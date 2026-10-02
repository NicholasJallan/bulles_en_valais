# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

- **`main` is the live site until S13** (React + Babel compiled in the browser, deployed file by file: see [Live site](#live-site-main--until-s13)). Urgent fixes to the live site go on `main`. No redesign commit on `main` before S13.
- **Branch `refonte/la-descente`**: the redesign "La Descente", a static Astro 7 site. Plan, session protocol and progress: `plans/refonte-la-descente/` (start with `README.md`; the decisions and mutations in `PROGRESS.md` override the specs). One session at a time, each ends at its own boundary.
- `legacy/`: the old site, read-only, source of the content migrated in S03 (texts and prices: `legacy/components/i18n.jsx`). Deleted in S13. To run the old site, use `main` (`git worktree add ../bev-legacy main`).

## Development

Node ≥ 22.12 (the Mac has Node 26). No UI framework at runtime, nothing loaded from a CDN.

```bash
npm install
npm run dev             # dev server, http://localhost:4321
npm run build           # static build → dist/ (contact.php copied to dist/api/), then check:dist
npm run preview         # serves dist/ on http://localhost:4321
npm run check           # astro check (types)
npm test                # Vitest: src/**/*.test.ts, scripts/**/*.test.mjs (includes the FR/EN parity test)
npm run coverage        # + v8 coverage, ≥ 80 % on src/lib, src/data, src/i18n
npm run test:e2e        # Playwright: builds, then tests the preview server (tests/e2e)
npm run test:visual     # Playwright screenshots (tests/visual, from S07: hero without WebGL)
npm run test:a11y       # axe (tests/a11y, from S05)
npm run format          # Prettier (format:check to verify)
npm run check:budgets   # gzip budgets of dist/: initial JS ≤ 90 KB per page, total JS ≤ 150 KB, CSS ≤ 30 KB
npm run check:dist      # run by every build: no inline JavaScript nor resource of another origin, no hidden,
                        # secret or stray PHP file (api/contact.php only, and present)
```

Invariants at the end of every session: `npm run build`, `npm run check` and `npm test` pass, no console error on `/` and `/en/` (the smoke test checks it).

- **Astro 7 and coding agents**: Astro detects agents (Claude Code) and then runs `astro dev` / `astro preview` in the background (detached, with a lock file). Stop them with `npx astro dev stop` / `npx astro preview stop`; `--ignore-lock` keeps them in the foreground (the Playwright `webServer` uses it).
- **The dev server serves every file of the project** (Vite), gitignored ones included: `vite.server.fs.deny` in `astro.config.mjs` refuses `mail-config.php`, `settings.json`, `.env`… Never `npm run dev -- --host`. To show the site on the LAN, `npm run preview -- --host` (serves `dist/` only), with Nicholas's agreement.
- **Firefox**: the Firefox build of Playwright 1.63 does not start on macOS 27.0.1 ("Could not find profile folder"), so `playwright.config.ts` has no `firefox` project: Firefox is validated only when it works (D21 in `PROGRESS.md`). Add the project back once a Playwright update fixes it.

### Test the contact endpoint

```bash
php tests/php/contact_test.php      # unit tests, dependency-free (local PHP: brew install php)
bash tests/php/run_integration.sh   # PHP built-in server + fake SMTP server (needs curl, lsof, Python 3.8+; ports 8099 and 2525)
bash tests/php/run_unit_php74.sh    # unit tests with the production PHP 7.4, piped over ssh to the Pi (ask first)
```

Production runs **PHP-FPM 7.4**: keep `public/api/contact.php` compatible with PHP 7.4 (no `str_starts_with`, `match`, union types, named arguments…). `php7.4 -l` only checks the syntax; `run_unit_php74.sh` runs the unit tests, which call every function including the entry points, under 7.4 without writing anything on the Pi.

## Architecture (branch `refonte/la-descente`)

```
src/
├── pages/                 index.astro (FR, /) · en/index.astro (EN, /en/)
├── layouts/               BaseLayout.astro: lang, title, description, canonical, hreflang, boot.js, app.ts
├── components/<feature>/  one folder per section; page/HomePage.astro assembles the page for a locale
├── i18n/                  types.ts · dictionary.ts · fr.ts · en.ts · legal/ · index.ts · routes.ts (+ tests)
├── data/                  courses · specialties · places · credentials · contact · gifts · sections (+ tests)
├── lib/                   pure logic, tested with Vitest (TDD): color/, motion/, depth/, webgl/, css/, format, typography
├── test/                  content-checks.ts: generic checks shared by the dictionary and data tests
├── scripts/app.ts         single client entry point; scripts/motion/ = motion module, scripts/webgl/ = hero surface (DOM glue, not covered)
├── styles/                tokens.css · global.css · typography.css · motion.css · utilities.css
└── assets/images/         images for astro:assets
public/                    copied as is: api/contact.php, js/boot.js, js/consent-default.js, robots.txt, llms.txt
ops/nginx/                 security-headers.conf: final CSP and headers (S11), applied by nginx in S13
scripts/                   check-budgets.mjs · check-dist.mjs (+ lib/, tested)
tests/                     e2e/ · visual/ · a11y/ (Playwright) · php/ (contact endpoint)
```

### Translations

- Every visible text lives in `src/i18n/` (and `src/data/` for the localized labels of data, from S03). French is the source language, at `/` (no prefix); English at `/en/`. The architecture is ready for German: add `'de'` to `LOCALES` in `src/i18n/types.ts` and follow the type errors.
- **FR/EN parity is mandatory and enforced by the tests**: `fr.ts` and `en.ts` are typed `Dictionary` (`src/i18n/dictionary.ts`; TypeScript rejects a missing or extra key), and `src/i18n/parity.test.ts` also compares value kinds and array lengths, refuses empty strings and HTML, requires the same `TODO(I-xx)` markers at the same places, and bounds the length of titles and descriptions. Never change one language without the other.
- **Typography is applied when reading**: write straight apostrophes and plain spaces in the sources; `getDictionary()` runs `typeset()` (`src/lib/typography.ts`: curly apostrophes, French no-break spaces, units kept with their figures), and `localize(value, locale)` does the same for the `Localized` labels of `src/data/`.
- **One source per fact**: prices, depths and form interests live in `src/data/courses.ts` (every course once, specialties included); eyebrows hold their label only, their depth marker comes from `src/data/sections.ts`; contact details from `src/data/contact.ts` (a test checks the ones written in the texts).
- No HTML in the strings: headings with an emphasis use `Emphasis` (`before`, `em`, `after`), texts with links use `Rich`.
- `localePath(locale, path)` adds the locale prefix; `routes.ts` maps each page to its path per locale (language switch, canonical, `hreflang` with `x-default` → French).

### Client scripts

- `public/js/boot.js`: synchronous, first script of `<head>`. Adds `js`, and `motion-ok` unless reduced motion or calm mode is asked (removed after 3 s if the motion module has not added `motion-ready`).
- `src/scripts/app.ts`: the only module of the page. Elements declare their controllers with `data-controller="name"` (several names separated by spaces); the `CONTROLLERS` registry maps each name to a dynamic `import()` of a module exporting `init(element)`, which returns a cleanup function (`src/lib/controllers.ts`).
- Once every controller has started, `app.ts` sets `html[data-controllers="ready"]` (the E2E tests wait for it: `tests/e2e/ready.ts`); if one fails, it removes `html.js` so the page falls back to its no-JS version. Elements shown only with or without JavaScript use `.js-only` / `.no-js-only` (`utilities.css`).
- **Motion module** (`src/scripts/motion/index.ts`, S06): `app.ts` imports it dynamically under `html.motion-ok` and starts it once the controllers are ready; it adds `motion-ready`. `gsap.matchMedia` (`reduced-motion.ts`) undoes everything if reduced motion is asked meanwhile. Lenis on fine pointers only (same-page links scroll through it and focus their section's heading; modal `<dialog>`s stop it; scrollable panels need `data-lenis-prevent`). Reveals: `data-reveal="lines|fade|image|stagger"`, hidden by `motion.css` under `html.motion-ok` until marked `data-revealed`. Lamp buttons (`.button-primary`) emit `bv:lamp` (hover, press) for the bubbles.
- **Hero « Surface »** (`components/hero/hero.ts`, S07): started by the motion module. Intro E15 (`motion.css` hides the hero title and the HUD figures under `motion-ok` until `html[data-intro]`), immersion E2 scrubbed by the hero scroll, WebGL surface (`hero-surface.ts` → `scripts/webgl/surface.ts`, OGL, shaders in `lib/webgl/shaders/`) loaded after `load` + idle if `canUseWebGL()`, else a CSS water line. Rollback: `WEBGL_SURFACE = false`. The full-viewport photo is never Chromium's LCP element: the hero text is (D41).
- **Descent** (S08): bubbles (`lib/bubbles/` pure, `scripts/bubbles/emitter.ts` canvas created on the first release; any script may dispatch `bv:bubbles` `{ x, y, count, depth? }`, a no-op without motion); tab motion on `bv:tabs` (`ui/tabs-motion.ts`); interlude parallax and bubble trail on fine pointers (`interlude/interlude.ts`); depth ladder pinned on desktop only (`depth-ladder/ladder.ts`, `refreshPriority: 1`; Lenis resizes on every ScrollTrigger refresh, and the scroll follows a hash target below the pin).
- **HUD** (`components/hud/hud.ts`, essential controller): coarse depth from an IntersectionObserver, precise readings from `scripts/motion/depth.ts`; `setMode('normal'|'hidden'|'safety-stop')` for S08/S10; emits `bv:section` (the nav marks its links `aria-current`). Depths of every section, hidden ones included, come from `HUD_PROFILE` (`data/sections.ts`). On desktop the `.wrap` keeps a lane for the HUD (`utilities.css`).
- **Water** (`components/water/`): sections paint their own tone; the fixed water column only shows through the thermoclines (no text on a gradient).
- Shared UI: `ui/Section.astro` (anchor, tone, HUD depths from `sections.ts`; it forwards the parent's `data-astro-cid-*`, otherwise the parent's scoped styles miss it), `ui/TabList.astro` + `ui/tabs.ts` (APG tabs, panels stacked without JS), `ui/ArtPicture.astro` (one crop per media query).

### Rules that are easy to break

- **No inline script** (the target CSP forbids them): `is:inline` only on a `<script src>` pointing to a file of `public/` (boot.js, consent-default.js) and on JSON-LD. `npx playwright test --project=csp` runs a full visit under the headers of `ops/nginx/security-headers.conf` and fails on any CSP violation. `vite.build.assetsInlineLimit: 0` stops Astro from inlining small scripts and Vite from producing `data:` URIs. `check:dist` fails the build on an inline script, an inline event handler, a `javascript:` URL, or a script or stylesheet of another origin (everything is self-hosted).
- **Astro 7**: the Rust compiler no longer fixes HTML (close every tag, no block inside `<p>`); `compressHTML: 'jsx'` removes whitespace that contains a line break between elements, so keep a wanted space on the same line (`{a} <em>{b}</em>`) or write `{' '}`.
- No design value hard-coded: colors, spacing, radii, durations and easings come from `src/styles/tokens.css` (provisional values until S02).
- Animate only `transform`, `opacity`, `clip-path` (and `filter` sparingly); no `scroll` listener to animate.

## Contact / WhatsApp

- **WhatsApp number**: `41794368112` (E.164 without `+`); **phone**: `+41 79 436 81 12`; **email**: `nicholas@bullesenvalais.ch`. In the redesign they move to `src/data/contact.ts` (S03).
- Without JavaScript the form cannot be sent (`contact.php` accepts JSON only): it shows a notice pointing to WhatsApp, phone and e-mail (decision for S10). The submit button stays disabled until `contact-form.ts` starts.
- The contact form POSTs JSON to `/api/contact` (`public/api/contact.php`), with a hidden honeypot field `website`, `elapsed` (ms since the page loaded) and `locale`. On failure the form shows an error — listing the fields the server rejected, if any — with a pre-filled `mailto:` link (never opened automatically).
- `contact.php` checks, in order: method, `Content-Type: application/json`, `Origin` allowlist, body ≤ 32 KB, valid JSON, spam (honeypot filled or `elapsed` < 3 s → fake 200, nothing sent, only the reason logged; a missing `elapsed` is accepted: pages loaded before the 30.09.2026 deploy do not send it), field rules. It then sends one plain-text e-mail through Gmail SMTP (STARTTLS + AUTH LOGIN): base64 body, RFC 2047 headers, envelope addresses from the config only.
- The SMTP credentials live in `mail-config.php` on the Pi, next to `contact.php`: **never read, print, commit or sync it**. Any local copy is gitignored (`api/mail-config.php`, `public/api/mail-config.php`) and useless: the tests use `tests/php/test-config.php`. A copy in `public/api/` would end up in `dist/`.

## Live site (`main`) — until S13

The notes below describe the current production and apply to the `main` branch until S13, which deploys `dist/` as atomic releases (`plans/refonte-la-descente/02-architecture.md` §16). Nothing is deployed from `refonte/la-descente` before S12.

### Run the old site locally (from a `main` worktree)

```bash
python3 -m http.server 8000 --bind 127.0.0.1
# then open http://localhost:8000
```

Always bind to `127.0.0.1`: the server serves the whole working tree as plain text, including gitignored files, to anyone on the network otherwise. Binding is not enough against DNS rebinding (the server ignores the `Host` header), so keep no secrets in the working tree.

### Preview on the Pi (styleguide, D31)

When Nicholas reviews from a distance, the styleguide is published next to the live site, without touching it: only `_astro/`, `js/` and `styleguide/` of `dist/` go to the docroot (they do not exist in the old site), `noindex`, linked from nowhere. Dry run first; `-rlt` (not `-a`, which would give the docroot the owner and mode of the Mac); the scoped `--delete` only removes stale files of those three folders; `chown` only them:

```bash
npm run build
rsync -rltv -n --delete --omit-dir-times --rsync-path="sudo rsync" \
  --include='/_astro/***' --include='/js/***' --include='/styleguide/***' --exclude='*' \
  dist/ pi@bullesenvalais.ch:/var/www/html/dive/
# then the same command without -n, and:
ssh pi@bullesenvalais.ch "sudo chown -R www-data:www-data /var/www/html/dive/_astro /var/www/html/dive/js /var/www/html/dive/styleguide"
```

URL: `https://dive.bullesenvalais.ch/styleguide/`. Never send `index.html`, `en/` or `api/` this way: they would replace the live site.

### Deploy to Raspberry Pi

The Pi serves the site from `/var/www/html/dive` via nginx. There is no git repo on the Pi — deploy by rsync, from `main`:

```bash
# Single file
rsync -av --rsync-path="sudo rsync" \
  --exclude='.git' --exclude='.venv' --exclude='.idea' \
  path/to/file.jsx pi@bullesenvalais.ch:/var/www/html/dive/path/to/

# Whole site: dry run first (-n), then the same command without -n.
# Allowlist: only what the site serves. Never tests/, plans/, docs, local secrets
# (settings.json, .env…), and never the Pi's own mail-config.php.
rsync -av -n --rsync-path="sudo rsync" \
  --include='/index.html' --include='/app.jsx' --include='/components/***' --include='/images/***' \
  --include='/api/' --include='/api/contact.php' --exclude='*' \
  /Users/nicholas/projects/bulles_en_valais/ pi@bullesenvalais.ch:/var/www/html/dive/

# Toujours corriger les permissions après rsync (macOS rsync ne supporte pas --chown)
ssh pi@bullesenvalais.ch "sudo chown -R www-data:www-data /var/www/html/dive"
```

> Le `chown` est obligatoire après chaque rsync : sans lui, les fichiers sont copiés avec le propriétaire Mac (uid 501) et nginx (`www-data`) ne peut pas les lire → 403.

After nginx config changes: `ssh pi@bullesenvalais.ch "sudo nginx -t && sudo systemctl reload nginx"`

### Nginx config

Lives at `/etc/nginx/sites-available/bullesenvalais` on the Pi. The `dive` server block serves `dive.bullesenvalais.ch` (and the other `dive.*` names listed in `ALLOWED_ORIGINS`) from `/var/www/html/dive` with `index index.html`: static files, plus PHP for the contact endpoint only. `/api/contact` is internally redirected to `/api/contact.php`, the only PHP file executed (PHP-FPM 7.4, rate limit `zone=contact`: 5 requests/min per IP, burst 3, HTTP 429; body ≤ 32 KB); any other `.php` and any other path under `/api/` return 404. Other unknown paths return `index.html` with a 200 (SPA fallback), so check files on the Pi with `ls`, not `curl`. Logs: `/var/log/nginx/dive.access_log` and `dive.error_log`.

Security headers are set in the `dive` server block only. The current `script-src` includes both `'unsafe-inline'` and `'unsafe-eval'` because Babel Standalone compiles the JSX in the browser and injects it as inline scripts; the redesign removes both (target CSP: `02-architecture.md` §14).

### Old architecture (`legacy/`)

React 18 + Babel Standalone from unpkg, JSX compiled in the browser; each component exposes itself on `window`. All copy in `legacy/components/i18n.jsx` (`TRANSLATIONS.fr` / `.en`), language chosen on the client. `Tweaks.jsx` and the `postMessage` edit mode are leftovers of a mock-up tool.
