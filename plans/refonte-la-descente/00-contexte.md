# 00 — Contexte global

> À lire au début de **chaque** session. État établi par l'audit du 30.09.2026.

## 1. Le projet

- **Bulles en Valais** : site de **Nicholas Jallan**, instructeur de plongée multi-agences en Valais (Suisse).
  - Crédits : **SDI/TDI #35812**, **PADI MSDT #525399**, **FFESSM E4 / Trimix** (jusqu'au PTH120), **DEJEPS** (carte pro `07425ED0350`), **CAH 2B**. Plus de 20 ans de plongée. Photographe sous-marin (photos signées « © Nicholas Jallan »).
  - Lieux : **Lac du Rosel** (Martigny, `46°05′N · 7°04′E`), **Les Îles de Sion** (`46°14′N · 7°22′E`), **Léman sud-est** (`46°24′N · 6°50′E`).
  - Positionnement : petits groupes (souvent un-à-un, trois élèves au plus), progression au rythme de l'élève, « je forme des plongeurs, pas des certifiés ». SDI/TDI est mis en avant par défaut (voir les changements en cours, §4.4).
- **But du site** : générer des prises de contact (formulaire, WhatsApp, téléphone) et servir de page d'atterrissage aux campagnes **Google Ads** (`AW-10798308119`).
- URL canonique : `https://dive.bullesenvalais.ch/`. `bullesenvalais.ch` et `www.` redirigent en 301 vers `dive.`.
- Contacts publics : WhatsApp et téléphone `+41 79 436 81 12` (E.164 sans `+` : `41794368112`), e-mail `nicholas@bullesenvalais.ch`.

## 2. Infrastructure

- **Raspberry Pi**, Debian, **nginx 1.22.1**, HTTP/2, Let's Encrypt. Accès : `ssh pi@bullesenvalais.ch`.
- Docroot actuel : `/var/www/html/dive` (server block `dive` dans `/etc/nginx/sites-available/bullesenvalais`).
- **PHP-FPM 7.4** (`php7.4-fpm.service`, socket `/run/php/php7.4-fpm.sock`) exécute `/api/contact.php` (constat S00). Le PHP en ligne de commande du Pi est en 8.2, mais c'est bien FPM 7.4 qui sert le site : **le code PHP doit rester compatible 7.4** (ni `str_starts_with`, ni `match`, ni types union, ni arguments nommés… un `str_starts_with` a déjà planté le 28.04.2026). Contrôle sans rien écrire sur le Pi : `ssh pi@bullesenvalais.ch php7.4 -l < api/contact.php`.
  - `api/mail-config.php` (identifiants SMTP Gmail) existe sur le Pi **et en local** (copie gitignorée). Il ne doit jamais être lu, affiché, committé ni synchronisé.
  - Depuis S00, dans le bloc `dive`, **seul `/api/contact.php` exécute du PHP** (`location = /api/contact.php` : `limit_req` 5 req/min par IP, rafale 3, 429 ; corps ≤ 32 Ko) ; `/api/contact` y est redirigé en interne ; tout autre `.php` répond 404.
- Journaux du bloc `dive` : `/var/log/nginx/dive.access_log` et `dive.error_log`, **non couverts par logrotate** (motif `*.log`) : ≈ 270 Mo au 30.09.2026.
- `/api/csp/report` (cible du `report-uri`) n'existe pas : les rapports CSP (≈ 1 250 `POST` dans le journal) tombent sur le repli SPA.
- nginx sert `index.html` pour **toute** URL inconnue (repli SPA) : `/robots.txt`, `/sitemap.xml` et `/en/` répondent 200 avec la page d'accueil (soft 404).
- En-têtes actuels (server block `dive`) : HSTS preload, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, et une CSP :
  ```
  default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://www.googletagmanager.com;
  script-src-elem 'self' 'unsafe-inline' https://unpkg.com https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https://images.unsplash.com https://www.google.com https://www.googleadservices.com https://googleads.g.doubleclick.net;
  connect-src 'self' https://www.google.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.googletagmanager.com;
  frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'; report-uri /api/csp/report;
  ```
  → `connect-src` n'autorise pas `*.google-analytics.com` : **le GA4 `G-QG5ZCVY1Z7`, chargé via la balise Google, est bloqué** (erreurs console, aucune donnée).
