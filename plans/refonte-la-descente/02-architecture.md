# 02 — Architecture technique

> Spécification technique de la refonte. Les versions ont été vérifiées sur npm le 30.09.2026 ; utiliser la dernière version **mineure** de chaque majeure au moment de l'installation.

## 1. Stack

| Brique | Version | Rôle |
|---|---|---|
| Astro | `^7.3` | Build statique, i18n, `astro:assets` (sharp), Fonts API |
| TypeScript | `^6`, strict | Contrôleurs, logique, données typées (7 pas encore pris en charge par `@astrojs/check`, D16) |
| GSAP | `^3.15` | ScrollTrigger, SplitText, CustomEase (+ Draggable et Inertia si besoin ; DrawSVG non utilisé, S09) |
| Lenis | `^1.3` | Scroll lissé (pointeur fin seulement) |
| OGL | `^1.0` | WebGL minimal (hero), chargé à la demande |
| @astrojs/sitemap | `^3.7` | Sitemap avec alternates i18n |
| vanilla-cookieconsent | `^3.1` | Bandeau + préférences (S11) |
| Vitest (+ coverage v8) | `^5` | Tests unitaires, couverture ≥ 80 % sur `src/lib`, `src/data`, `src/i18n` |
| Playwright + @axe-core/playwright | `^1.63` / `^4.13` | E2E, régression visuelle, accessibilité |
| Prettier (+ prettier-plugin-astro) | — | Formatage |

Pas de React ni de Preact : composants `.astro` et contrôleurs TypeScript. Tout est auto-hébergé : polices via la Fonts API, aucun CDN.

## 2. Arborescence cible

```
.
├── astro.config.mjs · package.json · tsconfig.json · vitest.config.ts · playwright.config.ts · .prettierrc
├── public/
│   ├── api/contact.php            # copié tel quel dans dist/ (PHP-FPM sur le Pi)
│   ├── js/boot.js                 # < 1 Ko, synchrone dans <head> (§7)
│   ├── js/consent-default.js      # Consent Mode v2 : valeurs par défaut + gtag (S11)
│   ├── favicon.svg · apple-touch-icon.png · icon-192.png · icon-512.png · site.webmanifest
│   ├── og/og-fr.jpg · og/og-en.jpg
│   ├── robots.txt · llms.txt
├── src/
│   ├── pages/
│   │   ├── index.astro · en/index.astro                  # la page unique, FR et EN
│   │   ├── confidentialite.astro · mentions-legales.astro
│   │   ├── en/privacy.astro · en/legal-notice.astro
│   │   ├── 404.astro
│   │   └── styleguide.astro                              # noindex, supprimé en S13
│   ├── layouts/BaseLayout.astro · LegalLayout.astro
│   ├── components/
│   │   ├── page/HomePage.astro        # assemble les sections pour une locale
│   │   ├── nav/        Nav · MobileMenu · LanguageSwitch · nav.ts
│   │   ├── hud/        DepthGauge · DiveProfile · ProfileLine · hud.ts · events.ts · profile-geometry.ts
│   │   ├── water/      WaterColumn · Thermocline · water.ts (couches vues à travers les thermoclines)
│   │   ├── hero/       Hero · hero.ts · hero-surface.ts (WebGL après load + idle)
│   │   ├── manifesto/  Manifesto
│   │   ├── instructor/ Instructor
│   │   ├── courses/    Courses · AgencyPanel · PriceList (onglets : ui/TabList · ui/tabs.ts · ui/tabs-motion.ts)
│   │   ├── interlude/  Interlude · interlude.ts
│   │   ├── depth-ladder/ DepthLadder · CompareTable · ladder.ts
│   │   ├── specialties/  Specialties · SpecialtyCard · torch.ts
│   │   ├── places/     Places · PlaceCard · RhoneMap · places.ts
│   │   ├── prepare/    Prepare
│   │   ├── gifts/      Gifts · GiftCard · gift-card.ts
│   │   ├── testimonials/ Testimonials · rail.ts
│   │   ├── faq/        Faq · faq.ts
│   │   ├── contact/    Contact · ContactForm · contact-form.ts
│   │   ├── whatsapp/   WhatsAppDialog · whatsapp.ts
│   │   ├── consent/    consent.ts
│   │   ├── footer/     Footer · calm-mode.ts
│   │   └── ui/         Button · Eyebrow · SectionHeader · ArtPicture (prop `reveal`) · RichText · Icon
│   ├── scripts/app.ts                 # point d'entrée unique, orchestre l'initialisation (§7)
│   ├── scripts/motion/  index · gsap · reduced-motion · lenis · reveal · split · fonts · magnetic · depth · nav (DOM, hors couverture)
│   ├── scripts/webgl/   surface.ts (OGL, S07 ; DOM, hors couverture)
│   ├── scripts/bubbles/ emitter.ts (canvas 2D) · lamps.ts (bulles des CTA) (S08 ; DOM, hors couverture)
│   ├── i18n/  types.ts · dictionary.ts · fr.ts · en.ts · legal/{fr,en}.ts · index.ts · routes.ts (+ tests)
│   ├── data/  courses.ts · specialties.ts · places.ts · rhone.ts · credentials.ts · contact.ts · gifts.ts · sections.ts · *.test.ts
│   ├── lib/
│   │   ├── motion/  eases.ts · tokens.ts · waterline.ts · magnetic.ts · cascade.ts · track.ts (logique pure, + tests)
│   │   ├── torch/   torch.ts (+ test)      # lampe des Spécialités : carte éclairée, dérive, particules (S09)
│   │   ├── depth/   resolve-depth.ts · temperature.ts · profile.ts · ascent.ts · ladder-scale.ts (+ tests)
│   │   ├── bubbles/ boyle.ts · pool.ts (+ tests)
│   │   ├── webgl/   capability.ts · viewport.ts · lake.ts · ripples.ts (+ tests) · shaders/{surface.vert,surface.frag,lake.glsl,noise.glsl}
│   │   ├── color/   palette.ts · contrast.ts (+ test)
│   │   ├── geo.ts (+ test)             # projection des coordonnées des lieux, position des stations le long du Rhône (S09)
│   │   ├── form/    validate.ts (+ test) · submit.ts
│   │   ├── analytics/ consent.ts · events.ts
│   │   ├── seo/     jsonld.ts (+ test)
│   │   ├── css/     custom-properties.ts (+ test)   # lecture de tokens.css pour les tests (S02)
│   │   ├── format.ts (+ test)          # CHF, mètres, coordonnées, durée mm:ss
│   │   └── typography.ts (+ test)      # typographie au rendu : apostrophes, espaces insécables (S03)
│   ├── test/  content-checks.ts (+ test)  # contrôles génériques des dictionnaires et des données (S03)
│   ├── styles/ tokens.css · typography.css · global.css · motion.css · utilities.css
│   └── assets/ images/ · brand/logo.svg · textures/water-mask.png
├── tests/ e2e/ · visual/ · a11y/ · php/
├── ops/ deploy.sh · rollback.sh · nginx/dive.conf (copie versionnée, sans secret)
├── scripts/check-budgets.mjs          # tailles gzip du JS et du CSS de dist/ (D19)
├── scripts/check-dist.mjs             # enchaîné par le build : ni JS inline ni ressource externe, aucun fichier interdit, contact.php présent (D17)
├── legacy/                            # ancien site en lecture seule, supprimé en S13
└── plans/refonte-la-descente/
```

