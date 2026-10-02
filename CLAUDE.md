# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

- **`main` is the live site**: the static Astro 7 build of the redesign "La Descente", served on the Pi from atomic releases (see [Production](#production-raspberry-pi)). Released as `v2.0.0` on 2026-10-02 (S13).
- The redesign plan, its decisions (D1–D56) and journal stay in `plans/refonte-la-descente/` (`PROGRESS.md`): read them before changing a choice made there. Follow-up plan: `plans/mesure-google/` (GA4, Ads conversions, tighter CSP).
- The old React site lives only in git history (tag `v1-legacy`, before the merge of the redesign).

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
npm run test:csp        # full visit under the production headers of ops/nginx/security-headers.conf
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

## Architecture

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
ops/                       deploy.sh · rollback.sh (releases on the Pi) · lib/common.sh
ops/nginx/                 dive.conf: reference copy of the live nginx blocks · security-headers.conf: CSP and headers (snippet on the Pi)
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
- **Hero « Surface »** (`components/hero/hero.ts`, S07): started by the motion module. Intro E15 (`motion.css` hides the hero title and the HUD figures under `motion-ok` until `html[data-intro]`), immersion E2 scrubbed by the hero scroll, WebGL surface (`hero-surface.ts` → `scripts/webgl/surface.ts`, OGL, shaders in `lib/webgl/shaders/`) loaded after `load` + idle if `canUseWebGL()`, else a CSS water line. The ripples live on the lake in metres (D49): `lib/webgl/lake.ts` holds the camera calibrated on the photo (projection photo ↔ lake, mirrored by `lakeAt` in `lake.glsl`); a new hero photo needs a new calibration and water mask. Rollback: `WEBGL_SURFACE = false`. The full-viewport photo is never Chromium's LCP element: the hero text is (D41).
- **Descent** (S08): bubbles (`lib/bubbles/` pure, `scripts/bubbles/emitter.ts` canvas created on the first release; any script may dispatch `bv:bubbles` `{ x, y, count, depth? }`, a no-op without motion); tab motion on `bv:tabs` (`ui/tabs-motion.ts`); interlude parallax and bubble trail on fine pointers (`interlude/interlude.ts`); depth ladder pinned whenever motion runs, in one column on a phone (`depth-ladder/ladder.ts`, `refreshPriority: 1`, no `anticipatePin`; Lenis resizes on every ScrollTrigger refresh, and the scroll follows a hash target below the pin).
- **Abyss and route** (S09): lamp of the Specialties (`specialties/torch.ts`, pure part `lib/torch/`): a beam moved in `transform` over the content's back layer, motes drawn once in a low-res canvas, the card under it gets `is-lit`, keyboard focus puts it on the focused tab or panel, idle drift; out of the beam the cards sit at `--torch-dim` (AA, tested), lit ones are opaque with a warm title, and the beam spills over the section's top and bottom edges; pinned horizontal track of Places whenever motion runs, the map above the sites on a phone (`places/places.ts`, `refreshPriority: 1`): the river is drawn by `stroke-dashoffset` on a `pathLength="1"` path (station shares in `data-fraction`, `lib/geo.ts`), a focused link scrolls the page to its site, photo reveals deferred to `containerAnimation` triggers (`data-reveal-defer`, `revealElement()`); the window hides its overflow (axe) and keeps its own scroll at 0. Without motion, narrow screens show a row of cards in `scroll-snap`.
- **Ascent** (S10): shared horizontal track `scripts/motion/pinned-track.ts` (pin, scrubbed track, window kept at 0, focused link brought into view, photos revealed by `containerAnimation`, `refreshPriority: 1`; used by Places and the Testimonials: any future rail follows it, D45); Testimonials pinned on every screen (`testimonials/testimonials.ts` takes the buttons over from `rail.ts` through `takeOverRail()`; a review taller than the window is cut short with « Lire l'avis en entier » → `<dialog>`; below 260 px of window, the native rail stays); voucher tilt on fine pointers (`gifts/gift-card.ts`, `lib/motion/tilt.ts`); safety stop (`faq/safety-stop.ts`, essential controller: `setMode('safety-stop')` while the FAQ crosses the middle of the screen, clock in `lib/depth/safety-stop.ts`); Snell's window opened by the scroll (`contact/snell.ts`).
- **HUD** (`components/hud/hud.ts`, essential controller): coarse depth from an IntersectionObserver, precise readings from `scripts/motion/depth.ts`; `setMode('normal'|'hidden'|'safety-stop')` for S08/S10; emits `bv:section` (the nav marks its links `aria-current`). Depths of every section, hidden ones included, come from `HUD_PROFILE` (`data/sections.ts`). On desktop the `.wrap` keeps a lane for the HUD (`utilities.css`).
- **Water** (`components/water/`): sections paint their own tone; the fixed water column only shows through the thermoclines (no text on a gradient).
- Shared UI: `ui/Section.astro` (anchor, tone, HUD depths from `sections.ts`; it forwards the parent's `data-astro-cid-*`, otherwise the parent's scoped styles miss it), `ui/TabList.astro` + `ui/tabs.ts` (APG tabs, panels stacked without JS), `ui/ArtPicture.astro` (one crop per media query).

### Rules that are easy to break

- **No inline script** (the target CSP forbids them): `is:inline` only on a `<script src>` pointing to a file of `public/` (boot.js, consent-default.js) and on JSON-LD. `npx playwright test --project=csp` runs a full visit under the headers of `ops/nginx/security-headers.conf` and fails on any CSP violation. `vite.build.assetsInlineLimit: 0` stops Astro from inlining small scripts and Vite from producing `data:` URIs. `check:dist` fails the build on an inline script, an inline event handler, a `javascript:` URL, or a script or stylesheet of another origin (everything is self-hosted).
- **Astro 7**: the Rust compiler no longer fixes HTML (close every tag, no block inside `<p>`); `compressHTML: 'jsx'` removes whitespace that contains a line break between elements, so keep a wanted space on the same line (`{a} <em>{b}</em>`) or write `{' '}`.
- No design value hard-coded: colors, spacing, radii, durations and easings come from `src/styles/tokens.css` .
- Animate only `transform`, `opacity`, `clip-path` (and `filter` sparingly); no `scroll` listener to animate.

## Contact / WhatsApp

- **WhatsApp number**: `41794368112` (E.164 without `+`); **phone**: `+41 79 436 81 12`; **email**: `nicholas@bullesenvalais.ch`. Source: `src/data/contact.ts`.
- Without JavaScript the form cannot be sent (`contact.php` accepts JSON only): it shows a notice pointing to WhatsApp, phone and e-mail (kept in S10, D47). The submit button stays disabled until `contact-form.ts` starts.
- The contact form POSTs JSON to `/api/contact` (`public/api/contact.php`), with a hidden honeypot field `website`, `elapsed` (ms since the page loaded) and `locale`. On failure the form shows an error — listing the fields the server rejected, if any; « try again in a minute » on 429; « the form is taking a break » on 503 busy — with a pre-filled `mailto:` link (never opened automatically) and WhatsApp. Success releases a burst of bubbles (`bv:bubbles`, `lib/bubbles/events.ts`).
- `contact.php` checks, in order: method, `Content-Type: application/json`, `Origin` allowlist, body ≤ 32 KB, valid JSON, spam (honeypot filled, `elapsed` missing or < 3 s → fake 200, nothing sent, only the reason logged), field rules, then the **daily limit** (50 e-mails, D46: locked counter `/var/www/bullesenvalais/shared/state/contact-quota`, plain file only; past it `503 {error:"busy"}` without sending; an unusable counter sends anyway and logs it). It then sends one plain-text e-mail through Gmail SMTP (STARTTLS + AUTH LOGIN): base64 body, RFC 2047 headers, envelope addresses from the config only.
- The SMTP credentials live in `mail-config.php` on the Pi: `/var/www/bullesenvalais/shared/mail-config.php` (constant `MAIL_CONFIG_FILE`, outside the releases; a missing file → 500 and a log line); a copy also remains in the old docroot `/var/www/html/dive/api/` until it is archived: **never read, print, commit or sync it**. Any local copy is gitignored (`api/mail-config.php`, `public/api/mail-config.php`) and useless: the tests use `tests/php/test-config.php`. A copy in `public/api/` would end up in `dist/`.

## Production (Raspberry Pi)

`ssh pi@bullesenvalais.ch`: Debian, nginx 1.22.1, PHP-FPM 7.4 (the default of every site on the Pi; `php8.2` passes the unit tests of `contact.php` but its FPM pool is stopped: switching dive to it is a separate, tested step). Any action on the Pi (ssh writes, nginx, deploy) needs Nicholas's agreement in the session, with a dry run first.

```
/var/www/bullesenvalais/
├── releases/<YYYYMMDD-HHMMSS>/   one build of dist/ each (UTC, root:root, read by www-data)
├── current -> releases/…         served by the dive block
├── staging -> releases/…         pre-production release (served by no nginx block)
├── shared/                       750 root:www-data: mail-config.php (640), state/contact-quota (dir 700 www-data)
└── deploy.log
```

### Deploy

```bash
ops/deploy.sh production --dry-run   # npm ci, tests, build, pre-flight on the Pi, rsync -n
ops/deploy.sh production             # new release, smoke test (files, php7.4 -l), atomic switch, HTTP check; asks y/N
ops/deploy.sh staging                # same, on the staging link
ops/rollback.sh --list | previous | <release>   # production by default; `staging previous` for staging
```

A clean git tree is required. A release that fails before the switch is removed; if `/` stops answering after the switch, the previous release is put back. The last 5 releases are kept (never the ones `current` or `staging` point to). `--skip-build` reuses `dist/` (trusted to match HEAD).

### nginx

`/etc/nginx/sites-available/bullesenvalais` (also holds other sites: shop, fede, silence, dp-fede, which are not ours). Reference copy of our blocks: `ops/nginx/dive.conf`; headers snippet `/etc/nginx/snippets/bulles-security-headers.conf` = `ops/nginx/security-headers.conf`. To change them: back up the file on the Pi, edit, `sudo nginx -t && sudo systemctl reload nginx`, check the other sites still answer, then copy the change into `ops/nginx/`.

- `root /var/www/bullesenvalais/current`; real 404 (`try_files $uri $uri/ =404`, `error_page 404 /404.html`), no SPA fallback.
- Cache: `/_astro/` 1 year `immutable`; images, icons and fonts 30 days; HTML and unhashed files (`js/boot.js`, `js/consent-default.js`…) `no-cache`. gzip level 6 for the text types (the `http` block compresses only HTML).
- Every `location` with its own `add_header` includes the headers snippet again (nginx drops the inherited ones there).
- PHP: only `location = /api/contact.php` (`/api/contact` is redirected to it internally): `limit_req zone=contact` 5/min per IP, burst 3, 429; body ≤ 32 KB; `SCRIPT_FILENAME $realpath_root…` (no stale release after a switch). Any other `.php` and anything else under `/api/` → 404. A new PHP endpoint needs its own exact `location`.
- `http` block: TLS 1.2 and 1.3 only (since S13). certbot renews all the names by webroot `/var/www/html/dive` (`location ^~ /.well-known/acme-challenge/`): keep that folder, or change `webroot_path`, when the old docroot is removed.
- Logs: `/var/log/nginx/dive.access_log`, `dive.error_log` (rotated weekly by `/etc/logrotate.d/nginx-dive`, 8 kept); `contact:` lines for the endpoint (rejections, SMTP step, `daily limit reached`).

### Rollback to the old site (until the old docroot is archived, J+14)

The old React site is intact in `/var/www/html/dive`. Last resort: restore `/etc/nginx/sites-available/bullesenvalais.bak-20261002-155459-s13`, then `sudo nginx -t && sudo systemctl reload nginx`. Prefer `ops/rollback.sh previous`.