- Déploiement actuel : `rsync` depuis le Mac puis `sudo chown -R www-data:www-data /var/www/html/dive` (obligatoire, sinon 403). Recharger nginx : `sudo nginx -t && sudo systemctl reload nginx`.

## 3. Dépôt et outils

- GitHub **public** : `NicholasJallan/bulles_en_valais`, branche par défaut `main` = site en ligne. `gh` authentifié (compte `NicholasJallan`).
- Refonte sur la branche **`refonte/la-descente`**, créée depuis `main` en S01 (après S00). Fusion dans `main` en S13.
- Mac : **Node 26.10.0**, **npm 11.19.1**, **ffmpeg 9.0.2**, `cwebp`, Python 3.14 (`.venv/` du projet), Homebrew, **PHP 8.5** (installé en S00 pour les tests du formulaire ; la production est en 7.4, voir §2).
- MCP utiles : `chrome-devtools` (Lighthouse, traces de performance, captures), `nano-banana` (génération et retouche d'images, S04). La skill `xccr-diver-render` (fal.ai) existe mais demande que le MCP fal-ai soit configuré.
- Versions npm vérifiées le 30.09.2026 : `astro@7.3.5` (Node ≥ 22.12), `gsap@3.15.0` (tous les plugins gratuits, licence « Standard no charge »), `lenis@1.3.26`, `ogl@1.0.11` (Unlicense), `@astrojs/sitemap@3.7.4`, `vanilla-cookieconsent@3.1.0`, `vitest@5.0.3`, `@playwright/test@1.63.0`, `@axe-core/playwright@4.13.0`, `sharp@0.35.5`.
- Installées en S01 (01.10.2026) : les versions ci-dessus, plus `typescript@6.0.3` (D16 : `@astrojs/check@0.9.10` ne prend pas encore TypeScript 7 en charge), `@astrojs/check@0.9.10`, `prettier@3.9.9`, `prettier-plugin-astro@1.1.0` et `es-module-lexer@2.3.2` (budgets).
- **Astro 7** (sorti le 22.06.2026) : compilateur Rust par défaut (**plus aucune correction HTML automatique** : balise non fermée = erreur), **`compressHTML: 'jsx'` par défaut** (les espaces entre éléments inline disparaissent comme en React : mettre `{' '}` explicitement), Vite 8 + Rolldown, `src/fetch.ts` réservé. Fonts API et `security.csp` stables depuis Astro 6.
  - Sous un agent (Claude Code), `astro dev` et `astro preview` **passent en arrière-plan** (processus détaché, fichier verrou) : `npx astro dev stop` / `npx astro preview stop` pour les arrêter, `--ignore-lock` pour rester au premier plan (c'est ce qu'utilise Playwright).
  - Un script de moins de 4 Ko sans import serait inliné : `vite.build.assetsInlineLimit: 0` l'empêche (D17).
- **Playwright 1.63** : son Firefox (155, build 1543) ne démarre pas sur macOS 27.0.1 (« Could not find profile folder »). Les tests E2E tournent donc sur chromium, webkit, mobile-chrome et mobile-safari ; Firefox n'est validé que s'il fonctionne (D21).

## 4. État des lieux du site actuel (audit du 30.09.2026)

### 4.1 Architecture actuelle (à remplacer)

- `index.html` (1 440 lignes : tout le CSS inline + React 18 + Babel Standalone depuis unpkg) + `app.jsx` + `components/*.jsx`. Chaque composant se déclare sur `window`. JSX compilé **dans le navigateur**.
- Copie FR/EN dans `components/i18n.jsx` (`TRANSLATIONS.fr` / `.en`), langue choisie côté client (`localStorage`). Aucune URL par langue.
- `styles.css` (33 Ko) : **copie divergente et non chargée** de l'ancien CSS. Les classes `.form-confirmed*`, `.form-error`, `.contact-left` et `.contact-lead` n'existent que là : **le panneau de succès et les erreurs du formulaire ne sont pas stylés en production**.
- Code mort : panneau `Tweaks` et mode d'édition `postMessage` (hérités d'un outil de maquettage), variantes de hero et de layout inutilisées.
- `HirondelleTransition.jsx` et `BdeTransition.jsx` sont identiques à l'image près.

### 4.2 Mesures (mobile, CPU ×4, Fast 4G, cache chaud)

