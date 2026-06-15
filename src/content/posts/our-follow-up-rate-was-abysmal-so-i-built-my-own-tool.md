---
title: "Our follow-up rate was abysmal, so I built my own tool"
description: "I had a number stuck in my head: eight to 10 touches before deciding a prospect isn't interested..."
pubDatetime: 2026-06-02T09:00:00Z
tags: ["ai", "productivity", "crm", "startup"]
canonicalURL: "https://dev.to/kenahrens/our-follow-up-rate-was-abysmal-so-i-built-my-own-tool-4c0k"
---

> Originally published on [dev.to](https://dev.to/kenahrens/our-follow-up-rate-was-abysmal-so-i-built-my-own-tool-4c0k).

I had a number stuck in my head: eight to 10 touches before deciding a prospect isn't interested anymore.

I thought we were doing better than that. Then I actually looked.

In 2024 I went through HubSpot, which was our CRM at the time, and checked the outreach history for prospects who had gone quiet. When was the last time we heard from them? How many times had we followed up since then?

The pattern was pretty consistent: one outreach attempt, sometimes two, then nothing. We'd get a no-response or two and move on. The deal would go quiet and we'd call it dead.

My benchmark was eight to 10. We were stopping at one or two.

That's not a team discipline problem. We're not bad at follow-up when a deal is active. We're bad at follow-up when the signal from the other side goes quiet and there's no obvious forcing function to reach back out. People are busy. Their inboxes are full. Sometimes they didn't ignore me on purpose. They just didn't respond yet.

I knew I needed something that would make them make noise — at least for me.

## The tool

I called it Radar.

I built it around the places where our customer and prospect interactions actually happen. Slack. Email. CRM. In-product usage. Meeting notes in a markdown folder. PostHog for what people are doing after the call. No single system had the full picture.

Radar syncs all of it. CRM, PostHog, meeting notes, email history, Slack threads. That sync is the workhorse. It builds a timeline of every interaction with each account, then tracks the touches: Slack touch, email touch, meeting, whatever happened.

Different accounts need different cadences. A happy customer might be fine with a 30-day check-in. Someone in the middle of an important project might need a touch every three days. Radar lets me set that standard and highlights the accounts that are outside it.

The first version did one thing: for each flagged account, suggest a draft follow-up email. A draft that knew the last thing we'd talked about, not a generic "checking in." Referenced anything new we'd shipped that might be relevant. Asked something specific.

I didn't use the suggested follow-ups as-is. That wasn't the point. They gave me a starting point, and I could edit the email before sending it.

I ran it the first week it worked. We sent follow-ups to the accounts it surfaced.

We booked five meetings in the next seven days.

Five meetings from one week of follow-up, to accounts that had been quiet. People we'd talked to before who had just gone dark while we weren't watching.

The team noticed. We ended up with our own Slack emoji for Radar. That's how I know something is actually being used.

## Why

Following up with prospects who've gone quiet is an important task that competes with everything else on my plate. When there's nothing urgent pushing me toward an account, I don't go looking.

Radar makes it visible. Every morning I can open it and see who has gone past the follow-up window I set. Three days. Thirty days. Whatever makes sense for that account. The accounts I should be thinking about surface automatically instead of disappearing into the CRM.

That changed how I think about what I need from a CRM. Every CRM I've used was designed to track deals. That's useful, but it's backward-looking — it tells me what happened. Radar tells me who needs attention right now.

## What went wrong

The first version proved the concept. Then I tried to scale it.

The earliest mistake was letting it send automatically. The original setup queued drafts for me to review before anything went out. I got comfortable and loosened that. Emails went out without a human pass, and some of them weren't ready.

UTF-8 encoding was one I didn't see coming. The body of an email could look completely fine in the preview and still produce a garbled subject line when it hit a mail client that handled encoding differently.

![Garbled Email Subjects](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9et1q64bj9wwuesiu24z.png)

Here's an example of what an average email looked like when things were working:

> One issue I keep seeing in service-heavy systems is mock drift. Mocks stay "correct" per the spec, but prod has extra fields, missing fields, odd status codes, retries, and timeouts. Then AI tools and integration tests learn the wrong shape and you get regressions that only show up under real traffic.
>
> Do you have a way to detect when your mocks no longer match what upstreams are actually returning in prod?

Not a disaster. But it needed editing before sending. The problem is that at volume, "needs editing" becomes "probably didn't get edited."

Strong prompts and evals help. They don't fully solve it. The AI knows the account history. It doesn't know whether this person has heard a similar pitch three times this week, or whether the framing that worked on one account falls flat on another. That judgment doesn't transfer.

I scaled back. The tool now focuses more on the intelligence side — surfacing who needs attention, what's happened recently, what context matters before a call — and less on generating copy to blast out. The draft emails are still there, but as a starting point I edit, not output I send.

## Since then

We've kept building on it. Now it pulls together the pipeline of new opportunities, what problems specific accounts are running into, and how long since the last meaningful touch. It's tracking across web, email, slack and other systems.

![Continuous Data Sync](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/mjvkepiw1r621wtzfr9x.png)

We're still not hitting eight to 10 touches on every prospect. But we're not giving up at one or two anymore either.

My follow-up process had a gap between the standard in my head and what was actually happening. The only way I found that gap was by auditing it. The only way I closed it was by making a tool that made the gap visible every morning.

The accounts that don't make noise aren't necessarily dead. They're just quiet. That's different.
