# Deploy notes — Roadster Kickflip

## Live
- **Production:** https://roadster-kickflip.pages.dev/
- Deployment alias (from wrangler): `https://a28d0a27.roadster-kickflip.pages.dev` (TLS flaky from some networks; use production URL)
- Verified 2026-10-19 Asia/Shanghai: `/`, `game.js`, `style.css`, `og.png`, `robots.txt`, `sitemap.xml` all HTTP 200

## Repo
- GitHub: https://github.com/AI-Racing-Abc/roadster-kickflip
- Commit on `main`: https://github.com/AI-Racing-Abc/roadster-kickflip/commit/8887f06
- Branch: `main` (merged from `seo-landing`)
- Static site, no build step

## Cloudflare
- Account: Ai.racing.abc@gmail.com's Account
- Project: `roadster-kickflip` (created via `wrangler pages project create`)
- Deployed from Mac with existing wrangler OAuth (`pages` write scope)

## Redeploy
```bash
cd /path/to/roadster-kickflip   # clean checkout of main
npx wrangler pages deploy . --project-name=roadster-kickflip --branch=main --commit-dirty=true
```

## Placeholders still open
- Stripe Payment Link (`#STRIPE_PAYMENT_LINK`)
- YouTube embed (`YOUTUBE_VIDEO_ID`)
- Custom domain optional (pages.dev is enough for now)
- Google Search Console not submitted yet

## Progress
- [x] SEO landing on `seo-landing` then merged to `main`
- [x] Push to GitHub (`8887f06`)
- [x] Create Cloudflare Pages project
- [x] `wrangler pages deploy`
- [x] Live URL verified (game canvas + landing assets)
