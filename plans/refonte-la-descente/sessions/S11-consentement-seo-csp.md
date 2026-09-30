# S11 — Consentement, mesure, SEO, CSP

| | |
|---|---|
| Branche | `refonte/la-descente` |
| Dépend de | S05 (parallélisable avec S07 à S10) |
| Taille | M |
| Modèle conseillé | Opus 5.5 |
| Skills / agents | `seo` ; `security-review` ; agents `security-reviewer` et `code-reviewer` |
| Inputs | I-06 (conversions Ads, GA4), I-07 (mode de consentement), I-08 (mentions légales), I-14 (profils, optionnel) |
| Gate | — |

## Brief de contexte

Aujourd'hui, la balise Google Ads charge un GA4 que la CSP bloque (aucune donnée), et il n'y a aucun consentement alors que Google exige le Consent Mode v2 pour les visiteurs UE/UK/CH (D8). Cette session met en place le **bandeau**, le **Consent Mode v2**, les **conversions**, le **SEO technique complet** et la **CSP finale**, prête à être appliquée par nginx en S13.

À lire : `02-architecture.md` §12 à §14 · `00-contexte.md` §2 (CSP actuelle) et §9.

## Préconditions

- S05 cochée. I-06 et I-07 reçus (sinon : mode avancé par défaut et conversions désactivées derrière un drapeau, consigné dans le journal).

## Tâches

1. **`public/js/consent-default.js`** (synchrone, juste après `boot.js`) : définit `dataLayer` et `gtag`, pose les valeurs par défaut (`02-architecture.md` §12), puis **injecte `gtag/js?id=AW-10798308119` uniquement si `location.hostname === 'dive.bullesenvalais.ch'`**, pour que le développement et la préproduction n'envoient jamais de données. En mode basique (I-07), l'injection attend le consentement.
2. **Bandeau** : `npm i vanilla-cookieconsent@^3.1` ; `src/components/consent/consent.ts` (catégories `necessary`, `analytics`, `marketing` ; `onConsent` et `onChange` → `gtag('consent','update', …)`) ; textes FR/EN ajoutés au dictionnaire (parité) ; style relié aux tokens via les variables CSS de la librairie (fond du ton courant, bouton principal « lampe ») ; bouton « Gérer les cookies » du pied de page branché ; HUD mobile et bouton WhatsApp **masqués** tant que le bandeau est ouvert.
3. **Mesure** (`src/lib/analytics/events.ts`) : `trackLead()` (succès du formulaire), `trackWhatsApp()`, `trackPhone()` → `gtag('event','conversion',{ send_to:'AW-10798308119/<libellé>' })` (I-06) et `generate_lead` pour GA4. Vérifier dans l'assistant de balises Google (avec Nicholas) si GA4 est déjà une destination de la balise Google ; sinon ajouter `gtag('config','G-QG5ZCVY1Z7')` dans `consent-default.js`.
4. **Tableau des cookies** dans la page Confidentialité (FR/EN) : noms, fournisseurs, finalités et durées réelles (`_gcl_au`, `_ga`, `_ga_<id>`, cookie de la librairie de consentement, clé `localStorage` du Mode calme), relevés dans le navigateur **après** consentement. Compléter les mentions légales avec I-08.
5. **SEO** :
   - `<head>` complet (`02-architecture.md` §13) : Open Graph (images de S04), Twitter, `theme-color`, `og:locale` ;
   - `src/lib/seo/jsonld.ts` (**TDD**) : `@graph` construit depuis `src/data/*` (JSON valide, aucun `undefined`, prix en CHF, `sameAs` seulement si I-14 est fourni, **pas** d'`AggregateRating`) ;
   - `public/robots.txt` (tout autorisé, lien vers le sitemap), `public/llms.txt` (présentation courte + liens FR/EN), sitemap (vérifier les alternates `hreflang` dans `dist/sitemap-0.xml`), `noindex` sur `404` et `styleguide`.
6. **CSP finale** :
   - `ops/nginx/security-headers.conf` : CSP de `02-architecture.md` §14, vérifiée domaine par domaine avec le [guide Google](https://developers.google.com/tag-platform/security/guides/csp) **à la date de la session**, plus les autres en-têtes actuels (HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`) ;
   - `scripts/serve-with-csp.mjs` : petit serveur Node (`node:http`) qui sert `dist/` avec ces en-têtes ;
   - projet Playwright `csp` : parcours complet (scroll, onglets, FAQ, formulaire simulé, bandeau accepter puis refuser, dialogues) en écoutant `securitypolicyviolation` (via `addInitScript`) : **zéro violation** pour les ressources `'self'`. Les domaines Google ne se chargent pas en local (garde sur le nom d'hôte) : ils seront vérifiés en production (S13) ;
   - optionnel (S00 a constaté que `/api/csp/report` n'existe pas : ≈ 1 250 rapports perdus dans le repli SPA) : `public/api/csp-report.php` (JSON ≤ 8 Ko, journal hors docroot, limité par nginx, **avec sa propre `location` exacte** : depuis S00, tout autre `.php` que `contact.php` répond 404) et `report-uri` / `report-to` dans l'en-tête.
7. **Aucun script inline** : `grep -rn "<script" dist --include=*.html` ne doit montrer que des `src=` et des `application/ld+json`.
8. **Tests** :
   - E2E consentement : `dataLayer` contient le `consent default` refusé ; « Tout accepter » → `consent update` accordé ; « Refuser » → refusé ; réouverture des préférences depuis le pied de page ; bandeau au clavier (focus, `Esc` non destructif) ;
   - unitaires : `jsonld.ts` ;
   - `csp` sans violation ; axe sur le bandeau ouvert.

## Vérifications

```bash
npm run build && npm run check && npm test && npm run test:e2e
npx playwright test --project=csp
grep -rn "<script" dist --include=*.html
npm run check:budgets
```

## Critères de sortie

- Consent Mode v2 conforme ; conversions branchées (ou désactivées proprement si I-06 manque) ; aucune donnée envoyée hors production.
- JSON-LD, sitemap, robots et hreflang valides ; CSP finale écrite et testée localement ; aucun script inline.
- Revues de sécurité et de code sans CRITICAL ni HIGH.

## Retour arrière

`git revert` ; la CSP n'est pas encore appliquée en production (S13).

## 🔁 Fin de session

Session suivante : **S12 — Préproduction & recette**, quand S07 à S10 sont cochées.
