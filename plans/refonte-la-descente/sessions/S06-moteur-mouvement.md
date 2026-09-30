# S06 — Moteur de mouvement : Lenis, GSAP, révélations, colonne d'eau, HUD

| | |
|---|---|
| Branche | `refonte/la-descente` |
| Dépend de | S05 |
| Taille | L (points de sortie après les tâches 3 et 5) |
| Modèle conseillé | Opus 5.5 |
| Skills / outils | `frontend-design:frontend-design` ; MCP `chrome-devtools` (traces) ; agent `code-reviewer` |
| Inputs | I-05 (températures ; sinon valeurs proposées marquées `TODO(I-05)`) |
| Gate | — |

## Brief de contexte

La page statique existe. Il faut maintenant le **moteur commun** du mouvement, sur lequel s'appuieront toutes les sections : initialisation de GSAP et des courbes, Lenis synchronisé avec ScrollTrigger, gestion du mouvement réduit et du Mode calme, révélations génériques (titres, images), **colonne d'eau** et thermoclines pilotées par la profondeur, **profondimètre (HUD)** avec son profil de plongée, et navigation vivante.

À lire : `01-direction-artistique.md` §3, §4 et §7 (E3 à E6, E16 à E18) · `02-architecture.md` §7 et §8 · `00-contexte.md` §7 et §9.

## Préconditions

- S05 cochée ; tous les tests verts.

## Tâches

1. **`src/lib/motion/`** :
   - `gsap.ts` : `registerPlugin` (ScrollTrigger, SplitText, CustomEase ; DrawSVG sera chargé à la demande en S09), `ScrollTrigger.config({ ignoreMobileResize: true })`. Tout le module de mouvement est chargé par `import()` dynamique depuis `app.ts` (`02-architecture.md` §7), jamais dans le bundle initial ;
   - `eases.ts` : `CustomEase` `buoyant`, `surface`, `drift`, `sink` créées à partir de `tokens.ts` ;
   - `reduced-motion.ts` : `gsap.matchMedia()` avec les conditions `motion`, `desktop` et `fine`, **et** la classe `motion-ok` ;
   - `lenis.ts` (config de `02-architecture.md` §8, API `stop()` et `start()` pour les dialogues, `data-lenis-prevent`) ;
   - `split.ts` (enveloppe SplitText), `reveal.ts` (`data-reveal="lines|fade|image|stagger"`), `magnetic.ts` (≤ 6 px, pointeur fin).
2. **Profondeur (TDD)** : `src/lib/depth/resolve-depth.ts` (section courante, puis interpolation entre `depthStart` et `depthEnd` ; cas limites : haut de page, bas de page, sections plus courtes que le viewport, section de l'échelle en mode « masqué ») et `temperature.ts` (interpolation dans la table I-05). Tests d'abord.
3. **Colonne d'eau et thermoclines** (E4) : `WaterColumn.astro` (un calque fixe par ton, **seule l'opacité est animée**) et `Thermocline.astro` (bande de 25 à 40vh, bruit SVG déplacé en `transform`) ; `water.ts` fait le lien avec la profondeur. Aucun texte courant sur un dégradé.

   > 🔁 Point de sortie possible.
4. **HUD** (E3) : `DepthGauge.astro` (bord droit sur desktop, pastille en bas à gauche sur mobile), chiffres tabulaires, profondeur à 1 décimale, température, durée mm:ss ; `DiveProfile.astro` (tracé SVG en U, points de passage calculés depuis les sections, point actif, **liens réels** dans un `<nav aria-label>`) ; `hud.ts` expose `setMode('normal'|'hidden'|'safety-stop')`, utilisé en S08 et S10. Indicateur `▲ LENT` de remontée rapide derrière un drapeau (désactivé par défaut). Valeurs changeantes en `aria-hidden`.
5. **Mouvements génériques** :
   - E5 : titres `data-reveal="lines"` (après `document.fonts.ready`) ;
   - E6 : `ImageReveal` (ligne d'eau en `clip-path`, dézoom 1,08 → 1) ;
   - E16 : nav masquée à la descente et réaffichée à la remontée, verre dépoli après le hero, indicateur de section active ; menu mobile « plongée » (liens révélés ligne à ligne, profondeur de chaque section) ;
   - E17 : lueur et aimantation du CTA (point d'accroche prévu pour les bulles de S08) ;
   - E18 : `@view-transition { navigation: auto; }` et `view-transition-name` pour la nav et le HUD.

   > 🔁 Point de sortie possible.
6. **Mode calme** : la bascule du pied de page désactive réellement le mouvement (classe + rechargement) ; vérifier que la page reste complète.
7. **Performance** : trace de scroll avec le MCP `chrome-devtools` (`performance_start_trace` sans rechargement, scroll programmé via `evaluate_script`, puis arrêt) : aucune tâche longue > 50 ms pendant le scroll, pas de re-layout provoqué par les animations ; `npm run check:budgets` (JS initial ≤ 90 Ko gzip).
8. **Tests** :
   - unitaires : profondeur, température, concordance `tokens.css` / `tokens.ts` ;
   - E2E : mouvement réduit (pas de classe `lenis`, tout le contenu visible) ; HUD ≈ valeur attendue après un scroll vers `#specialties` ; ancres et focus toujours corrects avec Lenis (`#faq` reçoit le focus) ; somme des `layout-shift` < 0,05 pendant le chargement et un scroll complet (PerformanceObserver) ; garde-fou de `boot.js` (sans le JS de mouvement, le contenu réapparaît après 3 s).

## Vérifications

```bash
npm run build && npm run check && npm test
npm run test:e2e
npm run check:budgets
```

## Critères de sortie

- Scroll fluide (60 fps desktop), aucun CLS dû aux révélations, HUD juste sur toute la page, mouvement réduit et Mode calme complets.
- Budgets respectés ; tests verts.

## Retour arrière

`git revert` : la page statique de S05 reste fonctionnelle (amélioration progressive).

## 🔁 Fin de session

Sessions suivantes : **S07** (hero), puis **S08**, **S09** et **S10** (dans cet ordre par défaut, ou en parallèle avec des worktrees).
