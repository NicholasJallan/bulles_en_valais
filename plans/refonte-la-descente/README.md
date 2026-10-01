# Refonte « La Descente » — Bulles en Valais

> Plan d'exécution multi-sessions, rédigé le 30.09.2026 pendant la session de cadrage (audit + questions à Nicholas).
> Chaque session est exécutée par une session Claude Code **qui démarre à froid** : tout ce qu'il faut savoir est dans ces fichiers.

## Objectif

Refondre `dive.bullesenvalais.ch` en une **page unique immersive au rendu premium** : le site devient une **plongée**.
Le scroll fait descendre de la surface (hero, lumière du lac) vers le bleu profond (spécialités), puis remonter vers la surface (contact : « Sous l'eau, on ne parle pas. Remontons. »).
Mouvements lents en « flottabilité neutre », effets raffinés et justes pour un plongeur (surface d'eau en WebGL, caustiques, bulles qui grossissent en remontant, rouge qui disparaît avec la profondeur, lampe torche, profondimètre), avec une performance, une accessibilité et un SEO nettement meilleurs qu'aujourd'hui.

## Décisions de cadrage (validées par Nicholas le 30.09.2026)

| #  | Sujet | Décision |
|----|-------|----------|
| D1 | Faille critique `api/contact.php` (injection SMTP) | Corrigée en **S00**, avant toute refonte, sur `main` |
| D2 | Direction artistique | **« La Descente »** → `01-direction-artistique.md` |
| D3 | Architecture | **One-page enrichi**. Seules pages annexes : Confidentialité, Mentions légales (obligatoires) et 404 |
| D4 | Stack | **Astro 7 + TypeScript + GSAP 3.15 + Lenis 1.3 (+ OGL pour le WebGL)**, build statique, déploiement de `dist/` sur le Pi |
| D5 | Médias | Pas de photo ni de vidéo sous-marine des lacs. **Visuels IA acceptés** pour les ambiances, jamais pour représenter faussement un lieu ou une personne. **Logo vectoriel** fourni par Nicholas |
| D6 | Contenu ajouté | Bloc **Bons cadeaux** (pas d'assistant de cursus, pas de réservation en ligne, pas de mise en avant CCR/stages) |
| D7 | Langues | **FR (`/`) + EN (`/en/`)**, architecture prête pour l'allemand |
| D8 | Cookies / mesure | **Bandeau + Google Consent Mode v2**, GA4 réparé (aujourd'hui bloqué par la CSP), pages légales (nLPD) |

Les décisions prises ensuite sont consignées dans `PROGRESS.md` (section « Décisions ») et **priment** sur les fichiers de specs.

## Fichiers du plan

| Fichier | Rôle | Qui le lit |
|---|---|---|
| `README.md` | Index, protocole de session, graphe, Definition of Done | Toutes les sessions |
| `00-contexte.md` | Projet, infra, audit, conventions, budgets, invariants, anti-patterns, ressources | Toutes les sessions |
| `01-direction-artistique.md` | Concept, profil de plongée, couleur, typo, mouvement, catalogue d'effets E1–E18, images, voix | Sessions design, contenu, animation |
| `02-architecture.md` | Specs techniques (arborescence, i18n, données, scripts, WebGL, formulaire, consentement, SEO, CSP, tests, déploiement) | Sessions de code |
| `INPUTS-NICHOLAS.md` | Ce que Nicholas doit fournir ou valider, et pour quelle session | Avant chaque session concernée |
| `PROGRESS.md` | Cases à cocher, décisions, mutations du plan, journal | Début et fin de chaque session |
| `sessions/SXX-*.md` | Brief autonome d'une session | La session concernée |

## Sessions

Taille indicative (temps d'agent) : **S** ≤ 1 h · **M** 1–2 h · **L** 2–3 h (les sessions L ont des points de sortie intermédiaires).

| Session | Titre | Dépend de | Taille | Gate / inputs |
|---|---|---|---|---|
| [S00](sessions/S00-hotfix-securite.md) | Correctif sécurité du formulaire (site actuel, `main`) | — | M | 📥 WIP à valider, accès Pi |
| [S01](sessions/S01-fondations-astro.md) | Fondations Astro 7 (branche `refonte/la-descente`) | S00 | M | — |
| [S02](sessions/S02-design-system.md) | Design system & styleguide « La Descente » | S01 | L | 🛑 **Gate 1** (palette, typo, mouvement) |
| [S03](sessions/S03-contenus-i18n.md) | Contenus & i18n typés FR/EN | S01 | M | 🛑 **Gate 2** (textes) · 📥 données |
| [S04](sessions/S04-visuels.md) | Visuels : retouches, IA, logo, favicons, OG | S02 | M | 🛑 **Gate 3** (visuels) · 📥 logo SVG |
| [S05](sessions/S05-page-statique.md) | Page statique complète (sémantique, responsive, a11y) | S02, S03 | L | — |
| [S06](sessions/S06-moteur-mouvement.md) | Moteur de mouvement : Lenis, GSAP, révélations, colonne d'eau, HUD | S05 | L | — |
| [S07](sessions/S07-hero-surface-webgl.md) | Hero « Surface » en WebGL + immersion | S06, S04 | L | — |
| [S08](sessions/S08-cursus-echelle-interludes.md) | Cursus, échelle de profondeur, interludes, bulles | S06 | L | 📥 profondeurs validées |
| [S09](sessions/S09-specialites-lieux.md) | Spécialités (lampe torche) & Lieux (parcours du Rhône) | S06, S04 | L | 📥 données des lacs |
| [S10](sessions/S10-remontee-contact.md) | Remontée : Préparer, Bons cadeaux, Témoignages, Palier FAQ, Contact, WhatsApp | S06 | L | 📥 détails bons cadeaux |
| [S11](sessions/S11-consentement-seo-csp.md) | Consentement, analytics, SEO, CSP | S05 | M | 📥 libellés de conversion Ads, infos légales |
| [S12](sessions/S12-preprod-recette.md) | Préproduction & recette complète | S07–S11 | L | 🛑 **Gate 4** (recette) · 📥 DNS staging |
| [S13](sessions/S13-mise-en-production.md) | Mise en production, suivi, nettoyage | S12 | M | 🛑 feu vert de mise en ligne |

### Graphe de dépendances

```
main :  S00
          │
refonte:  S01 ──► S02 ──► S04 ─────────────────────────┐
           │       │                                    │
           └──► S03┴──► S05 ──► S06 ──┬──► S07 ◄────────┘
                         │            ├──► S08
                         │            ├──► S09 (◄ S04)
                         │            └──► S10
                         └──────────────► S11
                                       S07..S11 ──► S12 ──► S13
```

- **Parallélisables** si tu veux aller plus vite (avec un worktree git par session) : `S02 ∥ S03`, puis `S07 ∥ S08 ∥ S09 ∥ S10 ∥ S11`. Par défaut : **séquentiel**, dans l'ordre des numéros. En parallèle, chaque session ajoute sa propre entrée au journal de `PROGRESS.md` ; les conflits sur ce fichier se résolvent à la fusion des worktrees.
- `main` reste le site en ligne jusqu'à S13. Tout correctif urgent du site actuel se fait sur `main` (déploiement fichier par fichier, comme aujourd'hui).

## Démarrer une session — 🔁 point de changement de contexte

La fin de **chaque** session est un point de changement de contexte : tu peux faire `/clear` (ou ouvrir une nouvelle session), puis coller :

```
Exécute la session SXX du plan de refonte « La Descente ».
Lis d'abord, dans l'ordre : plans/refonte-la-descente/README.md, 00-contexte.md, PROGRESS.md,
puis sessions/SXX-*.md et les sections des specs qu'elle cite.
Applique le protocole de session et arrête-toi à la fin de SXX.
```

Pour **reprendre une session interrompue** (point de sortie intermédiaire), même prompt : l'agent lit le journal de `PROGRESS.md` et reprend à la tâche suivante.

## Protocole de session (pour l'agent exécutant)

1. **Préconditions** — bonne branche, arbre git propre, session précédente cochée dans `PROGRESS.md`, inputs requis présents (`INPUTS-NICHOLAS.md`). Si un prérequis manque : s'arrêter, expliquer, proposer une alternative. Ne pas improviser.
2. **Relire** `PROGRESS.md` §Décisions et §Mutations : elles priment sur les specs.
3. **Exécuter** les tâches dans l'ordre. TDD pour toute logique pure (`src/lib/**`, PHP) : test d'abord (RED), implémentation (GREEN), refactor.
4. **Vérifier** : commandes de la session + invariants globaux (`00-contexte.md` §8).
5. **Revue** : agent `code-reviewer` sur le diff de la session. Ajouter `security-reviewer` pour S00, S10 (formulaire), S11 (CSP/consentement) et S12–S13 (serveur). Corriger tout CRITICAL/HIGH avant de conclure.
6. **Commits** conventionnels (`feat:`, `fix:`, `refactor:`, `perf:`, `test:`, `docs:`, `chore:`), petits et cohérents.
7. **Journaliser** dans `PROGRESS.md` : cocher la session, ajouter une entrée au journal (date, fait, écarts, décisions, points ouverts, captures utiles), committer (`docs(plan): …`).
8. **Conclure** par un résumé court et le nom de la session suivante. Ne pas enchaîner sur la suivante.

### Gates 🛑

Une gate est un **arrêt obligatoire**. L'agent présente ce qu'il faut juger (captures aux 4 largeurs, URL de preview LAN, choix proposés avec une recommandation) et attend la validation explicite de Nicholas, consignée dans `PROGRESS.md`. Jamais franchie implicitement, jamais « en attendant ».

### Actions sortantes

Tout ce qui touche le Pi (ssh, rsync, nginx), le DNS, GitHub (push, PR) ou un service tiers (génération IA payante, Search Console, Google Ads) se fait **après confirmation de Nicholas dans la session**, avec une commande en mode simulation (`rsync -n`, `nginx -t`) d'abord.

### Mutation du plan

Si une étape doit changer : consigner dans `PROGRESS.md` §Mutations (date, session, type — découper / insérer / sauter / réordonner / abandonner —, changement, raison), puis modifier les fichiers concernés **dans le même commit**. Pas de déviation silencieuse.

## Definition of Done (projet)

- Toutes les sections de `01-direction-artistique.md` §2 livrées en FR et EN, parité vérifiée par les tests.
- Lighthouse mobile en production : Performance ≥ 90 (cible 95), Accessibilité 100, SEO 100, Bonnes pratiques ≥ 95.
- Labo mobile (CPU ×4, Fast 4G, cache vide) : LCP ≤ 2,0 s, CLS ≤ 0,05, TBT ≤ 200 ms ; INP ≤ 200 ms sur onglets, FAQ, formulaire.
- JS ≤ 150 Ko gzip au total (≤ 90 Ko au chargement initial), CSS ≤ 30 Ko gzip, images initiales ≤ 1 Mo.
- axe : 0 violation sérieuse/critique (FR et EN). Navigation clavier complète. `prefers-reduced-motion` respecté partout.
- Chrome, Safari (macOS + iOS) et Chrome Android validés à la main ; Firefox seulement s'il fonctionne (D21).
- Formulaire durci et limité en débit ; CSP sans `unsafe-eval` ni script inline ; en-têtes de sécurité conservés.
- `robots.txt`, `sitemap`, `hreflang`, JSON-LD valides ; plus aucune « soft 404 ».
- Bandeau de consentement fonctionnel, conversions Google Ads et GA4 reçues après consentement.
- Déploiement atomique par releases, retour arrière testé.
- `legacy/` supprimé, `CLAUDE.md` et `README.md` à jour, branche fusionnée dans `main`, tag `v2.0.0`.
