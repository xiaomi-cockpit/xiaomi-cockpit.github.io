# Xiaomi Cockpit website: project notes for Claude

Read this first. Public website of the app "Xiaomi Cockpit" (https://xiaomi-cockpit.github.io), repo `xiaomi-cockpit/xiaomi-cockpit.github.io`, GitHub Pages from `main` (root). The app itself lives in the PRIVATE repo `pagnchanak/xiaomi-cockpit` (see its CLAUDE.md for what the app does); this repo has no app code.

## Who you work with
- The user has no coding knowledge: explain in plain language, give exact click steps, do the coding yourself. They use Windows and the GitHub website.
- Work on `main` directly (small static site). Push, then check https://xiaomi-cockpit.github.io a minute later.
- You cannot create releases, delete branches or change repository/Pages settings from the session; tell the user the clicks.

## Purpose
Showcase the app: features, download + install instructions, a detailed user guide. English only for now (languages can be added later). Easy to extend with more info.

## Files
- `index.html`: hero with a drawn preview of the dashboard, features, the three layouts, download + install steps, FAQ.
- `guide.html`: detailed user guide (sticky contents list, sections: getting started, layouts, gestures, clock, music, map and navigation incl. Google key, dock, floating button, settings, looks, troubleshooting, updating). Keep it in sync with the app (see the app repo's CLAUDE.md).
- `404.html`, `.nojekyll`, `assets/style.css`, `assets/site.js`, `assets/icons.svg` (sprite, `<use href="assets/icons.svg#i-name">`), `assets/favicon.svg`.
- Add screenshots later under `assets/screenshots/` and show them in a gallery section.

## Design (same look as the app)
- Dark and light themes: follows the system, the header button toggles and remembers (localStorage `cockpit-theme`); `?theme=light` / `?theme=dark` in the URL overrides (handy for screenshots). The inline script in each page head sets the theme before paint.
- Background = the app's Cockpit style drawn on a canvas (`#bg`, `assets/site.js`): dark gradient `#0a1621 -> #102232` with blue light pools, light solid `#a7b4c1` (the app's light Cockpit colour dimmed to 86%), three large soft accent bubbles drifting (dark: accent shades 1 / 0.63 / 0.88, alpha 120/95/105; light: accent mixed 0 / 0.12 / 0.06 with white).
- Accent colour cycles every 7 s through the app's accent list (dark: `#7fe3c4 #7cc7ff #b9a3ff #ff9ec4 #ffb36b #f4db6a #ff8e86 #b4e86a`; light: `#14a383 #1a7fd6 #6a4bd6 #d6336f #d9650f #a77f00 #d23a2f #4d8f12`), blended smoothly; CSS variables `--accent`, `--accent-rgb`, `--on-accent` (dark ink on bright accents).
- Glass panels (`.glass`, `.glass.strong`): backdrop blur + saturation, translucent tint (dark 7.5% / light 50%), 1 px rim, a lit top edge and top-left curve (`::after`), a soft shadow ONLY under the bottom edge (box-shadow with negative spread), and a live accent glow on the rim where a background bubble crosses the edge (`::before`, driven by `updateGlow()` setting `--ga --gx --gy`). Corner radius 22 px.
- Typography: system font stack, light-weight large headings, small spaced caps labels (`.tiny`). `prefers-reduced-motion` stops the animation and reveals.

## Links
- Download button (always the newest APK): `https://github.com/xiaomi-cockpit/xiaomi-cockpit.github.io/releases/latest/download/Xiaomi-Cockpit.apk`. The app repo's workflow publishes each release's APK to a release in THIS public repo (secret `WEBSITE_TOKEN` in the app repo). Version badge: JS reads `releases/latest` of this repo.
- Not affiliated with Xiaomi, Baidu or Google (footer text); keep that disclaimer.

## Testing
No local build needed. To look at the pages: `python3 -m http.server`, then headless Chromium (`/opt/pw-browsers/chromium-*/chrome-linux/chrome --headless=new --no-sandbox --screenshot=out.png --window-size=1440,2000 --virtual-time-budget=5000 URL?theme=light`). Headless Chromium has a minimum window width of about 500 px; check phones through an iframe of 390 px.