## 3. Configuration Astro (esquisse)

```js
// astro.config.mjs
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dive.bullesenvalais.ch',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' }, // CSS externe
  vite: {
    build: { assetsInlineLimit: 0 }, // ni script inline ni URI data: (CSP, D17)
    server: { fs: { deny: [/* défauts de Vite 8 */, 'mail-config.php', 'settings.json'] } }, // D18
  },
  i18n: {                           // locales importées de src/i18n/types.ts (source unique)
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  fonts: [
    // Gate 1 (D25) : Instrument Serif (titres) + Switzer (texte, interface, chiffres du HUD).
    // tokens.css relie les rôles : --font-display → --font-instrument-serif, --font-sans → --font-switzer.
    { provider: fontProviders.google(), name: 'Instrument Serif', cssVariable: '--font-instrument-serif',
      weights: [400], styles: ['normal', 'italic'], subsets: ['latin'], fallbacks: ['Georgia', 'serif'] },
    { provider: fontProviders.fontshare(), name: 'Switzer', cssVariable: '--font-switzer',
      weights: ['100 900'], styles: ['normal', 'italic'], fallbacks: ['Arial', 'sans-serif'] },
  ],
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'fr', locales: { fr: 'fr-CH', en: 'en' } },
      filter: (page) => !page.includes('/styleguide/'),
    }),
  ],
});
```

Pièges d'Astro 7 :
- Le compilateur Rust **ne corrige plus le HTML** : fermer toutes les balises, ne jamais mettre de bloc dans un `<p>`.
- `compressHTML: 'jsx'` : l'espace entre `{a}<em>{b}</em>` disparaît. Écrire `{a}{' '}<em>{b}</em>` quand un espace est voulu.
- `src/fetch.ts` est réservé.

## 4. i18n

```ts
// src/i18n/types.ts
export const LOCALES = ['fr', 'en'] as const;       // ajouter 'de' plus tard
export type Locale = (typeof LOCALES)[number];
export type Localized<T = string> = Readonly<Record<Locale, T>>;
export interface Emphasis { before: string; em: string; after?: string }   // titres « … <em>…</em> … »
export type Rich = ReadonlyArray<{ text: string } | { link: { label: string; href: string; external?: boolean } }>;
export interface Dictionary { meta: {…}; nav: {…}; hud: {…}; hero: {…}; /* une clé par section */ }
```

