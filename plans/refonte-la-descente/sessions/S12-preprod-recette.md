# S12 — Préproduction & recette complète — 🛑 Gate 4

| | |
|---|---|
| Branche | `refonte/la-descente` |
| Dépend de | S07, S08, S09, S10, S11 ; **Gate 2 validée** |
| Taille | L (points de sortie après les tâches 4 et 6) |
| Modèle conseillé | Opus 5.5 |
| Skills / agents | `deployment-patterns`, `e2e-testing`, `verification-loop`, `design:accessibility-review` ; MCP `chrome-devtools` ; agents `security-reviewer` (serveur) et `code-reviewer` |
| Inputs | I-11 (préproduction), I-17 (accès au Pi) |
| Gate | 🛑 **Gate 4** : recette de Nicholas sur la préproduction |

## Brief de contexte

Le site est complet sur la branche. Il faut préparer le serveur pour des **déploiements atomiques par releases** (sans toucher au site en ligne), publier une **préproduction**, dérouler **toute la recette** (automatique et sur vrais appareils), corriger, puis obtenir la validation de Nicholas.

À lire : `02-architecture.md` §15 à §17 · `00-contexte.md` §2, §7 et §9 · README (actions sortantes).

## Préconditions

- S07 à S11 cochées ; Gate 2 validée ; plus aucun `TODO(I-xx)` bloquant (sinon, liste validée par Nicholas comme acceptable au lancement).

## Tâches

1. **Inventaire du serveur** (lecture seule) : contenu de `/var/www/html/dive` et de `api/`, présence de `/api/csp/report`, configuration nginx complète, version et extensions PHP, espace disque. Copier la configuration **sans secret** dans `ops/nginx/dive.conf` (référence versionnée).
2. **Structure des releases** (à confirmer) : `sudo mkdir -p /var/www/bullesenvalais/{releases,shared}` ; **copier** (sans déplacer, l'ancien site doit continuer de fonctionner) la configuration SMTP : `sudo install -m 640 -o root -g www-data /var/www/html/dive/api/mail-config.php /var/www/bullesenvalais/shared/mail-config.php`, **sans jamais afficher son contenu**. Adapter `public/api/contact.php` pour lire ce chemin (constante), avec échec franc s'il manque. Ajouter l'origine de préproduction à `ALLOWED_ORIGINS` si l'option A est retenue. Tests PHP verts.
3. **Scripts** : `ops/deploy.sh [staging|production] [--dry-run]` et `ops/rollback.sh [previous|<horodatage>]`, conformes à `02-architecture.md` §16 (nouveau dossier par release, `chown`, symlink atomique, requête de fumée, 5 releases conservées). `shellcheck` si disponible.
4. **Préproduction** (I-11) :
   - **option A** (recommandée) : `next.bullesenvalais.ch` → enregistrement DNS (par Nicholas), server block copié de `dive` avec `root /var/www/bullesenvalais/staging`, `auth_basic` (fichier créé avec `openssl passwd -apr1`), `X-Robots-Tag: noindex`, en-têtes de `ops/nginx/security-headers.conf`, PHP avec `$realpath_root`, `try_files … =404`, `error_page 404` ; certificat via `sudo certbot --nginx -d next.bullesenvalais.ch` ; `sudo nginx -t && sudo systemctl reload nginx` ;
   - **option B** : la prévisualisation sur le Pi (`npm run preview:pi -- --apply`, `https://dive.bullesenvalais.ch/preview/`, D42), déjà en place depuis S09 : sans mot de passe ni en-têtes finaux (elle tourne sous la CSP de l'ancien site), sans `contact.php` à jour ni 404 propre ; elle suffit pour la recette visuelle et sur appareils, pas pour celle du serveur.
   Déployer : `ops/deploy.sh staging`.

   > 🔁 Point de sortie possible.
5. **Recette automatique** :
   - `npm test`, `npm run coverage` (≥ 80 %), tests PHP (unitaires et intégration) ;
   - `npm run test:e2e` (projets Chromium, WebKit, Pixel 7, iPhone 15 ; Firefox seulement si une mise à jour de Playwright l'a rétabli, D21) ;
   - `npm run test:visual` : générer les références aux 4 largeurs, **les revoir une par une**, puis les committer ;
   - `npm run test:a11y` (FR, EN, pages légales, bandeau ouvert) ;
   - `npx playwright test --project=csp` ;
   - sur la préproduction : Lighthouse mobile et trace (MCP `chrome-devtools`, en-tête `Authorization` via `emulate.extraHttpHeaders` pour l'option A) → consigner dans le tableau Mesures de `PROGRESS.md` ; `npm run check:budgets`.
6. **Recette manuelle** (avec Nicholas, sur de vrais appareils : iPhone Safari, Android Chrome, Mac Safari, Chrome, et Firefox s'il fonctionne, D21) :
   - fluidité du scroll, HUD, hero et immersion, échelle, lampe, lieux, bons cadeaux, rail, palier, contact ;
   - clavier seul de bout en bout ; lecteur d'écran (VoiceOver) sur le hero, les onglets, la FAQ et le formulaire ;
   - mouvement réduit système **et** Mode calme ;
   - **envoi réel** d'un message depuis la préproduction → reçu, accents et `Reply-To` corrects ;
   - pages légales, 404, sélecteur de langue, liens partenaires, WhatsApp, téléphone.

   > 🔁 Point de sortie possible.
7. **Corrections** : un commit par anomalie, test de non-régression quand c'est possible, redéploiement en préproduction.
8. 🛑 **Gate 4** : Nicholas valide la préproduction (checklist du point 6 cochée) **et** fixe le créneau de mise en ligne. Consigner dans `PROGRESS.md`.

## Vérifications

```bash
npm run build && npm run check && npm test && npm run coverage
npm run test:e2e && npm run test:visual && npm run test:a11y && npx playwright test --project=csp
php tests/php/contact_test.php && bash tests/php/run_integration.sh
ops/deploy.sh staging --dry-run
curl -sI -u "<user>:<pass>" https://next.bullesenvalais.ch/ | grep -iE "content-security|strict-transport|x-robots"
```

## Critères de sortie

- Toutes les suites vertes ; mesures conformes à `00-contexte.md` §7 ; checklist manuelle complète ; Gate 4 validée.
- Le site en ligne n'a pas bougé (`/var/www/html/dive` intact).

## Retour arrière

La préproduction est indépendante : supprimer le server block `next` et le dossier `/var/www/bullesenvalais` suffit.

## 🔁 Fin de session

Session suivante : **S13 — Mise en production**, au créneau fixé avec Nicholas.
