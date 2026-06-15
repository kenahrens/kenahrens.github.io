---
title: "How to Tame Your AI Agents: From $900 in 18 Days to Coding Smarter"
description: "It started with a curiosity and ended with a $900 bill. Eighteen days. Three AI coding agents: Claude..."
pubDatetime: 2025-08-12T09:00:00Z
tags: ["ai", "productivity", "coding"]
canonicalURL: "https://dev.to/kenahrens/how-to-tame-your-ai-agents-from-900-in-18-days-to-coding-smarter-75n"
---

> Originally published on [dev.to](https://dev.to/kenahrens/how-to-tame-your-ai-agents-from-900-in-18-days-to-coding-smarter-75n).

It started with a curiosity and ended with a $900 bill. Eighteen days. Three AI coding agents: Claude Code, Gemini CLI, Cursor and Codex. What could possibly go wrong? Turns out, everything—until I learned how to tame them.

When I first fired up Cursor back in March, it was like having a hyperactive coding partner who never needed coffee breaks. I used it to freshen up [product docs](https://docs.speedscale.com/) and tweak a few demo apps. Then Claude Code hit the scene in June and I dove headfirst into something more ambitious: vibecoding a complete [CRM demo app](https://github.com/kenahrens/crm-demo) (react frontend, go backend, postgres database). That worked so well, I figured—why not push it further?

Gemini CLI arrived just in time for me to test it on an even bigger challenge: building a [banking microservice application](https://github.com/speedscale/microsvc) with full OpenTelemetry tracing. Since we use Google Workspace, working with Gemini AI Agent seemed like a no-brainer. But where Claude kept pace and Cursor quickly showed off code changes, Gemini sometimes got lost in its own loops—one particularly wild day ended with it racking up $300 in charges all by itself.

![Gemini AI agent bill showing $300 in charges from runaway loops](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/qmxse4udow7wosyquscl.png)

By the end of July, I’d also migrated our marketing site from WordPress to an Astro content site, and GPT-5 Codex had entered the chat. I had four AI development tools at my fingertips and an itch to see how far I could take them. In less than three weeks, I burned through $900 for API costs and monthly subscription fees (about $50 per day of #vibecoding).

![Claude Code API bill showing $300 in charges in just a few days](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zmge8x9h64c9g1yexte4.png)

## The Costly Lessons

### Don't Let the AI Drive
The biggest mistake I made early on was treating AI agents like senior developers who could just "figure it out." I'd give them vague instructions like "build a microservices app" and watch them spiral into increasingly complex solutions that solved problems I didn't have.

![AI Agents Drive Safely](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/3huxng6jbbyz9dhl5z5t.jpg)

AI agents work best when managed like talented junior engineers: give them clear requirements, specific constraints, and well-defined deliverables. Create a PLAN.md that breaks down exactly what you want, in what order, with clear boundaries. Then supervise each step before letting them move to the next one. This is a great primer from Rich Stone on how to [Code with LLMS and a PLAN](https://richstone.io/1-4-code-with-llms-and-a-plan/).

Think of it as technical leadership, not delegation. You're the architect; they're the implementers. If you learn something new about your architecture while building a task from the list, then tell the AI Agent to make a note about it in `ARCHITECTURE.md` so it will keep the standards. It really wants to not follow the standards so you may need to remind it frequently.

### The Docker Identity Crisis
Another one of my painful headaches came from letting an AI mix Docker Compose (for local) and Kubernetes (for production) configs without clear boundaries. One minute it’s spinning up a clean `docker-compose.yml` for local dev, the next it’s sprinkling Kubernetes `Deployment` YAML into the mix—resulting in setups that ran nowhere. And when I asked it to test something, it would run part in docker and part in K8S and get itself easily confused.

The fix? Separate everything. I now keep local and production infra in completely different directories and make it painfully clear to the AI which world we’re in before it writes a single line.

```
├── kubernetes
│   ├── base
│   │   ├── configmaps
│   │   │   ├── app-config.yaml
│   │   │   └── app-secrets.yaml
│   │   ├── database
│   │   │   ├── postgres-configmap.yaml
│   │   │   ├── postgres-deployment.yaml
│   │   │   ├── postgres-pvc.yaml
│   │   │   └── postgres-service.yaml
│   │   ├── deployments
│   │   │   ├── accounts-service-deployment.yaml
│   │   │   ├── api-gateway-deployment.yaml
│   │   │   ├── frontend-deployment.yaml
│   │   │   ├── transactions-service-deployment.yaml
│   │   │   └── user-service-deployment.yaml
│   │   ├── ingress
│   │   │   ├── frontend-ingress-alternative.yaml
│   │   │   └── frontend-ingress.yaml
│   │   ├── kustomization.yaml
│   │   ├── namespace
│   │   │   └── namespace.yaml
│   │   └── services
│   │       ├── accounts-service-service.yaml
│   │       ├── api-gateway-service.yaml
│   │       ├── frontend-service-nodeport.yaml
│   │       ├── frontend-service.yaml
│   │       ├── transactions-service-service.yaml
│   │       └── user-service-service.yaml
```

### OpenTelemetry Overload
Then came observability. I trusted the AI to set up tracing across Node.js and Spring Boot services. Big mistake. It pulled in deprecated Node OTel APIs, tried to auto- and manually instrument Spring Boot at the same time (hello, duplicate spans), and wrote Jaeger configs that didn’t match my collector.

Now I predefine *exactly* which observability stack I’m using—library names, versions, and all—and paste that into every session so the AI can’t go rogue. If you're not sure, ask the AI to audit what it installed and double check if those are the right versions or the right configs. It realized that it had the wrong configs for Jaeger and recommended installing the OTEL Collector which cleaned up the config quite a bit.

![OTEL Architecture after better planning](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/uzp0eo9zwb6509foydn1.png)

### The 1.8GB Node.js Docker Image
This one was a shocker. Here's what the AI generated for our Next.js frontend—a classic case of "it works" without any thought about efficiency:

```dockerfile
# What the AI built (simplified version)
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install  # Installs ALL dependencies, including dev ones
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

This innocent-looking Dockerfile created a **1.8GB monster**. The base Node 20 image alone is 1.1GB, then it installed all dev dependencies (including things like TypeScript, ESLint, and testing frameworks that shouldn't be in production), copied the entire source tree, and kept everything.

I only realized how bad it was when a user casually mentioned, "Your images take forever to start." Sure enough, the startup lag was brutal. The AI had made no attempt to slim things down because I hadn't told it to.

The fix required explicit instructions about multi-stage builds and production optimization—resulting in a [97% size reduction from 1.8GB to ~50MB](https://github.com/speedscale/microsvc/commit/optimize-images). If you don't explicitly demand lean builds, it won't even try.

## The Wins

**1. PLAN.md as a North Star** – Writing a detailed PLAN.md with every service, API, and today's focus point keeps the AI grounded. Hallucinations dropped by about 80% once I started using this. It's the one file that gives the AI its "map" before it starts building. Also checking things off your plan makes you feel that incremental progress like something is actually getting done around here.

**2. Multi-Agent Workflow** – Sometimes one agent just isn't enough. Rather than relying on a single AI that might have blind spots, I started configuring Claude to "call out" to specialized sub-agents for second opinions—like having a Gemini agent act as fact-checker or a critical thinking agent provide analytical feedback. Each sub-agent gets a clean context window and specialized tooling for their specific role. This approach delivered measurably better results: studies show up to 90% improvement over standalone agents on complex tasks. You're essentially building a specialized team where each AI has a focused expertise rather than asking "a chef to fix a car engine." My friend Shaun wrote more about this approach in [Is Your Agent Lying?](https://proxymock.io/blog/is-your-agent-lying/)

![Multi-Agent Workflow In Practice](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/d3a1acxiiepbzixujlk4.jpg)



**3. The "Prove It" Step** – This is where I make the AI prove it tested its own work. Good is having it run a quick self-check and explain what it tested. Better is TDD—writing the tests first, then building to make them pass. Best is when those tests run automatically in CI with hooks that block anything failing from merging. This one change has caught more silly errors than I'd like to admit.

**4. Real Traffic Testing with ProxyMock** – Unit tests are great, but they don't catch integration failures or API contract changes. I started using [proxymock](https://proxymock.io) to record real production traffic patterns, then replay them against new versions of services. This caught several breaking changes that would have slipped through traditional testing—like when the AI "optimized" a JSON response structure without realizing downstream services depended on the original format. Recording actual traffic patterns and replaying them against every code change became the ultimate safety net for AI-generated modifications.

```
LATENCY / THROUGHPUT
+--------------------+--------+-------+-------+-------+-------+-------+-------+-------+------------+
|      ENDPOINT      | METHOD |  AVG  |  P50  |  P90  |  P95  |  P99  | COUNT |  PCT  | PER-SECOND |
+--------------------+--------+-------+-------+-------+-------+-------+-------+-------+------------+
| /                  | GET    |  1.00 |  1.00 |  1.00 |  1.00 |  1.00 |     1 | 20.0% |      18.56 |
| /api/numbers       | GET    |  4.00 |  4.00 |  4.00 |  4.00 |  4.00 |     1 | 20.0% |      18.56 |
| /api/rocket        | GET    |  4.00 |  4.00 |  4.00 |  4.00 |  4.00 |     1 | 20.0% |      18.56 |
| /api/rockets       | GET    |  4.00 |  5.00 |  5.00 |  5.00 |  5.00 |     1 | 20.0% |      18.56 |
| /api/latest-launch | GET    | 34.00 | 34.99 | 34.99 | 34.99 | 34.99 |     1 | 20.0% |      18.56 |
+--------------------+--------+-------+-------+-------+-------+-------+-------+-------+------------+

1 PASSED CHECKS
 - check "requests.response-pct != 100.00" was not violated - observed requests.response-pct was 100.00
```

## Was It Worth It?

As a startup co-founder, my world isn’t measured in billable hours—it’s measured in how quickly we can get something in people’s hands, learn from it, and ship the next iteration. The banking demo wasn’t just an experiment; it was a race against the clock to have something ready for KubeCon India.

We made it. The team presented the project on stage, showing off our “Containerized Time Travel” with traffic replay. It was the perfect proof point that speed and iteration matter more than perfection in the early days.

![Pega team presenting at KubeCon India 2025](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/d09mu608wkbtum99v83u.jpeg)

You can watch their talk here: [Containerized Time Travel with Traffic Replay – KubeCon India](https://kccncind2025.sched.com/event/23Ev9/containerized-time-travel-replicating-production-performance-sravanthi-naga-hari-babu-volli-pegasystems?iframe=no).

## AI Agent Troubleshooting Checklist

When your AI agent starts spinning its wheels or burning through tokens, stop and check:

- **Context overload**: Is the conversation too long? Start fresh with a clear, focused prompt
- **Vague requirements**: Did you give it a specific goal or just say "make it better"?
- **Missing constraints**: Have you defined boundaries (tech stack, file structure, performance requirements)?
- **No success criteria**: How will the AI know when it's done?
- **Tool confusion**: Is it trying to use the wrong approach for the task (e.g., complex Kubernetes for a simple local dev setup)?
- **Infinite loops**: Is it repeatedly "fixing" the same issue? Stop and reframe the problem
- **Scope creep**: Has it started solving problems you didn't ask it to solve?

When in doubt, restart with a PLAN.md that breaks down exactly what you want, then hand it one piece at a time.


## How I'll Avoid Another $900 Sprint
- Choose a main model and go for their version of an "unlimited" plan. As of August 2025 for example you can get Claude Max for $200 with high limits and no per-API costs.
- The web interfaces are good for building out a plan, have it research and draft the initial plan, which you then hand over to the AI Agent.
- Check the dependencies of your project. The AI tools readily add new libraries, keep it in line with `ARCHITECTURE.md`. An easy way to tell is when you check in code see if your `pom.xml` or `package.json` or `go.mod` has new entries.
- Enforce small diffs. Have it make a branch and separate check-in for each change. Then run "/clean" in between steps on your `PLAN.md`

## Ready to Tame Your AI Agents?

The journey from chaos to control with AI coding agents isn't about avoiding them—it's about learning to tame them. With the right approach, these tools can accelerate your development without draining your bank account.

I'd love to hear your story. What's the most expensive lesson you've learned with AI coding agents? Share it—we might just build the ultimate survival guide together.

