# S00 — Correctif sécurité du formulaire (site actuel)

| | |
|---|---|
| Branche | `main` (site en ligne, architecture actuelle) |
| Dépend de | — |
| Taille | M |
| Modèle conseillé | Opus 5.5 |
| Skills / agents | `security-review` ; agents `security-reviewer` puis `code-reviewer` en fin de session |
| Inputs | I-01 (changements non commités), I-17 (accès au Pi, `brew install php`) |
| Gate | — (chaque action sortante est confirmée par Nicholas) |

## Brief de contexte

`api/contact.php` (dépôt **public**) relaie le formulaire du site vers Gmail via un client SMTP maison (STARTTLS + AUTH LOGIN). Il contient une **faille critique** :

- l'échappement des lignes qui commencent par « . » utilise `preg_replace('/^\./', '..', $body)` **sans le modificateur `m`** : seule la première ligne est traitée ;
- le nom, l'intérêt et le message gardent leurs `\r\n` ; le nom est injecté tel quel dans l'en-tête `Subject` ;
- en-têtes et corps partent bruts dans la commande `DATA`.

Un corps JSON forgé contenant `\r\n.\r\n` termine donc le message, puis injecte de nouvelles commandes SMTP (`MAIL FROM`, `RCPT TO`, `DATA`) dans la session **authentifiée** du compte Gmail de Nicholas : le site peut servir de relais de spam. S'y ajoutent l'injection d'en-têtes par le nom, l'absence de limite de débit, de pot de miel et de contrôle d'origine.

Autre défaut : les classes `.form-confirmed*`, `.form-error`, `.contact-left` et `.contact-lead` n'existent que dans `styles.css`, qui n'est pas chargé : le panneau de succès et les erreurs du formulaire ne sont pas stylés en production.

À lire : `00-contexte.md` §2 et §4 · `02-architecture.md` §11.

## Préconditions

- Branche `main` ; `git status` montre les changements non commités décrits en `00-contexte.md` §4.4.
- Nicholas a confirmé I-17 (ssh + sudo sur le Pi, installation de PHP en local).

## Tâches

1. **Changements en cours (I-01)** : montrer `git diff --stat` et résumer. Si Nicholas valide : `git add components/ && git commit -m "content: put SDI/TDI first and update FFESSM to E4"`. Sinon : `git stash push -m "wip-content-2026-09"`.
2. **Outils** : `brew install php`, puis vérifier `php -v`. Sur le Pi, en lecture seule : `ssh pi@bullesenvalais.ch 'php -v; php -m | grep -iE "mbstring|openssl|json"'`. Ne pas dépendre de `mbstring` s'il est absent.
3. **Incident — y a-t-il eu abus ?** (lecture seule) : volume de `POST /api/contact` dans les journaux nginx (`sudo zgrep -h "POST /api/contact" /var/log/nginx/dive.access_log* | awk '{print $1}' | sort | uniq -c | sort -rn | head`), recherche de corps anormaux si disponibles. Demander à Nicholas de vérifier le dossier « Envoyés » de Gmail et les alertes de sécurité Google. **Au moindre doute : Nicholas régénère le mot de passe d'application Gmail** et met à jour `mail-config.php` lui-même. Ne jamais lire ni afficher ce fichier.
4. **Tests d'abord (RED)** — `tests/php/contact_test.php`, un petit harnais d'assertions sans dépendance, qui `define('CONTACT_NO_AUTORUN', true)` puis `require` le fichier. Cas à couvrir :
   - `normalize_newlines("a\nb\r\nc\rd") === "a\r\nb\r\nc\r\nd"` ;
   - `sanitize_header("Bob\r\nBcc: x@y.z")` ne contient ni `\r` ni `\n` ;
   - `encode_header("Contact — Élodie")` produit des mots encodés `=?UTF-8?B?…?=` qui se décodent à l'identique, sans ligne de plus de 76 caractères ;
   - `encode_body("l1\r\n.\r\nMAIL FROM:<x@y.z>")` contient uniquement `[A-Za-z0-9+/=\r\n]`, aucune ligne égale à « . », et se décode à l'identique ;
   - `validate_payload()` : nom manquant ou > 100 caractères, e-mail invalide ou > 254, téléphone hors `^[0-9 +().\-]{0,40}$`, message > 5000 → erreurs ; intérêt inconnu → `other` ;
   - `is_spam()` : pot de miel `website` rempli → vrai ; `elapsed` < 3000 → vrai ; cas normal → faux ;
   - `origin_allowed()` : `https://dive.bullesenvalais.ch`, `https://bullesenvalais.ch` et `https://www.bullesenvalais.ch` → vrai ; autre origine ou vide → faux.
   `php tests/php/contact_test.php` doit échouer.
