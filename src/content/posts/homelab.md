---
title: "I open sourced my homelab. I ran a secret scanner on myself first."
description: "Before flipping my k3s homelab repo to public I ran gitleaks across all 178 commits. It found 12 secrets. Here's why I published anyway."
pubDatetime: 2026-06-15T09:00:00Z
tags: ["homelab", "kubernetes", "gitops", "security"]
draft: true
---

> Draft seeded from `gtm/content/draft-devto-oss-homelab.md`. Rewrite to voice, then set `draft: false`.

I've got a Raspberry Pi homelab running k3s. ArgoCD does the GitOps, Grafana and VictoriaMetrics do the monitoring, sealed-secrets handle the credentials, Traefik does ingress. It's been in a private GitHub repo for months.

I wanted to make it public. Homelab repos are some of the most useful things on GitHub when you're trying to figure out how someone wired their cluster together, and mine was sitting there helping nobody.

But homelab repos are also one of the most common ways people leak secrets. So before I flipped the switch I ran gitleaks across the entire history. All 178 commits.

It found 12 secrets.

Every single one was an encrypted SealedSecret, which is the one kind of secret you're allowed to commit to a public repo. The stuff that actually leaks out of homelab repos (your public domain, your DDNS hostname) doesn't trip a scanner at all.

The repo is here: [github.com/kenahrens/homelab](https://github.com/kenahrens/homelab).
