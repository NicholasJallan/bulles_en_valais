# S10 — Remontée : Préparer, Bons cadeaux, Témoignages, Palier FAQ, Contact, WhatsApp

| | |
|---|---|
| Branche | `refonte/la-descente` |
| Dépend de | S06 (et S08 pour le moteur de bulles) |
| Taille | L (points de sortie après les tâches 3 et 5) |
| Modèle conseillé | Opus 5.5 |
| Skills / agents | `frontend-design:frontend-design` ; `design:ux-copy` pour les messages du formulaire ; agents `code-reviewer` **et `security-reviewer`** (formulaire) |
| Inputs | I-12 (détails des bons cadeaux), I-09 (témoignages) |
| Gate | — |

## Brief de contexte

La remontée : de 22 m à la surface. « Avant de s'immerger » (matériel et assurances), **Bons cadeaux** (nouveau, D6), témoignages, **palier de sécurité** (la FAQ, 5 m pendant 3 min) et retour à la **surface** pour parler : le contact, sous une « fenêtre de Snell ». Le formulaire reçoit sa forme définitive (succès en gerbe de bulles, échec avec alternatives).

À lire : `01-direction-artistique.md` §7 (E6, E7, E11 à E14) · `02-architecture.md` §11.

## Préconditions

- S06 et S08 cochées.

## Tâches

1. **Avant de s'immerger** : révélations (E6) des cartes matériel et assurances ; liens partenaires via `RichText` ; ancres `#gear` et `#insurance` fonctionnelles.
2. **Bons cadeaux** (E11) :
   - `GiftCard` : format 1,586:1, reflet caustique irisé (dégradés CSS + masque), inclinaison ≤ 8° au pointeur (`gsap.quickTo` sur `rotateX` et `rotateY`, perspective 800 px), au gyroscope **non** (évite les demandes de permission) ;
   - offres, « comment ça marche » en 3 étapes et conditions selon I-12 ;
   - CTA « Offrir » : `data-prefill-interest="gift"` → sélectionne « Bon cadeau » dans le formulaire, défile jusqu'au contact et place le focus sur le premier champ.
3. **Témoignages** (E12) : rail `scroll-snap` + boutons précédent/suivant (état désactivé aux extrémités), indicateur de progression, glisser à la souris en amélioration progressive, parallaxe légère des guillemets ; `lang` corrects ; mentions de traduction (I-09).

   > 🔁 Point de sortie possible.
4. **Palier de sécurité — FAQ** (E13) : ouverture fluide (`interpolate-size: allow-keywords` et `::details-content` là où c'est supporté, sinon `grid-template-rows: 0fr → 1fr` via une classe) ; `hud.setMode('safety-stop')` tant que la section est visible (compte à rebours depuis 3:00, en pause hors de la vue, remise à zéro douce) ; sur-titre « Palier de sécurité · 5 m · 3 min ».
5. **Contact — surface** (E14) :
   - fenêtre de Snell (disque de lumière doux derrière le titre, léger miroitement), fond qui s'éclaircit jusqu'à l'écume ; accroche « Sous l'eau, on ne parle pas. Remontons. » ;
   - formulaire final : succès → **gerbe de bulles** + message + appel à `analytics.trackLead()` (sans effet jusqu'à S11) ; erreurs 400 → messages par champ ; 429 → « Trop d'envois, réessayez dans une minute » ; 500 ou réseau → message clair + bouton « Envoyer par e-mail » (`mailto:` pré-rempli, **au clic seulement**) + lien WhatsApp ;
   - canaux (WhatsApp, téléphone, e-mail) : icônes animées au survol en `transform` (plus de `padding` animé).

   > 🔁 Point de sortie possible.
6. **WhatsApp** : bouton flottant et dialogue aux couleurs de la marque (fini le clone de l'interface WhatsApp) ; `<dialog>` modal, `data-lenis-prevent`, `lenis.stop()` et `start()`, focus initial dans le champ, `Esc`, focus rendu au bouton ; lien `wa.me` encodé, ouvert en `noopener noreferrer`. Ne jamais chevaucher le HUD mobile ni le bandeau cookies.
7. **PHP** (`public/api/contact.php`, **compatible PHP 7.4**, TDD) :
   - vérifier que `ALLOWED_INTERESTS` contient `gift` (S03) ;
   - **plafond quotidien d'envois** (décidé en S00, risque d'épuisement du quota Gmail : un robot aux IP tournantes contourne la limite nginx par IP) : compteur `jour + nombre` dans un fichier verrouillé (`flock`), **hors docroot**, écrit par `www-data` ; au-delà d'un plafond (proposer 50 par jour à Nicholas), réponse `503 {ok:false,error:"busy"}` sans envoi, journalisée sans donnée personnelle ; si le compteur est illisible, envoyer quand même et journaliser (on ne perd pas un vrai message pour un souci de fichier) ; le client affiche alors le message d'échec avec ses alternatives ;
   - **rendre `elapsed` obligatoire** (absent → `too_fast`) : le nouveau client l'envoie toujours ; S00 l'avait rendu facultatif pour les pages chargées avant son déploiement ;
   - **envoi sans JavaScript** (reporté de S05) : aujourd'hui `contact.php` n'accepte que du JSON, donc sans JS le formulaire affiche un avis (`contact.form.noScript`) et renvoie vers WhatsApp, le téléphone et l'e-mail. Option à soumettre à Nicholas : accepter aussi `application/x-www-form-urlencoded` (même `Origin`, mêmes règles) et répondre par une redirection 303 vers une page de confirmation ou d'erreur. Conflit à trancher : sans JS, pas d'`elapsed` (donc pas de garde « trop rapide ») ; soit ce chemin n'a que le pot de miel, soit on garde l'avis. Revue de sécurité obligatoire si le chemin est ouvert ;
   - optionnel (revue S00, risque faible) : délai global d'environ 30 s pour tout le dialogue SMTP, en plus du délai de 10 s par lecture ;
   - `php tests/php/contact_test.php`, `bash tests/php/run_integration.sh` et, avec l'accord de Nicholas, `bash tests/php/run_unit_php74.sh` verts.
8. **Tests** :
   - E2E : pré-remplissage cadeau (valeur, défilement, focus) ; formulaire (requêtes simulées 200 → succès avec canvas de bulles en mode mouvement, 400 → erreurs par champ, 429 → message, 500 → alternatives **sans navigation**) ; rail (boutons, clavier) ; FAQ exclusive ; mode palier du HUD ; dialogue WhatsApp (focus, `Esc`, URL générée) ;
   - accessibilité : axe sur toute la page ;
   - revue `security-reviewer` du formulaire (client + PHP).

## Vérifications

```bash
npm run build && npm run check && npm test && npm run test:e2e && npm run test:a11y
php tests/php/contact_test.php && bash tests/php/run_integration.sh
npm run check:budgets
```

## Critères de sortie

- Remontée complète et cohérente jusqu'à la surface ; formulaire robuste et accessible ; bons cadeaux fonctionnels de bout en bout (jusqu'au formulaire).
- Revue de sécurité sans CRITICAL ni HIGH.

## Retour arrière

`git revert` par sous-fonction ; le formulaire de S05 reste fonctionnel.

## 🔁 Fin de session

Session suivante : **S11** (si elle n'a pas été menée en parallèle), puis **S12**.