5. **Correctif (GREEN)** — réécrire `api/contact.php` :
   - `declare(strict_types=1);`, constantes `ALLOWED_ORIGINS`, `ALLOWED_INTERESTS` (valeurs actuelles : `baptism sdi-owd sdi-aowd sdi-rescue tdi padi-owd padi-aowd padi-rescue padi-dm ffessm specialty refresher other`), limites ;
   - fonctions pures du point 4 et `handle_request()`, appelée seulement si `!defined('CONTACT_NO_AUTORUN')` ;
   - contrôles dans l'ordre : méthode (`OPTIONS` → 204, autre que `POST` → 405), `Content-Type: application/json` → sinon 403, `Origin` autorisée → sinon 403, corps ≤ 32 Ko → sinon 413, JSON valide → sinon 400, spam → `200 {ok:true}` sans envoi, validation → `400` avec `fields` ;
   - message : en-têtes nettoyés, `Subject` et nom affiché de `From` encodés RFC 2047, `Reply-To` seulement si l'e-mail est valide, `Content-Type: text/plain; charset=UTF-8`, **`Content-Transfer-Encoding: base64`** (corps normalisé en CRLF, `chunk_split(base64_encode(…), 76, "\r\n")`), échappement des points conservé en défense en profondeur (`/m`) ;
   - `$cfg['starttls'] ?? true` (vrai par défaut, désactivable pour les tests) ; `QUIT` et fermeture du socket sur tous les chemins ; `error_log` sans donnée personnelle ;
   - rester compatible avec les clés actuelles de `mail-config.php` (`host`, `port`, `user`, `pass`, `from`, `to`), telles que les lit le code existant.
6. **Intégration** — `tests/php/fake_smtp.py` (Python stdlib `socketserver`, sans STARTTLS, annonce `PIPELINING`, accepte `AUTH LOGIN`, journalise commandes et contenus `DATA` dans un JSON), `tests/php/test-config.php` (localhost:2525, `starttls => false`, identifiants factices), `tests/php/router.php` (définit le chemin de config de test, puis inclut `api/contact.php`), `tests/php/run_integration.sh` : démarre le faux serveur et `php -S 127.0.0.1:8099 tests/php/router.php`, puis vérifie avec `curl` :
   - requête normale → une seule transaction (1 `MAIL FROM`, 1 `RCPT TO`, 1 `DATA`) ;
   - **charge malveillante** (message avec `\r\n.\r\nMAIL FROM:<a@b.c>\r\nRCPT TO:<victim@example.com>\r\nDATA\r\n…`, nom avec `\r\nBcc: victim@example.com`) → toujours **une seule** transaction vers le destinataire configuré ; le corps décodé contient le texte littéral ;
   - sans `Origin` → 403 ; pot de miel → 200 sans transaction ; corps > 32 Ko → 413.
   Le chemin de config de test ne doit pas pouvoir être piloté depuis la requête HTTP : constante définie par le routeur de test, jamais par une variable d'environnement lue en production.