- L'interface `Dictionary` est dans `dictionary.ts` (une clé par bloc, dans l'ordre de la page ; `types.ts` reste sans import car `astro.config.mjs` le charge). Les pages légales sont dans `legal/{fr,en}.ts`.
- `fr.ts` et `en.ts` exportent chacun un objet de type `Dictionary` : TypeScript refuse toute clé manquante ou en trop.
- Les sur-titres ne contiennent que leur libellé : la profondeur du marqueur vient de `src/data/sections.ts` (composant `Eyebrow`).
- **Typographie au rendu** : les sources gardent des apostrophes droites et des espaces simples ; `getDictionary()` applique `typeset()` (`src/lib/typography.ts`) une fois par langue, et `localize()` fait de même pour les libellés localisés de `src/data/`.
- `parity.test.ts` vérifie en plus la **longueur des tableaux** (FAQ, témoignages, surlignages), l'absence de chaîne vide et de HTML, les mêmes marqueurs `TODO(I-xx)` aux mêmes endroits dans chaque langue, et la longueur des titres (≤ 60) et descriptions (≤ 155) de chaque page ; `content.test.ts` vérifie que les coordonnées écrites dans les textes sont celles de `src/data/contact.ts`.
- **Aucun HTML dans les chaînes.** Les liens (partenaires plongee.ch et scubashop.ch) passent par `Rich` et le composant `RichText`. Plus de `dangerouslySetInnerHTML`.
- URLs : `/` (FR) et `/en/`. Les pages légales sont mises en correspondance dans `routes.ts` pour le sélecteur de langue. `hreflang` : `fr-CH`, `en`, `x-default` → `/`.
- Pas de redirection automatique. Option : si `navigator.language` commence par `en` sur la page FR, un discret « This page is also available in English » (fermable, mémorisé dans `localStorage`).
- Témoignages (avis Google) : texte original sur la page FR ; sur la page EN, traduction marquée « Translated from French » (I-09, D29), avec les bons attributs `lang`.

## 5. Données (source unique)

```ts
// src/data/courses.ts — un seul catalogue : cursus, spécialités, fédéral (S03)
export type AgencyId = 'sdi-tdi' | 'padi' | 'ffessm';
export type Price = { readonly amount: number; readonly currency: 'CHF' } | { readonly onRequest: true };
export interface Course {
  readonly id: string;              // 'sdi-owsd' ; CourseId = union littérale des id
  readonly agency: AgencyId;
  readonly group: 'core' | 'specialty' | 'tech' | 'federal';
  readonly name: Localized;
  readonly meta?: Localized;        // ligne sous le nom dans la grille du Cursus
  readonly price: Price;
  readonly cursus?: 'row' | 'extra';// ligne de la grille du Cursus, ou ligne sous la grille
  readonly maxDepth?: number;       // mètres, pour l'échelle de profondeur (I-04)
  readonly inLadder?: boolean;
  readonly formInterest?: Interest; // valeur du <select> du formulaire (contact.ts)
}
```

- **Un prix par cours** : tous les tarifs de `legacy/components/i18n.jsx` sont dans `courses.ts`, spécialités comprises ; un test les compare à l'ancien site, avec les changements décidés en I-10 (D22, D23). `cursusCourses()`, `ladderCourses()`, `courseById()` et `isOnRequest()` servent les sections.
- `specialties.ts` : les cartes des quatre onglets (SDI 10, TDI 4, PADI 10 avec leur équivalent SDI, FFESSM 7 avec le PTH70) pointent vers le catalogue (`course`, `equivalent`) et portent leur `sub` et leur description.
- `places.ts` : `id`, `name`, `area`, `coords` (degrés décimaux, libellé DMS calculé par `formatCoordinates`), `description`, `photo` et `facts` : profondeur max du lac et, pour le Léman, quelques sites (I-03). Ordre du Rhône : Sion, Rosel, Léman. `mapUrl()` : lien des coordonnées vers Google Maps (URL de recherche, sans clé ni script). `rhone.ts` : cadre et points du tracé schématique (S09).
- `credentials.ts` : SDI/TDI #35812, PADI MSDT #525399, FFESSM E4, DEJEPS `07425ED0350` (lien vers la carte pro), CAH 2B.
- `contact.ts` : téléphone, WhatsApp (`41794368112`, `whatsappUrl()`), e-mail, profils publics (Instagram), lien de la fiche Google, **intérêts du formulaire** (valeurs actuelles + `gift`) et leurs libellés. Un test vérifie que ces valeurs sont exactement celles de `ALLOWED_INTERESTS` de `public/api/contact.php`.
- `gifts.ts` : les trois offres de bons cadeaux (le baptême affiche le prix du catalogue) ; `sections.ts` : le profil de plongée (ancres, marqueurs des sur-titres, profondeurs du HUD, ancres historiques).
- Formatage centralisé dans `src/lib/format.ts` : `formatCHF(690, 'fr')` → « CHF 690 », profondeurs, marqueurs (« 05 m »), températures, coordonnées, durées. Testé.

## 6. Composants

