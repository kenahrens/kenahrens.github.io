---
title: "Notes + Local AI: Simpler Than You Think"
description: "I got caught flat-footed twice by the same customer. I have an office hours call with them almost..."
pubDatetime: 2026-05-19T09:00:00Z
tags: ["markdown", "ai", "productivity", "notes"]
canonicalURL: "https://dev.to/kenahrens/notes-local-ai-simpler-than-you-think-2ce6"
---

> Originally published on [dev.to](https://dev.to/kenahrens/notes-local-ai-simpler-than-you-think-2ce6).

I got caught flat-footed twice by the same customer. I have an office hours call with them almost every week. For a couple of weeks in a row they asked the same question: any update on that issue from last month? I'd written it down both times. I just never turned it into a ticket.

Office hours with active customers is some of the best feedback a startup gets. They're in the product, they know what's broken, and they're telling you directly instead of just quietly churning. When they point out you forgot to track their feedback it's embarrassing. But more importantly, it tells you something's wrong with the system, not just your memory.

I've tried a lot of note-taking approaches. Written by hand, scanned handwritten notes, typed everything up, recorded audio and had it transcribed. Capture was fine. The Follow-up section was where things died.

From 2022 to 2024 I used Notion. Got to 500+ notes. I thought the tagging and grouping would help me actually use what I'd captured. But it was just another black box. Notes went in, nothing came back out. Search worked fine, but only if I went looking, and between back-to-back calls, I wasn't going looking. And if I wanted to feed those notes to an LLM, I had to export everything, unzip a folder, run through a whole process. Enough friction that I just didn't.

So last year I exported everything as markdown and wrote a script to add frontmatter to all of them. Title, date, note type, meeting type (customer, vendor, investor, internal), company, tags.
```bash
$ ls -al spd-ai-notes | wc -l
    2257
```

2,200+ files. Any script, any AI tool, any grep can read them directly. No export. No process.

## Customer notes

I use four templates: technical, meeting, internal, and finance. The meeting template has four sections: Attendees, Agenda, Notes, Follow-up. I fill in half of it in the minute before the call starts. Customer feedback goes in Notes. Anything I need to act on goes in Follow-up.

```markdown
---
title: "{{title}}"
date: {{date:YYYY-MM-DD}}
note_type: meeting
meeting_type:
company:
tags:
  -
---
# {{title}}

## Attendees
- 

## Agenda
- 

## Notes
- 

## Follow-up
- 
```

The Follow-up section is the one that used to get lost. Now an AI agent reads it.

I can point Claude or [Qwen](https://huggingface.co/Qwen/Qwen3.6-27B) or [DS4](https://github.com/antirez/ds4) at the notes folder and say "read my meeting notes from the last week, find follow-up items related to product issues, and create a Linear ticket for each one." First time I ran it, it made 20 tickets. A full week of calls where customers had mentioned things in passing, I'd written them down, and nothing had happened. One pass, done.

It works the other direction too. Before a call, point the AI at your notes for that customer and ask for a quick brief: what did we cover last time, what's open, what changed. Fifteen minutes between back-to-back calls isn't enough to dig through notes manually. One prompt is.

Customer notes also flow into our GTM system so the sales context is there when the next call happens. Follow-ups from meetings feed my weekly TODO. And when I'm working with an AI agent on something and it spots an issue, it can drop a note right into that same folder. I'll pick it up later.

## Finance checklist

The finance template works differently. Instead of capturing what happened, it's a checklist I run 2-3 times a month: vendor invoices, customer AR aging, bank balance, payroll, board reporting. Every item links directly to the system I need to check. Open the note, work down the list, check things off. Takes about half the time it used to because I'm not trying to remember what I missed last time.

```markdown
---
title: "{{title}}"
date: {{date:YYYY-MM-DD}}
note_type: internal
topic: finance
participants:
  - 
tags:
  -
---
# {{title}}

## Participants
- 

## Checklist
- [ ] Vendor invoices (AP)
    - [ ] Contractors
    - [ ] SaaS subscriptions
    - [ ] Other vendors
- [ ] Customer invoices (AR aging report)
    - [ ] Outstanding by customer
    - [ ] Past due follow-ups
- [ ] Payment processor
    - [ ] Open invoices
    - [ ] Failed charges
- [ ] Marketplace revenue
    - [ ] Active agreements
    - [ ] Billed revenue
- [ ] Upcoming expenses
    - [ ] Credit card balance
    - [ ] Other payables
- [ ] Confirm bank balance
    - [ ] Payroll clearing
    - [ ] Operating account
- [ ] Bookkeeping review
    - [ ] Recent transactions
    - [ ] Outstanding requests
- [ ] Board/investor reporting
- [ ] Compliance
    - [ ] State and local filings
    - [ ] Audits
```

Same idea works for quarterly security reviews, board prep, anything repeatable that currently lives in your head.

## The wider ecosystem

Because everything is plain text, you're not locked into any one tool.

For viewing and navigating, [Obsidian](https://obsidian.md) handles large markdown libraries well: graph view, tag search, template plugins. [VSCode](https://code.visualstudio.com) works too if you'd rather stay in your dev environment. Both read the same folder with no conversion needed.

For AI, you don't have to use a cloud model. [Ollama](https://ollama.com) and [Apple MLX](https://github.com/ml-explore/mlx) let you run models locally against the same folder. Useful if you have notes you'd rather not send to an external API. [DS4](https://github.com/antirez/ds4) is worth looking at specifically. The latest models support up to 200k token context windows, so you can feed in most of your notes folder in a single pass.

And if you need a different output format, just ask the AI to convert. Board summary, customer brief, HTML email. Markdown converts cleanly to any of them. The notes become inputs to other systems, not just records you write and forget.

The value of an app like Notion is the UI. The cost is that your data only works inside that app. Plain text inverts that tradeoff.

The note-taking advice you usually see is about capturing or summarizing a meeting. That's not wrong. But capture is the easy part.

The hard part is what happens to a note after it's written. If the answer is "nothing, unless I manually go find it," there's a hole in the system regardless of how good the notes are. Pointing an AI at the folder is what closed it.

That customer still does office hours with me. When they ask about last month's item, I've got a ticket to show them.
