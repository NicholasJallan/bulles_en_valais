# Suivi — Refonte « La Descente »

> Mis à jour à la fin de **chaque** session (protocole : `README.md`). Les décisions et mutations consignées ici **priment** sur les specs.

## État des sessions

- [x] **S00** — Correctif sécurité du formulaire (site actuel, `main`) — 30.09.2026
- [x] **S01** — Fondations Astro 7 (branche `refonte/la-descente`) — 01.10.2026
- [x] **S02** — Design system & styleguide — 01.10.2026 (Gate 1 validée)
- [x] **S03** — Contenus & i18n typés FR/EN — 01.10.2026 (Gate 2 validée)
- [x] **S04** — Visuels : retouches, IA, logo, favicons, OG — 01.10.2026 (Gate 3 validée)
- [x] **S05** — Page statique complète — 01.10.2026
- [x] **S06** — Moteur de mouvement — 02.10.2026
- [x] **S07** — Hero « Surface » en WebGL + immersion — 02.10.2026
- [x] **S08** — Cursus, échelle de profondeur, interludes, bulles — 02.10.2026
- [x] **S09** — Spécialités (lampe torche) & Lieux (parcours du Rhône) — 02.10.2026
- [ ] **S10** — Remontée : Préparer, Bons cadeaux, Témoignages, Palier FAQ, Contact, WhatsApp
- [x] **S11** — Consentement, analytics, SEO, CSP — 02.10.2026 (en parallèle de S06)
- [ ] **S12** — Préproduction & recette — 🛑 Gate 4
- [ ] **S13** — Mise en production, suivi, nettoyage

## Gates

| Gate | Objet | Statut | Date | Décision |
|---|---|---|---|---|
| 1 | Palette, typographie, sensation du mouvement (styleguide) | ✅ | 2026-10-01 | Appariement **B** (Instrument Serif + Switzer) ; palette gardée, lagon moins « bleu clair » et descente moins verte ; tempo normal ; HUD en Switzer tabulaire (D25). Jugée sur `https://dive.bullesenvalais.ch/styleguide/` (D31) |
| 2 | Textes FR/EN (`CONTENT-REVIEW.md`) | ✅ | 2026-10-01 | Tout accepté, questions posées dans la session ; TDI Deco à CHF 250, témoignages traduits, fiche Google, « le Léman », deux « Alexandre F. » séparés, confidentialité sans rubrique États-Unis ni délai de réponse |
| 3 | Visuels (hero, retouches, IA, logo animé) | ✅ | 2026-10-01 | Hero A (Rosel) avec **seuls les fils électriques retirés** ; interlude B : image actuelle sans filigrane ; recadrages, lieux, masque d'eau et images de partage acceptés ; logo bleu sur blanc ou blanc sur noir, **jamais animé** (D32–D35). Jugée sur les planches envoyées dans la session |
| 4 | Recette complète en préproduction | ⬜ | | |

## Décisions

