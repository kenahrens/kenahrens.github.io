---
title: "Twenty years of Linux, and now I run my own AI"
description: "I've been an open source fan for a long time. Lately that's meant building my own local AI stack so I'm not at the mercy of token bills and shifting licenses."
pubDatetime: 2026-06-16T09:00:00Z
tags: ["ai", "local-ai", "open-source", "apple-silicon"]
ogImage: "/post-images/running-my-own-local-ai-stack/dad-email-cover.png"
---

I've been running Linux and Ubuntu for nearly 20 years. I can date it almost exactly, because I still have the email from my Dad back in early 2007 telling me he'd just installed Ubuntu. That's where this started.

![Email from my Dad in early 2007 about installing Ubuntu](/post-images/running-my-own-local-ai-stack/dad-email.png)

The big trend the last couple of years is obviously AI and the large language models, and this balancing act between what you can run yourself on your own machine versus what you get from a state-of-the-art model that you have to pay quite a bit for. Everyone has seen the challenges with the cost structure. Copilot had to change their license. Cursor had to change their license. Anthropic is changing theirs. It's hard to find the right mix where you give a lot of value to customers and you're also able to charge them an appropriate amount.

Open source and AI is another way to solve this. So I've been investing in building out my own local stack of AI tools I can run on my machine.

I'm on an M-series Mac, the Apple Silicon. You may have heard of tools like [Ollama](https://github.com/ollama/ollama) that let you run open source models. There's another one called [oMLX](https://github.com/jundot/omlx) that's designed specifically for Apple Silicon, and in my testing it ran better. You download the models straight from Hugging Face. The ones I run are the [mlx-community](https://huggingface.co/mlx-community) builds, which are already quantized down to 4-bit, so a 31B model that would be around 60GB at full precision comes down to about 17GB on disk. I didn't have to convert anything or do any prep. I just pulled them down and pointed oMLX at the folder. Right now I'm running [Gemma 4](https://huggingface.co/mlx-community/gemma-4-31b-it-4bit) and [Nemotron](https://huggingface.co/mlx-community/NVIDIA-Nemotron-3-Nano-30B-A3B-4bit), plus a few others.

The thing that makes this actually useful day to day is that I keep oMLX running all the time. It installs as a Homebrew service. Newer versions of Homebrew want you to explicitly trust third-party taps before they'll load anything, so it's a two-step setup that you do once, and then it starts when I log in and restarts itself if it ever crashes:

```bash
brew trust jundot/omlx       # one-time; newer brew rejects untrusted taps
brew services start omlx
```

If you skip the trust step you'll get a `Refusing to load formula` error and brew won't move on.

Under the hood `brew services` is just a wrapper around launchd, the macOS process supervisor. Same mechanism I use further down for my own scheduled jobs, just packaged up so I don't have to write the plist by hand.

It asks for a chunk of memory up front, but it only touches the CPU and GPU when something calls it, so the rest of the time it just sits idle. That means I can wire it into all the tools I use day to day, whether it's the Zed code editor or the opencode terminal-based AI agent, and they all just point at a server that's already there.

To give you a sense of what that actually means in practice, here's what the three models I use most do on my machine through oMLX, generating a few hundred tokens from a cold start:

| Model | Type | Throughput |
|---|---|---|
| Gemma 4 | 31B, dense | ~27 tokens/sec |
| Qwen 3.6 | 27B, dense | ~30 tokens/sec |
| Nemotron | 30B, mixture-of-experts | ~158 tokens/sec |

All three are plenty fast for interactive work. The Nemotron number is the interesting one. It's a similar size on disk to the others, but because it's a mixture-of-experts model it only activates a small slice of its weights per token, so it runs five or six times faster. That's fast enough that I don't think twice about putting it in a script that runs on a loop.

That's been a cool boost. I can run AI models, and I can especially use them as part of scripts that run continuously on my machine. I set up a launchd framework so I can run things on a schedule. I have a weekly to-do checklist job, a daily planning job, and a heartbeat that runs every 15 minutes making sure my system is actually in good shape.

The other big model I've been testing is DeepSeek 4. antirez came up with a way to run it in its own package called [DS4](https://github.com/antirez/ds4), and that's part of my stack too. The advantage is it's a lot more powerful. It runs around 35 tokens a second for me, about the same as Gemma even though it's a much bigger model. The disadvantage is it uses most of the resources on the computer when I run it, so it's not something I leave idling in the background the way I do with the oMLX models.

But just being able to tap into open weight models and run them on my own machine is a huge power boost. It gives me the confidence to kick something off and step away from my desk without burning up all my tokens for the week. Or I can run things overnight and come back to see if they got done.

I'm not worried about consuming all my tokens or getting bumped into the next API tier. You've probably seen some of my past blogs where I spent tens of thousands of dollars on tokens in a couple of months. I like the idea of using open source AI to optimize some of that spend. And frankly, I like the freedom and the support for open source too.

I even use [VoiceInk](https://github.com/Beingpax/VoiceInk) on my own machine so I can do my own transcribing without sending it to a third party. And when I record videos, I run Whisper locally to create the transcripts.

So there's quite a bit you can do on your own machine when you're on Apple Silicon. The hardware is expensive. But you also get the ability to bring tons of tools onto your local machine and get a lot more out of the horsepower you already paid for.

If you want to see the actual setup, I put my stack here: [github.com/kenahrens/mac-local-ai](https://github.com/kenahrens/mac-local-ai).
