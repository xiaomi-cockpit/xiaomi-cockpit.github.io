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

## Update (v1.3.0 content)
- index.html: new feature cards (Weather you can see, Nearby EV chargers, Report and request; icon `i-bolt` added to the sprite), updated Clock/weather and Navigation cards, Google key card/FAQ (chargers, Google Weather), first-start step (language + map service), new FAQ "Can I ask for a new feature?".
- guide.html: sections Weather effects (#weather-fx) and Nearby chargers (#chargers), route overview + live traffic update, one Google key (Settings > Google key, four services incl. Weather API), weather source/frequency, Home/Work/Search buttons, settings table, Report/Request captions.

## Update (v1.4.0 content)
- guide.html: next events (up to 3 rows), music bars without the visualizer setting, floating button off by default and never on the phone screen, glass shadow/refraction switches removed, self-update (Settings > Updates). index.html music card text updated.

## Update (docs for v1.4.0)
- Full pass over guide.html and index.html for v1.4.0: first start (language + map service), permissions table (calendar events, install unknown apps), weather effects on by default, nearby chargers (15 closest, no limit, connector types, place line), settings table (Updates section, Diagnostics wording), glass effects always on, extra FAQs (chargers empty, update does not install, Google Weather note), home page (three events, data sources, self-update). Keep both pages in step with the app's CLAUDE.md after every release.

## Languages (website)
- The site is available in English (default), Khmer (km), Russian (ru) and Polish (pl), like the app. `assets/i18n.js` translates the page in the browser: the KEY of each string is its English HTML (inline tags kept, icons as `{{ic:id}}`), the dictionaries are `assets/i18n/km.json`, `ru.json`, `pl.json` ({English HTML: translation}). Language = `?lang=` > saved choice (localStorage `cockpit-lang`) > browser language. A switcher (`#lang-select`) is added in the header.
- When English text on a page changes or is added, add/update the same English string as a key in all three JSON files. To list the exact keys of a page, open it with `?dumpkeys=1` (a JSON of units/attrs/metas is appended). Untranslated text simply stays English.
- Mark things that must never be translated with `translate="no"` or `aria-hidden="true"`. Translations were written by Claude and are welcome for native-speaker review.
- Asset links in the HTML carry ?v=<timestamp>; change it whenever style.css/site.js/i18n.js change, so phones do not keep old copies.

## Update (v1.6.0 content)
- Yandex API map service documented: guide (#yandex-key: get a key, status colours, black-map FAQ), map service list, route/chargers notes, settings table, first-start texts; home page (Live map and Navigation cards, optional-key card, new FAQ "Can I use Yandex maps instead of Google?", footer data sources).
- Theme rules (Theme setting wins; only Light lets weather effects darken; live switching with a fade), weather wording from Google Weather, key status colours (green/orange/red) described in the guide.
- Hero preview: weather text "Cloudy" (Google wording) and the map box has a faint accent rim (`.mmap::after`, masked to two corners like a bubble crossing the edge).
- Translations (km/ru/pl JSON) added for every new string; the JSON files are one entry per line (keep that format).

## Update (7 October 2026): screenshots, new features, privacy
- The hero and the Screens section are illustrations again (screenshots and renders were tried and rejected as not doing the app justice; the files are deleted). The hero is HTML/CSS/SVG (`.carscreen .screen`, markup in index.html) and `site.js` cycles its state class every 4.2 s: `s-nav` (route, turn banner with the Then line, trip card), `s-alt` (grey alternative with a minutes bubble), `s-chargers` (green pins, station bar, card; `add` = the card says Add and the blue stop appears), `s-notif` (notification card), `s-edit` (dock wobbles with remove badges and +). Keep it in step with the app when the UI changes. The three Screens illustrations are inline SVGs generated for the layouts (classes `.il ...` at the end of style.css).
- Guide, features, install steps, FAQ and privacy were brought in line with the app after 1.6.0 (setup wizard, consent and API status, Navigation SDK banner, stops and alternatives, charger flow, notification card, dock edit mode, Settings sections Permissions/Service/Weather/Map/Music/Look, no Gemini, no Custom Maps App). All new English text has km/ru/pl entries; `assets/i18n/*.json` were pruned to the keys that exist on the pages (check with `?dumpkeys=1`). Asset links use `?v=202610071200`.
