# Deploy notes — Roadster Kickflip

## Goal
Public free Cloudflare Pages URL (`*.pages.dev`) with the SEO landing + playable game. No custom domain yet.

## Repo
- GitHub: https://github.com/AI-Racing-Abc/roadster-kickflip
- Branch used for deploy: `main` (merged from `seo-landing`)
- Static files: `index.html`, `style.css`, `game.js`, `og.png`, `robots.txt`, `sitemap.xml` (no build step)

## Cloudflare
- Account: Ai.racing.abc@gmail.com's Account (wrangler OAuth on the Mac)
- Project name: `roadster-kickflip`
- Expected URL: https://roadster-kickflip.pages.dev

## Deploy command (Mac, authenticated wrangler)
```bash
cd /path/to/roadster-kickflip
npx wrangler pages deploy . --project-name=roadster-kickflip --branch=main
```

## Placeholders still open
- Stripe Payment Link (`#STRIPE_PAYMENT_LINK`)
- YouTube embed (`YOUTUBE_VIDEO_ID`)
- Custom domain (optional; pages.dev is live first)

## Progress
- [x] SEO landing on `seo-landing` (commit aa22bfa+)
- [ ] Push / merge to `main`
- [ ] `wrangler pages deploy`
- [ ] Live URL verified (game + landing)
