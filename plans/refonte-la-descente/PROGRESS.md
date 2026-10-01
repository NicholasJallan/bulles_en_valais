# Suivi — Refonte « La Descente »

> Mis à jour à la fin de **chaque** session (protocole : `README.md`). Les décisions et mutations consignées ici **priment** sur les specs.

## État des sessions

- [x] **S00** — Correctif sécurité du formulaire (site actuel, `main`) — 30.09.2026
- [x] **S01** — Fondations Astro 7 (branche `refonte/la-descente`) — 01.10.2026
- [ ] **S02** — Design system & styleguide — 🛑 Gate 1
- [ ] **S03** — Contenus & i18n typés FR/EN — 🛑 Gate 2
- [ ] **S04** — Visuels : retouches, IA, logo, favicons, OG — 🛑 Gate 3
- [ ] **S05** — Page statique complète
- [ ] **S06** — Moteur de mouvement
- [ ] **S07** — Hero « Surface » en WebGL + immersion
- [ ] **S08** — Cursus, échelle de profondeur, interludes, bulles
- [ ] **S09** — Spécialités (lampe torche) & Lieux (parcours du Rhône)
- [ ] **S10** — Remontée : Préparer, Bons cadeaux, Témoignages, Palier FAQ, Contact, WhatsApp
- [ ] **S11** — Consentement, analytics, SEO, CSP
- [ ] **S12** — Préproduction & recette — 🛑 Gate 4
- [ ] **S13** — Mise en production, suivi, nettoyage

## Gates

| Gate | Objet | Statut | Date | Décision |
|---|---|---|---|---|
| 1 | Palette, typographie, sensation du mouvement (styleguide) | ⬜ | | |
| 2 | Textes FR/EN (`CONTENT-REVIEW.md`) | ⬜ | | |
| 3 | Visuels (hero, retouches, IA, logo animé) | ⬜ | | |
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

## Mesures

| Date | Contexte | LCP | CLS | TBT | JS gzip init./total | CSS gzip | Poids initial | LH Perf/A11y/BP/SEO |
|---|---|---|---|---|---|---|---|---|
| 2026-09-30 | **Site actuel** (prod, mobile, CPU ×4, Fast 4G, cache chaud) | 1,8 s (render delay) | 0,00 | n.m. | ~1 Mo+ (React + Babel via unpkg, non mesurable en cross-origin) | inline | ≈ 5 Mo d'images décodées | —/91/73/83 |
| 2026-10-01 | S01 : squelette sans design (`check:budgets` sur `dist/`) | n.m. | n.m. | n.m. | 0,6 / 0,6 Ko | 0,7 Ko | n.m. | n.m. |

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
