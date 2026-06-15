# kahrens.com

Source for [kahrens.com](https://kahrens.com), my personal site and blog. Built with [Astro](https://astro.build), hosted on GitHub Pages.

## Develop

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Structure

- `src/pages/` — routes (`index`, `about`, `blog/`)
- `src/content/blog/` — blog posts in Markdown (see `src/content.config.ts` for frontmatter schema)
- `src/layouts/Base.astro` — site shell
- `src/styles/global.css` — all styles
- `public/` — static assets and the `CNAME` for the custom domain

## Writing a post

Add a Markdown file under `src/content/blog/`:

```yaml
---
title: "Post title"
description: "One-line summary for SEO and listings."
pubDate: 2026-06-15
tags: ["tag1", "tag2"]
draft: true   # omit or set false to publish
---
```

Draft posts show in `npm run dev` but are excluded from production builds.

## Deploy

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds the site
and deploys to GitHub Pages. Pages must be set to build from **GitHub Actions**
(Settings → Pages → Build and deployment → Source).
