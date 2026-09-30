# S08 — Cursus, échelle de profondeur, interludes, bulles

| | |
|---|---|
| Branche | `refonte/la-descente` |
| Dépend de | S06 |
| Taille | L (points de sortie après les tâches 2 et 4) |
| Modèle conseillé | Opus 5.5 |
| Skills / outils | `frontend-design:frontend-design` ; MCP `chrome-devtools` |
| Inputs | I-04 (profondeurs validées ; sinon `TODO(I-04)` visibles dans le journal) |
| Gate | — |

## Brief de contexte

Descente de 8 à 40 m : les cursus (trois écoles), l'**interlude A** (« Descendre »), l'**échelle de profondeur** (section signature, « Jusqu'où irez-vous ? »), le comparatif et l'**interlude B** (« À quarante mètres, le rouge a disparu »). Cette session crée aussi le **moteur de bulles** (loi de Boyle), réutilisé ensuite.

À lire : `01-direction-artistique.md` §2 et §7 (E7, E9, E17) · `02-architecture.md` §8 et §10.

## Préconditions

- S06 cochée. `courses.ts` porte `maxDepth` et `inLadder`.

## Tâches

1. **Bulles (TDD)** :
   - `boyle.ts` : `radiusAtDepth` et `riseSpeed`, tests de référence (de 10 m à la surface, rayon ×1,26 ; de 30 m à la surface, ×1,587) ;
   - `emitter.ts` : canvas 2D fixe unique, pool de 64, `burst()` et `trail()`, rendu en dégradé radial avec reflet, arrêt quand aucune bulle n'est active, rien en mouvement réduit.
   - Branchements : CTA (2 ou 3 bulles au survol, gerbe au clic) via le point d'accroche de S06.
2. **Cursus** : transitions d'onglets (indicateur qui glisse en `transform`, fondu enchaîné et légère montée des panneaux, cascade des lignes de tarifs), révélation du titre d'agence (`Emphasis`). Aucune régression clavier ni ARIA.

   > 🔁 Point de sortie possible.
3. **Interludes** (`interlude.ts`) : parallaxe de l'image (`transform`, 8 à 12 %), citation révélée ligne à ligne, **traînée de bulles au pointeur** (pointeur fin, mouvement autorisé) avec un curseur-anneau propre à l'interlude (`cursor: none` uniquement dans ce cas), thermocline d'entrée et de sortie. Rien de tout cela sur tactile ni en mouvement réduit.
4. **Échelle de profondeur** (E9) :
   - `src/lib/depth/ladder-scale.ts` (**TDD**) : profondeur → position, linéaire de 0 à 40 m (60 % de la course), compressée de 40 à 120 m (40 %) ;
   - desktop (≥ 1024 px, mouvement autorisé) : section épinglée (~300vh), timeline scrubbée ; règle graduée (tous les 5 m jusqu'à 40, puis tous les 10 m) qui défile, marqueur « vous êtes ici » avec la profondeur en très grands chiffres, cartes de certification qui apparaissent à leur profondeur (alternance gauche/droite, les précédentes s'estompent) ; `hud.setMode('hidden')` à l'entrée, `'normal'` à la sortie ;
   - sortie : thermocline « Remontée · 40 m » vers l'interlude B ;
   - mobile et mouvement réduit : liste statique de S05, sans épinglage.

   > 🔁 Point de sortie possible.
5. **Comparatif** : en-tête collant, ligne survolée « éclairée », révélation discrète.
6. **Tests** :
   - unitaires : `boyle.ts`, `ladder-scale.ts` ;
   - E2E : toutes les cartes de l'échelle sont dans le DOM quel que soit le mode (SEO et accessibilité) ; en mouvement réduit, aucun épinglage (hauteur de section normale) ; onglets du cursus toujours conformes au clavier ; pas de canvas de bulles en mouvement réduit ;
   - performance : trace pendant la traversée de l'échelle (pas de tâche longue > 50 ms).

## Vérifications

```bash
npm run build && npm run check && npm test && npm run test:e2e
npm run check:budgets
```

## Critères de sortie

- Descente cohérente de 8 à 40 m, avec l'échelle comme moment fort ; bulles plausibles ; replis complets.
- Profondeurs conformes à I-04, ou `TODO(I-04)` listés dans le journal.

## Retour arrière

`git revert` par sous-fonction (bulles, cursus, interludes, échelle) : chaque partie est dans son propre commit.

## 🔁 Fin de session

Session suivante : **S09**.
