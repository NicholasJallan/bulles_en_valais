# 01 — Direction artistique « La Descente »

> Spécification créative. Les valeurs marquées **(S02)** sont des propositions finalisées au design system et validées à la Gate 1. Les données marquées **(📥)** sont à valider par Nicholas (`INPUTS-NICHOLAS.md`).

## 1. L'idée

**« Descendre, lentement, vers le silence. »** Le titre actuel du hero devient le principe de tout le site : **la page est une plongée**.

- Scroller, c'est descendre. La couleur de l'eau, la lumière, la température et même le comportement des bulles suivent la profondeur.
- Le profil suit celui d'une vraie plongée : descente, fond, **remontée lente**, **palier de sécurité à 5 m pendant 3 minutes** (la FAQ), retour à la surface (le contact). Sous l'eau, on ne parle pas : **la conversation se fait en surface**.
- Chaque effet est **juste pour un plongeur** : loi de Boyle (les bulles grossissent en remontant), absorption de la lumière (le rouge disparaît en premier), fenêtre de Snell (depuis le fond, le ciel est un cercle de lumière), thermoclines, vitesse de remontée. Ce sont ces détails qui font dire « c'est un vrai plongeur qui a fait ce site ».
- Le premium vient de la **retenue** : un seul effet signature par écran, des mouvements lents et lourds comme dans l'eau, une typographie éditoriale, beaucoup d'air.

## 2. Profil de plongée (ordre des sections de la page unique)

| # | Section | `id` (ancres conservées) | Profondeur HUD (m) | Ton | Temp. HUD (I-05) | Effets | Session |
|---|---|---|---|---|---|---|---|
| 0 | **Surface** — hero | `top` | 0 | photo | 21 °C | E1, E2, E15 | S07 |
| 1 | **Manifeste** — « Je forme des plongeurs, pas des certifiés. » | `manifesto` | 0 → 3 | surface | 21 °C | E5 | S06 |
| 2 | **L'instructeur** | `about` | 3 → 8 | surface → lagon | 20 °C | E5, E6 | S06 |
| 3 | **Cursus** — 3 écoles, tarifs | `agencies` | 8 → 15 | lagon | 16 °C | E5, onglets fluides | S08 |
| 4 | **Interlude A** « Descendre » (`bde.jpg`) | `interlude-descent` | 15 → 18 | image | 10 °C | E7, parallaxe, citation | S08 |
| 5 | **Échelle de profondeur** + comparatif | `depth`, `compare` | règle locale 0 → 120 (HUD global masqué) | profond → abysse | — | E9 | S08 |
| 6 | **Interlude B** « Lumière » (hirondelle régénérée) | `interlude-light` | 40 | image | 8 °C | E7, citation | S08 |
| 7 | **Spécialités** | `specialties` | 40 → 32 | abysse | 8 °C | E8 | S09 |
| 8 | **Lieux** — parcours du Rhône | `places` | 32 → 22 | profond | 8 °C | E10 | S09 |
| 9 | **Avant de s'immerger** — matériel + assurances | `prepare` (+ `gear`, `insurance`) | 22 → 15 | émeraude | 9 °C | E6 | S10 |
| 10 | **Bons cadeaux** | `gifts` | 15 → 10 | lagon | 13 °C | E11 | S10 |
| 11 | **Témoignages** | `testimonials` | 10 → 6 | lagon → surface | 18 °C | E12 | S10 |
| 12 | **Palier de sécurité** — FAQ | `faq` | 5 (palier 3:00) | surface | 20 °C | E13 | S10 |
| 13 | **Surface** — contact | `contact` | 5 → 0 | surface lumineuse | 21 °C | E14, E7 (succès) | S10 |
| 14 | Pied de page | — | 0 | surface | — | — | S05 |

