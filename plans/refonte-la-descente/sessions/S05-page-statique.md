# S05 — Page statique complète (sémantique, responsive, accessible)

| | |
|---|---|
| Branche | `refonte/la-descente` |
| Dépend de | S02, S03 (S04 conseillée ; sinon images provisoires) |
| Taille | L (points de sortie après les tâches 3 et 5) |
| Modèle conseillé | Opus 5.5 |
| Skills / agents | `frontend-design:frontend-design` ; `design:accessibility-review` en fin de session ; agent `code-reviewer` |
| Inputs | — |
| Gate | — |

## Brief de contexte

Construire **toute la page, FR et EN, sans animation** : c'est la base d'amélioration progressive sur laquelle S06 à S10 ajouteront le mouvement. Sans JavaScript, tout le contenu est lisible et le formulaire fonctionne. Avec JavaScript, les contrôleurs essentiels (onglets, FAQ, formulaire, menu, WhatsApp, langue, Mode calme) marchent **sans GSAP**.

À lire : `01-direction-artistique.md` §2 et §6 · `02-architecture.md` §2, §4 à §7, §11 et §13 · `00-contexte.md` §4.3 (défauts à ne pas reproduire).

## Préconditions

- S02 et S03 cochées ; tokens figés ; dictionnaires complets.

## Tâches

1. **`BaseLayout`** : `<head>` complet hors Open Graph et JSON-LD (S11) ; `<Font preload>` limité aux fichiers critiques ; `boot.js` ; `app.ts` ; lien d'évitement « Aller au contenu » ; `<main id="content">`.
2. **`HomePage.astro`** : sections dans l'ordre de `01-direction-artistique.md` §2, chacune avec `id`, `aria-labelledby`, `data-tone`, `data-depth-start` et `data-depth-end`. Ancres historiques conservées (`#gear` et `#insurance` en alias dans `#prepare`, `#compare` dans l'échelle).
3. **Sections 0 à 6** :
   - `Nav` (liens Instructeur, Cursus, Spécialités, Lieux, FAQ ; langue ; CTA « Me contacter ») ;
   - `Hero` (`h1` en `Emphasis`, chapeau, 2 CTA, ligne des crédits, coordonnées ; `<Picture>` `loading="eager"` et `fetchpriority="high"`, `sizes="100vw"`) ;
   - `Manifesto`, `Instructor` (portrait en art direction : `<picture>` construit avec `getImage()` pour les sources desktop et mobile ; crédits en liste de définitions) ;
   - `Courses` (onglets conformes à l'APG ; **sans JS, les trois panneaux s'affichent empilés** avec leur titre) avec `AgencyPanel` et `PriceList` alimentés par `courses.ts` ;
   - `Interlude` A (`figure`, `blockquote`, crédit) ;
   - `DepthLadder` en version **statique** (liste ordonnée avec règle graduée, données `courses.ts`) et `CompareTable` (`th scope="col"` et `th scope="row"`, lecture en cartes sous 768 px) ;
   - `Interlude` B.

   > 🔁 Point de sortie possible : committer, journaliser « S05 : sections 0 à 6 faites ».
4. **Sections 7 à 14** : `Specialties` (4 onglets, grille de `SpecialtyCard`), `Places` (3 `PlaceCard`, `RhoneMap` SVG statique), `Prepare` (matériel avec `RichText` pour les liens partenaires, assurances), `Gifts` (`GiftCard` statique, offres, étapes, CTA `data-prefill-interest="gift"`), `Testimonials` (rail `scroll-snap` avec boutons précédent/suivant, attributs `lang` corrects), `Faq` (`<details name="faq">`), `Contact` (titres, canaux, crédits, `ContactForm`), `WhatsAppDialog` (`<dialog>`), `Footer` (crédits, liens légaux, langue, bouton « Gérer les cookies » inactif jusqu'à S11, bouton **Mode calme** `aria-pressed`).
5. **Contrôleurs essentiels** (registre de `app.ts`, chacun retourne une fonction de nettoyage) :
   - `tabs.ts` : clavier ← → Début Fin, `tabindex` itinérant, `aria-selected`, `aria-controls` ;
   - `nav.ts` : menu mobile en `<dialog>` modal (focus piégé, `Esc`, focus rendu au bouton, `aria-expanded`) ;
   - `contact-form.ts` : `src/lib/form/validate.ts` (**TDD**, mêmes règles que le PHP) et `submit.ts` (états, erreurs par champ avec `aria-invalid` et `aria-describedby`, résumé d'erreurs focalisé, `aria-live`, pot de miel, `elapsed`, pré-remplissage `data-prefill-interest`, échec → alternatives, **jamais d'ouverture automatique de `mailto:`**) ;
   - `whatsapp.ts` : dialogue, lien `wa.me/41794368112?text=…` encodé, `rel="noopener noreferrer"` ;
   - `calm-mode.ts` : bascule la classe et `localStorage` (dans un try/catch), puis recharge la page.
   - Sélecteur de langue : **de vrais liens** calculés au build (`routes.ts`), jamais des `<span onClick>`.

   > 🔁 Point de sortie possible.
6. **Pages annexes** : `LegalLayout`, pages Confidentialité et Mentions légales FR/EN (textes de S03), `404.astro` bilingue avec lien vers l'accueil, en `noindex`.
7. **Responsive** : vérifier 320, 375, 768, 1024, 1440 et 1920 px ; aucun débordement horizontal ; cibles tactiles ≥ 44 px sur mobile.
8. **Tests** :
   - E2E : ancres historiques, onglets au clavier, FAQ exclusive, formulaire (requêtes simulées : 200 → succès, 400 → erreurs par champ, 500 → alternatives sans navigation), pré-remplissage cadeau, dialogues (focus, `Esc`, retour du focus), bascule de langue, page `/en/` intégralement en anglais (hors témoignages originaux marqués `lang="fr"`) ;
   - `tests/e2e/overflow.spec.ts` : `scrollWidth <= innerWidth` à 320 px ;
   - accessibilité : `tests/a11y/axe.spec.ts` sur `/`, `/en/` et les pages légales ;
   - unitaires : `validate.ts`.
9. **Performance et revue** : Lighthouse mobile en local (sans mouvement) : Perf ≥ 95, A11y 100, SEO ≥ 95 ; `npm run check:budgets` ; `design:accessibility-review` ; agent `code-reviewer`.
10. **Captures de référence** aux 4 largeurs dans `plans/refonte-la-descente/gates/s05/`.

## Vérifications

```bash
npm run build && npm run check && npm test
npm run test:e2e && npm run test:a11y
npm run check:budgets
```

## Critères de sortie

- Toutes les sections FR/EN présentes ; fonctionnement sans JS vérifié (JavaScript désactivé dans Playwright) ; contrôleurs essentiels OK.
- axe : 0 violation sérieuse ou critique ; aucun débordement ; Lighthouse local conforme.
- Chaque défaut de `00-contexte.md` §4.3 est traité ou planifié.

## Retour arrière

`git revert` des commits de la session (les sections sont isolées par dossier).

## 🔁 Fin de session

Session suivante : **S06 — Moteur de mouvement**. **S11** (consentement, SEO, CSP) peut désormais être menée en parallèle.
