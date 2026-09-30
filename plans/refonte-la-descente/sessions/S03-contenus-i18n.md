# S03 — Contenus & i18n typés FR/EN — 🛑 Gate 2

| | |
|---|---|
| Branche | `refonte/la-descente` |
| Dépend de | S01 (parallélisable avec S02) |
| Taille | M |
| Modèle conseillé | Opus 5.5 |
| Skills | `design:ux-copy` (textes d'interface), `seo` (title et description), `brand-voice` en option |
| Inputs | I-03, I-04, I-05, I-08, I-09, I-10, I-12, I-14 (les manquants deviennent des marqueurs `TODO(I-xx)` explicites) |
| Gate | 🛑 **Gate 2** : textes FR/EN. Validation asynchrone possible, **obligatoire avant S12** |

## Brief de contexte

Tous les textes et toutes les données du site doivent exister, **typés et à parité**, avant la construction des sections. Source : `legacy/components/i18n.jsx` (textes et tarifs actuels, y compris les changements SDI/TDI et FFESSM E4 de S00), les nouvelles lignes de `01-direction-artistique.md` §9 et les inputs de Nicholas. **Aucun fait inventé** : sans donnée, on écrit `TODO(I-xx)` et on le liste.

À lire : `01-direction-artistique.md` §2 et §9 · `02-architecture.md` §4 et §5 · `INPUTS-NICHOLAS.md`.

## Préconditions

- S01 cochée. Inputs listés ci-dessus demandés à Nicholas en début de session (en une seule question groupée).

## Tâches

1. **Relevé des inputs** : noter dans `INPUTS-NICHOLAS.md` ce qui est reçu, avec la date. Pour I-10 (tarifs incohérents), **obtenir une réponse** : c'est bloquant pour `courses.ts`.
2. **Interface `Dictionary` complète** (`src/i18n/types.ts`), une clé par bloc :
   - `meta` (title ≤ 60 caractères, description ≤ 155, textes Open Graph), `a11y` (lien d'évitement, ouvrir/fermer le menu, fermer un dialogue, noms des langues), `nav`, `hud` (profondeur, température, durée, palier, remontée lente, profil de plongée) ;
   - sections, dans l'ordre de `01-direction-artistique.md` §2 : `hero`, `manifesto`, `instructor`, `courses`, `interludes`, `depthLadder`, `compare`, `specialties`, `places`, `prepare`, `gifts`, `testimonials`, `faq`, `contact`, `whatsapp` ;
   - `footer` (crédits photo et IA, liens légaux, Mode calme, « Gérer les cookies ») et `legal` (textes des pages Confidentialité et Mentions légales). Les textes du bandeau de consentement viendront en S11.
   - Titres à emphase en `Emphasis` ; liens dans le texte en `Rich` ; **aucun HTML dans les chaînes** ; chaque sur-titre porte un marqueur de profondeur.
3. **Données** (`src/data/`) :
   - `courses.ts` : tous les cours de `legacy/components/i18n.jsx` (agences SDI/TDI, PADI, FFESSM), tarifs **à l'identique** après arbitrage I-10, `maxDepth` et `inLadder` (I-04), `formInterest` ;
   - `specialties.ts` : listes par onglet (SDI 10, PADI 10 avec équivalences SDI, TDI 4, FFESSM 6) ;
   - `places.ts` (I-03), `credentials.ts`, `contact.ts` (intérêts du formulaire : valeurs actuelles + `gift`).
4. **Nouveaux textes, FR puis EN** : manifeste, échelle de profondeur (titre, chapeau, légendes), citations des interludes, « Avant de s'immerger », **Bons cadeaux** (titre, chapeau, offres, « comment ça marche » en 3 étapes, conditions, CTA — selon I-12), phrase d'appel des témoignages (aujourd'hui codée en dur en FR), contact « Sous l'eau, on ne parle pas. Remontons. », HUD, textes alternatifs de toutes les images, crédits. EN : traduction naturelle, orthographe britannique.
5. **Témoignages** : originaux sur la page FR ; traductions EN marquées « Translated from French » si I-09 est accordé (sinon originaux avec `lang="fr"` et la mention « Reviews written in French »).
6. **Pages légales** (FR et EN) :
   - **Confidentialité** (nLPD, et RGPD pour les visiteurs de l'UE) : responsable du traitement, données collectées (formulaire, échanges WhatsApp/téléphone/e-mail à l'initiative du visiteur, journaux serveur), finalités, bases légales, destinataires et sous-traitants (Google : Gmail pour l'acheminement du formulaire, Google Ads et GA4 **après consentement** ; transferts vers les États-Unis), durées de conservation (I-08), droits et autorité compétente (PFPDT), cookies (tableau complété en S11), contact ;
   - **Mentions légales** : identité et forme juridique, adresse (si affichable, I-08), contacts, IDE éventuel, hébergement (serveur auto-hébergé en Suisse), propriété intellectuelle et crédits photo, responsabilité.
   - Mention en tête du journal : « Textes à relire par Nicholas ; ceci n'est pas un avis juridique ».
7. **Tests** :
   - parité (clés, types, longueurs de tableaux, aucune chaîne vide, aucun `TODO` dans un seul des deux fichiers) ;
   - données : identifiants uniques, prix > 0 en CHF, tout cours `inLadder` a un `maxDepth`, chaque intérêt de `contact.ts` figure dans `ALLOWED_INTERESTS` de `public/api/contact.php` → **ajouter `gift`** à cette liste PHP et relancer `php tests/php/contact_test.php` ;
   - `src/lib/format.ts` (TDD) : `formatCHF`, profondeurs, coordonnées, `mm:ss`.
8. **`plans/refonte-la-descente/CONTENT-REVIEW.md`** : tableau FR | EN de tous les textes **nouveaux ou modifiés**, liste des `TODO(I-xx)` restants, questions ouvertes.
9. 🛑 **Gate 2** : présenter `CONTENT-REVIEW.md` à Nicholas. Consigner « validée » ou « en attente » dans `PROGRESS.md`, avec les retours. Les sessions S04 à S11 peuvent avancer avec les textes actuels ; **S12 exige la Gate 2 validée**.

## Vérifications

```bash
npm run check && npm test && npm run coverage
php tests/php/contact_test.php
grep -rn "TODO(I-" src/ | wc -l     # à reporter dans le journal
```

## Critères de sortie

- `fr.ts`, `en.ts` et `src/data/*` complets, typés et à parité ; `TODO(I-xx)` uniquement là où un input manque, tous listés.
- Tarifs arbitrés (I-10) ; `gift` accepté côté PHP.
- `CONTENT-REVIEW.md` produit ; statut de la Gate 2 consigné.

## Retour arrière

`git revert` des commits de la session (aucun impact sur les autres fichiers).

## 🔁 Fin de session

Session suivante : **S04** si S02 est faite, sinon **S02**.