- Les profondeurs du HUD sont **narratives** (pas une échelle réelle). La règle de l'échelle de profondeur (§7, E9) est, elle, **réelle** : chaque certification y est placée à sa profondeur maximale.
- La température affichée est **calculée à partir de la profondeur** (`temperature.ts`, table I-05 : 21 °C en surface, 8 °C au fond, thermocline vers 15 m). La colonne « Temp. HUD » ci-dessus est indicative.
- Les profondeurs des sur-titres et du HUD sont dans `src/data/sections.ts` (S03).
- Les **sur-titres** remplacent la numérotation « 01 — » par un **marqueur de profondeur** : `— 05 m · L'instructeur`, `— 12 m · Cursus`, `— 40 m · Spécialités`, `— 05 m · Palier`… Cohérence totale avec le HUD.
- Entre deux sections de tons différents, une **thermocline** (E4) assure la transition.

## 3. Principes de mouvement

1. **Flottabilité neutre** : les éléments arrivent et **se posent**, avec une décélération douce, sans rebond ni élastique. Entrées de 0,9 à 1,4 s ; retours d'interface de 0,12 à 0,48 s.
2. **Inertie de l'eau** : scroll lissé (Lenis, sur pointeur fin seulement), parallaxes faibles (8 à 12 % au maximum), léger retard des éléments secondaires.
3. **La lumière signale l'action** : tout ce qui est cliquable « s'allume » (lueur chaude). Le focus clavier est un halo de lumière.
4. **Les bulles sont la signature** : rares, physiquement plausibles, déclenchées par une intention (survol d'un CTA, clic, succès du formulaire, pointeur dans un interlude).
5. **Silence** : un seul effet signature par écran ; aucun texte courant animé pendant la lecture ; tout est désactivable (`prefers-reduced-motion`, et bouton « Mode calme »).

### Tokens de mouvement (S02)

```css
--dur-instant: 120ms;  --dur-fast: 240ms;  --dur-base: 480ms;
--dur-slow: 900ms;     --dur-drift: 1400ms; --dur-tide: 2400ms;
--ease-buoyant: cubic-bezier(0.16, 1, 0.3, 1);   /* entrées : se pose sans rebond */
--ease-surface: cubic-bezier(0.22, 1, 0.36, 1);  /* retours d'interface */
--ease-drift:   cubic-bezier(0.45, 0, 0.55, 1);  /* flottements, boucles lentes */
--ease-sink:    cubic-bezier(0.55, 0, 0.75, 0.2);/* sorties : coule doucement */
```

GSAP reprend exactement les mêmes courbes via `CustomEase` (`buoyant`, `surface`, `drift`, `sink`), déclarées une seule fois dans `src/lib/motion/eases.ts`.

## 4. Couleur : la physique de la lumière sous l'eau

- **Tons de profondeur** : surface (écume chaude) → lagon (turquoise du Rosel) → émeraude glaciaire → Léman → profond → abysse.
- **Règle sémantique « le rouge disparaît »** : comme dans l'eau, les couleurs chaudes *décoratives* (mots en italique des titres, filets) se désaturent avec la profondeur. **Seuls les éléments d'action gardent le rouge-lampe à toutes les profondeurs** (boutons, liens, focus, état actif). En profondeur, la seule couleur chaude visible est donc celle de ce qui est cliquable, comme la lampe du plongeur.
- Le rouge-lampe est aussi un **clin d'œil au rouge du drapeau valaisan**.

### Palette (OKLCH, validée à la Gate 1)

Source : `src/lib/color/palette.ts`, recopiée dans `src/styles/tokens.css` (un test vérifie la concordance). Valeurs principales :

```css
--c-surface:      oklch(97.5% 0.008 85);   /* écume : fond clair principal */
--c-surface-2:    oklch(94% 0.014 85);     /* calcaire */
--c-lagoon:       oklch(90% 0.018 205);    /* lagon minéral (Gate 1 : moins « bleu clair ») */
--c-lagoon-ink:   oklch(45% 0.06 215);     /* turquoise du Rosel, assourdi (accents froids) */
--c-emerald:      oklch(37% 0.04 215);     /* émeraude glaciaire, moins verte (Gate 1) */
--c-leman:        oklch(32% 0.055 230);    /* Léman (aussi les panneaux du ton émeraude) */
--c-deep:         oklch(22% 0.045 240);    /* profond */
--c-abyss:        oklch(14% 0.03 245);     /* abysse */
--c-ink:          oklch(21% 0.03 240);     /* texte sur clair */
--c-ink-soft:     oklch(38% 0.025 235);
--c-foam:         oklch(96% 0.01 90);      /* texte sur foncé */
--c-foam-soft:    oklch(80% 0.02 220);
--c-torch:        oklch(68% 0.19 33);      /* rouge-lampe allumé : actions sur les tons sombres */
--c-torch-deep:   oklch(51% 0.19 31);      /* rouge-lampe de jour : actions sur les tons clairs */
--c-torch-pale:   oklch(82% 0.1 40);       /* liens sur émeraude */
--c-torch-glow:   oklch(76% 0.15 50);      /* halo des actions */
--c-alert:        oklch(82% 0.15 85);      /* ambre des alertes (HUD, erreurs) */
```

Plus les panneaux de chaque ton (`*-raised`), l'ambre d'alerte des tons clairs (`alert-deep`) et la lumière décorative en cinq paliers (`deco-surface` → `deco-abyss`), qui se désature avec la profondeur. Les rouges ne servent qu'aux actions.

- Contrastes **testés automatiquement** en S02 (`src/lib/color/contrast.ts`) : ≥ 4,5:1 pour le texte courant, ≥ 3:1 pour les grands titres et les éléments d'interface, pour chaque couple texte/fond de chaque ton.
- Chaque section déclare `data-tone="surface|lagoon|emerald|deep|abyss"` : le ton fixe le fond **et** les couleurs de texte. Le dégradé continu n'existe que dans les thermoclines, jamais sous du texte courant.

## 5. Typographie (Gate 1 : appariement B)

| | Titres / citations | Texte / interface / chiffres du HUD |
|---|---|---|
| **Retenu** | **Instrument Serif** (Google, OFL 1.1 ; romain et italique, 400) | **Switzer** (Fontshare, ITF Free Font License 2.0 ; variable 100–900) |

- Comparés au styleguide (S02) : A Fraunces + Switzer (recommandé), **B Instrument Serif + Switzer (choisi par Nicholas)**, C Zodiak + General Sans.
- **Chiffres du HUD et données** : Switzer en `tabular-nums`, sans troisième police (les monos JetBrains et Geist sont écartés).
- Trois fichiers préchargés (Instrument Serif romain et italique, Switzer romain) : 72 Ko pour un budget de 150 Ko.
- Switzer est servie telle que livrée par Fontshare et jamais committée : la licence interdit sous-ensemble, conversion de format et diffusion par un dépôt (D26).
- Échelle fluide en `clamp()`, ratio 1,25 à 1,333. Hero jusqu'à ~9vw, `text-wrap: balance` pour les titres, `text-wrap: pretty` pour les paragraphes.
- Instrument Serif n'a pas d'axe variable : aucune animation d'axe ; le mouvement des titres reste en `transform` et `opacity` (E5).
- Typographie française appliquée au rendu (`src/lib/typography.ts`, S03) : apostrophes courbes, espaces fines insécables avant ? ! ; et insécables avant : et dans « ».

## 6. Composition

- Grille de 12 colonnes, gouttières fluides, marge latérale ≥ 16 px sur mobile. Largeur de lecture 60 à 70 caractères.
- **Rythme** : alterner sections pleine largeur (interludes, échelle, lieux) et sections éditoriales asymétriques (titre en 5 colonnes, texte en 6, décalé). Pas de grilles de cartes uniformes.
- **Profondeur visuelle** : superpositions (titres qui chevauchent les images), ombres « sous-marines » (grandes, diffuses, teintées de bleu), lueurs pour les actions.
- Rayons : 2 px (boutons, champs), 14 px (cartes, images), 999 px (bulles, pastilles). Jamais un rayon unique partout.
- Écran étroit d'abord : 320, 375, 768, 1024, 1440, 1920 px.

## 7. Catalogue d'effets

> Pour chaque effet : **Où · Quoi · Comment · Perf · Repli · Session**. « Repli » couvre `prefers-reduced-motion`, le Mode calme, l'absence de WebGL et le tactile.

**E1 — Surface vivante (hero)**
- Où : hero. Quoi : la photo du lac « respire » ; l'eau (et seulement l'eau) ondule, des caustiques dansent sous la surface, le pointeur ou le toucher crée des ondes.
- Comment : canvas OGL **au-dessus** de l'`<img>` du hero (qui reste l'élément LCP). Shader : déplacement par bruit limité par un **masque d'eau** (texture en niveaux de gris produite en S04), caustiques calculées (fonction maison), jusqu'à 8 ondulations en uniformes (position + âge). Fondu du canvas une fois la première image rendue.
- Perf : module chargé à la demande après le LCP (`import()` en idle) ; ≤ 30 Ko gzip ; DPR plafonné à 1,5 ; résolution ×0,75 sur mobile ; rendu arrêté hors écran et onglet caché ; gestion de `webglcontextlost`.
- Repli : image fixe + reflet CSS très léger, ou rien.
- Session : S07.