| Date | Réf. | Décision | Source |
|---|---|---|---|
| 2026-09-30 | D1 | Faille `api/contact.php` corrigée en S00, avant la refonte | Nicholas (cadrage) |
| 2026-09-30 | D2 | Direction artistique « La Descente » | Nicholas (cadrage) |
| 2026-09-30 | D3 | One-page enrichi (+ pages légales et 404) | Nicholas (cadrage) |
| 2026-09-30 | D4 | Astro 7 + TypeScript + GSAP + Lenis (+ OGL), build statique | Nicholas (cadrage) |
| 2026-09-30 | D5 | Visuels IA acceptés (ambiances, non trompeurs) ; logo vectoriel fourni ; pas de photo ni vidéo sous-marine | Nicholas (cadrage) |
| 2026-09-30 | D6 | Ajout d'un bloc Bons cadeaux (seul nouveau contenu fonctionnel) | Nicholas (cadrage) |
| 2026-09-30 | D7 | FR + EN, architecture prête pour DE | Nicholas (cadrage) |
| 2026-09-30 | D8 | Bandeau + Consent Mode v2, GA4 réparé, pages légales | Nicholas (cadrage) |
| 2026-09-30 | D9 | Changements de contenu validés (SDI/TDI d'abord, FFESSM E4, PTH120, nouvelle grille) ; **TDI Nitrox avancé et Decompression Procedures à CHF 250** dans le Cursus comme dans les Spécialités | Nicholas (S00) |
| 2026-09-30 | D10 | nginx `dive` : limite de débit du formulaire, **seul `contact.php` exécute du PHP**, tout autre `.php` et tout autre chemin sous `/api/` → 404 | Nicholas (S00) |
| 2026-09-30 | D11 | Plafond quotidien d'envois (quota Gmail) traité en **S10** | Nicholas (S00) |
| 2026-09-30 | D12 | Téléphone en **texte libre** (≤ 40 caractères, sans caractère de contrôle) au lieu du motif `^[0-9 +().\-]{0,40}$` : il ne va que dans le corps en base64, et le motif refusait `079/436 81 12` ou `(soir)` | S00 (revue de code) |
| 2026-09-30 | D13 | `elapsed` **absent** accepté tant que des pages chargées avant S00 peuvent envoyer ; rendu obligatoire en S10 | S00 (revue de code) |
| 2026-09-30 | D14 | E-mail : partie locale **sans guillemets** et sans `=?` (`FILTER_VALIDATE_EMAIL` laisse passer `"a\␊b"@x.ch`) | S00 (sécurité) |
| 2026-09-30 | D15 | Push de `main` (dont `plans/`) sur GitHub autorisé, le correctif étant en production | Nicholas (S00) |
| 2026-10-01 | D16 | **TypeScript 6** (`^6`) et non 7 : `@astrojs/check` 0.9.10 n'accepte que TypeScript 5 ou 6 (npm installait 7.0.2). À revoir quand il prendra TypeScript 7 en charge | S01 (constat) |
| 2026-10-01 | D17 | **Aucun inline dans `dist/`** : `vite.build.assetsInlineLimit: 0` (Astro inlinait le module `app.ts` ; une police en `data:` serait bloquée par `font-src 'self'`) ; `check:dist`, enchaîné par `npm run build` (un `postbuild` sauterait avec `--ignore-scripts`), refuse les scripts inline (JSON-LD excepté), les gestionnaires `on*`, les URL `javascript:`, les scripts et feuilles de style d'une autre origine, les fichiers cachés (hors `.well-known/`), clés, certificats et `settings.json`, et tout fichier sous `api/` ou en PHP autre que `api/contact.php`, qui doit être présent | S01 (constat, revues de code) |
| 2026-10-01 | D18 | Serveur de dev : `vite.server.fs.deny` = défauts de Vite + `mail-config.php` et `settings.json` (il servait `/api/mail-config.php` en 200). Jamais `astro dev --host` ; sur le réseau local, seulement `astro preview --host` (sert `dist/`) | S01 (constat) |
| 2026-10-01 | D19 | Budgets : JS initial = scripts et préchargements référencés par la page **plus leurs imports statiques** (es-module-lexer) ; JS total = tous les `.js` de `dist/` ; CSS par page (feuilles liées + `<style>`) ; gzip niveau 6, 1 Ko = 1 024 octets | S01 |
| 2026-10-01 | D20 | `is:inline` permis sur un `<script src>` vers un fichier de `public/` (`boot.js`) : ce n'est pas du code inline. L'interdit du §9 vise le code JavaScript inline (JSON-LD excepté) | S01 |
| 2026-10-01 | D21 | **Pas de validation Firefox tant qu'elle ne fonctionne pas** : le Firefox de Playwright ne démarre pas sur macOS 27.0.1, donc le projet `firefox` est retiré des tests E2E (à rétablir si une mise à jour de Playwright le corrige) ; la recette manuelle ne teste Firefox que s'il fonctionne | Nicholas (après S01) |
| 2026-10-01 | D22 | FFESSM N1 à N4 : prix affichés partout (CHF 390 / 490 / 690 / 990), plus de « Sur demande » dans le Cursus ; N5, PTH70 et PTH120 sur demande | Nicholas (I-10 a) |
| 2026-10-01 | D23 | TDI : Nitrox et Nitrox avancé à **CHF 290**, Decompression Procedures à **CHF 250** (le Nitrox avancé était à 250 depuis D9) ; FFESSM N1 aux prérogatives officielles (encadré à 20 m) | Nicholas (I-10 b, c ; Gate 2) |
| 2026-10-01 | D24 | Échelle de profondeur : baptême à **6 m** ; **PTH70** ajouté (sur demande, onglet FFESSM, 70 m), nécessaire avant la formation PTH120 | Nicholas (I-04) |
| 2026-10-01 | D25 | **Gate 1** : appariement **B** (Instrument Serif + Switzer), chiffres du HUD en Switzer tabulaire (aucun mono), tempo normal ; palette gardée avec un lagon moins « bleu clair » et une descente moins verte | Nicholas (Gate 1) |
| 2026-10-01 | D26 | Polices Fontshare (Switzer) servies telles que livrées et jamais committées : l'ITF Free Font License 2.0 interdit sous-ensemble, conversion de format et diffusion par un dépôt | S02 (licence) |
| 2026-10-01 | D27 | Pages légales : nom, IDE CHE-249.028.561, e-mail et téléphone, **sans adresse postale** ; messages conservés selon leur utilité ; ni rubrique sur les transferts vers les États-Unis, ni délai de réponse | Nicholas (I-08, Gate 2) |
| 2026-10-01 | D28 | « Bons cadeaux » hors du menu principal (5 liens + « Me contacter »), accessible par le profil de plongée du HUD et le pied de page | S03 (choix délégué par Nicholas) |
| 2026-10-01 | D29 | Témoignages : avis Google, traduits sur la page EN avec « Translated from French » ; les deux « Alexandre F. » (deux personnes) jamais côte à côte ; « Laisser un avis Google » mène à la fiche Google ; pas de page Facebook pour l'instant | Nicholas (I-09, I-14, Gate 2) |
| 2026-10-01 | D30 | Revues de code à **effort modéré** (une passe, modèle plus léger) pour économiser les tokens | Nicholas |
| 2026-10-01 | D31 | **Prévisualisation sur le Pi** quand Nicholas est à distance : `_astro/`, `js/` et `styleguide/` ajoutés au docroot du site en ligne (`noindex`, liés nulle part), sans toucher à `index.html` ; essai à blanc, `rsync -rlt --omit-dir-times`, `--delete` limité à ces dossiers, `chown` de ces seuls dossiers (procédure dans `CLAUDE.md`) | Nicholas (Gate 1) |
| 2026-10-01 | D32 | Retouches des vraies photos : **seuls les fils électriques** sont retirés (éolienne, panneau « Western City », toboggans, pylônes et mâts gardés), au hero (option A, Rosel) comme sur la photo des lieux du Rosel ; option B (Sion) écartée | Nicholas (Gate 3, I-15) |
| 2026-10-01 | D33 | Interlude B : **image actuelle** (`hirondelle.png`) avec le seul filigrane ✦ retiré, agrandie ×2 (`interludes/light.jpg`) ; les deux nouvelles générations écartées | Nicholas (Gate 3) |
| 2026-10-01 | D34 | Interlude A : recadrages 16:9 et 4:5 **sans la signature**, crédit « © Nicholas Jallan » en légende ; version actuelle de 1707 px gardée (pas d'original plus grand pour l'instant) | Nicholas (Gate 3) |
| 2026-10-01 | D35 | Logo : **bleu nuit sur blanc ou blanc sur noir** uniquement (aucune variante multicolore ; icônes bleu sur blanc) et **jamais animé** : E15 sans le logo, E7 jamais sur le logo | Nicholas (Gate 3) |
| 2026-10-02 | D36 | I-06 et I-07 non fournis : Consent Mode **avancé**, conversions Ads désactivées (libellés `null`), GA4 non configuré en double (`GA4_ID = null`) en attendant l'assistant de balises | repli du brief S11 |
| 2026-10-02 | D37 | Sur ordinateur, la grille (`.wrap`) garde un couloir de chaque côté pour le HUD (`--hud-inline-size`) : le profondimètre ne recouvre jamais le contenu | S06 (constat sur les captures) |
| 2026-10-02 | D38 | Risques acceptés de la CSP finale (revue S11) : `www.google.com` en `script-src` (exigé par le guide Google pour Ads) et jokers `*.google.*` en `img-src` / `connect-src` ; à resserrer en S13 d'après les requêtes réellement vues en production | S11 (revue de sécurité) |
| 2026-10-02 | D39 | I-07 : Consent Mode **avancé** confirmé (`MODE = 'advanced'` dans `consent-default.js`, phrase sur les signaux sans cookie gardée dans Confidentialité) ; le MEDIUM de la revue S11 est donc un choix assumé | Nicholas (après S11) |
| 2026-10-02 | D40 | I-06 : identifiants `AW-10798308119` et `G-QG5ZCVY1Z7` confirmés ; **aucune campagne payante**, simple suivi de l'activité ; GA4 est déjà une destination de la balise (lu dans le `gtag.js` public), donc `GA4_ID` reste `null` ; conversions Ads, événements clés GA4 et resserrement de la CSP sortis du chemin critique vers le plan dédié `plans/mesure-google/`, à lancer après S13 | Nicholas (après S11) |
| 2026-10-02 | D41 | **Élément LCP = texte du hero**, pas sa photo : Chromium exclut du LCP une image qui couvre tout le viewport (heuristique « fond » ; à 80 % de hauteur, la photo redevient LCP). Critère retenu : le LCP est dans le hero, peint avec la première image (accroche sous le mouvement, titre `h1` sous mouvement réduit), jamais après le module de mouvement ni le WebGL ; la photo reste `eager` + `fetchpriority="high"` et n'est jamais masquée | S07 (constat) |
| 2026-10-02 | D42 | **Prévisualisation sur le Pi à chaque session** qui change ce qu'on voit : `npm run preview:pi` (essai à blanc) puis `-- --apply` publie toutes les pages de `dist/` sous `/preview/` (liens internes réécrits, `noindex, nofollow`, balise Google neutralisée) avec `_astro/`, `js/` et `styleguide/`, sans toucher à `index.html`, `en/` ni `api/` du site en ligne ; **autorisation permanente** pour cette seule commande ; URL données à Nicholas à la fin de la session. Retirée en S13 | Nicholas (après S09) |

## Mutations du plan

| Date | Session | Type | Changement | Raison |
|---|---|---|---|---|
| 2026-09-30 | S00 | corriger | Journal d'accès : `/var/log/nginx/dive.access_log` (et non `access.log`) ; `dive.*_log` ne sont pas couverts par logrotate | constat sur le Pi |
| 2026-09-30 | S00 | ajouter | Contrainte **PHP-FPM 7.4** : `00-contexte` §2, `02-architecture` §11, S10, `CLAUDE.md` ; script `tests/php/run_unit_php74.sh` (tests unitaires sous 7.4, code transmis par ssh sans rien écrire sur le Pi) | FPM 7.4 en production, `str_starts_with` y avait déjà planté |
| 2026-09-30 | S00 | étendre | nginx : en plus de la limite de débit, PHP réservé à `contact.php` et `^~ /api/` → 404 ; `02-architecture` §14 et §16, S11 et S13 mis à jour | revue de sécurité, accord de Nicholas (D10) |
| 2026-09-30 | S00 | étendre | Durcissements issus des revues : données en clair après STARTTLS refusées, réponses SMTP multi-lignes validées, `starttls => false` seulement vers la boucle locale, rejets journalisés avec leur motif, origines des autres noms `dive.*`, erreurs par champ côté client, repli `mailto:` protégé, succès annoncé (`role="status"`, focus) | revues de code et de sécurité |
| 2026-09-30 | S00 | ajouter | S10 : plafond quotidien d'envois, `elapsed` obligatoire, délai global SMTP (optionnel) | D11, D13, revue de sécurité |
| 2026-09-30 | S00 | ajouter | `tests/php/smtp_log.py` : lecture déterministe du journal du faux serveur SMTP (sans attente arbitraire) | tests d'intégration |
| 2026-09-30 | S00 | modifier | Commit de contenu en `feat(content):` au lieu de `content:` (types conventionnels de Nicholas) | convention |
| 2026-09-30 | S00 | corriger | `CLAUDE.md` : serveur local lié à `127.0.0.1` ; `rsync` du projet entier avec essai à blanc et exclusions (`settings.json`, `.env`, `tests/`, `plans/`, `api/mail-config.php`, docs) | revues |
| 2026-10-01 | S01 | corriger | Tâche 3 : `git mv api/contact.php public/api/` (fichier seul) au lieu de `git mv api public/api` ; brief S01 mis à jour | le dossier contient le secret local `api/mail-config.php` (gitignoré), que le renommage du dossier aurait fait passer dans `public/` puis dans `dist/` |
| 2026-10-01 | S01 | corriger | Playwright : `webServer` en `npm run preview -- --port 4321 --ignore-lock` et `reuseExistingServer: false` ; `02-architecture` §15 et §17, brief S01 mis à jour | sous un agent (paquet `am-i-vibing`), Astro 7 détache `astro dev` / `astro preview` en arrière-plan avec un fichier verrou : Playwright voyait « exited early », puis réutilisait le serveur orphelin, donc un build périmé |
| 2026-10-01 | S01 | ajouter | `astro.config.mjs` : `vite.build.assetsInlineLimit: 0` et `vite.server.fs.deny` ; `scripts/check-dist.mjs` enchaîné par `npm run build` ; `es-module-lexer` en dépendance de développement ; `02-architecture` §1, §2, §3, §15 et `00-contexte` §3, §8, §9 mis à jour | D16 à D20, revue de code |
| 2026-10-01 | S01 | constater | Le Firefox de Playwright 1.63 (Firefox 155, build 1543) ne démarre pas sur macOS 27.0.1 (« Could not find profile folder », même lancé seul et hors bac à sable) ; chromium, webkit, mobile-chrome et mobile-safari passent. Signalé dans `00-contexte` §3 et `CLAUDE.md` | environnement, pas le projet |
| 2026-10-01 | S01 | retirer | Projet Playwright `firefox` retiré (gardé en commentaire) ; Firefox ne figure plus dans les tests E2E de `02-architecture` §15 ni de S12, et la Definition of Done (`README.md`) et la recette manuelle de S12 ne le valident que s'il fonctionne | D21 |
| 2026-10-01 | S01 | ajouter | Logo PNG haute définition de Nicholas committé dans `src/assets/brand/LogoFull.png` ; `INPUTS-NICHOLAS` I-02 mis à jour (le SVG reste attendu pour S04) | demande de Nicholas |
| 2026-10-01 | S02 | corriger | Tâche 7 : captures faites par un script Playwright autonome (chromium, preview sur le port 4322) au lieu du MCP `chrome-devtools`, absent de la session | environnement |
| 2026-10-01 | S02 | ajouter | Textes du styleguide hors de `src/i18n/` (seul `hero.title` vient du dictionnaire) : contenus de démonstration repris de `legacy/components/i18n.jsx` dans `samples.ts`, textes de documentation dans `palette-data.ts` (tons, groupes, rôles), `water-column.ts` (notes des paliers) et dans les tableaux et le balisage des `.astro` de `src/components/styleguide/` et de `src/pages/styleguide.astro`. Exception à « textes visibles dans `src/i18n/` » : page noindex, en français seulement, supprimée en S13 ; S03 réécrivait les dictionnaires en parallèle | sessions S02 ∥ S03 ; précisé après la revue de code |
| 2026-10-01 | S02 | modifier | Variables CSS des polices **par famille** (`--font-fraunces`, `--font-switzer`, `--font-instrument-serif`, `--font-zodiak`, `--font-general-sans`, `--font-jetbrains-mono`, `--font-geist-mono`) et non par appariement (`--font-a-display`…) : Switzer sert à A et à B. Les rôles `--font-display`, `--font-sans` et `--font-hud` de `tokens.css` pointent vers elles ; renommage final à la tâche 10 | doublon de téléchargement évité |
| 2026-10-01 | S02 | modifier | Fraunces : axe optique (72), `SOFT` et `WONK` figés par style (romain 50/0, italique 100/1), graisse variable 100–900 : **37 + 43 Ko** au lieu de 118 + 146 Ko avec les cinq axes. L'animation ponctuelle de `SOFT` (DA §5) n'est plus possible ; celle de `wght` reste | budget polices (`00-contexte` §7) |
| 2026-10-01 | S02 | modifier | Palette ajustée pour passer les tests (à reporter dans `01-direction-artistique.md` §4 à la tâche 10) : émeraude 42 → **37 %** (0,056 200) ; rouge-lampe dédoublé : **allumé** `oklch(68% 0.19 33)` sur les tons sombres, **de jour** `oklch(51% 0.19 31)` sur les tons clairs, **pâle** `oklch(82% 0.1 40)` pour les liens sur émeraude ; `lagoon-ink` chroma 0,08 → 0,075 (hors sRGB) ; ajouts : panneaux par ton (`*-raised`, Léman pour l'émeraude), ambre d'alerte (`alert`, `alert-deep`), lumière décorative en cinq paliers (`deco-surface` → `deco-abyss`) | contrastes : sur la palette d'origine, rouge sur lagon 2,54:1 et sur émeraude 2,44:1, `foam-soft` sur émeraude 4,43:1 |
| 2026-10-01 | S02 | ajouter | Rôles testés `--bg-panel`, `--action-ink`, `--action-text`, `--alert` (13 couples par ton) ; rôles dérivés `--line`, `--line-faint`, `--glow`, `--focus-halo` ; tokens de mouvement `--dur-rise` (1,1 s) et `--stagger-line` (80 ms) d'E5 ; `--accent-deco` réservé aux textes de 24 px et plus (seuil 3:1) | composants, E5 |
| 2026-10-01 | S02 | ajouter | Polices Fontshare (Switzer, Zodiak, General Sans) servies **telles que livrées** et jamais committées : l'ITF Free Font License 2.0 (17.08.2026) autorise l'auto-hébergement mais interdit le sous-ensemble, la conversion de format et la diffusion par un dépôt (le cache de la Fonts API est dans `node_modules/.astro/` et `.astro/`, ignorés par git). Seuls les monos Google (OFL) sont en sous-ensemble | licence ; à promouvoir en décision à la fusion |
| 2026-10-01 | S02 | ajouter | `BaseLayout` : `route` facultatif (pas de canonical ni de hreflang hors des routes) mais alors `noindex` obligatoire (union de types), slot `head` ; `app.ts` enregistre `styleguide-switch` et `styleguide-motion`, à retirer en S13 avec le styleguide | styleguide ; union après la revue de code |
| 2026-10-01 | S02 | corriger | Brief S02, tâche 9 : l'URL LAN de la gate passe par `npm run build && npm run preview -- --host` (avec l'accord de Nicholas) au lieu de `npm run dev -- --host` | D18 (le serveur de dev sert tous les fichiers du projet) ; revue de code |
| 2026-10-01 | S02 | remplacer | Tâche 9 : Gate 1 jugée sur `https://dive.bullesenvalais.ch/styleguide/`, publiée sur le Pi (D31), et non par l'URL LAN ; brief S02 mis à jour | Nicholas à distance |
| 2026-10-01 | S02 | appliquer | Tâche 10 : Instrument Serif + Switzer seulement (4 fichiers servis, 3 préchargés, 72 Ko) ; variables de famille gardées, `--font-display` pointe vers `--font-instrument-serif` ; sélecteurs d'appariement et de police du HUD retirés ; `01-direction-artistique.md` §2 (températures I-05), §4 (palette finale), §5 (typographie), §7 (E9) et §9 mis à jour | D25 |
| 2026-10-01 | S02 ∥ S03 | fusionner | S02 menée dans un worktree sous `.claude/worktrees/`, fusionnée par `d48b427` ; les échantillons du styleguide lisent les dictionnaires et les données : l'exception « textes hors de `src/i18n/` » ne couvre plus que les textes de documentation du styleguide | parallélisation |
| 2026-10-01 | S03 | ajouter | `src/i18n/dictionary.ts`, `src/i18n/legal/`, `src/lib/typography.ts` (typographie au rendu), `src/test/content-checks.ts`, `src/data/sections.ts` et `src/data/gifts.ts` ; `02-architecture` §2 à §5, `00-contexte` §6 et `CLAUDE.md` mis à jour | structure des textes et des données |
| 2026-10-01 | S03 | modifier | Cours : un seul catalogue (spécialités comprises), `meta` facultatif, champ `cursus`, `formInterest` typé ; « Sur devis » → « Sur demande » ; sur-titres : libellé dans le dictionnaire, profondeur dans `sections.ts` | un prix par cours ; `Eyebrow` de S02 |
| 2026-10-01 | S03 | réduire | `places.ts` : profondeur max des lacs et sites du Léman seulement ; températures, visibilité, accès, niveau et saison abandonnés | I-03 : non fournis, aucun fait inventé |
| 2026-10-01 | S03 | modifier | Gate 2 présentée dans la session (questions numérotées) et non par la lecture de `CONTENT-REVIEW.md` | Nicholas à distance |
| 2026-10-01 | S02, S03 | modifier | Revue complète pour S02 (Opus), revue à effort modéré pour S03 (Sonnet, une passe) | D30 |
| 2026-10-01 | S04 | modifier | Logo : vectorisé depuis `LogoFull.png` (potrace + svgo, `scripts/trace-logo.mjs`) faute de .ai ; groupes `#mark`, `#bubbles` (un tracé par bulle), `#wordmark` au lieu de `#mark`, `#water`, `#bubbles` (le logo n'a pas d'eau) ; `logo.svg` en `currentColor` | I-02 : PNG seul |
| 2026-10-01 | S04 | modifier | Retouches par **tuiles** (sortie du modèle limitée à ≈ 1 Mpx) recalées et fondues sur l'original pour garder 4080 px ; outils jetables hors dépôt, méthode dans `CREDITS.md` | résolution du hero |
| 2026-10-01 | S04 | ajouter | `scripts/make-icons.mjs` (favicons, `favicon.ico` de secours) ; `scripts/fonts/` (Instrument Serif, OFL, pour les images OG) ; `opentype.js`, `sharp` et `svgo` en dépendances de développement ; liens des icônes et du manifeste dans `BaseLayout` | revue de code ; Pango ignore les polices fournies sur macOS |
| 2026-10-01 | S04 | remplacer | Gate 3 jugée sur des planches envoyées dans la session (`gates/gate-3/`), sans prévisualisation sur le Pi | Nicholas à distance, contenu purement visuel |
| 2026-10-01 | S04 | abandonner | Animation du logo (E15 « le logo expire une bulle », bulles E7 au survol du logo) ; `01-direction-artistique.md` §7, briefs S04 et S07 mis à jour | D35 |
| 2026-10-01 | S05 | reporter | Envoi du formulaire **sans JavaScript** : `contact.php` n'accepte que du JSON, donc sans JS le formulaire affiche un avis (`contact.form.noScript`, FR/EN) et renvoie vers WhatsApp, le téléphone et l'e-mail ; l'éventuel chemin `x-www-form-urlencoded` (sans `elapsed`, donc pot de miel seul) est à trancher avec Nicholas en S10 ; brief S10 mis à jour | modifier le PHP relève de S10 (revue de sécurité) |
| 2026-10-01 | S05 | ajouter | `src/lib/depth/ladder-scale.ts` et `src/lib/geo.ts` dès S05 (TDD) pour l'échelle et la carte statiques ; S08 et S09 les reprennent | échelle graduée et carte du Rhône statiques |
| 2026-10-01 | S05 | modifier | Onglets communs `ui/TabList.astro` + `ui/tabs.ts` (au lieu de `courses/tabs.ts`), partagés par Cursus et Spécialités ; `ui/Section.astro` (ancre, ton, profondeurs du HUD, attributs de portée transmis) et `ui/ArtPicture.astro` (direction artistique : `<Picture>` ne sert qu'un recadrage) | composants partagés |
| 2026-10-01 | S05 | ajouter | `app.ts` pose `html[data-controllers="ready"]` quand les contrôleurs ont démarré (tests E2E, et S06) et retire `html.js` si l'un d'eux échoue (retour à la page sans JS) ; bouton d'envoi désactivé jusqu'au démarrage de `contact-form.ts` | un clic avant le contrôleur postait le formulaire en natif ; revue de code |
| 2026-10-01 | S05 | modifier | Bandeau de navigation posé sur le hero (`position: absolute`), non collant ; S06 décidera du comportement au défilement (ScrollTrigger) | aucun écouteur `scroll` en S05 |
| 2026-10-01 | S05 | corriger | Lighthouse lancé par `npx lighthouse@12` avec le Chromium de Playwright (MCP `chrome-devtools` absent de la session) ; revue de code et revue d'accessibilité fusionnées en une passe modérée (Sonnet, D30), en complément d'axe et de Lighthouse | environnement, économie de tokens demandée par Nicholas |
| 2026-10-02 | S06 ∥ S11 | paralléliser | S11 menée dans un worktree (`.claude/worktrees/s11`, branche `refonte/s11`) par un agent, fusionnée après S06 ; port Playwright paramétrable (`PW_PORT`) pour lancer deux suites côte à côte | demande de Nicholas |
| 2026-10-02 | S06 | déplacer | Colle DOM/GSAP du mouvement dans `src/scripts/motion/` (gsap, reduced-motion, lenis, split, reveal, magnetic, depth, nav, index) et non dans `src/lib/motion/` : elle n'est pas testable sous Vitest (`node`) et ferait tomber le seuil de couverture ; la logique pure reste dans `src/lib/` (`depth/resolve-depth`, `temperature`, `profile`, `ascent`, `motion/magnetic`) ; `02-architecture` §2 et brief S06 mis à jour | couverture ≥ 80 % sur `src/lib` |
| 2026-10-02 | S06 | remplacer | `ImageReveal` : attribut `data-reveal="image"` sur le `<picture>` (prop `reveal` d'`ArtPicture`, `pictureAttributes` de `<Picture>`) au lieu d'un composant enveloppe ; pas de couleur dominante (fond du panneau du ton) | le `clip-path` doit porter sur l'image même |
| 2026-10-02 | S06 | préciser | Colonne d'eau (E4) : les sections gardent leur fond opaque, la colonne fixe n'est visible qu'à travers les thermoclines (6 bandes) ; une couche par ton en `autoAlpha` (les couches à 0 ne sont pas peintes). Sans module de mouvement, la thermocline est un dégradé statique | « aucun texte courant sur un dégradé » |
| 2026-10-02 | S06 | préciser | HUD : contrôleur essentiel (aussi sous mouvement réduit et en Mode calme, suivi par IntersectionObserver, profondeur de début de section), affiné par ScrollTrigger quand le module de mouvement tourne ; sonde qui va du haut de la page à son bas (premières et dernières profondeurs atteintes) ; sections masquées (échelle, comparatif) avec des profondeurs interpolées entre leurs voisines (`HUD_PROFILE`) ; profil de plongée en `popover` natif ; libellé `hud.entry` ajouté (FR/EN) | E3, cas limites du brief |
| 2026-10-02 | S06 | corriger | Tâche 7 : trace de performance par un script Playwright (Chromium, molette, `longtask` + images) au lieu du MCP `chrome-devtools`, absent de la session | environnement |
| 2026-10-02 | S06 | conserver | Mode calme : la bascule existante de S05 (classe + rechargement) suffit ; vérifiée par un test E2E (page complète sans `motion-ok`) | tâche 6 |
| 2026-10-02 | S11 | modifier | CSP finale vérifiée sur le guide Google du 18.09.2026 : hôtes exacts en `script-src`, `*.google.ch` et `*.google.fr`, sans `td.doubleclick.net` ni `*.analytics.google.com` (couvert), `geolocation=()` ; `02-architecture` §14 mis à jour | guide Google à la date de la session |
| 2026-10-02 | S11 | reporter | `report-uri` et `csp-report.php` reportés en S13 (brief S13 mis à jour) | optionnel ; nécessite une `location` nginx et une extension de `check:dist` |
| 2026-10-02 | S11 | ajouter | `consent-default.js` relit `cc_cookie` ; projet Playwright `csp` sur `serve-with-csp.mjs` (2ᵉ `webServer`, port `PW_PORT + 10`) ; alternates du sitemap par `serialize` depuis `routes.ts` (`localePath` déplacé dans `routes.ts`) ; `02-architecture` §12, §13 et §15 mis à jour | revenir sur la page sans attendre la librairie ; tester sous la CSP ; pages légales sans alternates |
| 2026-10-02 | S11 | modifier | Revue de sécurité faite à la fusion (Sonnet, une passe, D30) : l'agent du worktree ne pouvait pas lancer de sous-agent | parallélisation |
| 2026-10-02 | S11 → hors refonte | extraire | Paramétrage Google (GA4, conversions Ads, CSP resserrée) déplacé dans `plans/mesure-google/README.md` (phases A à D, après S13) ; plus de prérequis I-06 pour S12 et S13 | D40 |
| 2026-10-02 | S07 | déplacer | `surface.ts` (colle OGL) dans `src/scripts/webgl/` et non `src/lib/webgl/` ; logique pure testée dans `src/lib/webgl/` (`capability`, `viewport` : cadrage `cover`, DPR, `object-position` ; `ripples` : réserve de 8 ondes, gestes) ; `hero-surface.ts` (chargement après `load` + idle, ondes au pointeur) à côté de `hero.ts` ; `02-architecture` §2 et §9 mis à jour | même règle qu'en S06 (couverture ≥ 80 % sur `src/lib`) |
| 2026-10-02 | S07 | préciser | Le WebGL du hero est chargé par `hero.ts` (démarré par le module de mouvement, dans `whileMotion`), et non directement par `app.ts` : il suit ainsi `gsap.matchMedia` (mouvement réduit demandé en cours de route → tout est défait) | cycle de vie unique |
| 2026-10-02 | S07 | modifier | Uniforms : en plus de ceux de §9, `uCoverScale` / `uCoverOffset` (cadrage identique à l'`<img>`) et `uTint`, `uDeep`, `uLight` (couleurs de `palette.ts`, aucune valeur en dur) ; `uPointer` abandonné (les ondes suffisent) ; `uRipples` passé en tableau JS (OGL ne résout `uRipples[0]` que sur un `Array`) | shader |
| 2026-10-02 | S07 | modifier | Critère « élément LCP = `<img>` du hero » remplacé par D41 ; test E2E : LCP dans `#top` et à moins de 100 ms du FCP ; brief S07 mis à jour | heuristique de Chromium |
| 2026-10-02 | S07 | ajouter | Intro E15 : `motion.css` masque le titre du hero et les chiffres du HUD sous `html.motion-ok` jusqu'à `html[data-intro]` (posé par `hero.ts`, même en cas d'échec ; garde-fou de 3 s de `boot.js` sinon) ; voile du hero allégé de 35 % pendant l'immersion ; rendu plafonné à 60 i/s | E15, lisibilité sous l'eau, écrans 120 Hz |
| 2026-10-02 | S07 | corriger | Tâche 7 : trace par un script Playwright + CDP (Pixel 7, CPU ×4, 150 ms / 9 Mbit/s, cache vide) et Lighthouse 12 local, au lieu du MCP `chrome-devtools`, absent de la session | environnement |
| 2026-10-02 | S07 | ajouter | `tests/visual/` créé (référence du hero sans WebGL, chromium et mobile-chrome) | tâche 8 |
| 2026-10-02 | S08 | déplacer | Moteur de bulles : logique pure `src/lib/bubbles/boyle.ts` + `pool.ts` (réserve, montée, Boyle ; testés), colle canvas dans `src/scripts/bubbles/emitter.ts` et `lamps.ts`, et non `src/lib/bubbles/emitter.ts` ; `02-architecture` §2 et §10 mis à jour | même règle qu'en S06 et S07 (couverture ≥ 80 % sur `src/lib`) |
| 2026-10-02 | S08 | ajouter | Évènements `bv:tabs` (émis par `ui/tabs.ts` au changement d'onglet, animé par `ui/tabs-motion.ts`, aussi pour les onglets des Spécialités) et `bv:bubbles` (gerbe demandée par n'importe quel script, sans effet hors du module de mouvement : succès du formulaire en S10) ; `currentDepth()` dans `hud.ts` (profondeur de départ des bulles) | crochets entre contrôleurs essentiels et module de mouvement |
| 2026-10-02 | S08 | modifier | Onglets : pas de vrai fondu enchaîné, l'ancien panneau disparaît aussitôt (`display: none` de `tabs.ts`) et le nouveau entre (fondu + montée de 16 px, lignes du titre, cascade des tarifs) ; l'indicateur glisse en `clip-path` (et non en `transform` + `scale`, qui déformerait les arrondis) | garder `tabs.ts`, le clavier et l'ARIA intacts, sans saut de hauteur |
| 2026-10-02 | S08 | préciser | Interludes : parallaxe, anneau et traînée de bulles sur pointeur fin seulement ; thermoclines d'entrée et de sortie = bords en dégradé vers le ton des sections voisines (props `from` / `to`), dans tous les modes ; citation révélée par le `data-reveal="lines"` commun | « rien de tout cela sur tactile » du brief ; aucun texte sur le dégradé |
| 2026-10-02 | S08 | préciser | Échelle : seule la scène (règle + marqueur, `[data-ladder-stage]`) est épinglée, l'en-tête défile avant (sinon le titre sortait de l'écran à 768 px de haut) ; 0 → 120 m sur 2,4 écrans pendant un épinglage de 3 écrans ; `refreshPriority: 1` ; HUD masqué par `data-hud="hidden"` (S06), sans appel explicite à `setMode` ; libellé « Remontée · 40 m » sur la thermocline qui suit l'échelle (prop `label` de `Thermocline`) | mise en page à 1024 × 768 ; une source par profondeur (`markerDepth('compare')`) |
| 2026-10-02 | S08 | corriger | Trace de performance par un script Playwright (CDP, molette, `longtask`) au lieu du MCP `chrome-devtools`, absent de la session | environnement |
| 2026-10-02 | S09 | préciser | Lampe : au clavier, elle se pose sur l'onglet focalisé ou sur la **première carte du panneau** focalisé (les cartes de spécialité ne sont pas focalisables : 31 arrêts de tabulation sans action seraient une régression) ; opacité simple gardée (même coût que `mix-blend-mode: screen` à la trace) ; particules redessinées seulement si la section change de taille ; brief S09 mis à jour | accessibilité, trace |
| 2026-10-02 | S09 | ajouter | Lien des coordonnées de chaque lieu vers Google Maps (`mapUrl()`, URL de recherche sans clé ni script, libellé accessible « …, ouvrir dans Google Maps » / « open in Google Maps ») : c'est l'élément focalisable qui permet au clavier d'amener un lieu hors écran dans la fenêtre | brief S09 (« focusin sur une carte hors écran ») ; validé par Nicholas |
| 2026-10-02 | S09 | modifier | Tracé du Rhône sans DrawSVG : `pathLength="1"` + `stroke-dashoffset` réglé par `places.ts` (même effet, aucun plugin à charger) ; part de chaque station le long du fleuve calculée au build (`fractionAlong`, `data-fraction`) ; tracé fantôme sous le tracé dessiné ; `02-architecture` §1, §2, §5, §8 et brief S09 mis à jour | budget, simplicité |
| 2026-10-02 | S09 | préciser | Lieux épinglés : carte fixe à gauche, fenêtre à droite où défilent le panneau d'introduction (en-tête) et les trois lieux, de droite à gauche comme le Rhône vers le lac ; photo des cartes plafonnée selon la hauteur de l'écran ; révélations des photos déclenchées par `containerAnimation` (`data-reveal-defer`, `revealElement()`) ; fenêtre en `overflow: hidden` (axe sait alors que les lieux au-delà sont masqués) avec son défilement propre maintenu à 0 | mise en page à 1024 × 768 ; axe |
| 2026-10-02 | S09 | préciser | Repli « cartes verticales en `scroll-snap` » : rangée horizontale de cartes portrait sous 64 rem (la suivante dépasse), grille de trois au-delà sans mouvement | brief S09 |
| 2026-10-02 | S09 | corriger | Défaut de S06 : les masques de ligne de SplitText faisaient grandir un titre de deux lignes de 0,12 em (marges négatives fusionnées), d'où un CLS de 0,15 sur mobile ; défaut de S08 : un changement d'onglet ne rafraîchissait pas ScrollTrigger (épinglages et profondeurs mesurés pour l'ancienne hauteur) | test CLS, revue de code |
| 2026-10-02 | S09 | corriger | Trace de performance par un script Playwright (molette + pointeur, `longtask`, images) au lieu du MCP `chrome-devtools`, absent de la session | environnement |
| 2026-10-02 | S09 | ajouter | `scripts/preview-pi.mjs` + `scripts/lib/preview-page.mjs` (testé) et `npm run preview:pi` ; protocole de session du `README.md` (étape 7 « Prévisualiser », gates, actions sortantes), briefs S10 (formulaire posté au `contact.php` en ligne), S12 (option B = cette prévisualisation) et S13 (retrait du script), `CLAUDE.md` mis à jour | D42 : Nicholas ne pouvait rien juger, rien n'étant publié |

## Mesures

| Date | Contexte | LCP | CLS | TBT | JS gzip init./total | CSS gzip | Poids initial | LH Perf/A11y/BP/SEO |
|---|---|---|---|---|---|---|---|---|
| 2026-09-30 | **Site actuel** (prod, mobile, CPU ×4, Fast 4G, cache chaud) | 1,8 s (render delay) | 0,00 | n.m. | ~1 Mo+ (React + Babel via unpkg, non mesurable en cross-origin) | inline | ≈ 5 Mo d'images décodées | —/91/73/83 |
| 2026-10-01 | S01 : squelette sans design (`check:budgets` sur `dist/`) | n.m. | n.m. | n.m. | 0,6 / 0,6 Ko | 0,7 Ko | n.m. | n.m. |
| 2026-10-01 | S02 : tokens, polices, styleguide (`check:budgets`) | n.m. | n.m. | n.m. | 1,3 / 36,4 Ko (GSAP des démos, styleguide seulement) | 3,2 Ko (accueil) · 9,3 Ko (styleguide) | polices préchargées : 122 Ko, 3 fichiers (paire A) | n.m. |
| 2026-10-01 | S02 + S03 fusionnées, après la Gate 1 (`check:budgets`) | n.m. | n.m. | n.m. | 1,3 / 36,4 Ko | 3,2 Ko (accueil) · 7,5 Ko (styleguide) | polices préchargées : 72 Ko, 3 fichiers (paire B) | n.m. |
| 2026-10-01 | S05 : page statique, Lighthouse mobile **local** (simulé, `astro preview`) | 2,2 s | 0 | 0 ms | 1,5 / 41,7 Ko | 11,2 Ko (accueil) | 249 Ko (`/`) ; hero AVIF 75 Ko (960 px), 118–168 Ko (1600–1920 px) | 99/100/100/100 (FR et EN) |
| 2026-10-02 | S06 seule (`check:budgets`) ; scroll à la molette, Chromium 1440 px, CPU ×1 et ×4 : 0 tâche longue, images p50/p95 16,7 ms ; CLS chargement + scroll complet < 0,05 (test E2E) | n.m. | < 0,05 | n.m. | 1,7 / 70,1 Ko | 12,9 Ko (accueil) | n.m. | n.m. |
| 2026-10-02 | S11 seule (`check:budgets`) | n.m. | n.m. | n.m. | 3,0 / 53,9 Ko | 11,3 Ko (accueil) | n.m. | n.m. |
| 2026-10-02 | S06 + S11 fusionnées (`check:budgets`) | n.m. | n.m. | n.m. | 3,2 / 82,0 Ko | 12,9 Ko (accueil) | n.m. | n.m. |
| 2026-10-02 | S07 (`check:budgets`) ; trace mobile Playwright + CDP (Pixel 7, CPU ×4, 150 ms / 9 Mbit/s, cache vide, 3 passes) ; Lighthouse 12 local (simulé) : S07 94, base S06 95 dans les mêmes conditions | FCP = LCP ≈ 0,6 s (trace) ; 2,9 s (Lighthouse, S06 : 2,8 s) | 0 | ≈ 120 ms (trace) ; 0 ms (Lighthouse) | 3,2 / 102,9 Ko (WebGL : 18,7 Ko, chargé vers 1,1 s, après le LCP) | 13,1 Ko (accueil) | n.m. | 94/100/100/100 |
| 2026-10-02 | S08 (`check:budgets`) ; traversée de l'échelle épinglée à la molette, Chromium 1440 px : 0 tâche longue, images p50/p95 16,7 ms (CPU ×1 et ×4) | n.m. | n.m. | 0 tâche longue | 3,2 / 106,2 Ko | 14,1 Ko (accueil) | n.m. | n.m. |
| 2026-10-02 | S09 (`check:budgets`) ; traversée des Spécialités et des Lieux à la molette avec le pointeur en mouvement, Chromium 1440 px : 0 tâche longue, images p50/p95 16,7 ms (CPU ×1 et ×4, 3 passes) | n.m. | < 0,05 (test E2E, après correctif) | 0 tâche longue | 3,2 / 108,6 Ko | 14,9 Ko (accueil) | n.m. | n.m. |

## Journal

### Cadrage — 2026-09-30
- Audit du code, des images et du site en ligne (en-têtes, CSP, endpoint PHP, Lighthouse, trace de performance).
- **Faille critique** trouvée dans `api/contact.php` (injection SMTP : échappement des lignes « . » limité à la première ligne, CR/LF non filtrés dans le nom et le message). Le dépôt est public. Correctif planifié en S00.
- Autres constats : `styles.css` divergent et non chargé (états du formulaire non stylés en prod), GA4 bloqué par la CSP, soft 404 (repli SPA), filigrane Gemini sur `hirondelle.png`, tarifs incohérents (I-10).
- Recherches : Astro 7.3.5, GSAP 3.15.0, Lenis 1.3.26, OGL 1.0.11, support navigateur des scroll-driven animations et des view transitions, références Awwwards, tutoriels Codrops.
- Décisions D1–D8 prises avec Nicholas. Plan rédigé dans `plans/refonte-la-descente/`.
- ⚠️ Ne pas committer ni pousser `plans/` avant que le correctif S00 soit en production (le dépôt est public).

### S00 — 2026-09-30 (correctif sécurité du formulaire, `main`)
- **Contenu (I-01)** : changements validés par Nicholas, avec TDI Nitrox avancé et Decompression Procedures alignés à CHF 250 dans les Spécialités, en FR et en EN (D9) → `3ad6146`. Ils étaient **déjà en ligne** depuis le 30.09 à 17 h 44 ; S00 n'a déployé que l'alignement TDI.
- **Vérification d'abus** : 13 `POST /api/contact` depuis la mise en service (21.04–31.07.2026) — essais de Nicholas, 4 requêtes d'un robot rejetées en 400 (JSON invalide), 1 vrai message. Aucune trace d'exploitation. Côté Gmail, vérifié par Nicholas : rien d'anormal. `settings.json` n'a jamais été servi (les 200 du journal sont le repli SPA : `index.html` compressé, 11 769 octets).
- **Constats** : PHP-FPM **7.4** en production (et non 8.2) ; `dive.access_log` non rotaté (≈ 270 Mo) ; `/api/csp/report` inexistant ; `FILTER_VALIDATE_EMAIL` accepte `"a\␊b"@x.ch`, second vecteur d'injection (par `Reply-To`) ; `api/mail-config.php` existe aussi en local.
- **Correctif** (`api/contact.php`, TDD, compatible 7.4) : corps en base64, en-têtes nettoyés et encodés RFC 2047, enveloppe tirée de la configuration seule, contrôles méthode / `Content-Type` / `Origin` / taille / profondeur JSON, pot de miel et délai minimal, validation des champs (D12–D14), données en clair après STARTTLS refusées, réponses SMTP multi-lignes validées, `QUIT` et fermeture sur tous les chemins, journal sans donnée personnelle (étape SMTP + code, motifs de rejet).
- **Tests** : 137 unitaires (PHP 8.5.11 en local, **7.4.33** sur le Pi via `run_unit_php74.sh`, sans rien écrire), 29 vérifications d'intégration (serveur PHP intégré + faux SMTP). Test de mutation : sans base64 ni doublement des points, la suite échoue (plusieurs transactions SMTP pour la charge malveillante).
- **Client** (`Contact.jsx`, `i18n.jsx`, `index.html`) : pot de miel `website`, `elapsed`, `locale` ; échec → message et lien `mailto:` pré-rempli (plus d'ouverture automatique ni de faux succès) ; erreurs par champ (`aria-invalid`, `aria-describedby`) ; libellés reliés aux champs ; succès annoncé et focalisé ; styles manquants copiés depuis `styles.css`.
- **nginx** (D10) : v1 = limite de débit + PHP réservé à `contact.php` ; v2 = `^~ /api/` → 404. Sauvegardes sur le Pi : `sites-available/bullesenvalais.bak-20260930-s00` (d'origine) et `.bak-20260930-s00b` (v1).
- **Déploiements** : deux, client d'abord et PHP en dernier, après essai à blanc. Production vérifiée : `GET` 405 · `POST` sans `Origin` 403 · rafale → 429 dès la 5ᵉ requête (aussi sur `/api/contact.php`) · corps > 32 Ko → 413 · `mail-config.php` et tout autre chemin sous `/api/` → 404 · en-têtes de sécurité conservés · **deux vrais messages reçus** par Nicholas (objet, accents, `Reply-To` corrects) · aucune erreur `contact:` au journal.
- **Revues** : `security-reviewer` (Opus ; la première tentative en Sonnet a échoué sur une limite d'usage) — rien de CRITICAL ni HIGH dans le code ni dans nginx, 120 000 charges hostiles sans violation ; deux HIGH hors diff : serveur local exposé au réseau (corrigé dans `CLAUDE.md`) et `settings.json` peut-être public (infirmé). `code-reviewer` — un CRITICAL de documentation (le `rsync` complet aurait publié `settings.json`) et un HIGH (anciens clients sans `elapsed`, messages perdus), corrigés. Revue ciblée du second lot : approuvée, un MEDIUM corrigé.
- **Commits** : `3ad6146`, `499a784`, `9468d6e`, `93ae614` (1ᵉʳ déploiement), `46935db`, `1e384e0` (2ᵉ déploiement), puis documentation et plan.
- **Points ouverts** :
  - S10 : plafond quotidien d'envois (D11), `elapsed` obligatoire (surveiller `contact: accepted without elapsed` dans `dive.error_log`), délai global SMTP (optionnel) ;
  - S12–S13 : passer PHP-FPM de 7.4 (fin de vie) à 8.2 — le code est compatible ; ajouter `dive.*_log` à logrotate ; nettoyer le docroot (`CLAUDE.md`, `README.md`, `styles.css`, anciennes images à la racine, `.idea/`, `.DS_Store`) ;
  - Nicholas : supprimer la copie locale de `api/mail-config.php` (inutile en local) ; activer le pare-feu macOS ; régénérer le mot de passe d'application si le serveur local a déjà tourné sur un réseau partagé ;
  - I-10 : tarifs FFESSM N1–N4, N1 encadré ou autonome, Nitrox TDI de base (CHF 290) plus cher que le Nitrox avancé (CHF 250) ;
  - ancien site : débordement horizontal à 375 px (onglets d'agences, images de l'interlude) — sans objet après la refonte.
- **Retour arrière** : code → `git show 82c934d:api/contact.php` (origine) ou l'état de `93ae614` (1ᵉʳ déploiement), puis `rsync` et `chown` ; nginx → restaurer la sauvegarde voulue, puis `sudo nginx -t && sudo systemctl reload nginx`.

### S01 — 2026-09-30 → 10-01 (fondations Astro 7, `refonte/la-descente`)
- **Branche** `refonte/la-descente` créée depuis `main` (à jour avec `origin/main`, arbre propre hormis `images/LogoFull.png`, non suivi). Échafaudage `create-astro@5.2.4`, modèle `minimal`, sans installation, git ni fichiers d'agent, généré dans le scratchpad ; repris : `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/`.
- **Rangement** : ancien site → `legacy/` ; images suivies → `src/assets/images/` ; `api/contact.php` → `public/api/contact.php` **seul**, pour que le secret local `api/mail-config.php` (gitignoré, toujours présent) reste hors de `public/` et de `dist/` ; chemins des tests PHP mis à jour. `images/LogoFull.png` laissé en place (voir I-02).
- **Installé** : astro 7.3.5, gsap 3.15.0, lenis 1.3.26, ogl 1.0.11 ; @astrojs/check 0.9.10, @astrojs/sitemap 3.7.4, typescript 6.0.3 (D16), vitest et @vitest/coverage-v8 5.0.3, @playwright/test 1.63.0, @axe-core/playwright 4.13.0, prettier 3.9.9, prettier-plugin-astro 1.1.0, es-module-lexer 2.3.2 ; navigateurs Playwright chromium, firefox et webkit. Script d'installation de `fsevents` non approuvé (npm 11, `allowScripts`) : inutile, son binaire précompilé fonctionne.
- **Fait** :
  - configuration Astro (§3, D17, D18) et `tsconfig` strict (`@/*` ; `legacy/` et rapports de tests exclus) ;
  - i18n typé (`types`, `fr`, `en`, `index`, `routes`) et test de parité générique, avec auto-tests ;
  - `HomePage` squelette : `h1` = `hero.title` en `Emphasis`, méta provisoires reprises du site actuel ;
  - `BaseLayout` : `lang` `fr-CH` / `en`, canonical, hreflang `fr-CH` / `en` / `x-default`, `boot.js` juste après `charset` ;
  - `boot.js` identique au §7 ; `app.ts` avec un registre de contrôleurs (`src/lib/controllers.ts`, vide, testé) ;
  - styles de base aux valeurs provisoires ;
  - Vitest (80 % par dossier), Playwright (5 projets), smoke E2E ;
  - `check:budgets` (D19) et `check:dist` (D17) ;
  - Prettier, `.gitignore`, `CLAUDE.md` réécrit.
- **Vérifications** :
  - Build + `check:dist`, `astro check` à 0/0/0, 53 tests unitaires (couverture 100 %), PHP 137 tests unitaires + 29 d'intégration, smoke E2E 16/16 (chromium, webkit, mobile-chrome, mobile-safari).
  - `dist/` contient `index.html` en FR et EN, le sitemap avec ses alternates, et `api/contact.php` seul sous `api/`.
  - `run_unit_php74.sh` n'a pas été relancé : le code PHP est inchangé et le script se connecte au Pi.
  - Tests de mutation : sans `assetsInlineLimit: 0`, ou avec un fichier interdit dans `dist/`, le build échoue ; sans la garde `Object.hasOwn`, son test échoue ; un `src/lib` sous-testé fait échouer la couverture.
- **Constats** :
  - npm installe TypeScript 7, que `@astrojs/check` ne prend pas en charge (D16) ;
  - Astro inlinait `app.ts` (D17) ;
  - le serveur de dev servait `/api/mail-config.php` en 200 (D18) ;
  - Astro 7 détache `astro dev` / `astro preview` sous un agent (« exited early » dans Playwright, serveur orphelin) ;
  - le Firefox de Playwright ne démarre pas sur macOS 27.0.1 ;
  - Prettier réécrit `{' '}` en espace littéral sur la même ligne, ce qu'Astro conserve (le smoke test le vérifie).
- **Revues** : `code-reviewer` (Opus).
  - 1ʳᵉ passe : 0 CRITICAL, 0 HIGH. Les 2 MEDIUM sont corrigés : le seuil de couverture global, que les dictionnaires auraient masqué, et l'absence de garde-fou contre un script inline. Sur 4 LOW, 3 sont corrigés ; le 4ᵉ (`LogoFull.png`) est réglé par l'indexation fichier par fichier.
  - 2ᵉ passe, ciblée : approuvée. Ses 4 LOW sont corrigés : fichiers cachés publiés, absence de `contact.php` non détectée, `postbuild` sauté par `--ignore-scripts`, ressources d'une autre origine non signalées.
- **Budgets** (voir §Mesures) : JS initial 0,6 Ko par page, JS total 0,6 Ko, CSS 0,7 Ko (gzip).
- **Commits** : `042dbad`, `9bcd018`, `43a951c`, `e33e888`, `421cc3d`, `db901b3`, `c8f1eac`, puis ce journal (`033642d`). Branche poussée sur `origin` avec l'accord de Nicholas. Ensuite, à sa demande : `fe47405` (logo dans `src/assets/brand/`) et `56d6f41` (Firefox retiré, D21), puis ce complément.
- **Points ouverts** :
  - Nicholas : supprimer la copie locale `api/mail-config.php`. Elle est toujours là ; le serveur de dev la refuse désormais, mais tout autre serveur lancé à la racine la servirait. ~~Dire si `images/LogoFull.png` doit rejoindre `src/assets/brand/`~~ → fait à sa demande (`fe47405`) ; S04 attend toujours le SVG (I-02).
  - S03 : titres et descriptions méta provisoires. La parité est stricte : un `Rich` ou un `Emphasis` doit avoir la même structure en FR et en EN. À assouplir par une décision si la traduction l'exige.
  - S05 : `test:visual` et `test:a11y` n'ont encore aucun test (« No tests found »).
  - S11 : faire tourner les tests E2E sous la CSP cible (`page.route`), en complément dynamique de `check:dist`. Un éventuel îlot `application/json` devra être autorisé par une décision.
  - S12–S13 :
    - régler le `gzip_comp_level` de nginx : les budgets sont mesurés au niveau 6, nginx compresse au niveau 1 par défaut ;
    - `deploy.sh` doit passer par `npm run build`, donc par `check:dist` ;
    - mettre à jour le `README.md` racine, obsolète, et la version de `package.json` (0.0.1).
  - Playwright : ~~réessayer Firefox après une mise à jour~~ → D21 : Firefox n'est validé que s'il fonctionne ; projet retiré (`56d6f41`), à rétablir si une mise à jour de Playwright le corrige.
- **Retour arrière** : `git switch main && git branch -D refonte/la-descente`, puis `git push origin --delete refonte/la-descente`. `main` n'a pas été touché.

### S02 — 2026-10-01 (design system & styleguide, en parallèle de S03)
- **Contexte** : exécutée en parallèle de S03, dans un worktree git dédié (branche `worktree-agent-a89ded45a165ffabb`, créée par l'outil depuis `main` puis recalée sur `6277579`), à fusionner dans `refonte/la-descente`. Preview sur le port 4322 ; `test:e2e` non lancé (port 4321 réservé à S03, smoke prévu après la fusion).
- **Fait** :
  - **Polices (tâche 1)** : Fonts API avec les candidates A (Fraunces + Switzer), B (Instrument Serif + Switzer), C (Zodiak + General Sans) et deux monos du HUD en sous-ensemble (JetBrains Mono, Geist Mono : chiffres, unités, capitales, `° · : —`). `BaseLayout` charge la paire A avec trois préchargements ; le styleguide ajoute les autres, chargées seulement quand un sélecteur les utilise.
  - **Contraste (tâche 2, TDD)** : `src/lib/color/contrast.ts` (OKLCH → OKLab → sRGB linéaire → sRGB, écrêtage, contrôle du gamut, luminance et ratio WCAG, hexadécimal) ; `palette.ts` (couleurs brutes, rôles des cinq tons, 13 couples vérifiés par ton) ; `src/lib/css/custom-properties.ts` lit `tokens.css` pour les tests de concordance.
  - **Tokens (tâche 3)** : couleurs et rôles par ton, espacements et échelle typographique fluides (320 → 1440 px), rayons 2 / 14 / 999 px, ombres sous-marines (liseré de lumière sur les tons sombres, où les longues ombres faisaient du banding), lueurs de la lampe, `z-index`, grille de 12 colonnes, mouvement (miroir `src/lib/motion/tokens.ts`, courbes `CustomEase` dans `eases.ts`, polygone de la ligne d'eau E6 dans `waterline.ts`).
  - **Typographie (tâche 4)** : titres en `text-wrap: balance`, paragraphes en `pretty`, italique « liquide » colorée selon la profondeur (h1, h2 et `.display`), `tabular-nums`, sur-titre à marqueur de profondeur (le tiret est une graduation).
  - **Composants (tâche 5)** : `Button` (lampe, secondaire, fantôme, lien ; survol, focus en halo, appui, désactivé), `Eyebrow`, `EmphasisText`, `SectionHeader`, `Field` (champ, liste, zone de texte ; aide et erreur reliées), `Icon` (icônes dessinées pour le site). Cibles de 44 px.
  - **Styleguide (tâche 6)** : `/styleguide/` (noindex, hors sitemap) avec le sélecteur d'appariement (`data-pairing`), la palette en « carottes » d'eau et les ratios mesurés de chaque ton, la colonne d'eau 0 → 40 → 0 m avec thermoclines, les composants dans tous leurs états sur trois tons, la maquette du HUD (plongée, palier, remontée trop rapide, pastille mobile) avec choix de la police des chiffres, et trois démos GSAP chargées seulement sous `motion-ok` : titre en flottabilité neutre (E5), révélation « ligne d'eau » (E6), gerbe de bulles selon la loi de Boyle (E7, prototype), avec un réglage de tempo (× 0,75 / 1 / 1,25).
  - **Captures (tâche 7)** : `gates/gate-1/` : haut et milieu de page à 320, 768, 1024 et 1440 px (paire A), plus les paires B et C, la palette, le HUD avec chacune des trois polices de chiffres, le mouvement, une gerbe de bulles et, après la revue, les états des composants en surface et à l'abysse ; 20 JPEG de 12 à 119 Ko.
  - **Auto-critique (tâche 8)** : grille `design:design-critique` et checklist `design-quality.md` (9 qualités requises sur 10, aucun motif interdit). Corrigés :
    - barre sur deux lignes et grisâtre sur les tons sombres ;
    - encart de la gate mal placé (une règle générique devenait plus spécifique avec le scoping d'Astro) ;
    - nuanciers en grille de cartes, remplacés par des bandes continues ;
    - rouge allumé trop saumon ;
    - ocre du lagon boueux ;
    - banding des ombres sur les tons sombres ;
    - bouton désactivé rose ;
    - mots courts isolés en fin de titre ;
    - coupure entre un nombre et son unité ;
    - révélation E6 qui ne jouait jamais (l'IntersectionObserver ne voit pas un élément masqué par son propre `clip-path`).
- **Vérifications** :
  - `npm run build` (+ `check:dist`, 3 pages) et `astro check` : 0 erreur, 0 avertissement.
  - Tests : 215 (contraste, gamut des 27 couleurs, 65 couples de rôles et 10 couples sur le voile de survol, concordance CSS ↔ TS des couleurs, du voile et du mouvement, rôles déclarés dans les seuls blocs de ton, courbes, ligne d'eau). Couverture de `src/lib` : 99,3 % des instructions, 95,7 % des branches.
  - Tests de mutation : un `--action` ajouté au bloc dérivé de `tokens.css`, ou un `--fg-soft` dans `global.css`, fait échouer le garde-fou des rôles ; une page sans `route` ni `noindex` fait échouer `astro check`.
  - `check:budgets` et `format:check` verts.
  - axe (WCAG 2.2 AA) : 0 violation à 1440 et à 375 px, pour les trois paires.
  - Mouvement réduit et Mode calme : démos coupées, message affiché, contenu visible.
  - 0 erreur console sur `/`, `/en/` et `/styleguide/`.
- **Licences** (vérifiées le 01.10.2026) :
  - Fraunces, Instrument Serif, JetBrains Mono et Geist Mono : **SIL OFL 1.1** (fichiers `ofl/<famille>/OFL.txt` du dépôt google/fonts) ;
  - Switzer, Zodiak et General Sans : **ITF Free Font License 2.0 du 17.08.2026** (`License/FFL.txt` de l'archive officielle `api.fontshare.com/v2/fonts/download/switzer` ; `license_type: itf_ffl` dans l'API Fontshare pour les trois). Usage commercial et auto-hébergement autorisés ; sous-ensemble, conversion de format et diffusion par un dépôt ou une plateforme interdits (voir §Mutations).
- **Poids des polices** (woff2, latin) :

  | Famille | Romain | Italique |
  |---|---|---|
  | Fraunces (axes figés) | 36,9 Ko | 43,3 Ko |
  | Switzer | 42,2 Ko | 32,6 Ko |
  | Instrument Serif | 14,7 Ko | 15,3 Ko |
  | Zodiak | 36,5 Ko | 43,6 Ko |
  | General Sans | 37,2 Ko | 39,8 Ko |
  | JetBrains Mono (sous-ensemble, U+00A0 compris) | 11,0 Ko | — |
  | Geist Mono (sous-ensemble, U+00A0 compris) | 9,1 Ko | — |

  Préchargement (3 fichiers) : 122 Ko pour A, 72 Ko pour B, 117 Ko pour C. Budget : 150 Ko.
- **Constats** :
  - Chez Google, réduire la plage de `wght` ne réduit pas le fichier ; figer un axe, si.
  - Astro fusionne deux familles qui partagent la variable, le nom et le fournisseur (utilisé pour Fraunces).
  - L'outil d'écriture décode la séquence d'échappement de l'espace insécable (U+00A0) : utiliser `String.fromCharCode(0xa0)`.
  - Prettier remettait des retours à la ligne dans le `<textarea>` (corrigé par `set:text`).
  - Dans le shell, un argument qui commence par `#` est un commentaire.
- **Recommandations pour la Gate 1** (à présenter à Nicholas) :
  1. appariement **A** (Fraunces + Switzer) : seul à porter le concept (italique douce et « liquide », chiffres tabulaires nets), 122 Ko préchargés ;
  2. palette : garder la palette ajustée ; point de vigilance, en surface la combinaison crème + sérif + accent chaud rappelle le look « éditorial » générique (atténué par la photo du hero, le vrai rouge signal et la descente rapide dans l'eau) ;
  3. mouvement : **juste** (× 1), à confirmer sur téléphone ;
  4. HUD : **grotesque tabulaire** (Switzer), sans troisième police et plus compacte (en mono, l'alarme « PALIER » passe sur deux lignes).
- **Points ouverts** :
  - Gate 1 (tâche 9) puis tâche 10 :
    - ne garder que les polices choisies et les renommer en `--font-display`, `--font-sans` (et `--font-hud` si un mono est retenu) ;
    - reporter les ajustements de palette et de mouvement dans `01-direction-artistique.md` §3 à §5, avec une mutation.
  - URL LAN de la gate : `npm run preview -- --host` sur la branche fusionnée, avec l'accord de Nicholas (jamais `astro dev --host`, D18).
  - Après la fusion : smoke E2E (`npm run test:e2e`).
  - S05 :
    - Switzer italique (33 Ko) n'est téléchargée que si un `em` en texte courant l'utilise ;
    - `Eyebrow` met lui-même la profondeur sur deux chiffres : à rapprocher de `src/lib/format.ts` (S03).
  - S06 :
    - reprendre `waterline.ts` et les courbes `buoyant`… pour `ImageReveal` et `SplitHeading` ;
    - reprendre aussi le masque élargi des lignes (`padding-block` et marge négative de 0,2 em) et l'indicateur `playing` de l'animation rendue par `onSplit` (redécoupage pendant l'animation) ; avec `--leading-tight` (0,96), vérifier les accents des capitales du h1.
  - S08 : remplacer le prototype de bulles par le moteur testé.
  - S13 : supprimer `src/pages/styleguide.astro`, `src/components/styleguide/` et les deux entrées `styleguide-*` d'`app.ts`.
- **Revue de code** (`code-reviewer`, Opus, sur le diff de la branche) : « approuvé avec réserves », 2 HIGH, 3 MEDIUM et 7 LOW, tous corrigés avant la Gate 1 :
  1. HIGH, contraste non testé : le bouton fantôme survolé passait `--action-text` sur un voile (4,15:1 sur le lagon). Il garde `--fg` sur le voile. Le voile (`--veil-hover`) est déclaré dans `palette.ts` et le texte posé dessus est testé sur les cinq tons. L'alerte est testée comme texte (4,5:1), puisqu'elle écrit les alarmes du HUD.
  2. HIGH, E5 : les masques de lignes de SplitText coupaient les jambages de Fraunces. Masques élargis de 0,2 em, départ à 135 %.
  3. MEDIUM, E5 : l'animation se figeait à mi-course quand SplitText redécoupait pendant qu'elle jouait. Les démos tournent désormais dans un `gsap.context()` unique.
  4. MEDIUM, cascade : un test parcourt `src/**/*.{css,astro}` et n'admet les rôles que dans les cinq blocs de ton de `tokens.css`.
  5. MEDIUM : `BaseLayout` type `route` et `noindex` en union : une page hors des routes doit être `noindex`.
  6. LOW : la lueur des boutons passe sur un `::after` dont seule l'opacité s'anime ; plus aucune transition de couleur, de bordure ou d'ombre.
  7. LOW : survols sous `@media (hover: hover)`, jamais sur un bouton désactivé.
  8. LOW : le crochet d'état du styleguide devient `data-sg-state`.
  9. LOW : les ombres et la lueur des tons clairs, ainsi que `color-scheme: light`, s'appliquent aussi aux tons clairs imbriqués.
  10. LOW : plus de valeurs en dur dans `Button` (`--veil-hover`, `--glow-soft`, `--glow-text` ; reflet radial supprimé).
  11. LOW : U+00A0 ajouté au sous-ensemble des monos.
  12. LOW, docs : mutation « textes visibles » précisée, brief S02 corrigé (preview, pas dev, pour l'URL LAN), commentaire de `motion.css`.

  Captures refaites, dont `1440-mouvement.jpg` ; ajout de `1440-etats-surface.jpg` et `1440-etats-abysse.jpg`.
- **Commits** :
  - tâches 1 à 8 : `0b72d99`, `d189d96`, `761d152`, `d948814`, `aad6e53`, `b1c770d`, `60bd134` ;
  - revue : `78c0dd3`, `f15e5a4`, `b97d9ca`, `35a779f`, `1be0cdc` ;
  - puis les captures refaites et ce complément.
- **Retour arrière** : `git revert` de ces commits (tokens, composants et styleguide sont isolés) ; ou ne pas fusionner la branche du worktree.
- **Gate 1 (tâche 9)** : Nicholas étant à distance, le styleguide est publié sur le Pi (D31) : `https://dive.bullesenvalais.ch/styleguide/` (procédure : `CLAUDE.md`, « Preview on the Pi »). Réponses : appariement **B** (« plutôt B »), palette gardée mais lagon trop « bleu clair » et descente trop verte, tempo normal, HUD en grotesque. Après ajustement (lagon `oklch(90% 0.018 205)`, encre `oklch(45% 0.06 215)`, émeraude `oklch(37% 0.04 215)`, déco émeraude `oklch(74% 0.035 95)`, contrastes toujours verts), **Gate 1 validée le 01.10.2026** (D25).
- **Tâche 10** (`647548d`) : polices réduites à Instrument Serif + Switzer (4 fichiers servis, 3 préchargés, 72 Ko) ; sélecteurs d'appariement et de police du HUD retirés du styleguide ; colonne d'eau aux températures I-05 ; `01-direction-artistique.md` §2, §4, §5, §7 et §9 mis à jour.
- **Fusion** dans `refonte/la-descente` (`d48b427`, sans conflit). Raccords :
  - échantillons du styleguide lus depuis les dictionnaires et les données (`c86bd7d`) ;
  - `Eyebrow` utilise `formatDepthMarker` (`db963c2`) ;
  - sur-titre du hero sur toute la ligne de la grille (`a2c3887`) : la règle scopée ne s'appliquait pas à la racine du composant enfant ; révélé sur téléphone par le vrai libellé, plus long.
- **Prévisualisations sur le Pi** (01.10.2026), trois envois, chacun après un essai à blanc :
  - `rsync -rlt --omit-dir-times` : `-a` aurait donné au docroot le propriétaire et le mode du Mac ;
  - `--delete` limité aux dossiers du styleguide, `chown` de ces seuls dossiers ;
  - vérifiés en HTTPS (types de contenu) et dans Chromium : aucune erreur console, aucune ressource bloquée par la CSP actuelle ;
  - docroot (`700 www-data`) et `index.html` du site en ligne inchangés.
- **Points ouverts** :
  - S04 (Gate 3) : même procédure de prévisualisation si Nicholas est à distance ;
  - S12–S13 : `_astro/`, `js/` et `styleguide/` restent dans l'ancien docroot (inoffensifs ; disparaissent avec la bascule sur les releases) ;
  - S13 : supprimer le styleguide.

### S03 — 2026-10-01 (contenus & i18n typés FR/EN, en parallèle de S02)
- **Contexte** : menée dans le dépôt principal pendant que S02 tournait dans son worktree. Inputs demandés en une question groupée ; réponses reçues en deux fois. Questions de la Gate 2 posées dans la session, Nicholas ne pouvant pas lire `CONTENT-REVIEW.md` à distance.
- **Inputs** (`INPUTS-NICHOLAS.md`) : I-03, I-04, I-05, I-08, I-09, I-10, I-12 et I-14 reçus le 01.10.2026 ; décisions D22 à D24 et D27 à D29.
- **Fait** :
  - `src/lib/format.ts` (TDD) :
    - CHF sans groupement sous cinq chiffres ;
    - profondeurs, marqueurs « 05 m », températures (vrai signe moins), coordonnées (O pour l'ouest en français), durée mm:ss ;
    - formateurs `Intl` mis en cache (le HUD formatera à chaque image).
  - `src/lib/typography.ts` (TDD) : typographie au rendu (apostrophes courbes, espaces fines insécables, unités), appliquée par `getDictionary()` et `localize()`.
  - Données (`src/data/`) :
    - catalogue unique des cours : un prix par cours, testé contre l'ancien site ;
    - cartes des onglets de spécialités : SDI 10, TDI 4, PADI 10 avec leurs équivalents, FFESSM 7 ;
    - lieux dans l'ordre du Rhône, certifications ;
    - contact : intérêts identiques à `ALLOWED_INTERESTS`, `gift` compris ; fiche Google ; Instagram ;
    - bons cadeaux ;
    - profil de plongée : marqueurs des sur-titres, profondeurs du HUD, ancres historiques.
  - Textes :
    - `Dictionary` complet (`dictionary.ts`) ;
    - `fr.ts` et `en.ts` : textes repris de l'ancien site, plus les nouveaux textes de la DA §9 ; EN britannique ; 8 témoignages traduits ;
    - pages Confidentialité et Mentions légales (`legal/`), à relire : ce n'est pas un avis juridique.
  - `gift` ajouté à `ALLOWED_INTERESTS` de `public/api/contact.php` (test d'abord).
  - `CONTENT-REVIEW.md` : choix de structure, textes nouveaux et modifiés FR | EN, sur-titres, réponses de la Gate 2.
- **Vérification de la migration** : les 890 chaînes de `legacy/components/i18n.jsx` ont été cherchées dans les nouvelles sources. Les 73 absentes mot pour mot sont toutes des changements listés :
  - sur-titres devenus marqueurs de profondeur ;
  - titres découpés en `Emphasis` ;
  - coordonnées et équivalences désormais calculées ;
  - HTML devenu `Rich` ;
  - modifications M1 à M21.
- **Vérifications** (état fusionné) :
  - build et `check:dist` (3 pages) ; `astro check` : 0 erreur, 0 avertissement, 0 indice ;
  - 335 tests Vitest (couverture : 99,6 % des instructions, 97,9 % des branches), 138 tests PHP, E2E 16/16 ;
  - `check:budgets` : JS 1,3 / 36,4 Ko, CSS 3,2 Ko sur l'accueil ;
  - `grep -rn "TODO(I-" src/ | wc -l` → 16 lignes, aucune dans le contenu.
- **Revues** : une première revue complète (Opus), lancée avant les réponses de Nicholas, a été arrêtée. Une revue à effort modéré (Sonnet, D30) a porté sur l'état final ; ses trois constats sont corrigés (`55e4048`) :
  - HIGH : `formatDepth(Infinity)` affichait « ∞ m » ;
  - MEDIUM : le test des offres cadeaux ne vérifiait pas tout ce que son nom annonçait ;
  - LOW : `PADI_CARDS` n'était pas en lecture seule.
- **Gate 2 validée le 01.10.2026** : tout accepté, sans retour. Politique de confidentialité sans rubrique sur les États-Unis ni délai de réponse (`8f15f8f`).
- **Constats** :
  - l'ICU de Node groupe `fr-CH` avec une apostrophe (« 12'500 ») : le test ne fige pas le séparateur ;
  - l'outil d'écriture décode les séquences `\u00a0` : les espaces invisibles sont écrites par script, en séquences d'échappement ;
  - le site en ligne (`main`) garde les anciens prix (TDI Nitrox avancé à 250, FFESSM « Sur demande ») : décalage accepté par Nicholas, mise à jour au fil des sessions.
- **Commits** :
  - avant la fusion : `d53a624`, `848eb5c`, `b971d9b`, `1bfc4ca`, `8f227d6`, `87a48f4`, `29e59eb`, `4d43542` ;
  - après la fusion : `c86bd7d`, `db963c2`, `55e4048`, `8b33ed0`, `a2c3887`, `6aae570`, `8f15f8f` ;
  - puis ce journal.
  - Branche poussée sur `origin` avec l'accord de Nicholas.
- **Points ouverts** :
  - S05 :
    - sur-titres par `Eyebrow` avec les marqueurs de `sections.ts` ;
    - `localize()` pour les données ; `cursusCourses()` et `GIFT_OFFERS` ;
    - « Bons cadeaux » hors du menu (D28) ;
    - `GOOGLE_PROFILE_URL` sur « Laisser un avis Google ».
  - S06 : table des températures I-05 (intermédiaires proposés dans `INPUTS-NICHOLAS.md`).
  - S11 : tableau des cookies de la page Confidentialité ; `sameAs` du JSON-LD (Instagram, fiche Google).
  - S12–S13 : fixer la rotation des journaux nginx et en écrire la durée dans la page Confidentialité (aujourd'hui « conservés pour la sécurité du site, puis supprimés »).
  - Point à garder en tête : Google (Gmail) et WhatsApp peuvent traiter des données hors de Suisse ; la rubrique a été retirée à la demande de Nicholas.
- **Retour arrière** : `git revert` des commits S03 (données, dictionnaires, typographie, `gift` côté PHP) ; aucun impact sur le site en ligne.

### S04 — 2026-10-01 (visuels : retouches, IA, logo, favicons, OG)
- **Inputs** : originaux HD reçus (I-13, dans `src/assets/original/`, ignoré par git) ; logo en PNG seulement (I-02) ; accord pour `nano-banana` (Gemini 3 Pro Image) et les retouches (I-15).
- **Fait** :
  - images rangées par section (`hero/`, `instructor/`, `places/`, `interludes/`, `prepare/`) ; anciens fichiers retirés (historique git) ; `CREDITS.md` (source, outil, prompts, retouches) ;
  - hero : `rosel_2.jpg` en 4080 px, fils électriques retirés par tuiles (D32) ;
  - lieux en 4:5 depuis les originaux HD (Sion, Rosel sans les lignes, Chillon) ; portrait 4:5 et 1:1 ; interlude A 16:9 et 4:5 sans signature (D34) ; interlude B sans filigrane, 2752 px (D33) ;
  - masque d'eau d'E1 (`scripts/make-water-mask.mjs`, TDD sur `scripts/lib/water-mask.mjs`) : rive réglée à la main, rocher émergé exclu, bords du cadre gardés blancs ;
  - logo SVG vectorisé, favicons (SVG clair/sombre, `.ico`), icônes 180/192/512, manifeste ;
  - images OG FR/EN (`scripts/make-og.mjs`, texte tracé en chemins par `scripts/lib/text-path.mjs`, TDD) ;
  - planches de la gate (`gates/gate-3/`, JPEG ≤ 200 Ko).
- **Constats** :
  - le modèle d'image ne rend que ≈ 1 Mpx (1200×896, 928×1152, 1376×768) et redessine toute l'image : d'où les tuiles recalées et le calage colorimétrique ;
  - `sharp` : `dilate()` sur un masque à un canal se comporte en érosion ; un attribut `d` de plus de ≈ 10 000 caractères est tronqué sans erreur ; Pango passe par CoreText sur macOS et ignore `fontfile` ;
  - `opentype.js` 2.0 : `Glyph.getPath()` renvoie des `NaN` au second tracé d'un même glyphe, et `Font.getPath()` échoue sur la substitution `ccmp` d'Instrument Serif ;
  - un `npm i` lancé dans un dossier dont `node_modules` était un lien vers celui du projet a remplacé le lien (projet intact, vérifié).
- **Vérifications** : `npm run build` (+ `check:dist`), `astro check` 0/0/0, 354 tests Vitest, `format:check`, smoke E2E 16/16 ; scripts d'images déterministes (deux exécutions, mêmes octets) ; aucun filigrane visible (contrôle à 100 %).
- **Revue** (`code-reviewer`, Sonnet, une passe, D30) : approuvée, 0 CRITICAL, 0 HIGH. MEDIUM corrigés : svgo en dépendance (reproductibilité), `favicon.ico` de secours (nginx servirait `index.html`). LOW corrigés : glyphe absent, logo sans `currentColor`, structure du logo vérifiée, tampon de police. `astro check` signalait 5 erreurs de types dans les scripts, manquées avant la revue : corrigées (`e36730a`).
- **Gate 3 validée le 01.10.2026** (D32–D35) ; candidats écartés supprimés (`hero/sion.jpg`, `light-2/3`, vidéo du concept E15).
- **Poids** : `src/assets/images` ≈ 7 Mo de masters (hero 2,6 Mo) ; OG 160 Ko chacune ; icônes ≤ 11 Ko ; logo 10 Ko ; masque d'eau 512×386.
- **Commits** : `482386a`, `443c329`, `2e110b9`, `0542158`, `2f898ca`, `71949b8`, `e36730a`, puis les décisions de la gate et ce journal.
- **Points ouverts** :
  - Nicholas : fichier .ai du logo (remplacera la vectorisation ; une version simplifiée pour le favicon 16 px serait bienvenue) ; original plus grand de `bde.jpg` s'il le retrouve ;
  - S05 : `logo.svg` en `currentColor`, bleu nuit `#141646` sur clair et blanc sur sombre seulement (D35) ; légende « © Nicholas Jallan » de l'interlude A ; légende « Visuel généré par IA » de l'interlude B et crédits du pied de page ; balises `og:image` (`/og/og-fr.jpg`, `/og/og-en.jpg`) avec S11 ;
  - S07 : `textures/water-mask.png` aligné sur `hero/rosel.jpg` (relancer `make-water-mask.mjs` si le hero change) ; intro E15 sans logo ;
  - S09 : `places/*.jpg` en 4:5 (1600×2000) ;
  - relancer `make-og.mjs` si le titre du hero change.
- **Retour arrière** : `git revert` des commits S04 ; les anciennes images sont dans l'historique (`5ce9495`).

### S05 — 2026-10-01 (page statique complète, FR/EN)
- **Fait** :
  - `BaseLayout` : lien d'évitement, `<main id="content">` ; `HomePage` assemble les 15 étapes du profil (`ui/Section` : `id`, `aria-labelledby`, `data-tone`, `data-depth-start/end`, `data-hud="hidden"` sur l'échelle et le comparatif) ;
  - sections : bandeau (menu mobile en `<dialog>` modal), hero (`<Picture>` `eager` + `fetchpriority="high"`, crédits, coordonnées du Rosel), manifeste, instructeur (portrait 4:5 / 1:1, crédits en `<dl>`), Cursus (onglets APG, tarifs de `courses.ts`, lien « Me renseigner » qui pré-remplit l'intérêt), interludes A et B (citation, crédit), échelle de profondeur statique (réelle jusqu'à 40 m puis resserrée, en pointillés), comparatif (cartes sous 48 rem), Spécialités (4 onglets, index en deux colonnes), Lieux (carte SVG du Rhône, fiches décalées vers l'aval), Avant de s'immerger (`#gear`, `#insurance`), Bons cadeaux (bon en objet, offres, étapes, CTA `data-prefill-interest="gift"`), Témoignages (rail `scroll-snap`, boutons, `lang`), FAQ (`<details name="faq">`), Contact (canaux, formulaire), dialogue WhatsApp, pied de page (crédits, liens légaux, langue, Mode calme `aria-pressed`, « Gérer les cookies » inactif jusqu'à S11) ;
  - contrôleurs essentiels : `nav`, `tabs`, `rail`, `contact-form`, `whatsapp`, `calm-mode` ; sélecteur de langue en vrais liens (`routes.ts`, pages légales ajoutées) ;
  - `src/lib/form/validate.ts` (mêmes règles que `contact.php`, vérifiées sur les mêmes adresses avec PHP) et `submit.ts` (JSON, délai de 15 s, 200 / 400 / échec, `mailto:` préparé mais jamais ouvert) en TDD ; `lib/tabs.ts`, `lib/depth/ladder-scale.ts`, `lib/geo.ts` en TDD ;
  - `LegalLayout`, Confidentialité et Mentions légales FR/EN, `404.astro` bilingue en `noindex` (hors du sitemap) ;
  - tests : `tests/e2e/page`, `controllers`, `form` (requêtes simulées 200/400/500), `no-js`, `overflow` (320 px, 5 pages), `tests/a11y/axe.spec.ts` (7 pages) ;
  - captures de référence : `gates/s05/fr-{320,768,1024,1440}.jpg`, `en-1440.jpg`.
- **Vérifications** : `npm run build` (+ `check:dist`, 8 pages) ; `astro check` 0/0/0 ; 414 tests Vitest ; Playwright 138 réussis, 2 sautés (menu mobile sur les projets desktop) sur chromium, webkit, mobile-chrome et mobile-safari, dont axe : **0 violation sérieuse ou critique** ; aucun débordement à 320, 375, 768, 1024, 1440 et 1920 px ; `check:budgets` : JS initial 1,5 Ko, total 41,7 Ko, CSS 11,2 Ko ; Lighthouse mobile local **99 / 100 / 100 / 100** sur `/` et `/en/`.
- **Constats** :
  - l'erreur affichée en quittant le champ e-mail décalait le bouton « Envoyer » entre l'appui et le relâchement : le clic était perdu (vu par un test E2E). La validation à la sortie est sautée pendant l'appui sur le bouton ;
  - un composant qui reçoit `class` d'un parent doit transmettre l'attribut `data-astro-cid-*` (`Section` le fait), sinon les styles à portée du parent ne s'appliquent pas ;
  - une grille sans `minmax(0, 1fr)` laissait le rail des témoignages imposer sa largeur (débordement) ;
  - Lighthouse prenait le portrait 1080 px sur un écran de 412 px à DPR 1,75 : largeur 840 ajoutée ; hero en AVIF q40 plafonné à 1920 px.
- **Revue** (`code-reviewer`, Sonnet, une passe, D30, accessibilité comprise) : approuvée, 0 CRITICAL, 0 HIGH. 4 MEDIUM corrigés (délai d'envoi, `mailto:` raccourci, retour à la page sans JS si un contrôleur échoue, défilement doux du rail seulement sous `motion-ok`) ; 6 LOW corrigés (résumé d'erreurs mis à jour, Ctrl/Cmd-clic, rôles des panneaux posés par `tabs.ts`, `aria-haspopup` posé par JS, attente des 3 s du garde anti-robot, focus des boutons du rail) ; 1 LOW laissé : le Mode calme recharge la page (prévu par le brief), le focus revient en haut.
- **Défauts de `00-contexte.md` §4.3** : 2 (images AVIF/WebP, `srcset`), 5 (aucun écouteur `scroll`), 6 (aucune propriété de mise en page animée), 7 (langue en liens, menu et WhatsApp en `<dialog>` avec focus, FAQ native, onglets APG), 8 (textes dans `src/i18n`, année calculée), 9 (`lang` des témoignages), 10 (échec → alternatives) et 13 (pot de miel, `elapsed`) traités ; 11 en partie (description, `hreflang`), le reste en S11 (JSON-LD) et S13 (soft 404) ; 12 en S11 ; 1, 3 et 4 réglés en S01 et S04.
- **Commits** : `8113cb8`, `326046e`, `adef479`, `9fb97c4`, `38b1b48`, `a23d47b`, puis ce journal.
- **Points ouverts** :
  - S06 : bandeau collant ou adaptatif au défilement ; `html[data-controllers="ready"]` disponible ; révélations sous `motion-ok` ;
  - S10 : envoi sans JS (mutation ci-dessus) ; Mode calme sans rechargement si le moteur de mouvement sait s'arrêter à chaud ;
  - S11 : bouton « Gérer les cookies » (`data-consent-manage`), Open Graph et JSON-LD ;
  - logo en `--c-ink` (bleu nuit de la palette) sur clair et en blanc sur la photo ; si Nicholas tient au `#141646` exact de D35, l'ajouter comme token ;
  - Nicholas : relecture de la page (prévisualisation sur le Pi possible, D31 : il faudrait alors publier `index.html`, ce que la procédure interdit ; une page de prévisualisation `noindex` à part serait à prévoir).
- **Retour arrière** : `git revert` des commits S05 ; aucun impact sur le site en ligne.

### S06 — 2026-10-02 (moteur de mouvement)
- **Fait** :
  - logique pure en TDD : `lib/depth/resolve-depth.ts` (`probeLine`, `resolveDepth` : haut et bas de page, trous entre sections, sections courtes ou vides, sections masquées), `temperature.ts` (I-05 : 21 → 8 °C, thermocline 10–15 m), `profile.ts` (`fillHiddenDepths`, géométrie du U, point actif), `ascent.ts`, `lib/motion/magnetic.ts`, `formatDecimal` ; `HUD_PROFILE` dans `data/sections.ts`, écrit par `Section.astro` sur chaque section ;
  - module de mouvement `scripts/motion/` (import dynamique sous `motion-ok`, démarré après les contrôleurs) : GSAP + ScrollTrigger + SplitText + CustomEase (`buoyant`, `surface`, `drift`, `sink`), `gsap.matchMedia` relié à `motion-ok`, Lenis (pointeur fin ; ancres par Lenis avec focus sur le titre et URL mise à jour ; arrêt pendant les `<dialog>` modaux ; préférences cookies en défilement natif), révélations `lines` (E5, découpe annulée après l'animation), `fade`, `image` (E6, ligne d'eau en `clip-path` + dézoom 1,08 → 1), `stagger`, aimantation ≤ 6 px des boutons « lampe » avec évènements `bv:lamp` (accroche des bulles de S08) ;
  - HUD (E3) : `DepthGauge` (bord droit sur ordinateur avec couloir réservé, pastille en bas à gauche sur téléphone, `data-hud-gauge`), profondeur à 1 décimale, température, durée mm:ss, chiffres en `aria-hidden` ; `DiveProfile` en `popover` (tracé en U, point actif, 13 vrais liens dont Bons cadeaux) ; `setMode('normal'|'hidden'|'safety-stop')` (compte à rebours `PALIER 5 m · 03:00` prêt pour S10), masqué dans l'échelle et le comparatif, `▲ LENT` derrière un drapeau (désactivé) ;
  - colonne d'eau et 6 thermoclines (E4), miroitement en `transform` ;
  - navigation vivante (E16) : fixe, rentrée à la descente, verre dépoli après le hero, section active (`aria-current`, aussi dans le profil), menu mobile « plongée » avec la profondeur de chaque lien, révélé ligne à ligne ; E17 (lueur existante + aimantation) ; E18 (`@view-transition`, `view-transition-name` sur la nav et le HUD, coupé sans `motion-ok`).
- **Vérifications** : `npm run build` (+ `check:dist`) ; `astro check` 0/0/0 ; Vitest 490 tests (après fusion) ; Playwright 201 réussis, 24 sautés (tous projets, `csp` compris) ; nouveaux tests `tests/e2e/motion.spec.ts` (HUD ≈ 32–40 m sur `#specialties`, HUD masqué dans l'échelle, profil de plongée, ancre `#faq` avec Lenis et focus, CLS < 0,05 au chargement et sur un scroll complet, mouvement réduit sans Lenis ni contenu masqué, Mode calme complet, garde-fou de `boot.js` avec le module retenu 5 s) ; trace : 0 tâche longue, 60 i/s (CPU ×1 et ×4) ; budgets : JS initial 3,2 Ko, total 82,0 Ko, CSS 12,9 Ko.
- **Constats** : Lenis retire déjà le `scroll-padding` de la page dans `scrollTo` (le décalage était compté deux fois) ; Lenis arrêté bloque la molette tout seul, d'où l'abandon de `overflow: clip` de sa feuille (il bloquait aussi les sauts d'ancre) ; une classe transmise à un composant enfant ne reçoit pas les styles à portée du parent (le tracé du profil s'affichait en grand dans la pastille mobile) ; sur WebKit, `goto` attendait le module retenu au-delà des 3 s du garde-fou (test passé en `waitUntil: 'commit'`).
- **Revue** (`code-reviewer`, Sonnet, une passe, D30) : approuvée, 0 CRITICAL, 0 HIGH ; 3 MEDIUM corrigés (`clip-path` résiduel si une révélation est interrompue, hash mal formé, rejet non géré du module), 3 LOW corrigés (liens `_blank` / `download`, rectangle de l'aimantation remesuré, déclencheurs des révélations tués après usage) ; 1 LOW laissé : après un saut par-dessus plusieurs thermoclines, la dernière bande mise à jour fixe les couches (invisible hors d'une thermocline, à revoir si un défaut apparaît).
- **Commits** : `fc4d1ab`, `e8a17d0`, `463261c`, `75907b8`, `9bffed3`, puis ce journal.
- **Points ouverts** :
  - S07 : E15 (le HUD « s'allume » à 0,0 m) et E2 (le titre du hero n'est pas découpé en S06) ; idle → WebGL après `load` dans `scripts/motion/index.ts` ;
  - S08 : `setMode('hidden')` déjà automatique dans l'échelle ; épinglage desktop dans `whileMotion` (`desktop`) ; bulles sur `bv:lamp` ;
  - S10 : `setMode('safety-stop')` au palier FAQ ; Mode calme sans rechargement possible (`whileMotion` sait tout défaire) ;
  - Firefox (D21) et Safari réel non vérifiés à la main ; les transitions de vue E18 seulement là où elles existent.
- **Retour arrière** : `git revert` des commits S06 ; la page statique de S05 reste fonctionnelle.

### S07 — 2026-10-02 (hero « Surface » en WebGL, immersion, intro)
- **Fait** :
  - TDD : `lib/webgl/capability.ts` (`canUseWebGL`, environnement injectable, contexte d'essai rendu aussitôt), `viewport.ts` (cadrage `object-fit: cover` en coordonnées GL, `object-position`, DPR ≤ 1,5 et ×0,75 sur téléphone), `ripples.ts` (8 ondes, âge, gestes : survol limité en fréquence, toucher bref seulement) ;
  - shaders écrits pour le site (`surface.vert`, `surface.frag`, bruit `webgl-noise` MIT crédité dans `noise.glsl`) : eau déplacée par le bruit et les ondes dans le masque d'eau, perspective du lac, caustiques maison sur les hauts-fonds, ligne d'eau ondulée et ménisque qui montent avec `uImmersion`, sous l'eau : réfraction, flou léger, couleurs lavées, teinte `lagoon-ink`, assombrissement `deep`, rayons obliques, caustiques, particules ;
  - `scripts/webgl/surface.ts` (OGL : Renderer, Program, Mesh, Triangle, Texture) : boucle `gsap.ticker` seulement à l'écran et onglet visible, 60 i/s au plus, `ResizeObserver`, contexte perdu → retour à l'image, contexte rendu si la création échoue ;
  - `hero.ts` : intro E15 (lignes du titre en 0,9 s + décalage, HUD qui « s'allume » à 0,0 m, une fois par page, sautée sur une ancre), immersion E2 (ScrollTrigger du hero, titre et accroche qui dérivent et s'effacent), repli sans WebGL (ligne d'eau en `clip-path` + voile sous-marin), drapeau de retour arrière `WEBGL_SURFACE` ; `hero-surface.ts` : après `load` + idle, `import()`, `decode()`, fondu du canvas au-dessus de l'image ;
  - tests : `tests/e2e/hero.spec.ts` (canvas sous Chromium, aucun rendu hors écran, LCP, intro, repli CSS, glisser tactile sur le hero, mouvement réduit), `tests/visual/hero.spec.ts` ; captures `gates/s07/`.
- **Vérifications** : `npm run build` (+ `check:dist`) ; `astro check` 0/0/0 ; Vitest 516 tests (99,6 % des lignes) ; Playwright 220 réussis, 37 sautés (tous projets, a11y et `csp` compris) ; `format:check` ; budgets : JS initial 3,2 Ko, total 102,9 Ko, CSS 13,1 Ko ; morceau WebGL 18,7 Ko gzip (≤ 30) ; trace mobile : FCP = LCP ≈ 0,6 s, CLS 0, TBT ≈ 120 ms, WebGL chargé après le LCP ; Lighthouse local 94 / 100 / 100 / 100 (base S06 : 95).
- **Constats** :
  - Chromium écarte du LCP une image qui couvre tout le viewport (D41) ; le texte masqué à la première peinture (titre sous l'intro) n'est jamais repris comme candidat, d'où l'accroche comme LCP sous le mouvement ;
  - OGL ne résout un tableau d'uniforms (`uRipples[0]`) que si la valeur est un `Array` (un `Float32Array` donnait un avertissement par image) ; `Renderer.setSize` écrit la taille en ligne sur le canvas, d'où l'observation de la taille du hero et non du canvas ;
  - le Chromium et le WebKit de Playwright ont WebGL 2 sans drapeau ;
  - un premier Lighthouse à 77 venait d'une tâche de Lighthouse lui-même (`_lighthouse-eval.js`, 651 ms) : mesures répétées et comparées à la base S06 dans un worktree temporaire.
- **Revue** (`code-reviewer`, Sonnet, une passe, D30) : 0 CRITICAL ; 1 HIGH corrigé (titre et HUD restés masqués si l'intro échoue : `data-intro` posé dans un `finally`, et sans hero) ; 3 MEDIUM corrigés (contexte WebGL rendu si la création échoue, surface libérée même si son démarrage lève, caustiques limitées aux hauts-fonds + 60 i/s au plus) ; LOW corrigés : nettoyage complet à la perte de contexte, intro jouée une seule fois ; LOW laissés : DPR figé à la création (changement d'écran), `console.warn` si la surface est indisponible (voulu).
- **Commits** : `e3e544e`, `854300e`, `ee42ee8`, `80ae5a1`, `0cf5adf`, puis ce journal.
- **Points ouverts** :
  - S12 : LCP Lighthouse simulé à 2,8–2,9 s (déjà en S06, rendu retardé du texte : polices et CSS sur le chemin critique) à mesurer en préproduction contre la cible de 2,0 s ; Safari réel (iOS) et un mobile milieu de gamme à juger à la main (fluidité du shader) ;
  - S08 : bulles sur `bv:lamp` ; l'intro E15 n'anime pas le logo (D35) ;
  - Nicholas : avis sur l'intensité de l'effet (captures `gates/s07/`) ; réglages simples dans `surface.frag` (amplitude des ondes, force des caustiques, teinte sous l'eau).
- **Retour arrière** : `WEBGL_SURFACE = false` dans `src/components/hero/hero.ts` (ligne d'eau CSS seule) ; ou `git revert` des commits S07 (hero statique de S05).

### S08 — 2026-10-02 (Cursus, interludes, échelle de profondeur, comparatif, bulles)
- **Fait** :
  - bulles (E7) en TDD : `lib/bubbles/boyle.ts` (`radiusAtDepth`, `riseSpeed` ; 10 m → surface ×1,26, 30 m → ×1,587), `pool.ts` (64 bulles, montée ∝ √r, oscillation, rayon de Boyle selon la hauteur parcourue, 40 px = 1 m) ; `scripts/bubbles/emitter.ts` (canvas fixe créé à la première émission, bulle pré-dessinée en couleur `--c-foam`, `gsap.ticker` seulement s'il y a des bulles, `burst`, `trail`, évènement `bv:bubbles`) ; CTA « lampe » : 2 ou 3 bulles au survol, gerbe de 14 au clic (E17) ;
  - Cursus : lumière qui glisse d'onglet en onglet (`clip-path`), entrée du panneau, lignes du titre d'agence et cascade des tarifs (`ui/tabs-motion.ts`, aussi sur les onglets des Spécialités) ; titre du premier panneau révélé au scroll ;
  - interludes : parallaxe de 12 % (pointeur fin), citation ligne à ligne, anneau à la place du curseur et traînée de bulles, bords en thermocline vers les tons voisins ;
  - échelle (E9) : `ladderTicks()` et `depthAtPosition()` en TDD ; sur ordinateur avec mouvement, scène épinglée 3 écrans, règle graduée (5 m jusqu'à 40, puis 10 m), « Vous êtes ici » en très grands chiffres, cartes alternées gauche/droite qui s'allument à leur profondeur et s'estompent ensuite ; thermocline « Remontée · 40 m » ; liste statique de S05 sur mobile, en mouvement réduit et en Mode calme ;
  - comparatif : en-tête collant (≥ 48 rem), ligne survolée éclairée, lignes révélées tour à tour ;
  - tests : `tests/e2e/descent.spec.ts` (9 profondeurs de l'échelle dans le DOM dans tous les modes, épinglage sur ordinateur seulement, aucun épinglage ni `pin-spacer` ni bulle en mouvement réduit, onglets APG au clavier sous l'indicateur, canvas unique `aria-hidden`, curseur des interludes, page ouverte sur une ancre sous l'échelle), `motion.spec.ts` (page ouverte sur une ancre) ; captures `gates/s08/`.
- **Profondeurs** : conformes à I-04 (D24) : 6, 18, 20, 30, 40, 45, 60, 70 et 120 m ; aucun `TODO(I-04)`.
- **Vérifications** : `npm run build` (+ `check:dist`) ; `astro check` 0/0/0 ; Vitest 536 tests ; Playwright e2e 217 réussis (35 sautés), a11y 28/28, `csp` 0 violation, visuels 2/2 ; `format:check` ; budgets : JS initial 3,2 Ko, total 106,2 Ko, CSS 14,1 Ko ; trace de la traversée de l'échelle : 0 tâche longue, 60 i/s à CPU ×1 et ×4.
- **Constats** :
  - défaut de S06 : une page ouverte sur une ancre (`/#agencies`) faisait échouer le module de mouvement (`resolveDepth` appelé avant la première mesure) ; corrigé, test ajouté ;
  - sous WebKit, le `ResizeObserver` de Lenis ne voit pas la place ajoutée par un épinglage : Lenis gardait sa limite et un lien vers `#faq` s'arrêtait 220 px trop haut ; Lenis est recalculé à chaque `refresh` de ScrollTrigger ;
  - le navigateur saute à l'ancre de l'adresse avant que l'épinglage ajoute trois écrans au-dessus : le défilement suit l'ancre après le premier `refresh` ;
  - ScrollTrigger range les déclencheurs par création : l'épinglage, créé après le HUD et l'eau, a `refreshPriority: 1`.
- **Revue** (`code-reviewer`, Sonnet, une passe, D30) : approuvée, 0 CRITICAL, 0 HIGH ; 2 MEDIUM corrigés (changements d'onglets rapides : découpe et cascade en cours terminées avant la suivante) ; LOW corrigés : anneau des interludes rendu visible si le module redémarre sous un pointeur immobile, indicateur recalé quand la largeur d'un onglet change, bulle tirée de `--c-foam` avec des constantes nommées, redimensionnement du canvas limité à une fois par image, lien commenté entre `--track-length` et `PIN_SCREENS` ; LOW laissé : tailles de mise en page de l'échelle et de l'anneau écrites dans leurs composants (propriétés nommées, pas des tokens du design system).
- **Commits** : `bb8640d`, `dda390b`, `da98031`, `1e66567`, `d13bea9`, `e1e0be0`, `a18355d`, `856d6c3`, `aa39918`, `d4df9c0`, puis ce journal.
- **Points ouverts** :
  - S10 : gerbe de bulles au succès du formulaire par `bv:bubbles` (`{ x, y, count }`) ; `setMode('safety-stop')` au palier ;
  - S09 : les onglets des Spécialités ont déjà la lumière qui glisse et l'entrée du panneau (`data-tab-headline` / `data-tab-row` à poser si leur titre et leurs lignes doivent suivre) ;
  - la texture de miroitement des thermoclines (S06) montre une couture verticale tous les 60 rem (visible à 960 px sur `gates/s08/thermocline-ascent.jpg`) : texture à rendre raccordable ;
  - Nicholas : avis sur l'échelle (`gates/s08/ladder-*.jpg`), la discrétion des bulles et l'anneau des interludes ;
  - le prototype de bulles du styleguide (`styleguide/bubbles-demo.ts`, point ouvert de S02) n'est pas remplacé : la page est supprimée en S13, son commentaire renvoie au moteur ;
  - Safari réel et Firefox (D21) non vérifiés à la main.
- **Retour arrière** : `git revert` par sous-fonction (bulles `bb8640d`, Cursus `da98031`, interludes `1e66567`, échelle `d13bea9` + `d4df9c0`, comparatif `e1e0be0`) ; sans le module de mouvement, la page statique de S05 reste complète.

### S09 — 2026-10-02 (Spécialités : lampe torche ; Lieux : parcours du Rhône)
- **Fait** :
  - lampe (E8) : `lib/torch/torch.ts` en TDD (`litIndex`, `driftPoint`, `particleField` déterministe) ; `specialties/torch.ts` : faisceau à dégradé radial chaud déplacé en `transform` (`quickTo`, 0,15 s), sous le contenu (`z-index`), particules dessinées une fois au tiers de la résolution et tenues immobiles pendant que le faisceau passe dessus (contre-translation), carte éclairée `is-lit` (bordure et lueur rouge-lampe en pseudo-élément, texte inchangé), clavier (onglet ou première carte du panneau focalisé), toucher, dérive lente après 2,4 s sans geste, seulement quand la section est à l'écran ;
  - onglets : cascade des lignes plafonnée à 0,6 s (`lib/motion/cascade.ts`), commune au Cursus et aux Spécialités (titre du panneau et cartes de spécialité marqués) ;
  - Lieux (E10) : `geo.ts` (`fractionAlong`, tests des trois sites : Sion à l'est, Rosel au sud-ouest, Léman au nord-ouest, ordre le long du fleuve), `data/rhone.ts`, `lib/motion/track.ts` (`centredProgress`, `interpolate`, `nearestIndex`) ; sur ordinateur avec mouvement, scène épinglée, carte à gauche dont le tracé se dessine jusqu'à la station du lieu en vue (station allumée), piste horizontale (introduction + 3 lieux), HUD de 32 à 22 m, photos révélées à leur entrée dans la fenêtre, lien focalisé qui amène son lieu dans la fenêtre ; sur mobile, rangée de cartes en `scroll-snap` ; lien des coordonnées vers Google Maps ;
  - tests : `tests/e2e/abyss.spec.ts` (lieux dans l'ordre FR/EN avec leur lien, lampe au pointeur et au clavier, piste épinglée au clavier avec tracé complet à la fin, épinglage juste après un onglet plus court, mouvement réduit sans lampe ni épinglage, aucun débordement) ; captures `gates/s09/`.
- **Vérifications** : `npm run build` (+ `check:dist`) ; `astro check` 0 erreur, 0 avertissement (3 indications antérieures à S09) ; Vitest 562 tests (couverture 99,4 % des lignes) ; Playwright e2e 235 réussis (37 sautés), a11y 28/28, `csp` 0 violation, visuels 2/2 ; `format:check` ; budgets : JS initial 3,2 Ko, total 108,6 Ko, CSS 14,9 Ko ; trace : 0 tâche longue, 60 i/s à CPU ×1 et ×4.
- **Constats** :
  - un `canvas` hérite du `max-inline-size: 100 %` de la remise à zéro : les particules, plus larges que le faisceau, étaient écrasées en traits ;
  - un `span.visually-hidden` (position absolue) dans une rangée défilante en sortait et élargissait la page mobile à 923 px : la carte est `position: relative` ;
  - les deux défauts antérieurs corrigés (CLS des titres découpés, `refresh` après un changement d'onglet) : voir Mutations.
- **Revue** (`code-reviewer`, Sonnet, une passe, D30) : 0 CRITICAL ; 1 HIGH corrigé (pas de `ScrollTrigger.refresh()` après un changement d'onglet, test RED puis GREEN) ; 4 MEDIUM corrigés (révélation différée aussi sur un saut, particules redessinées au changement de taille, `position: relative` de la piste pour `offsetLeft`, révélations différées dans un `gsap.context` annulé au nettoyage) ; LOW corrigé : point d'extrémité d'un tracé non dessiné ; LOW laissé : `font-size: 25px` des libellés de la carte (unités du `viewBox`, pas des pixels CSS) et `-0.24em` (le double de `0.12em` des masques).
- **Commits** : `1f277ed`, `b6701a3`, `ce4d720`, `c742989`, `f213bf3`, `a32166c`, `57657af`, puis ce journal.
- **Prévisualisation** (D42, après la conclusion, à la demande de Nicholas) : publiée sur `https://dive.bullesenvalais.ch/preview/` et `/preview/en/` ; essai à blanc vérifié (seuls `_astro/`, `js/`, `styleguide/`, `preview/` ; 15 fichiers périmés supprimés dans `_astro/`) ; site en ligne intact ; page publiée sans erreur console sous la CSP de l'ancien site (lampe sur ordinateur et mobile, Lieux épinglés sur ordinateur seulement). Le lien Google Maps est validé par Nicholas.
- **Points ouverts** :
  - Nicholas : avis sur la lampe (`gates/s09/torch-1440.jpg`), le parcours du Rhône, sur la prévisualisation (`/preview/`) ;
  - I-03 : températures, visibilité et accès toujours non fournis (rien d'inventé, aucun `TODO` affiché) ;
  - Safari réel et Firefox (D21) non vérifiés à la main ;
  - S10 : rien de nouveau ; la couture de la texture des thermoclines (point ouvert de S08) reste à traiter.
- **Retour arrière** : `git revert` par sous-fonction (lampe `1f277ed`, onglets `b6701a3`, lieux `ce4d720` + `f213bf3`) ; sans le module de mouvement, les Spécialités et les Lieux restent complets et statiques.

### S11 — 2026-10-02 (consentement, mesure, SEO, CSP ; en parallèle de S06, worktree `refonte/s11`)
- **Fait** : `consent-default.js` (défauts refusés ou relus dans `cc_cookie`, `ads_data_redaction`, balise Google en production seulement, `bvLoadGoogleTag()`), bandeau vanilla-cookieconsent 3.1.0 (contrôleur `consent`, textes FR/EN, styles chargés à la demande, ton `deep`, « Gérer les cookies » branché, `html[data-consent-open]` masque le HUD et WhatsApp), `events.ts` et `consent-mode.ts` (TDD), conversions formulaire, WhatsApp et téléphone ; tableau des cookies et signaux sans cookie dans Confidentialité (FR/EN) ; OG, Twitter, `theme-color`, JSON-LD `@graph` (TDD, accueil), `robots.txt`, `llms.txt`, alternates `hreflang` de toutes les pages du sitemap ; `ops/nginx/security-headers.conf`, `serve-with-csp.mjs`, projet Playwright `csp`.
- **Repli I-06 / I-07** (non fournis, D36) : mode avancé, libellés de conversion `null` (aucune conversion Ads), `GA4_ID = null` en attendant l'assistant de balises.
- **Vérifications** (worktree) : build + `check:dist` ; `astro check` 0/0/0 ; 448 tests Vitest (99,5 % des lignes) ; E2E 144 réussis, 20 sautés ; a11y 28/28 ; `csp` 0 violation (essai de mutation : un script inline injecté est détecté) ; aucun script inline dans `dist/` ; budgets : JS initial 3,0 Ko, total 53,9 Ko, CSS 11,3 Ko. Après fusion avec S06 : voir l'entrée S06.
- **Constats** : la librairie se cache aux robots (`navigator.webdriver`), les tests se présentent comme un visiteur ; Astro liait le CSS d'un module chargé dynamiquement sur toutes les pages (+5,5 Ko gzip bloquants), d'où le chargement par `?url` ; l'option `i18n` du sitemap n'apparie que des chemins identiques ; axe mesurait le contraste pendant la transition d'ouverture du bandeau.
- **Revue** (`security-reviewer`, Sonnet, une passe, à la fusion) : 0 CRITICAL, 0 HIGH. MEDIUM : mode avancé = pings sans cookie avant consentement (choix I-07 de Nicholas, D36) ; `www.google.com` en `script-src` (risque accepté, D38). LOW corrigés : serveur de test `serve-with-csp.mjs` (barres obliques initiales, fichier manquant) ; LOW laissés pour S13 : jokers `*.google.*`, `preload` HSTS (repris du site en ligne), COOP/CORP, `ads_data_redaction` (sans effet une fois `ad_storage` accordé).
- **Commits** : `08eb4f6`, `2dfac40`, `767961d`, `2a8bc37`, `30fc50b`, `e57e1dd`, `3542d62`, `3501ed6`, `33d6b79`, fusion, `dbc9dd2`.
- **Points ouverts** :
  - I-06 : libellés de conversion Ads, puis vérifier dans l'assistant de balises si GA4 est déjà une destination de la balise ; sinon `GA4_ID = 'G-QG5ZCVY1Z7'` ;
  - I-07 : si Nicholas choisit le mode basique, changer `MODE` et retirer la phrase sur les signaux anonymes dans Confidentialité (FR/EN) ;
  - S13 : relever en production les cookies réellement déposés (noms et durées du tableau) et vérifier l'effacement automatique de `_ga` sur `.bullesenvalais.ch` ; aucune violation CSP en production avant et après consentement ; `include` du fichier d'en-têtes dans chaque `location` qui a ses propres `add_header` ; trancher `report-uri` ; resserrer les jokers Google (D38).
- **Retour arrière** : `git revert` des commits S11 ; rien n'est appliqué en production.
