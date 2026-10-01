# S04 — Visuels : retouches, IA, logo, favicons, OG — 🛑 Gate 3

| | |
|---|---|
| Branche | `refonte/la-descente` |
| Dépend de | S02 (palette et étalonnage) |
| Taille | M |
| Modèle conseillé | Opus 5.5 |
| Skills / outils | MCP `nano-banana` (charger via `ToolSearch` : « nano-banana ») ; `sharp` (scripts Node), `ffmpeg`, `cwebp` ; `design:design-critique` ; `xccr-diver-render` seulement si le MCP fal-ai est configuré et que Nicholas le demande |
| Inputs | **I-02 (logo vectoriel)**, I-13 (originaux HD), I-15 (accord retouches et IA) |
| Gate | 🛑 **Gate 3** : hero, retouches, visuels IA, logo animé |

## Brief de contexte

Pas de photo ni de vidéo sous-marine des lacs (D5). Le premium visuel viendra de **vraies photos soignées** (surface des lacs, portrait, photo de Nicholas en bleu profond), **d'effets procéduraux** (WebGL, bulles, lumière) et de **quelques visuels IA d'ambiance**, toujours crédités et jamais trompeurs. Le logo actuel n'existe qu'en PNG 32×32 : Nicholas fournit un vectoriel.

À lire : `01-direction-artistique.md` §4 et §8 · `00-contexte.md` §9 (règles IA).

## Préconditions

- S02 cochée (palette figée). I-02 reçu ; sinon, traiter tout le reste et laisser le logo en attente, consigné dans le journal.

## Tâches

1. **Inventaire** : ranger les sources dans `src/assets/images/{hero,instructor,places,interludes,prepare}/` ; déposer les originaux HD de I-13 s'ils sont reçus. Créer `src/assets/images/CREDITS.md` (fichier, source, auteur ou outil IA, date, prompt, retouches).
2. **Hero, option A (recommandée)** : `rosel-2400.jpg` **retouchée**. Retirer lignes électriques, pylône, éolienne et panneau « 10000M » avec l'édition d'image de `nano-banana`, si l'outil accepte une image en entrée ; sinon demander à Nicholas une retouche (Lightroom ou Photoshop, suppression générative). Garder la résolution d'origine, comparer avant/après en pleine taille, aucune trace visible. Préparer aussi une **option B** pour la gate (par exemple Sion au coucher du soleil, si l'original HD est reçu).
3. **Masque d'eau** pour E1 : `scripts/make-water-mask.mjs` (sharp + SVG) génère `src/assets/textures/water-mask.png` (512 px de large, niveaux de gris, blanc = eau, bord flouté) à partir d'un polygone de la ligne de rive **réglé à la main** sur l'image retouchée. Contrôle : superposition semi-transparente enregistrée dans `gates/gate-3/`.
4. **Interlude B (hirondelle)** : régénérer avec `nano-banana` **sans filigrane**, en 16:9 et à la plus haute résolution possible (≥ 2560 px visé, sinon agrandir proprement), même intention : épave, plongeurs recycleur, lampes rouges, bleu profond, aucun visage reconnaissable. Proposer 2 ou 3 candidats. Vérifier à 100 % qu'aucun filigrane ✦ ne subsiste. Crédit « Visuel généré par IA ».
5. **Interlude A (`bde.jpg`)** : recadrages 16:9 (desktop) et 4:5 (mobile). La signature « © Nicholas Jallan » est recadrée ou conservée selon la décision de la gate ; crédit en légende dans tous les cas.
6. **Portrait** (`nicholas.jpg`) : recadrages dirigés, desktop 4:5 et mobile 1:1, centrés sur Nicholas et l'élève.
7. **Logo** (I-02) : SVG nettoyé (`npx svgo`), groupes nommés (`#mark`, `#bubbles`, `#wordmark` ; le logo n'a pas d'eau), variantes bleu sur blanc et blanc sur noir (D35) ; `public/favicon.svg` (avec `prefers-color-scheme`), `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `site.webmanifest`. ~~Concept d'animation E15 : le symbole « expire » une bulle~~ → abandonné à la Gate 3 (D35).
8. **Images Open Graph** : `scripts/make-og.mjs` (sharp : recadrage du hero + logo + accroche rendue avec la police de titre choisie via `fontfile`) → `public/og/og-fr.jpg` et `og-en.jpg`, 1200×630, ≤ 200 Ko.
9. **Planche de gate** : `plans/refonte-la-descente/gates/gate-3/` avec avant/après du hero, options A et B, candidats de l'interlude B, recadrages, logo et favicons (JPEG ≤ 200 Ko chacun).
10. **Auto-critique** : `design:design-critique` sur la planche ; vérifier la cohérence de l'étalonnage (blancs neutres, rouges réduits pour les images profondes).
11. 🛑 **Gate 3** : Nicholas choisit le hero (A ou B), valide les retouches (I-15), le candidat de l'interlude B, les recadrages et le logo. Consigner dans `PROGRESS.md` et `CREDITS.md`, puis supprimer les candidats non retenus.

## Vérifications

```bash
node scripts/make-water-mask.mjs && node scripts/make-og.mjs
npm run build          # astro:assets traite toutes les images sans erreur
du -sh src/assets/images public/og
```

## Critères de sortie

- Gate 3 validée ; `CREDITS.md` complet ; aucun filigrane visible ; seuls les fichiers retenus restent dans le dépôt.
- Masque d'eau aligné sur le hero retenu ; favicons et OG en place.

## Retour arrière

Les originaux restent dans l'historique git ; `git revert` des commits de la session.

## 🔁 Fin de session

Session suivante : **S05** (page statique), si S03 est faite.
