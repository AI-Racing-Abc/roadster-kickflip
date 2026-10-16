# Roadster Kickflip

Fan-made browser mini-game inspired by the Tesla Roadster “Do a kickflip!” hype.  
**Not affiliated with Tesla, SpaceX, or Elon Musk.**

Play locally by opening `index.html`, or host free on GitHub Pages.

## How to play

1. Click **Start** (or press Space).
2. The Roadster drives toward the ramp. Watch the **FLIP WINDOW** meter.
3. Press **Space** or **tap** the canvas when the needle is in the **green** zone.
   - **Perfect** (center green) → big score + combo + thrusters
   - **Good** (blue band) → solid flip
   - **Early / Late** → wipeout, combo resets
4. Each round has **8 attempts**. Best score is saved in `localStorage`.
5. Keys: `Space` / tap = flip · `P` = pause · `R` = restart round

## Files

```
roadster-kickflip/
  index.html   # page shell + HUD + CTA footer
  style.css    # layout, mobile-friendly
  game.js      # canvas gameplay
  README.md
```

No build step. No frameworks. Works offline.

## Deploy to GitHub Pages

Same idea as a static repo like photo-sort / AI-Racing Pages:

```bash
# from this folder
git init
git add .
git commit -m "Roadster Kickflip MVP"
# create a new empty GitHub repo, then:
git branch -M main
git remote add origin https://github.com/<YOU>/<REPO>.git
git push -u origin main
```

On GitHub: **Settings → Pages → Deploy from branch → `main` / root**.

Public URL will look like:

`https://<YOU>.github.io/<REPO>/`

Or drag the folder into a repo that already has Pages enabled.

## Soft CTA (already in footer)

- X: https://x.com/jeffreylamOK  
- Fiverr (Chinese conversational lessons): https://www.fiverr.com/s/ZooxY3l  

## Sharing tip

Clip a 10–15s screen recording of a Perfect kickflip, post on X with the Pages link, and quote Tesla’s kickflip post for traffic.

## License note

Original code here is yours to ship. Tesla/Roadster names & marks belong to their owners — this is a non-commercial fan tribute demo.
