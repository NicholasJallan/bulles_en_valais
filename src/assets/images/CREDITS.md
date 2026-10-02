# Crédits des images

> Tenu à jour à chaque ajout ou retouche (S04, 01.10.2026). Photos : **© Nicholas Jallan**, sauf mention.
> IA : **Gemini 3 Pro Image** (« Nano Banana Pro », `gemini-3-pro-image-preview`) via le MCP `nano-banana`, avec l'accord de Nicholas (I-15). Toute image générée ou retouchée par Gemini porte le filigrane **invisible** SynthID de Google ; aucune ne montre de filigrane visible (vérifié à 100 %). Les originaux HD de Nicholas sont dans `src/assets/original/` (ignoré par git) ; les anciens fichiers restent dans l'historique git.
> Politique (`01-direction-artistique.md` §8, `00-contexte.md` §9) : un visuel **généré** par IA porte la légende « Visuel généré par IA » et figure dans les crédits du pied de page ; une **retouche de nettoyage** d'une vraie photo n'est pas un visuel généré.

| Fichier | Source | Auteur / outil | Traitement |
|---|---|---|---|
| `hero/rosel.jpg` (4080×3072) | `original/rosel_2.jpg` (lac du Rosel, Martigny ; original de l'ancien `rosel-2400.jpg`) | Nicholas Jallan ; retouche Gemini | **Retouche de nettoyage** (Gate 3, D32) : **seuls les fils électriques** sont retirés ; l'éolienne, le pylône, le panneau « Western City », les toboggans et leurs reflets restent. Méthode : 4 tuiles du ciel et des montagnes retouchées à quasi pleine résolution (×1,23), recalées automatiquement, calées en couleur sur l'original et fondues ; l'eau, la rive et le premier plan restent les pixels d'origine. Contrôle avant/après : `plans/refonte-la-descente/gates/gate-3/11-hero-retenu.jpg` |
| `places/sion.jpg` (1600×2000) | `original/sion_les_iles_1.jpg` | Nicholas Jallan | Recadrage 4:5 (x 1750, largeur 2390) |
| `places/rosel.jpg` (1600×2000) | `original/rosel_3.jpg` | Nicholas Jallan ; retouche Gemini | Recadrage 4:5 (x 1780, y 197, 2300×2875) ; **retouche de nettoyage** (D32) : seules les lignes électriques le long de la rive sont retirées, les pylônes restent (une tuile 1600×900, fondue sur la rive seulement) |
| `places/leman.jpg` (1600×2000) | `original/leman_chateau_chillon.jpg` (château de Chillon) | Nicholas Jallan | Recadrage 4:5 (x 300, largeur 2458) |
| `instructor/nicholas-4x5.jpg` (1794×2243) | ancien `nicholas.jpg` (Nicholas et une élève en surface) | Nicholas Jallan | Recadrage 4:5 (desktop), x 224 |
| `instructor/nicholas-1x1.jpg` (2019×2019) | ancien `nicholas.jpg` | Nicholas Jallan | Recadrage 1:1 resserré (mobile), x 112, y 224 |
| `interludes/descent-16x9.jpg` (1707×960) | ancien `bde.jpg` (plongeur et requins-marteaux) | Nicholas Jallan | Interlude A, desktop : recadrage 16:9 (y 100), **signature « © Nicholas Jallan » hors cadre** ; crédit en légende |
| `interludes/descent-4x5.jpg` (952×1190) | ancien `bde.jpg` | Nicholas Jallan | Interlude A, mobile : recadrage 4:5 (x 700), signature hors cadre |
| `interludes/light.jpg` (2752×1536) | ancien `hirondelle.png` (1365×768) | Gemini | Interlude B (Gate 3, D33). **L'épave de l'Hirondelle, dans le Léman** : d'après Nicholas (02.10.2026, S12, D50), une photo **de Nicholas** (il y figure, à gauche), nettoyée, et non un visuel généré ; légende « L'Hirondelle, dans le Léman · Photo © Nicholas Jallan », plus de mention IA. Retouche : filigrane ✦ retiré par Gemini (« remove only the small four-pointed star watermark… »), agrandi ×2 (Lanczos + accentuation légère) |
| `prepare/gears.jpg` (800×800) | ancien `gears.jpg` (matériel sur un bateau) | Nicholas Jallan | Déplacé, inchangé |
| `../brand/LogoFull.png` (1825×2256) | logo de Bulles en Valais | Nicholas Jallan | Source du logo, inchangée |
| `../brand/logo.svg` | `LogoFull.png` | potrace 1.16 + svgo 4.1 (`scripts/trace-logo.mjs`) | **Vectorisation** du trait bleu nuit (les aplats blancs deviennent transparents), groupes `#mark`, `#bubbles` (14 bulles, un tracé chacune), `#wordmark` ; en attendant le fichier .ai (I-02). Toujours **bleu sur blanc ou blanc sur noir**, jamais animé (D35) |
| `../textures/water-mask.png` (512×386) | `hero/rosel.jpg` | `scripts/make-water-mask.mjs` | Masque d'eau d'E1 : polygone de la rive réglé à la main, rocher émergé exclu, bord flouté |
| `public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | `#mark` de `logo.svg` | `scripts/make-icons.mjs` | Symbole seul ; favicon bleu nuit, blanc en mode sombre, `favicon.ico` 32 px de secours ; icônes bleu nuit sur blanc (D35) |
| `public/og/og-fr.jpg`, `og-en.jpg` (1200×630) | `hero/rosel.jpg`, `logo.svg`, titre du hero | `scripts/make-og.mjs` | Recadrage du hero, logo écume, titre en Instrument Serif (OFL 1.1, `scripts/fonts/`) tracé en chemins |
