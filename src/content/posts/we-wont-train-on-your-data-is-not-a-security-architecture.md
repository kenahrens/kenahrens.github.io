---
title: "We won't train on your data is not a security architecture"
description: "MSA clauses and contractual guarantees aren't an architecture. If your production traffic leaves your cloud, you're trusting a policy, not a system."
pubDatetime: 2026-06-10T09:00:00Z
tags: ["Security", "Cloud native", "AI/ML"]
canonicalURL: "https://speedscale.com/blog/we-wont-train-on-your-data-is-not-a-security-architecture/"
---

> Originally published on [speedscale.com](https://speedscale.com/blog/we-wont-train-on-your-data-is-not-a-security-architecture/).


Every enterprise contract I've signed in the last two years has the same clause. "Vendor will not use Customer Data to train machine learning models." Sometimes it's a paragraph. Sometimes it's a whole section. The language varies but the intent is identical: don't feed our production data into your AI.

I get it. I sign the same clause as a vendor. But here's what's been bothering me: that clause is a promise, not an architecture. The data still leaves your environment. It still sits on someone else's infrastructure. You're trusting that the vendor's internal controls actually enforce what the contract says. And you're trusting that every employee, every subprocessor, every future acquirer will honor that commitment forever.

That's a lot of trust for data that includes your customers' PII, your transaction records, and the actual requests hitting your production APIs.

![What you're actually trusting when you sign the MSA clause](/post-images/we-wont-train-on-your-data-is-not-a-security-architecture/msa-trust-chain.svg)

## The JPMC letter nobody can ignore

In April 2025, Pat Opet, the CISO of JPMorgan Chase, published an [open letter](https://www.jpmorganchase.com/about/technology/blog/open-letter-to-our-suppliers) timed to RSA Conference. He didn't mince words. The current SaaS delivery model creates what he called a "global concentration of risk" where a single third-party breach cascades into systemic failure across downstream clients. His message to vendors: "Providers must urgently reprioritize security, placing it equal to or above launching new products."

This isn't a compliance team being cautious. This is the largest bank in the United States saying publicly that the current model doesn't work. Opet's letter goes further than just identifying the problem. It explicitly calls out "customer self-hosting" and "bring your own cloud" as stronger-control patterns that vendors should support. When JPMC's CISO writes an open letter telling SaaS vendors to let customers keep data on their own infrastructure, the contractual approach has hit its ceiling.

And financial services isn't alone. Healthcare systems, payment processors, and insurance companies are all running into the same wall. The data is too sensitive to leave the building, but the tools they need require access to that data to function.

## The geography problem

Industry regulations are one thing. You know HIPAA, you know PCI, your compliance team has those playbooks memorized. What's newer and moving faster is the country-by-country layer.

GDPR was the start. CCPA followed. Quebec's Law 25 went further than anything at the Canadian federal level. Brazil's LGPD, India's DPDP Act, Japan's APPI revisions. And the pattern is clear: every major economy is writing its own data protection, transfer, residency, and AI accountability rules, and they don't all agree with each other.

![30 EU/EEA countries each enacted their own national data protection law on top of GDPR](/post-images/we-wont-train-on-your-data-is-not-a-security-architecture/eu-regulation-grid.svg)

We work with companies in the travel industry where the data for each regional airline has to stay inside the country where that airline operates. India's DPDP Act creates cross-border transfer obligations. Several Middle Eastern jurisdictions impose their own data protection and residency requirements. It's a hard business requirement driven by the regulatory environment in each country, not a preference. If the airline's passenger data crosses a border into a vendor's cloud, the deal can be blocked.

This is the part that catches teams off guard. You can be fully compliant with US regulations and still trigger transfer, residency, or customer-contract issues because your SaaS vendor processes the data in Virginia. The compliance surface isn't one set of rules anymore. It's a patchwork that changes by country, and it's getting more complex every year.

## AI governance is the new wildcard

Here's what changed in the last 18 months. The regulations aren't just about where data lives anymore. They're about what happens to it when AI touches it.

The EU AI Act is now in force, with obligations phasing in through 2027. Colorado passed an AI act in 2024, though its implementation timeline remains politically contested. Other states are drafting their own. And the common thread is accountability: if you're using AI systems that process personal data, you need to demonstrate that you know where that data went and what was done with it.

| Layer | Examples | Trend |
|-------|----------|-------|
| **Geography** | GDPR, CCPA, Quebec Law 25, LGPD, DPDP, APPI | Every major economy writing its own rules |
| **Industry** | PCI DSS, HIPAA, DORA, SOC 2 | Sector-specific on top of country rules |
| **AI governance** | EU AI Act (phasing in), Colorado AI Act (contested), 10+ US states drafting | New layer that didn't exist two years ago |

Your production traffic is subject to all three layers simultaneously.

This collides with the MSA clause problem in a way most teams haven't thought through yet. Your AI coding agents are reading production logs, analyzing traffic patterns, processing request payloads. If any of that data is subject to GDPR, or your customer's MSA, or a country-specific residency law, then every AI workflow that touches production data is now a compliance question.

The MSA says your vendor won't train on your data. Fine. But what about the AI tools your own engineers are using? What about the coding agent that reads a production trace containing a customer's payment details and sends it to an external API for analysis? The vendor isn't training a model in that scenario. Your own workflow is creating the exposure.

## Promises vs. architecture

There are two ways to solve this.

The first is contractual. You write the MSA clause. Your vendor signs it. Their compliance team files it. Everyone moves on and hopes the controls hold. This is what most companies do today.

The second is architectural. The data never leaves your environment. Capture happens inside your VPC. Storage is on your infrastructure. Processing, replay, and analysis all run in your cloud, on your hardware, under your access controls. There's no clause to enforce because there's no data to protect from an external party.

That's what BYOC actually means when it's real. It doesn't mean "we'll deploy a container in your cloud that phones home to our SaaS." It doesn't mean "your data is encrypted in transit" (of course it is, that's table stakes). Real BYOC means the vendor's software runs entirely inside your boundary. The vendor never sees your data because the data never goes anywhere.

When JPMC's CISO says SaaS vendors need to rethink how they handle customer data, this is what the rethink looks like. You don't need a longer contract. You need a different architecture.

![BYOC architecture: capture, DLP, storage, and replay all inside your VPC](/post-images/we-wont-train-on-your-data-is-not-a-security-architecture/byoc-architecture.svg)

## DLP at the capture layer, not the policy layer

Keeping data inside your VPC is step one. But even inside your own environment, you don't want raw PII sitting in captured production traffic. A credit card number in a request payload is a liability whether it's in your cloud or someone else's.

This is where data loss prevention has to be architectural too. DLP redaction at the capture layer means sensitive fields get scrubbed before they ever touch disk. Credit card numbers, SSNs, auth tokens, session IDs, all identified and redacted at the point of capture, not after the fact by a policy scanner that runs on Tuesdays.

That matters for the AI governance problem I mentioned earlier. If your engineers are running AI coding agents against captured traffic to reproduce bugs or validate fixes, DLP means the AI never sees the raw sensitive data. The redaction happened upstream. You don't need an MSA clause with your own AI tools promising they won't memorize a customer's social security number. The number was replaced before the data was stored.

This is the difference between "we have a policy that says engineers shouldn't look at PII in test data" and "the PII isn't in the test data." One is a rule people follow until they don't. The other is a system that doesn't give them the option.

## Your data is yours. Use it.

Here's the part that gets lost in compliance conversations. Keeping your data inside your own cloud isn't just defensive. It's an advantage.

If your production traffic stays in your environment, you can build on top of it. Train your own models on your own request patterns. Build replay and validation pipelines that use real traffic instead of synthetic test data. Run AI-powered reproduction against actual production failures without worrying about what leaves your network.

It's not rocket science anymore to fine-tune a model. The hard part was always getting the data. If you've been capturing production traffic inside your VPC, you already have it. Your competitors who shipped their data to a SaaS vendor have a contractual promise that their data won't be used. You have the data itself, under your control, ready to be the foundation of whatever you build next.

The MSA clause protects you from a risk. The architecture gives you an asset.

Production traffic capture belongs in the same trust boundary as the applications that generated it.

Speedscale deploys as a K8s operator inside your VPC. [Capture](/blog/you-cant-fix-what-you-cant-see-debugging-encrypted-microservice-traffic-with-speedscales-ebpf-collector/), storage, [replay](/blog/spring-boot-migration-traffic-replay-validation/), and DLP all run in your environment. If you're evaluating how to handle production traffic in a regulated environment, [we should talk](/).