**E2 — Immersion (passer sous la surface)**
- Où : du hero au manifeste. Quoi : en scrollant, une **ligne d'eau ondulée** monte à travers l'écran ; en dessous, l'image passe « sous l'eau » (teinte bleu-vert, contraste réduit, rayons de lumière descendants, particules en suspension). Le titre remonte et s'efface en flottant.
- Comment : uniforme `uImmersion` (0 → 1) scrubbé par ScrollTrigger sur le hero ; titre DOM (SplitText) animé séparément.
- Repli : dégradé CSS en `clip-path` pour la ligne d'eau, ou simple fondu.
- Session : S07.

**E3 — Profondimètre (HUD) et profil de plongée**
- Où : fixe ; bord droit centré sur desktop, pastille en bas à gauche sur mobile (au-dessus de la zone sûre, masquée tant que le bandeau cookies est affiché).
- Quoi : style ordinateur de plongée — **profondeur** (grands chiffres tabulaires, 1 décimale), **température** et **durée de plongée** (temps passé sur la page, mm:ss). Un clic ouvre le **profil de plongée** : un tracé SVG en U avec les sections en points de passage, qui sert de navigation.
- Détails de plongeur : au palier (FAQ), le HUD affiche `PALIER 5 m · 03:00` en compte à rebours. Option : si l'on remonte très vite, un petit indicateur `▲ LENT` clignote deux fois, comme l'alarme de vitesse de remontée.
- Comment : `resolveDepth()` (fonction pure testée) interpole entre les `data-depth-start` / `data-depth-end` des sections ; mise à jour via ScrollTrigger (pas d'écouteur `scroll`).
- Accessibilité : `<nav aria-label="Profil de plongée">` avec de vrais liens ; les chiffres qui changent sont `aria-hidden`.
- Repli : les valeurs changent sans animation.
- Session : S06.

**E4 — Thermoclines**
- Où : entre deux sections de tons différents. Quoi : bande de transition de 25 à 40vh où le fond passe d'un ton à l'autre, avec un léger miroitement ; la température du HUD chute d'un coup, comme en vraie plongée.
- Comment : couche de fond fixe « colonne d'eau » (un calque par ton, seule l'opacité est animée : 100 % composité) + texture de bruit SVG déplacée en `transform`.
- Session : S06.

