# 02 — Architecture technique

> Spécification technique de la refonte. Les versions ont été vérifiées sur npm le 30.09.2026 ; utiliser la dernière version **mineure** de chaque majeure au moment de l'installation.

## 1. Stack

| Brique | Version | Rôle |
|---|---|---|
| Astro | `^7.3` | Build statique, i18n, `astro:assets` (sharp), Fonts API |
| TypeScript | strict | Contrôleurs, logique, données typées |
| GSAP | `^3.15` | ScrollTrigger, SplitText, CustomEase, DrawSVG (+ Draggable et Inertia si besoin) |
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
│   │   ├── hud/        DepthGauge · DiveProfile · hud.ts
│   │   ├── water/      WaterColumn · Thermocline · water.ts
│   │   ├── hero/       Hero · hero.ts
│   │   ├── manifesto/  Manifesto
│   │   ├── instructor/ Instructor
│   │   ├── courses/    Courses · AgencyPanel · PriceList · tabs.ts
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
│   │   └── ui/         Button · Eyebrow · SectionHeader · SplitHeading · ImageReveal · RichText · Icon
│   ├── scripts/app.ts                 # point d'entrée unique, orchestre l'initialisation (§7)
│   ├── i18n/  types.ts · fr.ts · en.ts · index.ts · routes.ts · parity.test.ts
│   ├── data/  courses.ts · specialties.ts · places.ts · credentials.ts · contact.ts · *.test.ts
│   ├── lib/
│   │   ├── motion/  gsap.ts · eases.ts · tokens.ts · lenis.ts · reduced-motion.ts · reveal.ts · split.ts · magnetic.ts
│   │   ├── depth/   resolve-depth.ts · temperature.ts · ladder-scale.ts (+ tests)
│   │   ├── bubbles/ boyle.ts (+ test) · emitter.ts
│   │   ├── webgl/   capability.ts (+ test) · surface.ts · shaders/{surface.vert,surface.frag,noise.glsl}
│   │   ├── color/   palette.ts · contrast.ts (+ test)
│   │   ├── geo.ts (+ test)             # projection des coordonnées des lieux (S09)
│   │   ├── form/    validate.ts (+ test) · submit.ts
│   │   ├── analytics/ consent.ts · events.ts
│   │   ├── seo/     jsonld.ts (+ test)
│   │   └── format.ts (+ test)          # CHF, mètres, coordonnées, durée mm:ss
│   ├── styles/ tokens.css · typography.css · global.css · motion.css · utilities.css
│   └── assets/ images/ · brand/logo.svg · textures/water-mask.png
├── tests/ e2e/ · visual/ · a11y/ · php/
├── ops/ deploy.sh · rollback.sh · nginx/dive.conf (copie versionnée, sans secret)
├── scripts/check-budgets.mjs          # tailles gzip de dist/_astro/*.{js,css}
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
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  fonts: [
    // Choisis à la Gate 1 (S02). Vérifier la syntaxe exacte des graisses variables dans la doc Fonts API.
    { provider: fontProviders.google(), name: 'Fraunces', cssVariable: '--font-display' /* weights, styles, subsets */ },
    { provider: fontProviders.fontshare(), name: 'Switzer', cssVariable: '--font-sans' },
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

- `fr.ts` et `en.ts` exportent chacun un objet de type `Dictionary` : TypeScript refuse toute clé manquante ou en trop.
- `parity.test.ts` vérifie en plus la **longueur des tableaux** (FAQ, témoignages, surlignages) et l'absence de chaîne vide.
- **Aucun HTML dans les chaînes.** Les liens (partenaires plongee.ch et scubashop.ch) passent par `Rich` et le composant `RichText`. Plus de `dangerouslySetInnerHTML`.
- URLs : `/` (FR) et `/en/`. Les pages légales sont mises en correspondance dans `routes.ts` pour le sélecteur de langue. `hreflang` : `fr-CH`, `en`, `x-default` → `/`.
- Pas de redirection automatique. Option : si `navigator.language` commence par `en` sur la page FR, un discret « This page is also available in English » (fermable, mémorisé dans `localStorage`).
- Témoignages : texte original sur la page FR ; sur la page EN, traduction marquée « Translated from French » (à valider par Nicholas, 📥 I-09), avec les bons attributs `lang`.

## 5. Données (source unique)

```ts
// src/data/courses.ts
export type AgencyId = 'sdi-tdi' | 'padi' | 'ffessm';
export type Price = { readonly amount: number; readonly currency: 'CHF' } | { readonly onRequest: true };
export interface Course {
  readonly id: string;              // 'sdi-owsd'
  readonly agency: AgencyId;
  readonly group: 'core' | 'specialty' | 'tech' | 'federal';
  readonly name: Localized;
  readonly meta: Localized;         // « Équivalent OWD », « 2 heures · baptême »
  readonly price: Price;
  readonly maxDepth?: number;       // mètres, pour l'échelle de profondeur (📥 I-04)
  readonly inLadder?: boolean;
  readonly formInterest?: string;   // valeur du <select> du formulaire
}
```

- Tous les tarifs sont migrés **à l'identique** depuis `legacy/components/i18n.jsx`, puis dédoublonnés. **Deux incohérences sont à trancher par Nicholas (📥 I-10)** :
  1. TDI Nitrox avancé et Decompression Procedures : **CHF 250** dans le panneau Cursus, **CHF 390** dans l'onglet Spécialités TDI.
  2. FFESSM N1 à N4 : **« Sur demande »** dans le panneau Cursus, **CHF 390 / 490 / 690 / 990** dans l'onglet Spécialités FFESSM. Le texte du N1 dans Spécialités (« plongées en autonomie ») contredit celui du panneau Cursus (« plongée encadrée à 20 m »).
- `places.ts` : `id`, `name`, `coords` (`lat`/`lng` décimaux + libellé DMS), `photo`, `data` (profondeur max, températures, visibilité, accès : 📥 I-03).
- `credentials.ts` : FFESSM E4, PADI MSDT #525399, SDI/TDI #35812, DEJEPS `07425ED0350` (lien vers la carte pro), CAH 2B.
- `contact.ts` : téléphone, WhatsApp (`41794368112`), e-mail, liste des **intérêts du formulaire** (valeurs actuelles + `gift`). Un test vérifie que chaque valeur figure dans `ALLOWED_INTERESTS` de `public/api/contact.php`.
- Formatage centralisé dans `src/lib/format.ts` : `formatCHF(690, 'fr')` → « CHF 690 », profondeurs, coordonnées, durées. Testé.

## 6. Composants

- Un dossier par section (§2). Une section = un `.astro` sémantique (`<section aria-labelledby>`, un `h2`, des `h3`) avec `data-tone`, `data-depth-start`, `data-depth-end` et son `id` d'ancre.
- **Amélioration progressive** : sans JS, tout le contenu est lisible et utilisable. Les onglets s'affichent en panneaux empilés, la FAQ fonctionne grâce à `<details>`, le formulaire se soumet (le JS ajoute validation, états et envoi JSON), le lien WhatsApp ouvre `wa.me`.
- `ui/ImageReveal.astro` : enveloppe `<Picture>` (AVIF + WebP), couleur dominante en fond, `data-reveal="image"`.
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

- `gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)` dans le module de mouvement ; `DrawSVGPlugin` importé et enregistré à la demande par `places.ts` (S09), Draggable/InertiaPlugin seulement s'ils servent (E12). Import nommé depuis `gsap/*` pour le tree-shaking.
- `gsap.matchMedia()` avec les conditions `motion: '(prefers-reduced-motion: no-preference)'`, `desktop: '(min-width: 1024px)'`, `fine: '(hover: hover) and (pointer: fine)'` **et** la classe `motion-ok` (Mode calme).
- Lenis :
  ```ts
  const lenis = new Lenis({ autoRaf: false, lerp: 0.09, smoothWheel: true, syncTouch: false, anchors: { offset: -navHeight } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ```
  `data-lenis-prevent` sur tout conteneur scrollable (menu mobile, dialogue WhatsApp, préférences cookies) ; `lenis.stop()` et `start()` à l'ouverture et à la fermeture des dialogues.
- ScrollTrigger : `ScrollTrigger.config({ ignoreMobileResize: true })` ; épinglages **uniquement** en contexte `desktop` ; `invalidateOnRefresh` pour les valeurs calculées ; chaque section crée ses déclencheurs dans un `gsap.context()` qu'on peut annuler.
- SplitText : `SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit(self) { return gsap.from(self.lines, {…}); } })`. L'attribut `aria` par défaut conserve le texte lisible par les lecteurs d'écran.
- Profondeur : `resolveDepth(sections, viewportCenterY)` (fonction pure : section courante, puis interpolation linéaire entre `depthStart` et `depthEnd` selon la progression). Branchée sur un ScrollTrigger global `onUpdate`.

## 9. WebGL (hero)

- `capability.ts` → `canUseWebGL(env)` : `motion-ok`, contexte `webgl2` obtenu, `saveData` absent, `deviceMemory` ≥ 4 si connu, `hardwareConcurrency` ≥ 4. Environnement injectable pour les tests.
- `surface.ts` → `createSurface({ canvas, image, mask })` retourne `{ setImmersion, addRipple, start, stop, destroy }`. Boucle sur `gsap.ticker`, arrêtée hors écran (IntersectionObserver) et sur `visibilitychange` ; DPR ≤ 1,5 ; `webglcontextlost` → retour à l'image fixe.
- Textures : l'image du hero (via `currentSrc`, même origine) et `water-mask.png` (512 px, niveaux de gris, blanc = eau).
- Shaders écrits par nous. Bruit : `webgl-noise` (MIT, Ashima Arts / Stefan Gustavson), crédité en tête du fichier. **Rien de Shadertoy.**
- Uniforms : `uTime`, `uImage`, `uMask`, `uResolution`, `uImmersion` (0 → 1), `uRipples[8]` (`vec3` : x, y, âge), `uPointer`.

## 10. Bulles

- `boyle.ts` : `radiusAtDepth(r0, fromDepth, toDepth) = r0 * ((10 + fromDepth) / (10 + toDepth)) ** (1 / 3)` et `riseSpeed(r)` ∝ √r. Testés (valeurs de référence : à 10 m, une bulle a un volume ×2 en surface, donc un rayon ×1,26).
- `emitter.ts` : un canvas 2D fixe (`pointer-events: none`, `aria-hidden`), pool de 64, API `burst(x, y, n, depth)` et `trail(el)`. Rendu : cercle en dégradé radial avec reflet. Ne tourne que s'il y a des bulles actives.

## 11. Formulaire et `/api/contact`

- URL inchangée : `POST /api/contact` (nginx la fait correspondre à `contact.php`).
- Requête JSON : `{ name, email, phone, interest, message, website /* pot de miel, vide */, elapsed /* ms depuis l'affichage */, locale }`.
- Réponses : `200 {ok:true}` · `400 {ok:false,error:"json"}` · `400 {ok:false,error:"validation",fields:[…]}` · `403 {ok:false,error:"forbidden"}` (origine ou content-type) · `405` (avec `Allow: POST, OPTIONS`) · `413` (corps > 32 Ko) · `429` (limite nginx) · `500 {ok:false,error:"delivery"}`. Pot de miel rempli, `elapsed` non numérique ou < 3000 → `200 {ok:true}` **sans envoi** (on ne renseigne pas les robots), seul le motif est journalisé (`contact: dropped (honeypot|too_fast)`). Un `elapsed` **absent** est accepté (pages chargées avant le déploiement de S00) : S10 pourra le rendre obligatoire une fois le nouveau client en ligne.
- Règles partagées client/serveur : nom 1–100 caractères (caractères de contrôle remplacés par des espaces) ; e-mail valide ≤ 254, **partie locale sans guillemets** (`FILTER_VALIDATE_EMAIL` seul laisse passer `"a\␊b"@x.ch`) et sans `=?` ; téléphone optionnel, **texte libre** de 40 caractères au plus, sans caractère de contrôle (`079/436 81 12`, `079 123 45 67 (soir)` ou une espace insécable passent) ; intérêt dans la liste autorisée (sinon `other`) ; message ≤ 5000 caractères, UTF-8 valide ; `locale` facultative (`fr`, `en`, `de`, sinon ignorée). Origines acceptées : `https://dive.bullesenvalais.ch`, l'apex et `www.`, et les autres noms servis par le même bloc nginx (`dive.bullesenvalais.com`, `dive.bulleenvalais.ch`, `dive.bulleenvalais.com`).
- Côté client (fait en S00 sur l'ancien site, à conserver en S10) : un `400` avec `fields` affiche les champs à vérifier (`aria-invalid`), les autres échecs un message générique ; les deux proposent le lien `mailto:` pré-rempli.
- Côté serveur (fait en S00, `api/contact.php`, **compatible PHP 7.4**) : corps de l'e-mail **encodé en base64** (plus aucune ligne « . » ni CRLF possible), en-têtes nettoyés (`[\x00-\x1F\x7F]`) et encodés RFC 2047 (lignes ≤ 76 caractères), `Reply-To` uniquement si l'e-mail est valide, enveloppe SMTP tirée de la configuration seule, vérification de l'`Origin` et du `Content-Type`, JSON limité en taille et en profondeur, `QUIT` et fermeture du socket sur tous les chemins, journalisation limitée à l'étape SMTP et au code de réponse (aucune donnée personnelle).
- Côté client : validation à la sortie de chaque champ, résumé des erreurs à l'envoi avec focus, `aria-live="polite"`, bouton désactivé pendant l'envoi. Succès : gerbe de bulles, message, événement de conversion (si consentement). Échec : message clair **avec des alternatives** (bouton « Envoyer par e-mail » pré-rempli, lien WhatsApp). **Jamais** d'ouverture automatique de `mailto:`.
- Pré-remplissage : tout lien `data-prefill-interest="gift"` (ou un cours) sélectionne l'intérêt et amène au formulaire sans recharger la page.

## 12. Consentement et mesure (S11)

- Ordre dans `<head>` : `boot.js` → `consent-default.js` (synchrone). C'est `consent-default.js` qui injecte `gtag/js?id=AW-10798308119` (async), **uniquement sur le nom d'hôte de production** (`dive.bullesenvalais.ch`) : le développement et la préproduction n'envoient ainsi aucune donnée. En mode basique, l'injection attend le consentement.
- `consent-default.js` : `gtag('consent','default',{ ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied', wait_for_update:500 })`, puis `gtag('js', new Date())` et `gtag('config','AW-10798308119')`. GA4 `G-QG5ZCVY1Z7` : vérifier dans l'assistant de balises s'il est déjà une destination de la balise Google ; sinon ajouter `gtag('config','G-QG5ZCVY1Z7')`.
- Mode **avancé** (balise chargée, pings sans cookies tant que le consentement est refusé) par défaut ; mode **basique** (balise chargée seulement après consentement) si Nicholas le préfère (📥 I-07).
- vanilla-cookieconsent : catégories `necessary` (toujours), `analytics` (→ `analytics_storage`), `marketing` (→ `ad_storage`, `ad_user_data`, `ad_personalization`). `onConsent` et `onChange` → `gtag('consent','update', …)`. Textes FR/EN dans le dictionnaire, styles via les variables CSS de la librairie reliées à nos tokens. Lien « Gérer les cookies » dans le pied de page.
- Conversions (après consentement) : succès du formulaire, clic WhatsApp, clic téléphone → `gtag('event','conversion',{ send_to:'AW-10798308119/<libellé>' })` (📥 I-06), plus `generate_lead` pour GA4.

## 13. SEO

- `<head>` par locale : `title`, `meta description` (≤ 155 caractères), `canonical` absolu avec barre finale, `hreflang` (fr-CH, en, x-default), Open Graph (`og:image` 1200×630 JPG par langue, `og:locale` `fr_CH` / `en_GB`), `twitter:card=summary_large_image`, `theme-color`.
- JSON-LD (`src/lib/seo/jsonld.ts`, testé), un `@graph` : `WebSite`, `LocalBusiness` (nom, URL, logo, image, téléphone, e-mail, `areaServed` Valais et Vaud, `sameAs` si fourni), `Person` (Nicholas, `jobTitle`, `hasCredential`), `OfferCatalog` (cours avec prix en CHF). **Pas** d'`AggregateRating` fabriqué à partir de nos propres témoignages (règle Google sur les avis autopromotionnels). Pas d'adresse postale sans accord (📥 I-08).
- Titres : un seul `h1` (hero), un `h2` par section, des `h3` pour les éléments.
- `sitemap-index.xml` (intégration), `robots.txt` réel, `llms.txt` court, vraie `404.html`. Côté serveur : plus de repli SPA (S13).
- Ancres historiques conservées (liens existants et extensions d'annonces Google Ads) : `#top #about #agencies #compare #specialties #places #gear #insurance #testimonials #faq #contact`.

## 14. Sécurité

- **CSP cible** (en-tête nginx, affinée en S11 avec le [guide de Google](https://developers.google.com/tag-platform/security/guides/csp), appliquée en S13) :
  ```
  default-src 'self';
  script-src 'self' https://*.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com https://*.google.ch;
  connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com https://*.google.ch https://pagead2.googlesyndication.com;
  font-src 'self'; frame-src https://td.doubleclick.net https://www.googletagmanager.com;
  worker-src 'self' blob:; manifest-src 'self';
  frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'; upgrade-insecure-requests;
  ```
  `style-src 'unsafe-inline'` est conservé (attributs `style` pour les variables CSS, injections de la librairie de consentement) ; c'est un compromis accepté. **Aucun script inline** : tout est dans des fichiers `'self'`. `security.csp` d'Astro (balise `<meta>`) n'est pas utilisé : l'en-tête nginx reste la seule source de vérité.
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

Projets Playwright : `chromium`, `firefox`, `webkit` (desktop 1440×900) et `mobile-chrome` (Pixel 7), `mobile-safari` (iPhone 15). `webServer` : `npm run build && npm run preview -- --port 4321`.

## 16. Déploiement (S12–S13)

```
/var/www/bullesenvalais/
├── releases/20261120-1830/        # contenu de dist/
├── current -> releases/20261120-1830
├── staging -> releases/20261118-0910
└── shared/mail-config.php         # 640 root:www-data, hors docroot
```

- nginx `dive` : `root /var/www/bullesenvalais/current;`, PHP limité à `location = /api/contact.php` (limite de débit conservée, tout autre `.php` → 404, comme depuis S00) avec `fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;` et `DOCUMENT_ROOT $realpath_root;` (bascule de symlink atomique sans cache PHP périmé), `try_files $uri $uri/ =404;`, `error_page 404 /404.html;`, cache `/_astro/` 1 an `immutable`, images et polices 30 jours, HTML `no-cache`, gzip pour les types texte.
- `contact.php` lit sa configuration dans `/var/www/bullesenvalais/shared/mail-config.php` (chemin constant ; échec franc avec 500 et journalisation si absent).
- `ops/deploy.sh [staging|production]` : `npm ci && npm test && npm run build` → `rsync` de `dist/` vers un **nouveau** dossier `releases/<horodatage>/` (donc aucun `--delete` sur du contenu en production) → `chown -R www-data:www-data` → symlink atomique (`ln -sfn` vers `current.tmp`, puis `mv -Tf`) → `curl` de fumée → conserver les 5 dernières releases.
- `ops/rollback.sh [previous|<horodatage>]` : repointe le symlink.
- Préproduction : `next.bullesenvalais.ch` (`auth_basic`, `X-Robots-Tag: noindex`) → `staging`. Alternative sans DNS : `npm run preview -- --host` sur le réseau local (📥 I-11).
- Retour à l'ancien site : l'ancien docroot `/var/www/html/dive` reste intact au moins 2 semaines après la mise en ligne.

## 17. Protocole de mesure de performance

1. `npm run build && npm run preview -- --host`.
2. chrome-devtools MCP : `new_page` (contexte isolé), `emulate` (`390x844x3,mobile,touch`, CPU ×4, `Fast 4G`), `performance_start_trace` avec rechargement → LCP, CLS, rendu bloquant ; `lighthouse_audit` (mobile).
3. `npm run check:budgets` (échoue si JS initial > 90 Ko, JS total > 150 Ko ou CSS > 30 Ko en gzip).
4. Consigner les chiffres dans le journal de `PROGRESS.md` (tableau par session) pour suivre l'évolution.
