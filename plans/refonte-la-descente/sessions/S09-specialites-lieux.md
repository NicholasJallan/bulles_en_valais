# S09 — Spécialités (lampe torche) & Lieux (parcours du Rhône)

| | |
|---|---|
| Branche | `refonte/la-descente` |
| Dépend de | S06, S04 (photos des lieux) |
| Taille | L (point de sortie après la tâche 2) |
| Modèle conseillé | Opus 5.5 |
| Skills / outils | `frontend-design:frontend-design` ; MCP `chrome-devtools` ; tutoriel Codrops « scroll-driven SVG map » (`00-contexte.md` §10) |
| Inputs | I-03 (données des lacs ; sinon `TODO(I-03)` affichés proprement, par exemple « — ») |
| Gate | — |

## Brief de contexte

Au plus profond (40 m), la section **Spécialités** est presque noire : une **lampe torche** suit le pointeur et réchauffe la carte qu'elle éclaire. Puis la remontée commence avec les **Lieux** : un tracé schématique suit le Rhône de Sion au Rosel (Martigny) puis au Léman, et se dessine pendant un défilement horizontal.

À lire : `01-direction-artistique.md` §7 (E8, E10) · `02-architecture.md` §5 (`places.ts`) et §8.

## Préconditions

- S06 cochée. Photos des lieux en place (S04).

## Tâches

1. **Lampe torche** (`torch.ts`, E8) :
   - élément à dégradé radial chaud déplacé en `transform` (`gsap.quickTo`, lissage ~0,15 s) ; tester `mix-blend-mode: screen` contre une simple opacité et garder l'option la plus rapide (trace) ;
   - texture de particules en suspension **générée une fois** en canvas au démarrage (basse résolution), en fond de section ;
   - carte éclairée : rectangles mis en cache (recalculés au `resize` et au `refresh`), classe `is-lit` (bordure et lueur rouge-lampe, texte inchangé) ;
   - clavier : la lampe se pose sur la carte qui a le focus ; tactile : au toucher ; au repos : dérive lente (`--ease-drift`) ;
   - le texte reste parfaitement lisible sans la lampe (contraste vérifié sans l'effet) ; rien en mouvement réduit.
2. **Onglets des spécialités** : même contrôleur que le cursus, transitions homogènes ; cascade d'apparition des cartes à chaque changement d'onglet (≤ 0,6 s au total).

   > 🔁 Point de sortie possible.
3. **Lieux** (E10) :
   - `src/lib/geo.ts` (**TDD**) : projection équirectangulaire des coordonnées vers le repère du SVG ; tests sur les trois sites (ordre et positions relatives : Sion à l'est, Rosel au sud-ouest, Léman au nord-ouest) ;
   - `RhoneMap.astro` : tracé **schématique dessiné à la main** (vallée du Rhône, courbe de Martigny, rive du Léman stylisée), trois stations ; aucun fond de carte (pas de licence OSM ni swisstopo) ;
   - desktop : section épinglée avec défilement horizontal (panneau d'introduction + 3 lieux, `containerAnimation`), tracé dessiné au scroll (DrawSVG), station active mise en valeur, HUD de 32 à 22 m ;
   - `PlaceCard` : photo (`ImageReveal`), coordonnées, données en `<dl>` (profondeur max, températures, visibilité, accès), description ;
   - **clavier** : un `focusin` sur une carte hors écran fait défiler jusqu'à elle (la position du scroll épinglé est recalculée) ;
   - mobile et mouvement réduit : cartes verticales en `scroll-snap`, tracé statique.
4. **Tests** :
   - unitaires : `geo.ts` ;
   - E2E : ordre et contenu des lieux ; navigation au clavier dans les lieux sans perte de focus ni débordement ; lampe absente en mouvement réduit ; aucune erreur console ;
   - performance : trace dans les deux sections (pas de tâche longue > 50 ms, pas de re-layout en boucle).

## Vérifications

```bash
npm run build && npm run check && npm test && npm run test:e2e
npm run check:budgets
```

## Critères de sortie

- Lampe torche fluide et lisible, parcours du Rhône clair ; clavier et tactile OK ; replis complets.

## Retour arrière

`git revert` par sous-fonction (lampe, onglets, lieux).

## 🔁 Fin de session

Session suivante : **S10**.
