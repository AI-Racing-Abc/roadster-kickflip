# SEO / Launch TODO

- [ ] **Export `og.png` from `og.svg`.** Render at 1200×630 (e.g. `rsvg-convert -w 1200 -h 630 og.svg -o og.png`, Inkscape, or a browser screenshot) and place `og.png` in the site root. Confirm `https://roadsterkickflip.com/og.png` returns 200 and passes the social preview debuggers.
- [ ] **Domain is a placeholder until bought.** `roadsterkickflip.com` is used in the canonical, Open Graph, Twitter, JSON-LD, `robots.txt`, and `sitemap.xml`. Update every occurrence if the final domain differs.
- [ ] **Stripe link placeholder.** Replace `href="#STRIPE_PAYMENT_LINK"` in the Support section with a real Stripe Payment Link, then remove “(coming soon)” from the button label.
- [ ] **YouTube ID placeholder.** Replace `YOUTUBE_VIDEO_ID` in the commented-out iframe inside `<section id="video">`, uncomment the embed, and remove the “Video coming soon” note once the clip is live.
- [ ] **Google Search Console submission pending.** Verify the domain, submit `https://roadsterkickflip.com/sitemap.xml`, and request indexing for the homepage.
- [ ] **Validate structured data.** Run the page through Google's Rich Results Test and Schema Markup Validator (`VideoGame` + `FAQPage`). Keep the visible FAQ text in sync with the FAQPage JSON-LD if either is edited.
- [ ] **Final SEO checks.** Confirm the title and meta description render correctly, the page has one H1, all article images (if added later) have alt text, and Core Web Vitals are acceptable on mobile.
