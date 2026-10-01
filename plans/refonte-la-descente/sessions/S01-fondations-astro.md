# S01 — Fondations Astro 7

| | |
|---|---|
| Branche | `refonte/la-descente` (créée ici depuis `main`) |
| Dépend de | S00 |
| Taille | M |
| Modèle conseillé | Opus 5.5 ou Sonnet 5 |
| Skills / agents | `code-reviewer` en fin de session |
| Inputs | — |
| Gate | — |

## Brief de contexte

Le site actuel (React + Babel compilés dans le navigateur) reste en ligne depuis `main`. Cette session pose le socle de la refonte : un projet **Astro 7** statique, en TypeScript strict, avec l'i18n FR/EN par URL, les outils de test et le budget de performance, **sans encore aucun design**. L'ancien code est rangé dans `legacy/` pour servir de source de contenu (S03).

À lire : `02-architecture.md` §1 à §4, §7 et §15 · `00-contexte.md` §3, §6 et §8.

## Préconditions

- S00 cochée ; `main` à jour et propre (`git switch main && git pull`).

## Tâches

1. `git switch -c refonte/la-descente`.
2. **Échafaudage** : `npm create astro@latest` avec le modèle `minimal`, sans installation ni git, **dans un dossier temporaire** (vérifier les options avec `npm create astro@latest -- --help`), puis reprendre `package.json`, `astro.config.mjs`, `tsconfig.json` et `src/` à la racine du dépôt.
3. **Rangement** :
   - `git mv index.html app.jsx styles.css components legacy/` ;
   - `git mv api/contact.php public/api/` (le correctif S00 suit ; **fichier seul** : `api/` contient aussi le secret local gitignoré `mail-config.php`, qui ne doit passer ni dans `public/` ni dans `dist/`) ;
   - `git mv images src/assets/images`.
   `.venv/`, `.idea/` et `settings.json` (non suivi) restent en place. Pour comparer avec l'ancien site, `main` reste disponible (`git worktree add ../bev-legacy main` si besoin).
   - Mettre à jour les chemins `api/` → `public/api/` dans `tests/php/` (le `require` de `contact_test.php` et celui de `router.php`, la variable `SOURCE` de `run_unit_php74.sh` ; `run_integration.sh` passe par `router.php`), puis relancer `php tests/php/contact_test.php` et `bash tests/php/run_integration.sh`.
4. **Dépendances** : `npm i astro@^7.3 gsap@^3.15 lenis@^1.3 ogl@^1.0` puis `npm i -D typescript @astrojs/check @astrojs/sitemap vitest @vitest/coverage-v8 @playwright/test @axe-core/playwright prettier prettier-plugin-astro`. Ensuite `npx playwright install chromium firefox webkit`.
5. **`astro.config.mjs`** selon `02-architecture.md` §3 : `site`, `trailingSlash: 'always'`, `build.format: 'directory'`, `inlineStylesheets: 'never'`, i18n (`fr` par défaut sans préfixe, `en`), intégration sitemap. Pas encore de polices (S02).
6. **`tsconfig.json`** : `extends: "astro/tsconfigs/strict"`, alias `@/*` → `src/*`.
7. **i18n minimal** : `src/i18n/types.ts` (`LOCALES`, `Locale`, `Localized`, `Emphasis`, `Rich`, `Dictionary` réduit à `meta` et `hero.title`), `fr.ts`, `en.ts`, `index.ts` (`getDictionary(locale)`, `localePath(locale, path)`), `routes.ts`. **`parity.test.ts`** générique : compare récursivement les clés, les types et la longueur des tableaux de `fr` et `en`, et refuse les chaînes vides.
8. **Pages** : `src/pages/index.astro` et `src/pages/en/index.astro` rendent `HomePage` (squelette) avec un `h1` issu du dictionnaire. `BaseLayout.astro` : `lang`, `charset`, `viewport`, `title`, `description`, `canonical`, `hreflang` (fr-CH, en, x-default) et `<script src="/js/boot.js">` en premier dans `<head>`. `public/js/boot.js` exactement comme `02-architecture.md` §7. `src/scripts/app.ts` : registre de contrôleurs vide, importé par le layout.
9. **Styles** : `src/styles/{tokens,typography,global,motion,utilities}.css` en place (reset moderne, `box-sizing`, `color-scheme: light`, `body` avec un fond explicite) ; les valeurs définitives viennent en S02.
10. **Outillage de test** :
    - `vitest.config.ts` : environnement `node`, couverture v8, seuil de 80 % sur `src/lib/**`, `src/data/**` et `src/i18n/**` (activé dès que ces dossiers ont du code) ;
    - `playwright.config.ts` : `webServer` (`npm run build && npm run preview -- --port 4321 --ignore-lock`, sans réutiliser un serveur existant), projets de `02-architecture.md` §15 ;
    - `tests/e2e/smoke.spec.ts` : `/` et `/en/` répondent, `h1` visible, `html[lang]` correct, `hreflang` présents.
11. **Scripts `package.json`** : `dev`, `build`, `preview`, `check` (`astro check`), `test` (`vitest run`), `coverage`, `test:e2e`, `test:visual`, `test:a11y`, `format`, `format:check`, `check:budgets`.
12. **`scripts/check-budgets.mjs`** : lit `dist/**/*.html` pour distinguer le JS initial (scripts `src` **et** `<link rel="modulepreload">` référencés, plus leurs imports statiques) du JS total (tous les `.js` de `dist/`), gzippe en mémoire et échoue au-delà de 90 / 150 Ko (JS) et 30 Ko (CSS). Afficher un tableau (D19). Ajouté après la revue : **`scripts/check-dist.mjs`**, lancé après chaque build (D17).
13. **`.gitignore`** : `node_modules/`, `dist/`, `.astro/`, `coverage/`, `test-results/`, `playwright-report/`, `public/api/mail-config.php` (en plus de l'entrée existante).
14. **`CLAUDE.md`** : réécrire pour la nouvelle architecture (commandes, arborescence, règle de parité appliquée par les tests, « `main` reste le site en ligne jusqu'à S13 », pointeur vers `plans/refonte-la-descente/`). Garder les notes de déploiement actuelles, marquées « jusqu'à S13 ».
15. **Push de la branche** (à confirmer) : `git push -u origin refonte/la-descente`.

## Vérifications

```bash
npm run build && npm run check && npm test     # build = astro build + check:dist
npx playwright test tests/e2e/smoke.spec.ts --project=chromium
npm run check:budgets
ls dist/ dist/en/ dist/api/        # index.html dans les deux langues, contact.php seul sous api/
```

## Critères de sortie

- Build, types, tests unitaires (parité) et smoke E2E verts. Budgets très en dessous des seuils.
- `dist/api/contact.php` présent ; `legacy/` contient l'ancien code ; images dans `src/assets/images/`.
- `CLAUDE.md` à jour ; branche poussée.

## Retour arrière

Supprimer la branche (`git switch main && git branch -D refonte/la-descente`, et sur le dépôt distant si elle a été poussée) : `main` n'a pas été touché.

## 🔁 Fin de session

Session suivante : **S02** (design system). **S03** (contenus) peut être menée en parallèle si tu le souhaites.