- Un dossier par section (§2). Une section = un `.astro` sémantique (`<section aria-labelledby>`, un `h2`, des `h3`) avec `data-tone`, `data-depth-start`, `data-depth-end` et son `id` d'ancre.
- **Amélioration progressive** : sans JS, tout le contenu est lisible et utilisable. Les onglets s'affichent en panneaux empilés, la FAQ fonctionne grâce à `<details>`, le formulaire se soumet (le JS ajoute validation, états et envoi JSON), le lien WhatsApp ouvre `wa.me`.
- Révélation E6 : `data-reveal="image"` posé sur le `<picture>` (prop `reveal` d'`ArtPicture`, `pictureAttributes` de `<Picture>`), et non un composant enveloppe : le `clip-path` doit porter sur l'image elle-même (S06).
- `ui/SplitHeading.astro` : rend un `Emphasis` en `h2`/`h3` avec `data-reveal="lines"`.

## 7. Scripts et cycle de vie

1. **`public/js/boot.js`** (synchrone dans `<head>`, avant le CSS ; pas de script inline à cause de la CSP) :
   ```js
   (function () {
     var d = document.documentElement, calm = false;
     d.classList.add('js');
     try { calm = localStorage.getItem('bv-calm') === '1'; } catch (e) {}
     if (!calm && !matchMedia('(prefers-reduced-motion: reduce)').matches) d.classList.add('motion-ok');
     setTimeout(function () { if (!d.classList.contains('motion-ready')) d.classList.remove('motion-ok'); }, 3000);
   })();
   ```
   Le CSS ne masque les éléments à révéler que sous `html.motion-ok`. Si le JS de mouvement ne démarre pas en 3 s, tout redevient visible (garde-fou).
2. **`src/scripts/app.ts`** (un seul module importé par `BaseLayout`) :
   1. Contrôleurs **essentiels** (toujours, dans le bundle initial, légers) : nav, menu mobile, onglets, FAQ, formulaire, WhatsApp, sélecteur de langue, Mode calme, consentement (la librairie de consentement elle-même est importée dynamiquement dès le `DOMContentLoaded`).
   2. Si `html.motion-ok` : **`import()` dynamique immédiat** du module de mouvement (GSAP + plugins + Lenis + HUD + colonne d'eau + révélations), donc hors du bundle initial ; il **revérifie `motion-ok`** avant d'agir (le garde-fou de 3 s a pu le retirer), puis `setupGsap()` (plugins + eases), Lenis si pointeur fin, HUD, colonne d'eau, révélations et ScrollTriggers de section.
   3. Après `load` et en idle (`requestIdleCallback` avec repli) : `import()` du WebGL du hero si `canUseWebGL()`, puis du moteur de bulles.
   4. `document.fonts.ready` → `ScrollTrigger.refresh()`. Enfin, ajouter la classe `motion-ready`.
3. **Registre de contrôleurs** : les éléments portent `data-controller="tabs"` ; `app.ts` fait correspondre chaque nom à un `import()` et appelle `init(el)`, qui **retourne une fonction de nettoyage**. Cela rend les contrôleurs testables isolément.

## 8. Mouvement

- `gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)` dans le module de mouvement ; le tracé du Rhône se dessine sans DrawSVG (`pathLength="1"` et `stroke-dashoffset` réglés par `places.ts`, S09), Draggable/InertiaPlugin seulement s'ils servent (E12). Import nommé depuis `gsap/*` pour le tree-shaking.
- `gsap.matchMedia()` avec les conditions `motion: '(prefers-reduced-motion: no-preference)'`, `desktop: '(min-width: 1024px)'`, `fine: '(hover: hover) and (pointer: fine)'` **et** la classe `motion-ok` (Mode calme).
- Lenis :
  ```ts
  const lenis = new Lenis({ autoRaf: false, lerp: 0.09, smoothWheel: true, syncTouch: false, anchors: { offset: -navHeight } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ```
  `data-lenis-prevent` sur tout conteneur scrollable (menu mobile, dialogue WhatsApp, préférences cookies) ; `lenis.stop()` et `start()` à l'ouverture et à la fermeture des dialogues.
- ScrollTrigger : `ScrollTrigger.config({ ignoreMobileResize: true })` ; épinglages de l'échelle, des Lieux et des Témoignages sur tous les écrans quand le mouvement est permis (mise en page sur une colonne sous 64 rem, D43, D45 ; pistes horizontales par le module commun `src/scripts/motion/pinned-track.ts`, S10), sans `anticipatePin` (il épinglait les Lieux par-dessus les Spécialités après un long saut) ; `invalidateOnRefresh` pour les valeurs calculées ; chaque section crée ses déclencheurs dans un `gsap.context()` qu'on peut annuler.
- SplitText : `SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit(self) { return gsap.from(self.lines, {…}); } })`. L'attribut `aria` par défaut conserve le texte lisible par les lecteurs d'écran.
- Profondeur : `resolveDepth(sections, viewportCenterY)` (fonction pure : section courante, puis interpolation linéaire entre `depthStart` et `depthEnd` selon la progression). Branchée sur un ScrollTrigger global `onUpdate`.

## 9. WebGL (hero)

- `capability.ts` → `canUseWebGL(env)` : `motion-ok`, contexte `webgl2` obtenu, `saveData` absent, `deviceMemory` ≥ 4 si connu, `hardwareConcurrency` ≥ 4. Environnement injectable pour les tests.
- `src/scripts/webgl/surface.ts` → `createSurface({ canvas, image, mask, focal, mobile, onContextLost })` retourne `{ setImmersion, addRipple, start, stop, destroy }`. Boucle sur `gsap.ticker`, arrêtée hors écran (IntersectionObserver) et sur `visibilitychange` ; DPR ≤ 1,5 ; `webglcontextlost` → retour à l'image fixe.
- Textures : l'image du hero (via `currentSrc`, même origine) et `water-mask.png` (512 px, niveaux de gris, blanc = eau).
- Shaders écrits par nous. Bruit : `webgl-noise` (MIT, Ashima Arts / Stefan Gustavson), crédité en tête du fichier. **Rien de Shadertoy.**
- Uniforms : `uTime`, `uImage`, `uMask`, `uResolution`, `uImmersion` (0 → 1), `uCoverScale` / `uCoverOffset` (cadrage de l'`<img>`), `uTint`, `uDeep`, `uLight` (couleurs de `palette.ts`) ; pour le lac (D49) : `uLakeLens` (rapport, focale, horizon, roulis) et `uLakeCamera` (hauteur, sinus et cosinus du tangage) de `lakeUniforms()`, `uRipples[16]` (`vec3` : x, z sur le lac en mètres, âge ; tableau JS pour OGL), `uRingWave` (nombre d'onde, vitesses de phase et de groupe), `uWindWaves` / `uWindDrift` (trois octaves de rides de vent). `uPointer` abandonné en S07.
- Géométrie du lac (D49) : `lake.ts` porte la caméra calée sur la photo et l'orthophoto swisstopo (`LAKE_VIEW`), `imageToWater` / `waterToImage` (miroir GLSL : `lakeAt` dans `lake.glsl`), la dispersion des ondes (`phaseSpeed`, `groupSpeed`) et `maskAt` (le pointeur ne crée un anneau que sur l'eau). Le shader calcule les pentes sur le plan d'eau, déplace le reflet (2 × la pente, surtout verticalement) et le fond (réfraction, via la jacobienne `dFdx`/`dFdy` du point du lac), pondère par Fresnel (Schlick), éclaire le fond sous les crêtes, et change en flou vertical les rides plus fines que trois pixels. Si la photo du hero change, refaire le calage (`LAKE_VIEW`) et `make-water-mask.mjs`.
- Chargement : `hero.ts` (démarré par le module de mouvement dans `whileMotion`) appelle `hero-surface.ts`, qui attend `load` puis l'idle, vérifie `canUseWebGL()`, importe `surface.ts`, décode l'image et le masque, puis fond le canvas au-dessus de l'`<img>`. Sans WebGL : ligne d'eau CSS (`clip-path`) et voile. Drapeau de retour arrière : `WEBGL_SURFACE` dans `hero.ts`.
- LCP : la photo plein écran n'est pas candidate pour Chromium (D41) ; l'élément LCP est le texte du hero, peint avec la première image.

## 10. Bulles

- `boyle.ts` : `radiusAtDepth(r0, fromDepth, toDepth) = r0 * ((10 + fromDepth) / (10 + toDepth)) ** (1 / 3)` et `riseSpeed(r)` ∝ √r. Testés (valeurs de référence : à 10 m, une bulle a un volume ×2 en surface, donc un rayon ×1,26).
- `pool.ts` (logique pure, testée) : réserve de 64 particules réécrite sans allocation, `spawnBubbles()` et `stepBubbles()` (montée ∝ √r, oscillation, rayon de Boyle selon la hauteur parcourue : 40 px = 1 m).
- `src/scripts/bubbles/emitter.ts` (S08) : un canvas 2D fixe (`pointer-events: none`, `aria-hidden`) créé à la première émission par le module de mouvement, API `burst(x, y, n, depth)` et `trail(el, depth)`. Rendu : une bulle dessinée une fois (dégradé radial, liseré, reflet) puis mise à l'échelle. Ne tourne sur `gsap.ticker` que s'il y a des bulles actives. Tout script peut demander une gerbe par l'évènement `bv:bubbles` (`{ x, y, count, depth? }`), sans effet hors du module de mouvement (succès du formulaire en S10). La profondeur de départ vient du HUD (`currentDepth()`).

## 11. Formulaire et `/api/contact`

- URL inchangée : `POST /api/contact` (nginx la fait correspondre à `contact.php`).
- Requête JSON : `{ name, email, phone, interest, message, website /* pot de miel, vide */, elapsed /* ms depuis l'affichage */, locale }`.
- Réponses : `200 {ok:true}` · `400 {ok:false,error:"json"}` · `400 {ok:false,error:"validation",fields:[…]}` · `403 {ok:false,error:"forbidden"}` (origine ou content-type) · `405` (avec `Allow: POST, OPTIONS`) · `413` (corps > 32 Ko) · `429` (limite nginx, page HTML) · `500 {ok:false,error:"delivery"}` · `503 {ok:false,error:"busy"}` (plafond quotidien, S10). Pot de miel rempli, `elapsed` **absent** (depuis S10), non numérique ou < 3000 → `200 {ok:true}` **sans envoi** (on ne renseigne pas les robots), seul le motif est journalisé (`contact: dropped (honeypot|too_fast)`).
- **Plafond quotidien** (S10, D46) : 50 e-mails par jour, compteur `AAAA-MM-JJ n` verrouillé (`flock`) dans `/var/www/bullesenvalais/shared/state/contact-quota` (hors docroot et hors des releases, dossier `state/` 700 à `www-data` ; S12 : `/tmp` est partagé, PHP-FPM n'a pas de `PrivateTmp` ; refusé s'il est un lien symbolique, un lien physique ou autre chose qu'un fichier) ; compté avant l'envoi, refus au-delà par `503 busy` sans envoi (`contact: daily limit reached`) ; compteur inutilisable → envoi quand même et `contact: daily counter unavailable, sent anyway` (on ne perd pas un vrai message). Sans JavaScript, le formulaire ne part pas (avis vers WhatsApp, téléphone, e-mail : D47).
- Règles partagées client/serveur : nom 1–100 caractères (caractères de contrôle remplacés par des espaces) ; e-mail valide ≤ 254, **partie locale sans guillemets** (`FILTER_VALIDATE_EMAIL` seul laisse passer `"a\␊b"@x.ch`) et sans `=?` ; téléphone optionnel, **texte libre** de 40 caractères au plus, sans caractère de contrôle (`079/436 81 12`, `079 123 45 67 (soir)` ou une espace insécable passent) ; intérêt dans la liste autorisée (sinon `other`) ; message ≤ 5000 caractères, UTF-8 valide ; `locale` facultative (`fr`, `en`, `de`, sinon ignorée). Origines acceptées : `https://dive.bullesenvalais.ch`, l'apex et `www.`, et les autres noms servis par le même bloc nginx (`dive.bullesenvalais.com`, `dive.bulleenvalais.ch`, `dive.bulleenvalais.com`).
- Côté client (fait en S00 sur l'ancien site, à conserver en S10) : un `400` avec `fields` affiche les champs à vérifier (`aria-invalid`), les autres échecs un message générique ; les deux proposent le lien `mailto:` pré-rempli.
- Côté serveur (fait en S00, `api/contact.php`, **compatible PHP 7.4**) : corps de l'e-mail **encodé en base64** (plus aucune ligne « . » ni CRLF possible), en-têtes nettoyés (`[\x00-\x1F\x7F]`) et encodés RFC 2047 (lignes ≤ 76 caractères), `Reply-To` uniquement si l'e-mail est valide, enveloppe SMTP tirée de la configuration seule, vérification de l'`Origin` et du `Content-Type`, JSON limité en taille et en profondeur, `QUIT` et fermeture du socket sur tous les chemins, journalisation limitée à l'étape SMTP et au code de réponse (aucune donnée personnelle).
- Côté client : validation à la sortie de chaque champ, résumé des erreurs à l'envoi avec focus, `aria-live="polite"`, bouton désactivé pendant l'envoi ; `429` → « réessayez dans une minute », `503 busy` → « le formulaire fait une pause », les deux avec les alternatives. Succès : gerbe de bulles, message, événement de conversion (si consentement). Échec : message clair **avec des alternatives** (bouton « Envoyer par e-mail » pré-rempli, lien WhatsApp). **Jamais** d'ouverture automatique de `mailto:`.
- Pré-remplissage : tout lien `data-prefill-interest="gift"` (ou un cours) sélectionne l'intérêt et amène au formulaire sans recharger la page.

## 12. Consentement et mesure (S11)

- Ordre dans `<head>` : `boot.js` → `consent-default.js` (synchrone). C'est `consent-default.js` qui injecte `gtag/js?id=AW-10798308119` (async), **uniquement sur le nom d'hôte de production** (`dive.bullesenvalais.ch`) : le développement et la préproduction n'envoient ainsi aucune donnée. En mode basique, l'injection attend le consentement.
- `consent-default.js` : `gtag('consent','default',{ ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied', wait_for_update:500 })` — ou, pour un visiteur qui a déjà choisi, les valeurs lues dans le cookie `cc_cookie` du bandeau (S11), puis `gtag('set','ads_data_redaction',true)`, `gtag('js', new Date())` et `gtag('config','AW-10798308119')`. Drapeaux en tête du fichier : `MODE` (I-07) et `GA4_ID` (I-06). Il expose `window.bvLoadGoogleTag()` (idempotent, gardé par le nom d'hôte), que le bandeau rappelle quand un consentement est accordé (mode basique). GA4 `G-QG5ZCVY1Z7` : vérifier dans l'assistant de balises s'il est déjà une destination de la balise Google ; sinon ajouter `gtag('config','G-QG5ZCVY1Z7')`.
- Mode **avancé** (balise chargée, pings sans cookies tant que le consentement est refusé) par défaut ; mode **basique** (balise chargée seulement après consentement) si Nicholas le préfère (📥 I-07).
- vanilla-cookieconsent : catégories `necessary` (toujours), `analytics` (→ `analytics_storage`), `marketing` (→ `ad_storage`, `ad_user_data`, `ad_personalization`). `onConsent` et `onChange` → `gtag('consent','update', …)` (`src/lib/analytics/consent-mode.ts`). Textes FR/EN dans le dictionnaire (`consent`), transmis au contrôleur `consent` par `data-consent-texts` sur le bouton « Gérer les cookies » du pied de page ; la librairie et sa feuille de style arrivent avec ce contrôleur (hors du bundle initial) ; styles reliés aux tokens (ton `deep`). Tant qu'une fenêtre du bandeau est ouverte, `html[data-consent-open]` masque la pastille du HUD (`[data-hud-gauge]`) et le bouton WhatsApp. La librairie ne s'affiche pas aux robots (`navigator.webdriver` compris) : les tests E2E se présentent comme un visiteur.
- Conversions (`src/lib/analytics/events.ts`) : succès du formulaire, clic vers WhatsApp (lien `wa.me` qui n'ouvre pas seulement le dialogue), clic téléphone → `gtag('event','conversion',{ send_to:'AW-10798308119/<libellé>' })` si le libellé est connu (`CONVERSION_LABELS`, `null` tant qu'I-06 manque), plus un évènement GA4 (`generate_lead`, `whatsapp_click`, `phone_click`). Consent Mode décide de ce que Google peut stocker.

## 13. SEO

- `<head>` par locale : `title`, `meta description` (≤ 155 caractères), `canonical` absolu avec barre finale, `hreflang` (fr-CH, en, x-default), Open Graph (`og:image` 1200×630 JPG par langue, `og:locale` `fr_CH` / `en_GB`), `twitter:card=summary_large_image`, `theme-color`.
- JSON-LD (`src/lib/seo/jsonld.ts`, testé), un `@graph` : `WebSite`, `LocalBusiness` (nom, URL, logo, image, téléphone, e-mail, `areaServed` Valais et Vaud, `sameAs` si fourni), `Person` (Nicholas, `jobTitle`, `hasCredential`), `OfferCatalog` (cours avec prix en CHF). **Pas** d'`AggregateRating` fabriqué à partir de nos propres témoignages (règle Google sur les avis autopromotionnels). Pas d'adresse postale sans accord (📥 I-08).
- Titres : un seul `h1` (hero), un `h2` par section, des `h3` pour les éléments.
- `sitemap-index.xml` (intégration ; ses alternates `hreflang` viennent de `routes.ts` par `serialize`, l'option `i18n` de l'intégration n'appariant que des chemins identiques), `robots.txt` réel, `llms.txt` court, vraie `404.html`. Côté serveur : plus de repli SPA (S13). JSON-LD sur l'accueil seulement (FR et EN).
- Ancres historiques conservées (liens existants et extensions d'annonces Google Ads) : `#top #about #agencies #compare #specialties #places #gear #insurance #testimonials #faq #contact`.

## 14. Sécurité

- **CSP finale** (S11) : `ops/nginx/security-headers.conf`, vérifiée le 02.10.2026 sur le [guide de Google](https://developers.google.com/tag-platform/security/guides/csp) (page du 18.09.2026, balise Google + GA4 + conversions Ads), appliquée en S13 :
  ```
  default-src 'self';
  script-src 'self' https://www.googletagmanager.com https://www.googleadservices.com https://www.google.com https://googleads.g.doubleclick.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com https://www.googleadservices.com https://*.g.doubleclick.net https://pagead2.googlesyndication.com https://*.google.com https://*.google.ch https://*.google.fr;
  connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://www.googleadservices.com https://*.g.doubleclick.net https://ad.doubleclick.net https://pagead2.googlesyndication.com https://*.google.com https://*.google.ch https://*.google.fr;
  font-src 'self'; frame-src https://www.googletagmanager.com;
  worker-src 'self' blob:; manifest-src 'self';
  frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'; upgrade-insecure-requests;
  ```
  Google demande chaque domaine national `google.<TLD>` : `.ch` et `.fr` (visiteurs du Léman) ; une violation sur un autre TLD ne ferait perdre qu'un signal publicitaire. `*.analytics.google.com` est couvert par `*.google.com` ; `td.doubleclick.net` ne figure plus dans le guide. Pas de `report-uri` pour l'instant (`/api/csp/report` n'existe pas ; reporté en S13). `style-src 'unsafe-inline'` est conservé (attributs `style` pour les variables CSS, injections de la librairie de consentement) ; c'est un compromis accepté. **Aucun script inline** : tout est dans des fichiers `'self'`. `security.csp` d'Astro (balise `<meta>`) n'est pas utilisé : l'en-tête nginx reste la seule source de vérité. `Permissions-Policy` : `geolocation=()` (au lieu de `(self)`, inutile au nouveau site).
- Conserver HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- nginx (en place depuis S00) : seul `contact.php` exécute du PHP, dans `location = /api/contact.php` (atteinte aussi par la redirection interne de `/api/contact`) avec `limit_req` (5 requêtes/min par IP, rafale de 3, statut 429) et `client_max_body_size 32k` ; tout autre `.php` répond 404. Tout nouveau script PHP (ex. `csp-report.php`, S11) doit recevoir sa propre `location` exacte.

## 15. Tests

| Niveau | Outil | Contenu | Commande |
|---|---|---|---|
| Unitaire | Vitest | `src/lib/**`, `src/data/**`, `src/i18n/**` (parité, profondeur, Boyle, contraste, format, validation, JSON-LD, capacité WebGL) | `npm test` / `npm run coverage` |
| PHP | php-cli | `tests/php/contact_test.php` (unitaires, sans dépendance) + intégration (serveur PHP intégré, `fake_smtp.py`, `smtp_log.py`) | `php tests/php/contact_test.php` · `bash tests/php/run_integration.sh` |
| E2E | Playwright | Chargement FR/EN, ancres, sélecteur de langue, onglets clavier, FAQ, formulaire (requêtes simulées 200/400/500), pré-remplissage cadeau, dialogues (WhatsApp, menu : focus, `Esc`), consentement (`dataLayer`), mouvement réduit (ni Lenis ni canvas) | `npm run test:e2e` |
| Visuel | Playwright `toHaveScreenshot` | Sections clés à 320/768/1024/1440, mouvement réduit + `animations: 'disabled'`, chiffres du HUD masqués | `npm run test:visual` |
| Accessibilité | @axe-core/playwright | FR et EN, tags `wcag2a wcag2aa wcag21aa wcag22aa`, 0 violation sérieuse/critique | `npm run test:a11y` |
| Performance | chrome-devtools MCP + `scripts/check-budgets.mjs` | Lighthouse mobile, trace (LCP/CLS/TBT), tailles gzip | `npm run check:budgets` |
| `dist/` | `scripts/check-dist.mjs` | Aucun script inline (JSON-LD excepté), gestionnaire `on*`, URL `javascript:` ni script ou feuille de style d'une autre origine ; aucun fichier caché (hors `.well-known/`), clé, certificat ni `settings.json` ; sous `api/` et en PHP, seulement `api/contact.php`, qui doit être présent | enchaîné par `npm run build` (un `postbuild` sauterait avec `--ignore-scripts`) |

Projets Playwright : `chromium`, `webkit` (desktop 1440×900) et `mobile-chrome` (Pixel 7), `mobile-safari` (iPhone 15), plus `csp` (S11 : `tests/csp/`, Chrome desktop, sur `scripts/serve-with-csp.mjs`, qui sert `dist/` avec les en-têtes de `ops/nginx/security-headers.conf` sans HSTS ni `upgrade-insecure-requests`, au port `PW_PORT + 10`) ; `firefox` est retiré tant que le Firefox de Playwright ne démarre pas sur macOS 27 (D21). `webServer` : `npm run build && npm run preview -- --port 4321 --ignore-lock`, avec `reuseExistingServer: false` (le port 4321 doit être libre ; voir `00-contexte` §3 pour l'arrière-plan automatique d'Astro 7 et le Firefox de Playwright sur macOS 27).

## 16. Déploiement (S12–S13)

```
/var/www/bullesenvalais/
├── releases/20261120-1830/        # contenu de dist/
├── current -> releases/20261120-1830
├── staging -> releases/20261118-0910
├── shared/                        # 750 root:www-data, hors docroot (créé en S12)
│   ├── mail-config.php            # 640 root:www-data
│   └── state/contact-quota        # dossier 700 www-data : plafond quotidien
└── deploy.log                     # une ligne par déploiement ou retour arrière
```

- nginx `dive` : `root /var/www/bullesenvalais/current;`, PHP limité à `location = /api/contact.php` (limite de débit conservée, tout autre `.php` → 404, comme depuis S00) avec `fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;` et `DOCUMENT_ROOT $realpath_root;` (bascule de symlink atomique sans cache PHP périmé), `try_files $uri $uri/ =404;`, `error_page 404 /404.html;`, cache `/_astro/` 1 an `immutable`, images et polices 30 jours, HTML `no-cache`, gzip pour les types texte.
- `contact.php` lit sa configuration dans `/var/www/bullesenvalais/shared/mail-config.php` (constante `MAIL_CONFIG_FILE` ; échec franc avec 500 et `contact: mail configuration missing at …` si absent).
- `ops/deploy.sh [staging|production]` : `npm ci && npm test && npm run build` → `rsync` de `dist/` vers un **nouveau** dossier `releases/<horodatage>/` (donc aucun `--delete` sur du contenu en production) → `chown -R root:root` (S12) → fumée → symlink atomique (`ln -sfn` vers `current.tmp`, puis `mv -Tf`) → `curl` de fumée → conserver les 5 dernières releases.
  Fait en S12 (revue de sécurité comprise) : `ops/deploy.sh staging|production [--dry-run] [--skip-build]` (arbre git propre exigé, confirmation pour la production ; release `AAAAMMJJ-HHMMSS` en **UTC** (l'heure locale se répète le jour du passage à l'heure d'hiver) ; release à **`root:root`**, lue par `www-data`, qui ne peut donc pas réécrire `contact.php` ; fumée **avant la bascule** : fichiers attendus, `api/mail-config.php` absent, lecture par `www-data`, `php7.4 -l` du `contact.php` déployé ; une release qui échoue avant la bascule est supprimée ; en production, `/` doit répondre 200 après la bascule, sinon retour à la release précédente, et le script dit s'il sert déjà cette release ; `shared/state` inscriptible par `www-data` vérifié ; rotation refusée si les liens sont illisibles, jamais sur les releases pointées par `current` ou `staging` ; ligne ajoutée à `deploy.log`). `--skip-build` fait confiance au `dist/` présent. Fonctions communes dans `ops/lib/common.sh` ; une seule connexion ssh multiplexée par exécution (le Pi refuse les rafales).
- `ops/rollback.sh [staging|production] previous|<horodatage>|--list` : repointe le symlink (production par défaut), puis la même fumée.
- Préproduction : `next.bullesenvalais.ch` (`auth_basic`, `X-Robots-Tag: noindex`) → `staging`. Alternative sans DNS : `npm run preview -- --host` sur le réseau local (📥 I-11).
- Retour à l'ancien site : l'ancien docroot `/var/www/html/dive` reste intact au moins 2 semaines après la mise en ligne.

## 17. Protocole de mesure de performance

1. `npm run build && npm run preview -- --host` (sous un agent, Astro 7 le lance en arrière-plan : `npx astro preview stop` pour l'arrêter).
2. chrome-devtools MCP : `new_page` (contexte isolé), `emulate` (`390x844x3,mobile,touch`, CPU ×4, `Fast 4G`), `performance_start_trace` avec rechargement → LCP, CLS, rendu bloquant ; `lighthouse_audit` (mobile).
3. `npm run check:budgets` (échoue si JS initial > 90 Ko, JS total > 150 Ko ou CSS > 30 Ko en gzip).
4. Consigner les chiffres dans le journal de `PROGRESS.md` (tableau par session) pour suivre l'évolution.
