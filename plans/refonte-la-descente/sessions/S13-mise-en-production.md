# S13 — Mise en production, suivi, nettoyage

| | |
|---|---|
| Branche | `refonte/la-descente`, puis fusion dans `main` |
| Dépend de | S12 + 🛑 Gate 4 validée |
| Taille | M |
| Modèle conseillé | Opus 5.5 |
| Skills / agents | `deployment-patterns`, `security-review` ; MCP `chrome-devtools` ; agent `security-reviewer` ; `schedule` (optionnel, contrôle à J+7) |
| Inputs | I-16 (domaine canonique, optionnel) ; présence de Nicholas pendant la bascule |
| Gate | 🛑 feu vert explicite de Nicholas juste avant la bascule |

## Brief de contexte

La préproduction est validée. On bascule `dive.bullesenvalais.ch` sur la nouvelle release (symlink atomique), on applique la configuration nginx finale (plus de repli SPA, vraie 404, cache, CSP finale, limite de débit), on vérifie tout en production, on garde l'ancien site intact en secours, puis on nettoie le dépôt et on fusionne.

À lire : `02-architecture.md` §14 et §16 · `00-contexte.md` §2 · `sessions/S12-preprod-recette.md` (état du serveur).

## Préconditions

- Gate 4 validée ; créneau confirmé ; tests verts sur le dernier commit ; `ops/deploy.sh production --dry-run` propre.

## Tâches