**E5 — Titres en flottabilité neutre**
- Quoi : les lignes des titres montent depuis un masque et se posent (`--ease-buoyant`, 1,1 s, décalage de 0,08 s entre lignes) ; les mots en italique arrivent avec un léger retard.
- Comment : `SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit })`, déclenché à l'entrée dans le viewport, après `document.fonts.ready`.
- Repli : texte visible immédiatement.
- Session : S06.

**E6 — Révélation « ligne d'eau » des images**
- Quoi : l'image apparaît derrière une ligne d'eau ondulée qui monte (`clip-path: polygon` à 24 points), avec un léger dézoom 1,08 → 1. Couleur dominante en fond pendant le chargement.
- Session : S06 (composant `ImageReveal`).

**E7 — Bulles (loi de Boyle)**
- Quoi : bulles plausibles. Vitesse de montée ∝ √rayon ; oscillation latérale sinusoïdale ; **le rayon grandit en remontant** : `r = r0 · ((10 + p0) / (10 + p))^(1/3)`, avec `p` la profondeur en mètres (+1 bar tous les 10 m).
- Déclencheurs : pointeur dans les interludes (pointeur fin), survol et clic des CTA (3 à 5 bulles), succès du formulaire (gerbe). Jamais sur le logo (D35).
- Comment : **un seul canvas 2D** fixe, pool de 64 particules, piloté par `gsap.ticker`, inactif s'il n'y a aucune bulle.
- Repli : aucune bulle.
- Session : S08 (moteur), puis utilisé en S10.