7. **Client (site actuel)** — `components/Contact.jsx` : champ pot de miel `website` (enveloppe `aria-hidden="true"`, `tabIndex={-1}`, `autoComplete="off"`, classe `.hp` hors écran), envoi de `elapsed` (horodatage d'affichage via `useRef`) ; sur réponse non OK : `setStatus('err')` et afficher `t.contact.form.error` avec un lien `mailto:` pré-rempli (plus d'ouverture automatique). Copier dans le `<style>` d'`index.html` les règles `.form-confirmed*`, `.form-error`, `.contact-left` et `.contact-lead` depuis `styles.css`, ajouter `.hp`. Vérifier à l'œil en local (`python3 -m http.server 8000`, requête vers `/api/contact` simulée ou en échec).
8. **Limite de débit nginx** (action sortante, à confirmer) : sauvegarder `/etc/nginx/sites-available/bullesenvalais` en `.bak-<date>`, **lire** le fichier pour repérer le bloc qui sert `/api/contact`, puis ajouter `limit_req_zone $binary_remote_addr zone=contact:1m rate=5r/m;` au niveau `http` (en tête du fichier de site, hors des `server`) et, dans ce bloc, `limit_req zone=contact burst=3 nodelay; limit_req_status 429; client_max_body_size 32k;`. Puis `sudo nginx -t && sudo systemctl reload nginx`.
9. **Déploiement** (à confirmer) : `rsync -av --rsync-path="sudo rsync"` fichier par fichier vers leurs dossiers respectifs sous `/var/www/html/dive/`, puis `sudo chown -R www-data:www-data /var/www/html/dive`. **Ne jamais synchroniser tout le projet** (le dossier `plans/` serait publié). Fichiers à envoyer :
   - toujours : `api/contact.php`, `components/Contact.jsx` et `index.html` ;
   - **si les changements en cours ont été validés (I-01)** : aussi `components/{About,Agencies,Compare,Hero,Specialties}.jsx` et `components/i18n.jsx`. Sinon la page afficherait un mélange (« E4 » dans le contact, « E3 #28663 » ailleurs) ;
   - s'ils ont été mis de côté (`stash`), `Contact.jsx` ne contient que les modifications de S00.
10. **Vérifications en production** : `GET /api/contact` → 405 ; `POST` sans `Origin` → 403 ; rafale de 8 `POST` sans `Origin` → apparition de 429 ; Nicholas envoie un vrai message depuis le site → reçu, objet et accents corrects, `Reply-To` correct. **Aucune charge malveillante contre la production.**
11. **Commits puis push** (après le déploiement) : `fix(security): prevent SMTP injection in contact endpoint` · `test: add contact endpoint unit and integration tests` · `fix(contact): add honeypot and style confirmation and error states`. Ensuite `docs(plan): add redesign plan "La Descente"` (dossier `plans/`, désormais publiable), puis `git push origin main`.
12. **`CLAUDE.md`** : corriger la section Contact (un backend PHP existe : relais SMTP Gmail, configuration uniquement sur le Pi, limite de débit, commandes de test) et la mention « static, no PHP ». Commit `docs: document contact backend and tests`.

## Vérifications

```bash
php tests/php/contact_test.php          # tout vert
bash tests/php/run_integration.sh       # 1 transaction par requête, charge malveillante neutralisée
curl -s -o /dev/null -w "%{http_code}\n" https://dive.bullesenvalais.ch/api/contact                                         # 405
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Content-Type: application/json" -d '{}' https://dive.bullesenvalais.ch/api/contact   # 403
```

## Critères de sortie

- Tests unitaires et d'intégration PHP verts ; revue `security-reviewer` sans CRITICAL ni HIGH.
- Production : 405 / 403 / 429 conformes ; message réel reçu.
- Commits poussés sur `main` ; `plans/` committé **après** la mise en production du correctif.
- `PROGRESS.md` : S00 cochée, journal (dont le résultat de la vérification d'abus), I-01 et I-17 mis à jour.

## Retour arrière

- Code : `git show <commit-précédent>:api/contact.php > /tmp/contact.php`, puis `rsync` de ce seul fichier et `chown`.
- nginx : restaurer la sauvegarde `.bak-<date>`, puis `sudo nginx -t && sudo systemctl reload nginx`.

## 🔁 Fin de session

Session suivante : **S01 — Fondations Astro 7**.
