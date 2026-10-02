# Mesure Google (GA4, puis Google Ads) — plan dédié

> Rédigé le 02.10.2026, à la fin de S06 ∥ S11 de la refonte « La Descente ». Tâche **différée** : à lancer quand
> Nicholas le décide, **après la mise en production de la refonte (S13)**. Une session Claude Code qui démarre à
> froid doit pouvoir l'exécuter avec ce seul fichier, plus `plans/refonte-la-descente/PROGRESS.md` (décisions D36,
> D38 et D39).

## Prompt de démarrage

```
Exécute le plan plans/mesure-google/README.md, phase <A|B|C|D>.
Lis d'abord ce fichier, puis plans/refonte-la-descente/PROGRESS.md (décisions D36, D38, D39, D40).
Arrête-toi à la fin de la phase.
```

## Contexte (état au 02.10.2026)

- **Identifiants confirmés par Nicholas** : balise Google / Google Ads `AW-10798308119`, propriété GA4
  `G-QG5ZCVY1Z7`. Ils appartiennent bien au site.
- **Usage actuel** : **aucune campagne payante en cours**. Nicholas ne fait que suivre l'activité du site. Les
  conversions Google Ads ne servent donc à rien pour l'instant : la priorité est que **GA4 reçoive des données**.
- **GA4 est déjà une destination de la balise `AW-10798308119`** : vérifié le 02.10.2026 en lisant le script public
  `https://www.googletagmanager.com/gtag/js?id=AW-10798308119` (il contient `vtp_instanceDestinationId:"G-QG5ZCVY1Z7"`).
  Charger la balise suffit : **ne pas** ajouter `gtag('config','G-QG5ZCVY1Z7')`, sinon les pages vues seraient
  comptées deux fois. Contrôle rapide : `curl -s "https://www.googletagmanager.com/gtag/js?id=AW-10798308119" | grep -c G-QG5ZCVY1Z7` (≥ 1).
- **Consentement** : Consent Mode v2 en mode **avancé** (D39) : la balise se charge dès l'arrivée, avec des valeurs
  refusées par défaut, puis passe à « accordé » selon le choix du visiteur dans le bandeau.
- **Pourquoi rien n'arrive aujourd'hui dans GA4** : le site en ligne (ancien site, `main`) a une CSP qui bloque
  `*.google-analytics.com`. La refonte corrige ce point (CSP finale de S11), appliquée en production en S13.

### Où se trouve le code

| Réglage | Fichier | Valeur actuelle |
|---|---|---|
| Mode de consentement | `public/js/consent-default.js` (`MODE`) | `'advanced'` |
| Configuration GA4 en double | `public/js/consent-default.js` (`GA4_ID`) | `null` (à garder, voir ci-dessus) |
| Garde de production | `public/js/consent-default.js` (`bvLoadGoogleTag`) | balise chargée seulement si `location.hostname === 'dive.bullesenvalais.ch'` |
| Libellés des conversions Ads | `src/lib/analytics/events.ts` (`CONVERSION_LABELS`) | `{ lead: null, whatsapp: null, phone: null }` |
| Événements GA4 envoyés | `src/lib/analytics/events.ts` | `generate_lead` (formulaire envoyé, sauf robot), `whatsapp_click` (lien `wa.me`), `phone_click` (lien `tel:`) |
| Branchement des clics | `src/components/consent/conversions.ts` | — |
| CSP (domaines Google) | `ops/nginx/security-headers.conf` | jokers `*.google.*` acceptés (D38) |
| Tableau des cookies | `src/i18n/legal/{fr,en}.ts` | noms et durées tirés de la documentation Google |

## Phases

