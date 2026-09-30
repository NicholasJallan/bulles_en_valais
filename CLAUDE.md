# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

### Run locally

```bash
python3 -m http.server 8000 --bind 127.0.0.1
# then open http://localhost:8000
```

Always bind to `127.0.0.1`: the server serves the whole working tree as plain text, including gitignored files, to anyone on the network otherwise. Binding is not enough against DNS rebinding (the server ignores the `Host` header), so keep no secrets in the working tree: nothing local needs `api/mail-config.php` (the tests use `tests/php/test-config.php`).

No build step. No package manager. No Node required. The contact endpoint is PHP, so with this static server a form submission fails and shows the error state.

### Test the contact endpoint

```bash
php tests/php/contact_test.php      # unit tests, dependency-free (local PHP: brew install php)
bash tests/php/run_integration.sh   # PHP built-in server + fake SMTP server (needs curl, lsof, Python 3.8+; ports 8099 and 2525)
bash tests/php/run_unit_php74.sh    # unit tests with the production PHP 7.4, piped over ssh to the Pi (ask first)
```

Production runs **PHP-FPM 7.4**: keep `api/contact.php` compatible with PHP 7.4 (no `str_starts_with`, `match`, union types, named arguments…). `php7.4 -l` only checks the syntax; `run_unit_php74.sh` runs the unit tests, which call every function including the entry points, under 7.4 without writing anything on the Pi.

### Deploy to Raspberry Pi

The Pi serves the site from `/var/www/html/dive` via nginx. There is no git repo on the Pi — deploy by rsync:

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

Security headers are set in the `dive` server block only. The `script-src` directive includes both `'unsafe-inline'` and `'unsafe-eval'` because Babel Standalone (no-build architecture) fetches JSX files via XHR, compiles them, and injects the result as inline scripts into the DOM — both flags are required for this to work.

## Architecture

### No-build stack

React 18 + Babel Standalone loaded from unpkg CDN with SRI hashes. JSX is transpiled **in the browser** at runtime. Every component file ends with `window.ComponentName = ComponentName` to expose it as a global — this is how `index.html` wires them together.

Load order in `index.html` matters: `i18n.jsx` and `Icons.jsx` must come before any component that uses them. `app.jsx` is last.

### Component model

Each `.jsx` file in `components/` is a self-contained React component that receives a `t` prop (translation object) and renders a page section. Components are pure presentational — no data fetching, no shared state. All state lives in `App` (`app.jsx`).

### Translations

All copy lives in `components/i18n.jsx` as a single `TRANSLATIONS` object (`fr` / `en`). The `useT(lang)` hook (defined in `i18n.jsx`, exposed as `window.useT`) returns the correct sub-tree. To add or change any visible text, edit only `i18n.jsx`.

**FR/EN parity is mandatory.** Every change to `i18n.jsx` must be applied to both the `fr` and `en` subtrees — same keys, same values (translated), same structure. Never update one language without updating the other.

### Design tokens

CSS custom properties defined in the `<style>` block of `index.html`:
- `[data-theme="dark"]` — dark mode overrides
- `[data-palette="nordic|glacier|sunset"]` — palette overrides
- Hero layout, agency layout, and dark mode are runtime-toggled via `data-` attributes on `<html>`

### Tweaks panel

`Tweaks.jsx` is a floating dev/demo panel (bottom-left) that switches palette, hero layout, agency layout, and dark mode. It communicates state changes upstream via `window.parent.postMessage` (for iframe embedding). The `DEFAULTS` object at the top of `app.jsx` controls which variant ships as the production default.

### Contact / WhatsApp

- **WhatsApp number**: `41794368112` (E.164 without `+`) — set in `components/Chat.jsx` (`PHONE` const) and `components/Contact.jsx` (`wa.me` href).
- **Phone**: `+41 79 436 81 12` — `tel:` href in `Contact.jsx`.
- **Email**: `nicholas@bullesenvalais.ch` — mailto fallback in `Contact.jsx`.
- Contact form POSTs JSON to `/api/contact` (`api/contact.php`), with a hidden honeypot field `website`, `elapsed` (ms since the page loaded) and `locale`. On failure the form shows an error — listing the fields the server rejected, if any — with a pre-filled `mailto:` link (never opened automatically).
- `api/contact.php` checks, in order: method, `Content-Type: application/json`, `Origin` allowlist, body ≤ 32 KB, valid JSON, spam (honeypot filled or `elapsed` < 3 s → fake 200, nothing sent, only the reason logged; a missing `elapsed` is accepted: pages loaded before the 30.09.2026 deploy do not send it), field rules. It then sends one plain-text e-mail through Gmail SMTP (STARTTLS + AUTH LOGIN): base64 body, RFC 2047 headers, envelope addresses from the config only. The SMTP credentials live in `api/mail-config.php` on the Pi (any local copy is gitignored): never read, print, commit or sync it.

### Scroll reveal

`App` sets up a single `IntersectionObserver` that adds `.visible` to `.reveal` elements when they enter the viewport. It re-runs whenever `state.hero`, `state.agencyLayout`, or `lang` changes (layout shifts may create new `.reveal` nodes).
