# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

### Run locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

No build step. No package manager. No Node required.

### Deploy to Raspberry Pi

The Pi serves the site from `/var/www/html/dive` via nginx. There is no git repo on the Pi — deploy by rsync:

```bash
# Single file
rsync -av --rsync-path="sudo rsync" \
  --exclude='.git' --exclude='.venv' --exclude='.idea' \
  path/to/file.jsx pi@bullesenvalais.ch:/var/www/html/dive/path/to/

# Whole project (excluding git/venv/idea)
rsync -av --rsync-path="sudo rsync" \
  --exclude='.git' --exclude='.venv' --exclude='.idea' \
  /Users/nicholas/projects/bulles_en_valais/ pi@bullesenvalais.ch:/var/www/html/dive/

# Toujours corriger les permissions après rsync (macOS rsync ne supporte pas --chown)
ssh pi@bullesenvalais.ch "sudo chown -R www-data:www-data /var/www/html/dive"
```

> Le `chown` est obligatoire après chaque rsync : sans lui, les fichiers sont copiés avec le propriétaire Mac (uid 501) et nginx (`www-data`) ne peut pas les lire → 403.

After nginx config changes: `ssh pi@bullesenvalais.ch "sudo nginx -t && sudo systemctl reload nginx"`

### Nginx config

Lives at `/etc/nginx/sites-available/bullesenvalais` on the Pi. The `dive` server block serves `dive.bullesenvalais.ch` from `/var/www/html/dive` with `index index.html` (static, no PHP).

## Architecture

### No-build stack

React 18 + Babel Standalone loaded from unpkg CDN with SRI hashes. JSX is transpiled **in the browser** at runtime. Every component file ends with `window.ComponentName = ComponentName` to expose it as a global — this is how `index.html` wires them together.

Load order in `index.html` matters: `i18n.jsx` and `Icons.jsx` must come before any component that uses them. `app.jsx` is last.

### Component model

Each `.jsx` file in `components/` is a self-contained React component that receives a `t` prop (translation object) and renders a page section. Components are pure presentational — no data fetching, no shared state. All state lives in `App` (`app.jsx`).

### Translations

All copy lives in `components/i18n.jsx` as a single `TRANSLATIONS` object (`fr` / `en`). The `useT(lang)` hook (defined in `i18n.jsx`, exposed as `window.useT`) returns the correct sub-tree. To add or change any visible text, edit only `i18n.jsx`.

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
- Contact form POSTs to `/api/contact`; on failure it falls back to a pre-filled `mailto:` link (no backend exists yet).

### Scroll reveal

`App` sets up a single `IntersectionObserver` that adds `.visible` to `.reveal` elements when they enter the viewport. It re-runs whenever `state.hero`, `state.agencyLayout`, or `lang` changes (layout shifts may create new `.reveal` nodes).