Chaque phase est courte (≤ 1 h) et indépendante. Les actions dans les interfaces Google sont faites **par Nicholas**,
guidé pas à pas par la session (les menus Google changent souvent : la session vérifie le chemin du jour et
s'adapte). Les chemins de clic ci-dessous sont indicatifs.

### Phase A — GA4 reçoit des données (juste après S13, sans rien paramétrer chez Google)

1. Sur le site en production, accepter les cookies, naviguer, puis ouvrir GA4 → **Rapports → Temps réel** : la visite
   doit apparaître en moins d'une minute.
2. Refuser les cookies dans une fenêtre privée : GA4 ne doit recevoir que des signaux sans cookie (mode avancé), et
   aucun cookie `_ga` ne doit être déposé (outils de développement → Application → Cookies).
3. Console du navigateur : aucune violation CSP, ni avant ni après le consentement.
4. Relever les cookies réellement déposés (`_ga`, `_ga_QG5ZCVY1Z7`, `_gcl_au`, `cc_cookie`) avec leurs durées,
   corriger le tableau de la page Confidentialité (FR et EN, parité) si besoin, puis committer.
5. Optionnel : `https://tagassistant.google.com` sur `https://dive.bullesenvalais.ch/` montre la balise, la
   destination GA4 et l'état du consentement.

**Fait quand** : visite visible en temps réel, aucune violation CSP, tableau des cookies exact.

### Phase B — Suivre les prises de contact dans GA4 (interface GA4 seulement, pas de code)

1. Déclencher une fois chaque événement en production : un envoi réel du formulaire, un clic WhatsApp, un clic
   téléphone (après acceptation des cookies).
2. GA4 → **Administration → Affichage des données → Événements** : `generate_lead`, `whatsapp_click` et
   `phone_click` apparaissent (jusqu'à 24 h de délai).
3. Les marquer comme **événements clés** (étoile ou bouton « Marquer comme événement clé »).
4. Optionnel : un rapport « Prises de contact » (Explorer → formulaire libre : événements clés par jour, par
   source et support).

**Fait quand** : les trois événements sont marqués comme événements clés et visibles dans les rapports.

### Phase C — Conversions Google Ads (seulement si des campagnes payantes reprennent)

Deux options, à trancher avec Nicholas au moment de la phase :

- **C1, recommandée** : conversions Ads directes. Créer trois actions dans Google Ads → Objectifs → Conversions →
  « Nouvelle action de conversion » → Site web → configuration manuelle. Formulaire : catégorie « Envoi de
  formulaire pour prospects ». WhatsApp et téléphone : catégorie « Contact ». Comptabilisation « Une » pour les
  trois. Relever le `send_to` (`AW-10798308119/<libellé>`) de chacune, puis renseigner `CONVERSION_LABELS` dans
  `src/lib/analytics/events.ts`. **TDD** : adapter d'abord `events.test.ts`, qui exige aujourd'hui des libellés
  `null`. Build, tests, déploiement (procédure de S13).
- **C2** : importer dans Ads les événements clés de GA4 (Phase B). Il faut lier les comptes (GA4 → Administration →
  Associations de produits → Google Ads), puis Ads → Conversions → Importer → Google Analytics 4. Aucun code ; la
  remontée est plus lente que C1.

Conversions améliorées (e-mail haché) : **non** par défaut. Elles exigent d'accepter les conditions dans Ads, un
ajout dans la page Confidentialité (FR et EN) et une revue de sécurité. À décider explicitement.

**Fait quand** : les conversions apparaissent « Actives » dans Ads après un test réel (24–48 h).

### Phase D — Resserrer la CSP (D38), après quelques semaines de production

1. Relever les domaines Google réellement contactés (outils de développement → Réseau, avant et après
   consentement ; journal nginx si `report-uri` a été ajouté en S13).
2. Remplacer les jokers `*.google.*` de `img-src` et `connect-src` par les hôtes observés ; retirer `www.google.com`
   de `script-src` si la balise fonctionne sans.
3. `npx playwright test --project=csp`, puis déploiement de l'en-tête (essai à blanc, `nginx -t`), et vérification
   en production qu'il n'y a aucune violation.

## Règles

- Rien n'est envoyé hors de `dive.bullesenvalais.ch` : ne jamais retirer la garde de production pour tester.
- Toute action sortante (Pi, nginx, GitHub, comptes Google) se fait après confirmation de Nicholas.
- Mettre à jour `PROGRESS.md` (journal, et `INPUTS-NICHOLAS.md` I-06) à la fin de chaque phase.

## Retour arrière

Code : `git revert`. Interfaces Google : un événement clé ou une action de conversion se désactive en un clic, sans
effet sur le site.
