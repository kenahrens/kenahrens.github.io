---
title: "From Traffic Context to Confirmed Fix in 3 Minutes"
description: "Traffic Context is the missing piece in most debugging workflows. We ran our autonomous agent on a real production bug \u2014 it found the root cause, wrote a reproduce harness, applied the fix, and confirmed it. Here's what that looked like."
pubDate: 2026-05-18
tags: ["AI Development", "Developer tools"]
canonicalURL: "https://speedscale.com/blog/traffic-context-confirmed-fix-3-minutes/"
draft: false
---

> Originally published on [speedscale.com](https://speedscale.com/blog/traffic-context-confirmed-fix-3-minutes/).


We've been building an AI agent that can take a production bug, find the root cause in captured traffic, write a fix, and validate it before a human reviews it. We call it Agent Factory. Last week we ran it on ourselves, against a real bug in our own production service.

The first thing we did was get the workflow wrong.

## The bug

Radar is our internal GTM system. It syncs sent Gmail messages for our sales team. It pulls emails, matches them to accounts and contacts, and builds a timeline of customer touchpoints.

About two weeks ago we started seeing intermittent sync failures. Some emails would just not show up. No error surface to users, no alert. The sync cursor would advance, but touches would silently drop.

We pulled a production traffic snapshot using Speedscale's eBPF collector and looked at what was actually happening at the network level. The numbers were pretty clear:

- 183 Gmail API calls captured in the snapshot
- 28 of them returned 429 (Too many requests)
- All 28 clustered in a 16-second window from `11:15:04 UTC` to `11:15:20 UTC`

That's 14.5% error rate, and it wasn't random: it was one burst. That pattern tells you something specific about the code.

## What was causing it

The Gmail sync code fetches a page of message IDs, then fetches the metadata for each message. That second step looked like this:

```javascript
const details = await Promise.all(refs.map((ref) => gmail.users.messages.get({
  userId: 'me',
  id: ref.id,
  format: 'metadata',
  metadataHeaders: ['From', 'To', 'Cc', 'Subject', 'Date'],
})));
```

With default config, a page is 100 messages. `Promise.all` fires all 100 simultaneously. Gmail's API has per-user rate limits. 100 concurrent requests per page, times however many users are syncing. You hit the ceiling fast.

The fix is simple: replace the unbounded `Promise.all` with a `mapWithConcurrency` worker-pool that caps concurrent calls at 10. But I'm getting ahead of myself, because this is where we made our first mistake.

## The thing we got wrong

We found the bug in the source code, wrote the fix, and opened the MR.

That's the wrong order.

Before writing any fix, you need to actually measure the thing the bug violates. Not "does the sync work" but "what is the peak number of concurrent in-flight calls to this endpoint, and what's the threshold where Gmail starts rate-limiting." If you can't measure that before the fix, you can't confirm anything after. You're just asserting it worked.

So we backed up. We wrote a self-contained test harness: no database, no real Gmail account, just a local HTTP mock that tracked concurrent in-flight requests. We ran the unpatched code through it:

```text
unpatched (Promise.all)
  peak concurrent    : 100
  window max (50ms)  : 200
```

Then we applied the fix and ran the same harness:

```text
patched (mapWithConcurrency × 10)
  peak concurrent    : 10
  window max (50ms)  : 30
```

Now we had something real. The MR description included both numbers, the harness code, and what it measured. That's the difference between "I think this fixes it" and "here's evidence it fixes it."

## Then we added the LLM

The manual version of this took a few hours: reading the snapshot, finding the burst pattern, tracking down the source, writing the harness, writing the fix. We'd built Agent Factory to automate exactly this workflow. So we ran it.

The Planner phase reads the snapshot, identifies the error pattern, finds the relevant source code, writes the reproduce harness, runs it, and emits a structured plan with the metric and baseline. The Worker phase reads the plan, applies the fix, writes a confirm harness with identical methodology, runs it, and reports back.

```text
┌──────────────────────────────────────┬──────────────────────────────────────┐
│                Metric                │                Value                 │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Planner (snapshot→plan+baseline)     │ 84s                                  │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Worker (fix+confirm harness)         │ 88s                                  │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Total issue → confirmed fix          │ ~3 minutes                           │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Bug identified correctly             │ Yes — Promise.all                    │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Root cause hypothesis                │ Correct                              │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Reproduce harness                    │ Generated & ran; peak=100            │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Fix approach                         │ mapWithConcurrency pool, cap=10      │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Confirm harness                      │ Generated & ran; peak=10 ≤ 10 ✓      │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

That's not magic. It's just the same steps a human would take, but without the context-switching.

## One trick worth knowing

We hit an interesting problem during the reproduce step. We wanted to use [proxymock](/proxymock/)'s mock server to validate the fix: serve the recorded traffic back through the mock and measure what happened. But the mock returns the *recorded* responses, which includes the 429s from the original burst. You can't tell from the mock's output whether the concurrency improved, because it's always going to return the same 429s regardless.

Here's the thing though: the proxymock mock server writes a timestamped file for every request it receives, even ones it responds to with a recorded failure. The *arrival timestamps* in the report directory are accurate: they reflect when the requests actually landed, not what the response was. So you can count requests per 50ms window from the timestamps and measure the burst pattern directly.

The 429 responses are noise. The timestamps are the signal. Once you see that, the mock becomes useful for algorithmic bugs even when it's serving recorded errors.

## After the fix deployed

We waited about 15 minutes after deploy and pulled another prod snapshot. Same cluster, same service, same 25-minute window.

```text
                   BEFORE    AFTER
Gmail calls          193       407
429 errors            28         0
Error rate          14.5%      0.0%
```

Zero. And more total calls, because the sync is now completing successfully instead of getting cut off mid-burst.

## What Speedscale's captured traffic made possible

The thing that made all of this work, both the manual version and the agent version, was having the actual production traffic as evidence before writing any code. We didn't have to guess what was happening or try to reproduce it from a bug report. The timestamps and status codes were right there in the snapshot.

Without that, you're debugging from logs and intuition. With it, you have a before/after measurement that either confirms the fix or doesn't. No ambiguity.

That's the loop we're building: traffic snapshot → metric → reproduce → fix → confirm → deploy → post-deploy snapshot. The agent automates the middle steps.

We're running it on more of our own services next. If you want to see how it works on yours, [reach out](/contact/).
