# Bulles en Valais — « La Descente »

Site de [dive.bullesenvalais.ch](https://dive.bullesenvalais.ch/) : Nicholas Jallan, instructeur de plongée multi-agences (SDI/TDI, PADI, FFESSM) en Valais.

Une page unique où le défilement fait plonger : de la surface du lac (hero en WebGL) vers le bleu profond (Spécialités, lampe torche), puis la remontée vers le Contact. Profondimètre, bulles qui grossissent en remontant, couleurs qui changent avec la profondeur, palier de sécurité sur la FAQ. Tout reste lisible et utilisable sans mouvement (`prefers-reduced-motion`, « Mode calme ») et sans JavaScript.

- **Français** à `/`, **anglais** à `/en/` (architecture prête pour l'allemand) ; pages Confidentialité, Mentions légales et 404.
- Formulaire de contact → `api/contact.php` (PHP 7.4, SMTP Gmail, anti-spam, plafond quotidien), WhatsApp, téléphone.
- Bandeau de consentement + Google Consent Mode v2 (balise Google Ads / GA4).

## Stack

Astro 7 (build statique) · TypeScript · GSAP 3 + Lenis (mouvement) · OGL (WebGL du hero) · vanilla-cookieconsent. Aucun framework UI au runtime, aucun CDN : tout est auto-hébergé. Tests : Vitest, Playwright (E2E, accessibilité avec axe, régression visuelle, CSP), tests PHP sans dépendance.

## Développer

Node ≥ 22.12.

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # dist/ + contrôle check:dist (aucun script inline, aucun secret)
npm run check          # types
npm test               # tests unitaires (dont la parité FR/EN)
npm run test:e2e       # Playwright (build + preview)
npm run check:budgets  # budgets JS/CSS gzip
```

Toutes les commandes, l'architecture et les règles du projet : [`CLAUDE.md`](CLAUDE.md). Historique de la refonte : [`plans/refonte-la-descente/`](plans/refonte-la-descente/).

## Mettre en ligne

Le Raspberry Pi sert le site depuis des **releases atomiques** : `/var/www/bullesenvalais/current` → `releases/<horodatage UTC>/`.

```bash
ops/deploy.sh production --dry-run   # build + tests, puis liste de ce qui partirait
ops/deploy.sh production             # nouvelle release, fumée, bascule du lien (confirmation demandée)
ops/rollback.sh --list               # releases disponibles
ops/rollback.sh previous             # retour à la release précédente
```

L'arbre git doit être propre. Les 5 dernières releases sont gardées. La configuration nginx de référence est dans [`ops/nginx/`](ops/nginx/) (bloc `dive.conf`, en-têtes et CSP `security-headers.conf`).
