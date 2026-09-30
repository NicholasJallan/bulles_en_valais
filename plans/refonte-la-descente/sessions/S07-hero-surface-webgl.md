# S07 — Hero « Surface » en WebGL + immersion + intro

| | |
|---|---|
| Branche | `refonte/la-descente` |
| Dépend de | S06, S04 (hero retenu et masque d'eau) |
| Taille | L (points de sortie après les tâches 3 et 5) |
| Modèle conseillé | Opus 5.5 (session la plus technique) |
| Skills / outils | `frontend-design:frontend-design` ; MCP `chrome-devtools` (trace, Lighthouse) ; tutoriel Codrops « ripples, reveals » (`00-contexte.md` §10) pour l'inspiration, **sans copier de code sous licence incompatible** |
| Inputs | — |
| Gate | — |

## Brief de contexte

Le hero est la première impression et **l'effet signature** du site : la photo du lac « respire » (seule l'eau ondule, des caustiques dansent, le pointeur crée des ondes), puis, au scroll, on **passe sous la surface**. Contraintes fortes : l'`<img>` du hero reste l'élément LCP (affichée immédiatement, jamais masquée), le WebGL est chargé à la demande après le LCP, et tout a un repli.

À lire : `01-direction-artistique.md` §7 (E1, E2, E15) · `02-architecture.md` §7 et §9 · `00-contexte.md` §7 (budgets) et §9 (anti-patterns : Shadertoy, LCP).

## Préconditions

- S06 cochée ; Gate 3 validée (hero retenu, `water-mask.png` aligné).

## Tâches

1. **`capability.ts` (TDD)** : `canUseWebGL(env)` avec environnement injectable (`motion-ok`, contexte `webgl2`, `saveData`, `deviceMemory` ≥ 4 si connu, `hardwareConcurrency` ≥ 4). Tests d'abord.
2. **Shaders** (`src/lib/webgl/shaders/`, importés en `?raw`, écrits par nous ; bruit `webgl-noise` MIT crédité en en-tête) :
   - `surface.vert` : triangle plein écran ;
   - `surface.frag` : échantillonnage de l'image avec déplacement par bruit **limité au masque d'eau** ; caustiques additives (fonction maison, par exemple bruit déformé ou Voronoï), plus fortes avec `uImmersion` ; ondulations (`uRipples[8]` : anneau sinusoïdal amorti par l'âge) ; ligne d'eau ondulée qui monte avec `uImmersion` ; sous la ligne : étalonnage sous-marin (teinte bleu-vert, contraste réduit), rayons de lumière descendants, particules en suspension (hash) ;
   - uniforms de `02-architecture.md` §9 ; `highp` si disponible, sinon `mediump`.
3. **`surface.ts`** (OGL : Renderer, Program, Mesh, Triangle, Texture) : `createSurface({ canvas, image, mask })` → `setImmersion`, `addRipple`, `start`, `stop`, `destroy` ; boucle sur `gsap.ticker` ; IntersectionObserver (arrêt hors écran), `visibilitychange`, `ResizeObserver`, DPR ≤ 1,5 (×0,75 de résolution sur mobile), `webglcontextlost` → retour à l'image fixe.

   > 🔁 Point de sortie possible : shader validé seul, sur une page de test (retirée ensuite).
4. **`hero.ts`** :
   - après `load` et en idle, si `canUseWebGL()` : `import()` du module, `await img.decode()`, création de la surface avec l'image affichée (`currentSrc`), puis fondu du canvas **au-dessus** de l'image (l'image reste en dessous comme repli) ;
   - ondes : pointeur (limitées en fréquence) ; sur tactile, **seulement au toucher bref** (jamais pendant un glissement, pour ne pas gêner le scroll) ;
   - E2 : ScrollTrigger scrubbé du début à la fin du hero → `setImmersion(0 → 1)` ; sortie du titre en dérive vers le haut (lignes SplitText) ; le HUD reste à 0,0 m tant que la ligne d'eau n'a pas traversé l'écran, puis la descente commence (manifeste : 0 → 3 m).
5. **Replis** :
   - mouvement autorisé sans WebGL : ligne d'eau CSS (`clip-path` ondulé animé en `transform` et `clip-path`) et voile sous-marin en opacité ;
   - mouvement réduit ou Mode calme : image fixe, aucun effet.

   > 🔁 Point de sortie possible.
6. **Intro E15** (≤ 1,2 s, jamais bloquante) : le logo SVG « expire » une bulle, les lignes du titre se posent, le HUD s'allume à 0,0 m. **L'image hero reste visible dès le premier affichage.**
7. **Performance** :
   - trace mobile (CPU ×4, Fast 4G, cache vide) : **LCP ≤ 2,0 s** et élément LCP = `<img>` du hero ;
   - morceau WebGL ≤ 30 Ko gzip, chargé après le LCP ;
   - temps de rendu GPU stable, aucune boucle quand le hero est hors écran (vérifier dans la trace).
8. **Tests** :
   - unitaires : `capability.ts` ;
   - E2E : canvas présent (Chromium desktop, mouvement autorisé) ; absent avec mouvement réduit ; l'entrée `largest-contentful-paint` pointe sur l'`IMG` du hero ; aucune erreur console ; le scroll tactile n'est pas bloqué (projet mobile) ;
   - visuel : capture du hero avec WebGL désactivé (image de référence stable).

## Vérifications

```bash
npm run build && npm run check && npm test && npm run test:e2e
npm run check:budgets
```

## Critères de sortie

- Surface vivante et immersion fluides sur desktop et sur un mobile récent ; replis propres ; LCP et budgets tenus.
- Aucun code de shader d'origine douteuse ; crédits présents dans les fichiers.

## Retour arrière

Désactiver le chargement dynamique dans `hero.ts` (drapeau) : le hero statique de S05 reste en place.

## 🔁 Fin de session

Session suivante : **S08**.