- FCP = LCP ≈ **1,8 s**, entièrement en « render delay » (compilation Babel). Ce serait pire à froid.
- ≈ **5 Mo d'images décodées** : `hirondelle.png` 1,6 Mo, `rosel-2400.jpg` 1,6 Mo (servi aussi sur mobile), `nicholas.jpg` 1 Mo. Page de 23 440 px de haut sur mobile.
- Lighthouse mobile : **Accessibilité 91** (contrastes des sur-titres et `.t-sub`, ordre des titres h4, `<select>` sans label, tableau sans en-têtes), **Bonnes pratiques 73** (cookies tiers, erreurs console GA4 et 405), **SEO 83** (pas de meta description, `robots.txt` invalide).

### 4.3 Défauts à ne pas reproduire (checklist pour la refonte)

1. JSX compilé dans le navigateur, CSP avec `unsafe-eval` et unpkg.
2. Images non optimisées (pas d'AVIF/WebP, pas de `srcset`), images de fond CSS non préchargées.
3. Hero : lignes électriques, éolienne et panneau publicitaire visibles sur la photo du Rosel.
4. `hirondelle.png` (visuel IA) : **filigrane Gemini ✦ visible** en bas à droite.
5. Écouteurs `scroll` sans `requestAnimationFrame` (parallaxe des interludes, nav).
6. Animations de propriétés de layout : `.nav { transition: all }` (padding), `.contact-channel:hover { padding-left }`, FAQ en `max-height`.
7. Sélecteur de langue en `<span onClick>` (inaccessible au clavier), burger sans `aria-expanded`, menu mobile sans piège de focus ni `Esc`, dialogue WhatsApp sans gestion du focus (et `aria-label="close"` en anglais sur la page FR), FAQ sans `aria-expanded`, onglets sans sémantique ARIA.
8. Textes codés en dur : « Vous venez de plonger avec moi ? » (témoignages, reste en FR sur la version EN), sur-titre « Valais · Suisse » du hero minimal, `© 2026` dans le pied de page, `aria-label` français des interludes.
9. Témoignages en français sur la page EN, sans attribut `lang`.
10. Échec d'envoi du formulaire → ouverture automatique de `mailto:` **et** affichage « succès » (trompeur). Corrigé en S00 sur l'ancien site.
11. SEO : pas de meta description, pas de `hreflang`, pas de données structurées, soft 404 (§2).
12. GA4 bloqué par la CSP, aucun consentement (Consent Mode v2 exigé par Google pour les visiteurs UE/UK/CH).
13. Formulaire : aucune protection anti-spam, aucune limite de débit — **et une injection SMTP critique**, plus une injection d'en-tête par l'e-mail (`FILTER_VALIDATE_EMAIL` accepte `"a\␊b"@x.ch`). Tout est corrigé en S00 : ne pas régresser.

### 4.4 Changements de contenu de septembre 2026 (commités en S00)

Commit `3ad6146` : SDI/TDI placé avant PADI partout (onglets, comparatif, sélection par défaut, intérêt par défaut `sdi-owd`), **FFESSM E4** à la place de « E3 #28663 », offre PTH120 / Trimix hélium, nouvelle grille tarifaire (PADI +100 CHF, spécialités +50 CHF, cours SDI/TDI chiffrés) et **TDI Nitrox avancé et Decompression Procedures à CHF 250** dans le Cursus comme dans les Spécialités (choix de Nicholas en S00). Ces textes étaient déjà en ligne avant S00 (déployés le 30.09.2026 à 17 h 44) ; S00 a déployé l'alignement TDI.

## 5. Contenu existant (source de vérité pour la migration)

Ordre actuel : Hero → Instructeur (01) → Cursus (02 : SDI/TDI, PADI, FFESSM avec tarifs) → interlude Hirondelle → Comparatif (03) → Spécialités (04 : onglets SDI, TDI, PADI, FFESSM) → Lieux (05) → interlude BDE → Matériel (06) → Assurances (07) → Témoignages (08, 5 avis réels) → FAQ (09, 7 questions) → Contact (10 : WhatsApp, téléphone, e-mail, certifications, formulaire) → pied de page, plus la bulle WhatsApp flottante.

- Tous les textes et tarifs : `legacy/components/i18n.jsx` (dans `components/i18n.jsx` avant S01).
- Images : `images/` (voir `01-direction-artistique.md` §8 pour l'inventaire et l'usage prévu).

## 6. Conventions

- **Langues** : identifiants et code en anglais, commentaires rares et en anglais, **textes visibles uniquement dans `src/i18n/`** (et `src/data/` pour les libellés localisés des données). FR est la langue source ; EN est une vraie traduction, pas du mot à mot.
- **Parité FR/EN obligatoire**, garantie par le type `Dictionary` et par `src/i18n/parity.test.ts`. Ajouter l'allemand = ajouter `'de'` au type `Locale` et laisser TypeScript lister les manques.
- **Organisation par fonctionnalité** (`src/components/<feature>/`), fichiers de 200 à 400 lignes (800 au maximum), fonctions de moins de 50 lignes, pas d'imbrication au-delà de 4 niveaux, immutabilité par défaut.
- **Aucune valeur de design en dur** : couleurs, espacements, rayons, durées et courbes passent par les tokens (`src/styles/tokens.css`, miroir TS dans `src/lib/motion/tokens.ts`).
- **Pas de framework UI au runtime** (ni React ni Preact) : composants `.astro` + petits contrôleurs TypeScript pilotés par attributs `data-*`.
- **TDD** sur `src/lib/**` (Vitest, couverture ≥ 80 %) et sur le PHP du formulaire. E2E Playwright pour les parcours. Régression visuelle en complément.
- **Commits conventionnels** : `type: description` (voir `~/.claude/rules/common/git-workflow.md`).
- Pas de `console.log` dans le code livré.

## 7. Budgets et barres de qualité

| Métrique (mobile, CPU ×4, Fast 4G, cache vide) | Cible |
|---|---|
| LCP | ≤ 2,0 s (règle générale : < 2,5 s) |
| CLS | ≤ 0,05 |
| TBT | ≤ 200 ms |
| INP (onglets, FAQ, formulaire) | ≤ 200 ms |
| JS gzip initial / total | ≤ 90 Ko / ≤ 150 Ko (le WebGL est chargé à la demande) |
| CSS gzip | ≤ 30 Ko |
| Image hero (AVIF) | ≤ 180 Ko desktop, ≤ 90 Ko mobile |
| Poids initial / après scroll complet | ≤ 1 Mo / ≤ 3 Mo |
| Polices | 3 fichiers préchargés au plus, ≤ 150 Ko au total |
| Lighthouse mobile | Perf ≥ 95 en local (≥ 90 en prod), A11y 100, SEO 100 |
| Animation | 60 fps desktop, ≥ 50 fps sur mobile moyen de gamme |

## 8. Invariants (à vérifier à la fin de chaque session à partir de S01)

- `npm run build` (qui enchaîne `check:dist`), `npm run check` (types Astro) et `npm test` (Vitest) passent.
- Parité FR/EN verte. Aucune erreur console sur `/` et `/en/` en `npm run preview` (vérifié par `tests/e2e/smoke.spec.ts`).
- Aucun JavaScript inline dans `dist/` (seul `application/ld+json` est permis) ni script ou feuille de style d'une autre origine ; aucun fichier caché, clé ni `settings.json` ; rien sous `api/` ni en PHP hormis `api/contact.php`, qui doit être présent : vérifié automatiquement par `check:dist` à chaque `npm run build` depuis S01 (D17).
- Budgets du §7 non dépassés (suivis en S06, S07, S12 et à la demande).
- `main` reste déployable et intact jusqu'à S13 (aucun commit de refonte sur `main`).

## 9. Anti-patterns interdits

- Animer `top`, `left`, `width`, `height`, `margin`, `padding` ou `border` → uniquement `transform`, `opacity`, `clip-path` (et `filter` avec parcimonie).
- Écouteurs `scroll` pour animer → ScrollTrigger ou IntersectionObserver.
- Détourner le scroll au point de casser le clavier, les ancres, la recherche dans la page, le retour arrière ou le scroll tactile natif. Pas de « snap » pleine page.
- Masquer l'élément LCP (image hero) au chargement ou attendre le WebGL pour afficher le hero.
- Copier du code de Shadertoy (licence par défaut CC BY-NC-SA 3.0, **non commerciale**) ou de CodePen sans licence explicite. Shaders écrits par nous, ou sources MIT/CC0/Unlicense créditées.
- Images IA représentant des personnes réelles (élèves, Nicholas) ou présentées comme la photo d'un lieu précis. Tout visuel IA porte un crédit discret « Visuel généré par IA » et ne montre aucun filigrane visible.
- Scripts tiers autres que la balise Google (soumise au consentement) ; aucun CDN au runtime (tout est auto-hébergé).
- `innerHTML` ou `set:html` avec du contenu dynamique (seulement des chaînes statiques de confiance).
- Redirection automatique selon la langue du navigateur.
- Toucher, afficher ou committer `mail-config.php` ou tout secret.
- `rsync --delete` vers le docroot de production sans filtres de protection ni essai à blanc (`-n`) préalable.
- Modifier une langue sans l'autre.
- `is:inline` sur du code JavaScript (CSP). Exceptions : les données JSON-LD, et un `<script src>` vers un fichier de `public/` comme `boot.js`, qui n'est pas du code inline (D20).
- `astro dev --host` : le serveur de dev sert tous les fichiers du projet (D18). Pour le réseau local, `astro preview --host`, qui ne sert que `dist/`.
- Dépasser un budget du §7 sans décision consignée dans `PROGRESS.md`.
- Pousser sur GitHub (dépôt public) le dossier `plans/` ou tout détail de la faille **avant** que le correctif S00 soit en production.

## 10. Ressources de référence

**Documentation**
- Astro : [Fonts](https://docs.astro.build/en/guides/fonts/) · [i18n](https://docs.astro.build/en/guides/internationalization/) · [Images](https://docs.astro.build/en/guides/images/) · [Configuration (security.csp, compressHTML)](https://docs.astro.build/en/reference/configuration-reference/) · [Passage à v7](https://docs.astro.build/en/guides/upgrade-to/v7/)
- GSAP : [docs v3](https://gsap.com/docs/v3/) (ScrollTrigger, SplitText, CustomEase, DrawSVG, Draggable/Inertia, `gsap.matchMedia`, `gsap.context`) · [licence](https://gsap.com/standard-license)
- [Lenis](https://github.com/darkroomengineering/lenis) · [OGL](https://github.com/oframe/ogl)
- Google : [Consent Mode](https://developers.google.com/tag-platform/security/guides/consent) · [CSP pour la balise Google](https://developers.google.com/tag-platform/security/guides/csp)
- [vanilla-cookieconsent v3](https://github.com/orestbida/cookieconsent) · [WAI-ARIA APG, onglets](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) · [Playwright, captures](https://playwright.dev/docs/test-snapshots) · [axe pour Playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)

**Tutoriels (Codrops)**
- [Animer des shaders WebGL avec GSAP : ondulations, révélations, flou](https://tympanus.net/codrops/2025/10/08/how-to-animate-webgl-shaders-with-gsap-ripples-reveals-and-dynamic-blur-effects/) (2025) → hero, E1
- [Distorsion façon eau](https://tympanus.net/codrops/2019/10/08/creating-a-water-like-distortion-effect-with-three-js/) → principe des ondulations au pointeur (à porter sur OGL)
- [Animations de carte SVG pilotées par le scroll](https://tympanus.net/codrops/2026/05/21/creating-scroll-driven-svg-map-animations-with-gsap/) (2026) → Lieux, E10
- [Scroll infini GSAP + Lenis](https://tympanus.net/codrops/2026/05/28/the-never-ending-story-building-a-seamless-infinite-scroll-experience-with-gsap-lenis/) (2026) → intégration Lenis
- [Texte en double vague piloté par le scroll](https://tympanus.net/codrops/2026/01/15/building-a-scroll-driven-dual-wave-text-animation-with-gsap/) (2026) → interludes

**Références d'inspiration** (quoi leur emprunter : `01-direction-artistique.md` §10)
- [Convex Seascape Survey](https://convexseascapesurvey.com/) (Unseen Studio) : la descente sous l'eau pilotée par le scroll.
- [The Sea We Breathe](http://www.theseawebreathe.com) : Site du jour Awwwards, 9,6/10 en animations et transitions.
- [OceanX 2025](https://2025.oceanx.org/) : Site du jour Awwwards (23.02.2026), palette cyan et corail.
- [The Deep Sea](https://neal.fun/deep-sea/) (Neal Agarwal) : « scroller, c'est descendre », les éléments placés à leur profondeur réelle.
