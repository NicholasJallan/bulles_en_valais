# S02 — Design system & styleguide « La Descente » — 🛑 Gate 1

| | |
|---|---|
| Branche | `refonte/la-descente` |
| Dépend de | S01 |
| Taille | L (point de sortie intermédiaire après la tâche 6) |
| Modèle conseillé | Opus 5.5 |
| Skills / outils | **charger `frontend-design:frontend-design` au début** ; `design:design-critique` sur les captures ; MCP `chrome-devtools` (captures) |
| Inputs | — |
| Gate | 🛑 **Gate 1** : palette, typographie, sensation du mouvement |

## Brief de contexte

Transformer la direction artistique en **système concret** : tokens (couleur par ton de profondeur, espacements, rayons, ombres, lueurs, mouvement), typographie (trois appariements à comparer), composants de base et démonstrations de mouvement, le tout réuni dans une page `/styleguide/` (noindex) que Nicholas juge sur ordinateur et sur téléphone.

À lire : **`01-direction-artistique.md` en entier** · `02-architecture.md` §3 (Fonts API) · `00-contexte.md` §6, §7 et §9.

## Préconditions

- S01 cochée ; build vert.

## Tâches

1. **Polices** : déclarer via la Fonts API les candidates des appariements A, B et C (`01-direction-artistique.md` §5) et un mono candidat, chacune avec sa variable CSS (`--font-a-display`, `--font-a-sans`, etc.). Vérifier et consigner les licences (OFL pour Google, ITF Free Font License pour Fontshare). Vérifier dans la doc Fonts API la syntaxe des graisses variables et des sous-ensembles.
2. **`src/lib/color/contrast.ts` (TDD)** : conversion OKLCH → sRGB (OKLCH → OKLab → sRGB linéaire → sRGB gamma, avec écrêtage), luminance relative et ratio WCAG. Tests : valeurs de référence (noir/blanc = 21), puis **tous les couples texte/fond de chaque ton** au-dessus des seuils (4,5:1 pour le texte courant, 3:1 pour les grands titres et l'interface). Le test lit les tokens depuis un module TS partagé (`src/lib/color/palette.ts`), aussi utilisé pour générer ou vérifier `tokens.css`.
3. **`tokens.css`** :
   - couleurs brutes (`01-direction-artistique.md` §4), puis blocs `[data-tone="surface|lagoon|emerald|deep|abyss"]` qui définissent les rôles `--bg`, `--fg`, `--fg-soft`, `--line`, `--accent-deco` (se désature avec la profondeur) et `--action` (rouge-lampe à toute profondeur) ;
   - espacements fluides (`clamp`), rayons (2 / 14 / 999 px), ombres « sous-marines », lueurs d'action, échelle de `z-index`, largeur max et gouttières ;
   - tokens de mouvement (`01-direction-artistique.md` §3), avec leur miroir TS dans `src/lib/motion/tokens.ts`. Un test vérifie que les deux fichiers concordent.
4. **`typography.css`** : échelle fluide, styles `h1` à `h3`, emphase italique par ton, utilitaires `tabular-nums` et sur-titre avec marqueur de profondeur (`— 12 m · Cursus`), `text-wrap: balance` pour les titres et `pretty` pour les paragraphes.
5. **Composants de base** (`src/components/ui/`) : `Button` (primaire « lampe » avec lueur, secondaire, fantôme, lien ; états hover, focus-visible en halo, active, disabled), `Eyebrow`, `SectionHeader`, `Icon`, champs de formulaire. Cibles tactiles ≥ 24 px (WCAG 2.2), idéalement 44 px.
6. **`src/pages/styleguide.astro`** (`<meta name="robots" content="noindex">`, exclu du sitemap) :
   - palette avec ratios de contraste affichés ;
   - **colonne d'eau** : bandes de 0 à 40 m puis retour à 0, pour ressentir la descente au scroll ;
   - **sélecteur d'appariement** (A/B/C, attribut `data-pairing`) appliqué au titre du hero, à un en-tête de section, un paragraphe, une grille de tarifs et des chiffres de HUD ;
   - boutons et champs dans tous leurs états, cartes, sur-titres, maquette statique du HUD ;
   - **trois démos de mouvement** (GSAP) : titre en flottabilité neutre (E5), révélation « ligne d'eau » d'une image (E6), gerbe de bulles (E7, prototype).

   > 🔁 Point de sortie possible ici : committer, journaliser « S02 tâche 6 terminée ».
7. **Captures** à 320, 768, 1024 et 1440 px (MCP `chrome-devtools`, pages `styleguide` en haut et au milieu), enregistrées en JPEG ≤ 200 Ko dans `plans/refonte-la-descente/gates/gate-1/`.
8. **Auto-critique** : lancer `design:design-critique` sur les captures et vérifier la checklist de `~/.claude/rules/web/design-quality.md` (au moins quatre qualités requises, aucun motif interdit). Corriger.
9. 🛑 **Gate 1** : présenter à Nicholas l'URL LAN (`npm run build && npm run preview -- --host`, avec son accord, puis `http://<ip-du-mac>:4321/styleguide/` ; jamais `astro dev --host`, D18), les captures et ces questions, avec une recommandation pour chacune :
   1. appariement typographique A, B ou C ;
   2. palette et tons (ajustements ?) ;
   3. sensation du mouvement (plus lent, plus rapide, juste) ;
   4. style du HUD (mono ou grotesque tabulaire).
   Consigner ses réponses dans `PROGRESS.md` (tableau Gates + Décisions).
10. **Finaliser** : ne garder que les polices choisies dans la config (supprimer les autres), figer les tokens, mettre à jour `01-direction-artistique.md` si une valeur change (en le signalant dans §Mutations).

## Vérifications

```bash
npm run build && npm run check && npm test     # dont contraste et concordance des tokens
npm run check:budgets
```

## Critères de sortie

- Gate 1 validée et consignée. Tokens définitifs, tests de contraste verts pour tous les tons.
- Une seule paire de polices (+ le mono éventuel) dans la config, préchargement limité à 3 fichiers au plus.
- Styleguide conforme aux décisions.

## Retour arrière

`git revert` des commits de la session (le styleguide et les tokens sont isolés).

## 🔁 Fin de session

Session suivante : **S04** (visuels), qui dépend de la palette, et **S03** si elle n'a pas encore été faite.
