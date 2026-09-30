# Suivi — Refonte « La Descente »

> Mis à jour à la fin de **chaque** session (protocole : `README.md`). Les décisions et mutations consignées ici **priment** sur les specs.

## État des sessions

- [x] **S00** — Correctif sécurité du formulaire (site actuel, `main`) — 30.09.2026
- [ ] **S01** — Fondations Astro 7 (branche `refonte/la-descente`)
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

## Mesures

| Date | Contexte | LCP | CLS | TBT | JS gzip init./total | CSS gzip | Poids initial | LH Perf/A11y/BP/SEO |
|---|---|---|---|---|---|---|---|---|
| 2026-09-30 | **Site actuel** (prod, mobile, CPU ×4, Fast 4G, cache chaud) | 1,8 s (render delay) | 0,00 | n.m. | ~1 Mo+ (React + Babel via unpkg, non mesurable en cross-origin) | inline | ≈ 5 Mo d'images décodées | —/91/73/83 |

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