1. **Sauvegardes** : copie datée de la configuration nginx ; vérifier que `/var/www/html/dive` (ancien site) est intact. Il sert de retour arrière pendant au moins 2 semaines.
2. **Nettoyage avant build** : supprimer `src/pages/styleguide.astro` (et ses composants de démo), `scripts/preview-pi.mjs` avec `scripts/lib/preview-page.*` et le script `preview:pi` (ils visent l'ancien docroot, D42 ; une prévisualisation future passera par `ops/deploy.sh staging`), puis `legacy/` ; vérifier que `dist/` ne contient plus de `styleguide` ; tests verts ; commit `chore: remove styleguide and legacy site`.
3. **Release de production** : `ops/deploy.sh production` → `releases/<horodatage>/` et symlink `current`. La release n'est pas encore servie : nginx pointe toujours vers l'ancien docroot.
4. **nginx `dive`** (feu vert de Nicholas juste avant) :
   - `root /var/www/bullesenvalais/current;` ;
   - PHP : `fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;` et `fastcgi_param DOCUMENT_ROOT $realpath_root;` ; correspondance `/api/contact` → `contact.php` conservée ; seul `contact.php` exécute du PHP (`location = /api/contact.php` avec sa limite de débit, tout autre `.php` → 404, comme depuis S00) ;
   - `try_files $uri $uri/ =404;` et `error_page 404 /404.html;` (fin du repli SPA) ;
   - cache : `/_astro/` 1 an `immutable`, images et polices 30 jours, HTML `no-cache` ; `gzip` pour les types texte ;
   - `include` de `ops/nginx/security-headers.conf` (CSP finale **sans** `unsafe-eval`, **sans** unpkg, **sans** script inline) dans le bloc `server` **et** dans chaque `location` qui pose ses propres `add_header` (nginx ne les hérite pas) ; limite de débit de `/api/contact` conservée ;
   - formulaire (S10) : vérifier où PHP-FPM écrit le compteur du plafond quotidien (`sys_get_temp_dir()/bulles-contact-quota` ; `PrivateTmp` du service `php7.4-fpm` ?), et le déplacer au besoin dans un dossier à `www-data` seul (ex. `/var/www/bullesenvalais/shared/`) par la constante `QUOTA_FILE` / `quota_path()` ; après la mise en ligne, un envoi réel doit créer le compteur (`AAAA-MM-JJ 1`) ;
   - rapports CSP (reporté de S11) : soit `public/api/csp-report.php` (JSON ≤ 8 Ko, journal hors docroot, sa propre `location` exacte limitée en débit, `check:dist` à étendre), soit pas de `report-uri` du tout ; trancher avec Nicholas ;
   - `sudo nginx -t && sudo systemctl reload nginx`.
5. **Vérifications immédiates** :
   - `curl -sI` : 200 sur `/` et `/en/`, en-têtes attendus, 404 réelle sur une URL inconnue, `robots.txt` et `sitemap-index.xml` servis en texte ou XML, 301 conservées depuis `bullesenvalais.ch` et `www.` ;
   - `/api/contact` : `GET` → 405, `POST` sans `Origin` → 403 ; **message réel** envoyé par Nicholas → reçu ;
   - MCP `chrome-devtools` : aucune erreur console, **aucune violation CSP**, après consentement comme sans ; bandeau fonctionnel ;
   - assistant de balises Google (avec Nicholas) : balise Ads et GA4 actives après consentement, conversions déclenchées (formulaire, WhatsApp, téléphone) ; temps réel GA4 ;
   - Lighthouse mobile en production → tableau Mesures de `PROGRESS.md` ;
   - ancres historiques (`/#agencies`, `/#contact`, etc.) et liens des annonces Google Ads.
6. **Retour arrière si besoin** : `ops/rollback.sh previous` (release précédente) ou, en dernier recours, rétablir `root /var/www/html/dive;` depuis la sauvegarde nginx, puis `nginx -t` et `reload`. Consigner tout incident.
7. **Search Console** (Nicholas, guidé par l'agent) : propriété vérifiée, sitemap soumis, inspection de `/` et `/en/`, demande d'indexation. Domaine canonique (I-16) : ne rien changer sans décision explicite.
8. **Documentation** : mettre à jour `README.md` (présentation, commandes, déploiement par releases) et `CLAUDE.md` (architecture finale, déploiement avec `ops/deploy.sh`, règles i18n, budgets) ; `.gitignore` final.
9. **Fusion** : PR `refonte/la-descente` → `main` avec `gh pr create` (résumé complet, plan de test coché, captures), fusion après accord de Nicholas, tag `v2.0.0`, push du tag.
10. **Suivi** :
   - J+1 : journaux nginx (404 inattendues, 429, 5xx), messages du formulaire reçus, conversions Ads ;
   - J+7 : couverture Search Console, erreurs PHP, performance ; proposer à Nicholas une vérification planifiée (`/schedule`) ;
   - J+14 : si tout va bien, et avec l'accord de Nicholas, archiver puis supprimer l'ancien docroot `/var/www/html/dive` (en gardant `mail-config.php` dans `shared/` seulement) et les releases au-delà des 5 dernières.
11. **Mémoire** : mettre à jour la mémoire projet (plan terminé, architecture finale, procédure de déploiement).

## Vérifications

```bash
ops/deploy.sh production --dry-run
curl -sI https://dive.bullesenvalais.ch/ | grep -iE "content-security|strict-transport|cache-control"
curl -s -o /dev/null -w "%{http_code}\n" https://dive.bullesenvalais.ch/cette-page-nexiste-pas/    # 404
curl -s https://dive.bullesenvalais.ch/robots.txt | head -3
```

## Critères de sortie

- Site en ligne sur la nouvelle release, conforme à la Definition of Done du README ; conversions et GA4 reçus ; retour arrière documenté et testé (au minimum en préproduction).
- Branche fusionnée, tag `v2.0.0`, documentation à jour, `PROGRESS.md` clôturé.

## 🔁 Fin du plan

Consigner dans `PROGRESS.md` le bilan (mesures avant/après, écarts, idées pour la suite : allemand, vidéo, journal de plongées).

Suite proposée à Nicholas une fois le site en ligne : **`plans/mesure-google/README.md`**, phase A (GA4 reçoit des données, tableau des cookies relevé en production), puis B à D quand il le décide (D40).
