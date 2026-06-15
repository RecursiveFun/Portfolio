---
title: How I Deployed berinde.dev on Vercel
date: 2026/06/16
description: A walkthrough of deploying my Nextra portfolio site to Vercel with a custom domain, build scripts, analytics, and the issues I ran into along the way.
tag: dev, vercel, next.js, deployment
author: Felix Berinde
---

# How I Deployed berinde.dev on Vercel

When I first built my portfolio, it lived on a default Vercel subdomain. That worked fine for testing, but I wanted a proper home on the web — something I could put on a resume, share on LinkedIn, and grow over time. This post covers how I deployed [berinde.dev](https://www.berinde.dev) on Vercel, connected my custom domain, and set up the build pipeline that keeps the site running today.

## The Stack

Before diving into deployment, here is what the site is built with:

- **Next.js 14** — React framework with static page generation
- **Nextra 2** with the **blog theme** — MDX-powered pages with minimal config
- **Custom CSS** — project cards, download buttons, and typography tweaks in `styles/main.css`
- **Vercel Analytics** and **Speed Insights** — traffic and performance monitoring

The site is mostly static. Pages live as `.mdx` and `.md` files under `pages/`, and Nextra compiles them into a standard Next.js app at build time. That makes Vercel a natural fit — push to GitHub, and Vercel builds and hosts the result.

## Project Structure

The layout is straightforward:

```
pages/
  index.mdx        → Home / About
  resume.mdx       → Resume and capstone downloads
  contact.mdx      → Contact info
  privacy.mdx      → Privacy policy
  posts/           → Blog posts
public/
  images/          → Photos, resume PDFs, screenshots
  ads.txt          → Google AdSense verification
  robots.txt       → Crawler rules and sitemap reference
scripts/
  gen-rss.js       → Generates feed.xml at build time
  gen-sitemap.js   → Generates sitemap.xml at build time
```

Static assets like images and PDFs go in `public/` so they are served from the root URL — for example, `/images/Felix_Berinde_Resume.pdf`.

## Connecting the Repository

The first step was linking my GitHub repo to Vercel:

1. Log in to [vercel.com](https://vercel.com) and click **Add New Project**
2. Import the GitHub repository containing the portfolio
3. Vercel auto-detected **Next.js** as the framework
4. Leave the build command as `npm run build` and the output directory as default (Next.js handles this)
5. Click **Deploy**

Vercel assigned a preview URL like `portfolio-felixberinde.vercel.app`. Every push to `main` triggers a new production deployment automatically.

## The Build Script

Out of the box, Next.js only runs `next build`. My site needs a few extra steps before that — generating an RSS feed and a sitemap from the blog posts. I chained them in `package.json`:

```json
"scripts": {
  "dev": "next",
  "build": "node ./scripts/gen-rss.js && node ./scripts/gen-sitemap.js && next build",
  "start": "next start"
}
```

**`gen-rss.js`** reads every file in `pages/posts/`, parses the frontmatter with `gray-matter`, and writes `public/feed.xml`. Subscribers and feed readers can follow new posts without me maintaining the XML by hand.

**`gen-sitemap.js`** does the same scan and produces `public/sitemap.xml` with URLs for every static page and blog post. The `robots.txt` file points crawlers to it:

```
Sitemap: https://www.berinde.dev/sitemap.xml
```

Both scripts pull the site URL from a shared `scripts/site-config.js` so I only update the domain in one place.

## Custom Domain Setup

To use `berinde.dev` instead of the Vercel subdomain:

1. In the Vercel project, go to **Settings → Domains**
2. Add `berinde.dev` and `www.berinde.dev`
3. Vercel provides DNS records to add at your domain registrar
4. For my setup, I added an **A record** pointing to Vercel's IP and a **CNAME** for `www`
5. Vercel automatically provisions an SSL certificate once DNS propagates

I set `www.berinde.dev` as the primary domain so all traffic resolves consistently. The site config, sitemap, and RSS feed all use `https://www.berinde.dev` as the canonical URL.

## Nextra Configuration

Nextra needs very little setup. My entire `next.config.js` is two lines:

```js
const withNextra = require('nextra')('nextra-theme-blog', './theme.config.js')
module.exports = withNextra()
```

The blog theme handles navigation, post listings, tags, and MDX rendering. `theme.config.js` customizes the footer with links to Contact, Privacy, Terms, and the RSS feed.

Pages with `type: page` in their frontmatter (About, Resume, Contact) appear in the top navigation. Posts in `pages/posts/` are picked up automatically with dates, tags, and descriptions from frontmatter.

## Analytics and Performance

Vercel offers first-party analytics that are easy to add. In `pages/_app.js`:

```js
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function Nextra({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </>
  )
}
```

No extra configuration is required on Vercel's side — the packages detect the environment and start collecting data after deployment.

## Node.js Version

This is worth calling out because it caused a real build failure. Vercel discontinued Node.js 18, and my project was pinned to it in the dashboard. The fix was two-fold:

1. Set **Node.js Version** to **24.x** in Vercel project settings
2. Add an `engines` field and `.nvmrc` file in the repo so local and CI environments match:

```json
"engines": {
  "node": "24.x"
}
```

```
24
```

After that change, builds succeeded without the version error.

## Security and Dependency Overrides

Vercel also flagged a vulnerable version of `next-mdx-remote` (a transitive dependency pulled in by Nextra). Since my site does not use remote MDX directly, I forced a safe version with an npm override:

```json
"overrides": {
  "next-mdx-remote": "^6.0.0"
}
```

I also removed an unused `gatsby-plugin-mdx` dependency that had snuck into `package.json`. It was not part of the Next.js stack at all and was pulling in over a thousand unnecessary packages.

## What I Would Do Differently

If I were starting fresh today, a few things would save time:

- **Set the custom domain on day one** — migrating URLs later meant updating RSS, sitemap, and site config
- **Pin Node version in the repo immediately** — avoids surprise build failures when Vercel deprecates a runtime
- **Keep dependencies lean** — every unused package is a potential security alert

## Local Development vs Production

Locally, I run `npm run dev` and preview at `localhost:3000`. Production builds use `npm run build` followed by `npm start` if I want to test the optimized output locally.

The main difference is that RSS and sitemap generation only runs during `build`, not during `dev`. If I add a new post and want to verify the sitemap locally, I run the build script or invoke the generator scripts directly.

## Summary

Deploying berinde.dev on Vercel boiled down to:

1. Connect the GitHub repo and let Vercel detect Next.js
2. Chain RSS and sitemap generation into the build command
3. Point a custom domain at Vercel with DNS records
4. Add analytics, pin Node 24, and clean up dependencies
5. Push to `main` — Vercel handles the rest

The free tier has been more than enough for a personal portfolio. Builds take under a minute, SSL is automatic, and every commit to `main` goes live without manual steps.

If you are deploying your own Nextra or Next.js site and run into issues, feel free to reach out on the [Contact](/contact) page.
