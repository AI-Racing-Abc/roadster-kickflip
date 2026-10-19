# SEO / Launch TODO

- [x] **Export `og.png` from `og.svg`.** Done at 1200×630 RGB (`og.png` on disk, 2026-10-19). Confirm `https://roadster-kickflip.pages.dev/og.png` returns 200 after deploy.
- [x] **Live URL (temporary).** Using free Cloudflare Pages: `https://roadster-kickflip.pages.dev`. Canonical, Open Graph, Twitter, JSON-LD, `robots.txt`, and `sitemap.xml` point here. When a custom domain is bought, replace every occurrence and re-deploy.
- [ ] **Stripe link placeholder.** Replace `href="#STRIPE_PAYMENT_LINK"` in the Support section with a real Stripe Payment Link, then remove “(coming soon)” from the button label.
- [ ] **YouTube ID placeholder.** Replace `YOUTUBE_VIDEO_ID` in the commented-out iframe inside `<section id="video">`, uncomment the embed, and remove the “Video coming soon” note once the clip is live.
- [ ] **Google Search Console submission pending.** Verify the pages.dev property (or custom domain later), submit `https://roadster-kickflip.pages.dev/sitemap.xml`, and request indexing for the homepage.
- [ ] **Validate structured data.** Run the page through Google's Rich Results Test and Schema Markup Validator (`VideoGame` + `FAQPage`). Keep the visible FAQ text in sync with the FAQPage JSON-LD if either is edited.
- [ ] **Final SEO checks.** Confirm the title and meta description render correctly, the page has one H1, all article images (if added later) have alt text, and Core Web Vitals are acceptable on mobile.
- [ ] **Custom domain (optional).** Buy something like `roadsterkickflip.com` / `carkickflip.com`, attach in Cloudflare Pages custom domains, then update all absolute URLs again.
