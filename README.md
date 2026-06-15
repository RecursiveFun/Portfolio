# berinde.dev

Personal portfolio and technical blog for [Felix Berinde](https://www.berinde.dev).

Built with [Next.js](https://nextjs.org/) and [Nextra](https://nextra.site/) (blog theme). Content is written in Markdown and MDX. The site is deployed on [Vercel](https://vercel.com).

## Live site

https://www.berinde.dev

## Tech stack

- **Next.js 14** — React framework with static generation
- **Nextra 2** — MDX pages, blog layout, and navigation
- **Vercel Analytics & Speed Insights** — traffic and performance
- **Node.js 24**

## Getting started

Requires Node.js 24.x (see `.nvmrc`).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

The build step generates the RSS feed, sitemap, and posts index before compiling the Next.js app.

## Project structure

```
pages/
  index.mdx          # Home / About
  resume.mdx         # Resume and capstone downloads
  contact.mdx        # Contact page
  privacy.mdx        # Privacy policy
  terms.mdx          # Terms of service
  posts/             # Blog posts (.md / .mdx)
components/          # React components (projects, PostList, etc.)
scripts/             # Build-time generators
public/              # Static assets (images, PDFs, ads.txt, robots.txt)
data/                # Generated posts-index.json (created at build)
styles/main.css      # Custom styles
theme.config.js      # Nextra theme (footer, etc.)
```

## Adding a blog post

1. Create a new `.md` or `.mdx` file in `pages/posts/`
2. Add frontmatter:

```yaml
---
title: My Post Title
date: 2026/06/16
description: A short summary for the posts list and SEO.
tag: dev, next.js
author: Felix Berinde
---
```

3. Run `npm run dev` or `npm run build` — the post is picked up automatically for the posts page, RSS feed, and sitemap.

Posts are listed on `/posts` via `components/PostList.js`, which reads from `data/posts-index.json` generated at build time.

## Build scripts

| Script | Output |
|--------|--------|
| `scripts/gen-rss.js` | `public/feed.xml` |
| `scripts/gen-sitemap.js` | `public/sitemap.xml` |
| `scripts/gen-posts-index.js` | `data/posts-index.json` |

Site URL and metadata are configured in `scripts/site-config.js`.

## Deployment

The site deploys to Vercel on push to `main`. Ensure the Vercel project uses **Node.js 24.x**.

Build command (default):

```bash
npm run build
```

## License

MIT