**E8 — Lampe torche (spécialités, 40 m)**
- Quoi : section très sombre ; un cône de lumière chaude suit le pointeur et révèle une texture de particules en suspension ; la carte éclairée se réchauffe (bordure et lueur rouge-lampe).
- Comment : un élément à dégradé radial déplacé en `transform` (`gsap.quickTo`), fusion `screen` testée pour la perf ; détection de la carte éclairée avec des rectangles mis en cache.
- Tactile et clavier : la lampe se pose sur la carte qui a le focus ou qui a été touchée ; au repos, elle dérive lentement.
- Règle : **le texte reste parfaitement lisible sans la lampe**, qui n'est qu'un décor.
- Session : S09.

**E9 — Échelle de profondeur**
- Quoi : « Jusqu'où irez-vous ? ». Une règle verticale de 0 à 120 m défile pendant que le marqueur « vous êtes ici » descend. Chaque certification apparaît à sa profondeur maximale (I-04) : baptême 6 m, Open Water 18 m, FFESSM N1 20 m, Advanced 30 m, N2 et Deep 40 m, TDI Deco 45 m, N3 60 m, trimix PTH70 70 m et PTH120 120 m. Au-delà de 40 m, l'échelle est compressée. Le HUD global est masqué pendant la section, la règle prend le relais en très grands chiffres.
- Comment (desktop ≥ 1024 px, mouvement autorisé) : section épinglée (~300vh), timeline scrubbée ; les données viennent de `src/data/courses.ts` (`maxDepth`).
- Sortie : thermocline « Remontée · 40 m » vers l'interlude B.
- Sur téléphone (D43) : même épinglage sur une colonne (marqueur en haut, règle à gauche, toutes les certifications à sa droite). Repli (mouvement réduit, Mode calme) : liste verticale statique avec règle à gauche, sans épinglage.
- Le **comparatif** SDI/TDI · PADI · FFESSM suit, en tableau sobre (en-tête collant, ligne survolée éclairée).
- Session : S08.

**E10 — Parcours du Rhône (lieux)**
- Quoi : un tracé schématique suit le Rhône, **de Sion au Rosel (Martigny) puis au Léman**, et se dessine au scroll (DrawSVG). Trois « stations », chacune avec sa photo, ses coordonnées et ses données (profondeur max, températures, visibilité, accès : 📥).
- Comment (desktop) : section épinglée avec défilement horizontal (`containerAnimation`). Le tracé est **dessiné à la main, schématique** (pas de fond de carte, donc pas de licence OSM ni swisstopo) ; positions relatives calculées à partir des coordonnées.
- Sur téléphone (D43) : même parcours, la carte au-dessus de la fenêtre des lieux. Repli (mouvement réduit, Mode calme) : cartes en `scroll-snap` sous 64 rem, grille de trois au-delà, tracé statique.
- Session : S09.

**E11 — Carte cadeau holographique**
- Quoi : une carte au format carte bancaire (1,586:1) avec un reflet « caustique » irisé qui bouge avec l'inclinaison (≤ 8°) ; bouton « Offrir » qui amène au formulaire avec l'intérêt « Bon cadeau » présélectionné.
- Comment : dégradés CSS (`conic-gradient` + masque) et `rotateX/rotateY` via `gsap.quickTo`, perspective 800 px.
- Repli : carte fixe.
- Session : S10.

**E12 — Rail de témoignages**
- Quoi : grandes citations typographiques sur un rail horizontal, glisser pour avancer, boutons précédent/suivant, légère parallaxe des guillemets.
- Comment (D45) : comme le parcours du Rhône (E10), **sur tous les écrans quand le mouvement est permis**, la section est épinglée et le défilement vertical fait avancer le rail vers la droite, puis la page reprend à la butée ; boutons précédent/suivant gardés (ils font défiler la page jusqu'à la citation), clavier comme pour les Lieux (un élément focalisé hors fenêtre y est amené). Sans mouvement : `scroll-snap` natif + boutons (accessible par défaut). Un avis plus haut que la fenêtre (téléphone) est tronqué en fondu avec « Lire l'avis en entier », qui l'ouvre dans un `<dialog>` (texte complet toujours dans la page) ; une fenêtre de moins de 260 px de haut (téléphone à l'horizontale) garde le rail natif (S10).
- Session : S10.

**Règle générale (D45)** : tout défilement horizontal du site (rail, carrousel, frise) suit ce modèle par défaut : piste épinglée pilotée par le scroll vertical sur tous les écrans, repli `scroll-snap` sans mouvement. Code à factoriser à partir de `components/places/places.ts` (fenêtre en `overflow: hidden` gardée à 0, `containerAnimation` pour ce qui entre dans la fenêtre, `refreshPriority: 1`, pas d'`anticipatePin`).

**E13 — Palier de sécurité (FAQ)**
- Quoi : accordéon exclusif `<details name="faq">`, ouverture fluide (`interpolate-size: allow-keywords` + `::details-content` là où c'est supporté, ouverture immédiate ailleurs : S10) ; le HUD affiche le compte à rebours du palier tant que la section croise le milieu de l'écran (en pause hors de la vue, repart de 3:00 seulement si l'on remonte la page au-dessus du palier).
- Session : S10.

**E14 — Fenêtre de Snell (retour à la surface)**
- Quoi : derrière le titre du contact, un disque de lumière doux, comme le ciel vu depuis le fond à travers la surface (cône d'environ 97°) ; en approchant, le fond s'éclaircit jusqu'à l'écume. Accroche : « Sous l'eau, on ne parle pas. Remontons. »
- Comment : dégradé radial + léger miroitement (bruit en `transform`).
- Session : S10.

**E15 — Intro (≤ 1,2 s, jamais bloquante)**
- Quoi : les lignes du titre du hero se posent, le HUD s'allume à 0,0 m. Le logo reste fixe : aucune animation du logo (Gate 3, D35). L'image hero est visible **dès le premier affichage** : c'est l'élément LCP, elle n'est jamais masquée.
- Session : S07.

**E16 — Navigation vivante**
- Quoi : transparente sur le hero, puis verre dépoli ; masquée quand on descend, réapparaît quand on remonte ; indicateur de section active. Menu mobile en plein écran « plongée » : fond d'eau profonde, liens révélés ligne à ligne, chacun avec sa profondeur (`Cursus — 12 m`).
- Session : S05 (structure, accessibilité), S06 (mouvement).

**E17 — CTA « lampe »**
- Quoi : le bouton principal s'allume au survol (lueur chaude), subit une aimantation légère (≤ 6 px, pointeur fin) et laisse s'échapper 2 ou 3 bulles.
- Session : S06 (base), S08 (bulles).

**E18 — Changement de langue**
- Quoi : fondu enchaîné FR ↔ EN, nav et HUD stables (`@view-transition { navigation: auto; }` + `view-transition-name`). Firefox : navigation instantanée, sans effet.
- Session : S06.

**Accessibilité du mouvement**
- `prefers-reduced-motion: reduce` → pas de Lenis, pas d'épinglage, pas de WebGL animé, pas de bulles, pas de parallaxe ; révélations remplacées par l'affichage direct.
- Bouton **« Mode calme »** dans le pied de page (préférence stockée dans `localStorage`, dans un try/catch) : même effet, pour ceux qui n'ont pas réglé leur système.

## 8. Images

### Inventaire et usage prévu

| Fichier | Contenu | Usage | Action (S04) |
|---|---|---|---|
| `rosel-2400.jpg` (2400×1807) | Rosel depuis la rive, eau limpide, fond visible | **Hero, option A (recommandée)** | Retouche : retirer lignes électriques, pylône, éolienne, panneau « 10000M ». Masque d'eau pour E1 |
| `dive_sion.jpg` (800×1000) | Les Îles au coucher du soleil | Lieux · Sion | 📥 original haute définition |
| `dive_leman.jpg` (800×1000) | Château de Chillon, Léman | Lieux · Léman | 📥 original haute définition |
| `dive_rosel.jpg` (800×1000) | Rive du Rosel, matériel au sol | Lieux · Rosel | 📥 original haute définition |
| `nicholas.jpg` (2243×2243) | Nicholas (recycleur, étanche rouge) avec une élève en surface | Instructeur | Recadrages desktop (4:5) et mobile |
| `gears.jpg` (800×800) | Matériel sur un bateau | Avant de s'immerger | — |
| `bde.jpg` (1707×1280, © Nicholas) | Plongeur et requins-marteaux en bleu profond | Interlude A | Recadrage 16:9 et portrait |
| `hirondelle.png` (1365×768, IA) | Épave, plongeurs recycleur, lampes rouges | Interlude B | **Régénérer** sans filigrane (≥ 2560 px), crédit IA |
| `logo.png` (32×32) | Logo | Remplacé | 📥 **logo vectoriel** → SVG animable, favicons |

### Règles

- Étalonnage cohérent : blancs neutres, légère désaturation ; réduction des rouges dans les images des sections profondes (cohérent avec §4).
- Formats générés par Astro : AVIF + WebP, `widths` adaptés, `sizes` exacts, dimensions explicites, `loading="lazy"` sauf pour le hero (`eager` + `fetchpriority="high"`).
- **Politique IA** : ambiances et illustrations seulement ; aucune personne réelle ; jamais présenté comme la photo d'un lieu nommé ; aucun filigrane visible ; mention « Visuel généré par IA » en légende discrète et dans les crédits du pied de page. Retouches de nettoyage (lignes électriques) sur les vraies photos : acceptables, validées par Nicholas à la Gate 3.
- Les effets procéduraux (caustiques, rayons, particules, bruit) sont **préférés** aux images IA : plus légers, plus nets, animables.

## 9. Voix et textes

- **Vouvoiement**, ton calme, précis et chaleureux. Titres évocateurs, corps factuel. Pas de superlatifs, pas de jargon marketing. L'EN suit l'orthographe britannique du site actuel (*recognised*, *metres*).
- Lignes validées à la Gate 2 (S03, 01.10.2026) ; tous les textes sont dans `src/i18n/` :
  - Manifeste : « Je forme des plongeurs, pas des certifiés. » / *I train divers, not certificate holders.*
  - Échelle : « Jusqu'où irez-vous ? » / *How deep will you go?*
  - Interlude A : « Descendre, c'est d'abord apprendre à respirer lentement. » / *Going down starts with learning to breathe slowly.*
  - Interlude B : « À quarante mètres, le rouge a disparu. Seule la lampe se souvient des couleurs. » / *At forty metres, red is gone. Only the torch remembers colour.*
  - Avant de s'immerger : « Avant de s'immerger » / *Before you go under*
  - Bons cadeaux : « Offrir une première respiration sous l'eau. » / *Give someone their first breath underwater.*
  - FAQ : sur-titre « Palier de sécurité · 5 m · 3 min » / *Safety stop · 5 m · 3 min*
  - Contact : « Sous l'eau, on ne parle pas. Remontons. » puis « On en parle de vive voix ? » / *Underwater, we don't talk. Let's surface.* puis *Shall we talk it through?*

## 10. Références : ce qu'on leur emprunte

- **Convex Seascape Survey** (Unseen Studio) : le moment où l'on passe sous l'eau piloté par le scroll → E2. Sans leur lourdeur 3D.
- **The Sea We Breathe** : le rythme des chapitres, la lenteur des transitions → E4, E5.
- **OceanX 2025** : un corail chaud posé sur des bleus froids → règle du rouge-lampe.
- **The Deep Sea** (neal.fun) : prendre la profondeur au pied de la lettre, avec retenue (le scroll fait le travail) → E9.
- **Ordinateurs de plongée** (esprit Shearwater) : grands chiffres, petites étiquettes, contraste élevé, aucune fioriture → E3.
