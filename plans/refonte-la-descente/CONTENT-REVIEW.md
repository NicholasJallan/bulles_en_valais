# Relecture des contenus — Gate 2 (S03)

> Produit en S03 le 01.10.2026. **Gate 2 validée par Nicholas le 01.10.2026** : questions posées dans la session (il ne pouvait pas lire ce fichier à distance), tout accepté, retours intégrés ci-dessous.
> Sources : `src/i18n/fr.ts`, `src/i18n/en.ts`, `src/i18n/legal/{fr,en}.ts`, `src/data/*.ts`.
> Seuls les textes **nouveaux ou modifiés** figurent ici ; tous les autres sont repris tels quels de l'ancien site (`legacy/components/i18n.jsx`).
> **Pages légales : textes à relire par Nicholas ; ceci n'est pas un avis juridique.**

Pour valider : réponds « Gate 2 validée », ou donne tes corrections (numéro de ligne du tableau ou texte). Les `TODO(I-xx)` attendent tes inputs ; ils restent visibles sur la page tant qu'ils ne sont pas remplacés.

## 1. Choix de structure (à confirmer)

| # | Choix | Effet visible |
|---|---|---|
| C1 | **Un seul prix par cours** (`src/data/courses.ts`) : le Cursus, les onglets de spécialités, l'échelle de profondeur et le formulaire lisent le même catalogue | Plus aucun écart de prix possible entre deux sections |
| C2 | **FFESSM N1 à N4 : CHF 390 / 490 / 690 / 990 partout** (I-10 a, ta réponse du 01.10.2026) ; N5 et PTH120 « Sur demande » | Le Cursus FFESSM affiche des prix au lieu de « Sur demande » |
| C3 | « Sur devis » (N5, PTH120 dans les Spécialités) devient **« Sur demande »** / *On request*, comme partout ailleurs | Un seul libellé |
| C4 | La note PADI (« Refresher course (ReActivate) — CHF 80. Discover Local Diving — CHF 80 (½ journée). ») devient deux **lignes de données** sous la grille PADI, prix tirés du catalogue | Même information, mise en forme par S05 |
| C5 | Les sur-titres « 01 — Instructeur » deviennent des **marqueurs de profondeur** « — 05 m · L'instructeur » (profondeurs dans `src/data/sections.ts`, tableau §3) | Voir §3 |
| C6 | **Ordre des lieux le long du Rhône** : Sion → Rosel (Martigny) → Léman (au lieu de Rosel, Sion, Léman), pour le parcours dessiné de S09 | Ordre des cartes Lieux |
| C7 | **Typographie au rendu** : apostrophes courbes (’), espaces fines insécables avant ? ! ; et insécables avant : et dans « », unités et montants insécables (« 18 m », « CHF 80 ») | Les sources restent faciles à modifier ; le site affiche une typographie française correcte |
| C8 | Lien **« Bons cadeaux » dans la navigation** (proposition) | Un 6ᵉ lien de menu ; à refuser si tu préfères un menu court |
| C9 | **Certifications dans l'ordre SDI/TDI, PADI, FFESSM, DEJEPS, CAH** (l'ancien site mettait FFESSM d'abord dans « L'instructeur ») | Cohérent avec « SDI/TDI d'abord » (S00) |
| C10 | **TDI Nitrox et Nitrox avancé : CHF 290 ; Decompression Procedures reste à CHF 250** (I-10 c, précisé à la Gate 2) | Le Nitrox avancé n'est plus moins cher que le Nitrox de base |
| C11 | **PTH70 ajouté** (I-04) : ligne « Sur demande » du Cursus FFESSM, carte de l'onglet FFESSM, 70 m sur l'échelle | Un cours de plus, nécessaire avant le PTH120 |
| C12 | **Échelle de profondeur** (I-04) : baptême 6 m · Open Water 18 m · N1 20 m · Advanced 30 m · N2 et Deep 40 m · TDI Deco 45 m · N3 60 m · PTH70 70 m · PTH120 120 m | Données de `courses.ts` (`maxDepth`) |
| C13 | **Pas d'adresse postale** (I-08) : Confidentialité et Mentions légales donnent le nom, l'IDE CHE-249.028.561, l'e-mail et le téléphone | Voir la question 9 |

## 2. Textes nouveaux

| # | Clé | FR | EN |
|---|---|---|---|
| N1 | `meta.title` | Cours de plongée en Valais — Bulles en Valais | Scuba diving courses in Valais — Bulles en Valais |
| N2 | `meta.description` | Cours de plongée SDI/TDI, PADI et FFESSM en Valais : lac du Rosel, Îles de Sion et Léman. Petits groupes, un instructeur, votre rythme. | SDI/TDI, PADI and FFESSM scuba courses in Valais: Lac du Rosel, Les Îles in Sion and Lake Geneva. Small groups, one instructor, your pace. |
| N3 | `meta.ogTitle` | Descendre, lentement, vers le silence — Bulles en Valais | Descending, slowly, into the silence — Bulles en Valais |
| N4 | `meta.ogDescription` | Formation plongée en Valais avec Nicholas Jallan, instructeur SDI/TDI, PADI et FFESSM. Du baptême au trimix, à votre rythme. | Scuba training in Valais with Nicholas Jallan, SDI/TDI, PADI and FFESSM instructor. From try-dive to trimix, at your own pace. |
| N5 | `meta.ogImageAlt` (à ajuster à l'image de S04) | Bulles en Valais : le lac du Rosel et le titre « Descendre, lentement, vers le silence ». | Bulles en Valais: Lac du Rosel and the title “Descending, slowly, into the silence”. |
| N6 | `hero.eyebrow` | Formation plongée · Valais, Suisse | Dive training · Valais, Switzerland |
| N7 | `hero.imageAlt` | Le lac du Rosel, près de Martigny : une eau si claire qu'on voit le fond depuis la rive. | Lac du Rosel near Martigny: water so clear you can see the bottom from the shore. |
| N8 | `manifesto` (sur-titre, titre, texte) | Manifeste · « Je forme des plongeurs, *pas des certifiés.* » · La différence tient dans l'aisance, la lecture du milieu, et cette économie de geste qui ne vient qu'avec des heures d'immersion. | Manifesto · “I train divers, *not certificate holders.*” · The difference shows in ease, in how you read the environment, and in that economy of movement that only comes with hours of immersion. |
| N9 | `interludes.descent.quote` | Descendre, c'est d'abord apprendre à respirer lentement. | Going down starts with learning to breathe slowly. |
| N10 | `interludes.descent.imageAlt` · crédit | Un plongeur et des requins-marteaux dans le bleu du large. · Photo © Nicholas Jallan | A diver and hammerhead sharks in the deep blue of the open sea. · Photo © Nicholas Jallan |
| N11 | `interludes.light.quote` | À quarante mètres, le rouge a disparu. Seule la lampe se souvient des couleurs. | At forty metres, red is gone. Only the torch remembers colour. |
| N12 | `interludes.light.imageAlt` · crédit | Illustration : des plongeurs en recycleur explorent une épave, leurs lampes rouges percent l'eau sombre. · Visuel généré par IA | Illustration: rebreather divers explore a wreck, their red torches cutting through dark water. · AI-generated image |
| N13 | `depthLadder` (sur-titre, titre, chapeau) | L'échelle · *Jusqu'où* irez-vous ? · Chaque certification ouvre une nouvelle profondeur. Voici jusqu'où chacune vous emmène, du baptême au trimix. | The scale · How deep *will you go?* · Each certification opens up a new depth. Here is how far each one takes you, from try-dive to trimix. |
| N14 | `depthLadder` (légendes) | Vous êtes ici · Profondeur maximale de chaque certification · Au-delà de 40 m, l'échelle est resserrée. · Remontée | You are here · Maximum depth of each certification · Below 40 m, the scale is compressed. · Ascent |
| N15 | `compare.caption` · `criterion` | Les trois écoles comparées : SDI/TDI, PADI et FFESSM · Critère | The three schools compared: SDI/TDI, PADI and FFESSM · Criterion |
| N16 | `prepare` (sur-titre, titre, chapeau) | Matériel & assurances · Avant de *s'immerger.* · Deux questions à régler avant la première plongée : ce que vous portez, et ce qui vous couvre. | Gear & insurance · Before you *go under.* · Two things to settle before your first dive: what you wear, and what covers you. |
| N17 | `prepare.gear.imageAlt` | Du matériel de plongée sur le pont d'un bateau. | Dive gear on the deck of a boat. |
| N18 | `gifts` (sur-titre, titre, chapeau) | Bons cadeaux · Offrir une première *respiration sous l'eau.* · Un bon cadeau à utiliser à son rythme, en petit comité. | Gift vouchers · Give someone their first *breath underwater.* · A gift voucher to use at their own pace, in a small group. |
| N18b | `gifts.offers` (I-12 ; prix du baptême tiré du catalogue : CHF 90) | Un baptême : Environ deux heures pour une première respiration sous l'eau, encadrée de près. · Une formation : Open Water, spécialité ou niveau fédéral : le bon couvre le cours choisi. · Un montant libre : Vous fixez le montant, la personne choisit sa plongée. | A try-dive: About two hours for a first breath underwater, closely supervised. · A course: Open Water, a specialty or a federal level: the voucher covers the chosen course. · Any amount: You set the amount, they choose their dive. |
| N18c | `gifts.conditions` · carte (I-12) | Valable un an. · Paiement : le moyen qui vous arrange. · Report ou remboursement : au cas par cas, il suffit d'en parler. · Carte : Bon cadeau, Valable 1 an | Valid for one year. · Payment: whichever method suits you. · Rescheduling or refund: case by case, just ask. · Card: Gift voucher, Valid for 1 year |
| N19 | `gifts.steps` | Vous choisissez : Dites-moi pour qui est le bon et ce que vous souhaitez offrir : un message suffit. · Vous recevez le bon : Je vous envoie le bon en PDF, à imprimer ou à transmettre. · La personne plonge : Elle choisit sa date avec moi, dans l'année qui suit. | You choose: Tell me who the voucher is for and what you would like to give: a message is enough. · You receive the voucher: I send you the voucher as a PDF, ready to print or forward. · They dive: They pick a date with me within the following year. |
| N20 | `gifts` (titres, CTA, carte) | Les offres · Comment ça marche · Conditions · Offrir un bon cadeau · Bon cadeau | The offers · How it works · Terms · Give a gift voucher · Gift voucher |
| N21 | `testimonials.prompt` (était codé en dur en FR) | Vous venez de plonger avec moi ? | Just dived with me? |
| N22 | `testimonials` (rail, langue, source, appel) | Témoignage précédent · Témoignage suivant · Avis rédigés en français · Avis publiés sur Google · Laisser un avis Google (vers la fiche Google) | Previous testimonial · Next testimonial · Translated from French · Reviews published on Google · Leave a Google review |
| N22b | Nouveaux avis Google (I-09) ; la page EN montre les **traductions** des 8 avis | **Alexandre F.** (Open Water · Nitrox) : un **second** Alexandre F. (deux personnes), jamais affiché à côté du premier · **Stefano T.** (PADI Open Water) : texte complet, signature « Stefano » retirée · **Adeline V.** (Baptême offert) : « mom compagnon » corrigé en « mon compagnon » | Translations of the 8 reviews, marked “Translated from French”; course labels: Open Water · Nitrox · PADI Open Water · Gifted try-dive |
| N23 | `contact.title` · `subtitle` | Sous l'eau, on ne parle pas. *Remontons.* · On en parle *de vive voix ?* | Underwater, we don't talk. *Let's surface.* · Shall we *talk it through?* |
| N24 | `contact.form` (nouveaux) | Laissez ce champ vide (pot de miel, invisible) · Envoi en cours… · Erreur d'envoi. Merci de réessayer, ou de m'écrire directement : · Écrire sur WhatsApp · Ce champ est obligatoire. · Vérifiez l'adresse e-mail, par exemple vous@exemple.ch. · Ce texte est trop long. | Leave this field empty · Sending… · Sending failed. Please try again, or write to me directly: · Write on WhatsApp · This field is required. · Please check the email address, for example you@example.com. · This text is too long. |
| N25 | `contact.form.mail` (e-mail préparé en cas d'échec) | Objet : Contact depuis le site · Nom · E-mail · Téléphone · Intérêt | Subject: Contact from the website · Name · Email · Phone · Interest |
| N26 | `whatsapp.defaultMessage` (envoyé si le champ est vide ; l'ancien site envoyait le texte d'accueil) | Bonjour Nicholas, je vous écris depuis votre site. | Hello Nicholas, I am writing from your website. |
| N27 | `hud` | Profondimètre · Profondeur · Température · Durée de plongée · Palier · Lent · Profil de plongée · Afficher / Fermer le profil de plongée · Profondeur imaginaire : elle suit votre lecture de la page. | Depth gauge · Depth · Temperature · Dive time · Safety stop · Slow · Dive profile · Show / Close the dive profile · Imaginary depth: it follows your reading of the page. |
| N28 | `a11y` | Aller au contenu · Navigation principale · Ouvrir / Fermer le menu · Fermer · (s'ouvre dans un nouvel onglet) · Langue · français, anglais · Bulles en Valais, retour en haut de page | Skip to content · Main navigation · Open / Close the menu · Close · (opens in a new tab) · Language · French, English · Bulles en Valais, back to top |
| N29 | `courses` (interface) | Choisir une école · Sur demande · Me renseigner | Choose a school · On request · Ask about it |
| N30 | `specialties` · `places` (interface) | Choisir un organisme · Équivalent · Le Rhône, de Sion au Léman · Profondeur max · Quelques sites | Choose an agency · Equivalent · The Rhône, from Sion to Lake Geneva · Max depth · Some of the sites |
| N31 | `instructor` (liens) | Vérifier sur le registre officiel (carte pro DEJEPS) | Check on the official register |
| N32 | `footer` | Valais · Suisse · © <année> Bulles en Valais · Nicholas Jallan · Crédits : Photos : © Nicholas Jallan ; Interlude « Lumière » : visuel généré par IA · Confidentialité · Mentions légales · Mode calme (activé / désactivé) : Coupe les animations et le défilement doux. · Gérer les cookies · Réseaux (Instagram @nicho_dive) · Remonter à la surface | Valais · Switzerland · © <year> Bulles en Valais · Nicholas Jallan · Credits: Photos: © Nicholas Jallan; “Light” interlude: AI-generated image · Privacy · Legal notice · Calm mode (on / off): Turns off animations and smooth scrolling. · Manage cookies · Social media · Back to the surface |
| N33 | `notFound` (404) | Erreur 404 · Cette page est restée *au fond.* · Le lien est peut-être ancien, ou l'adresse mal saisie. Remontons ensemble à la surface. · Retour à l'accueil | Error 404 · This page stayed *at the bottom.* · The link may be old, or the address mistyped. Let's head back to the surface together. · Back to the home page |
| N34 | `legal.privacy` | Politique de confidentialité (10 rubriques ; à la Gate 2, ni rubrique sur les transferts vers les États-Unis ni délai de réponse), voir `src/i18n/legal/fr.ts`. Responsable : Nicholas Jallan, Bulles en Valais (IDE CHE-249.028.561). Conservation : messages « tant qu'ils servent à votre demande ou à votre formation, et supprimés sur simple demande » ; journaux du serveur « conservés pour la sécurité du site, puis supprimés » (durée à fixer en S12–S13 avec la rotation des journaux) | Privacy policy (11 sections), see `src/i18n/legal/en.ts` |
| N35 | `legal.legalNotice` | Mentions légales (6 rubriques), voir `src/i18n/legal/fr.ts` : éditeur, numéro IDE, e-mail, téléphone, sans forme juridique ni adresse | Legal notice (6 sections), see `src/i18n/legal/en.ts` |
| N36 | lieux : nom · zone · profondeur (I-03) · texte alternatif | Les Îles · Sion · 38 m · Le plan d'eau des Îles, à Sion, au coucher du soleil. — Lac du Rosel · Martigny · 23 m · Du matériel de plongée posé sur la rive du lac du Rosel. — Léman · De Rivaz à Hermance · 300 m · sites : Rivaz Gare, Château de Chillon, Bikini, Hermance, Tougues · Le château de Chillon, au bord du Léman. | Les Îles · Sion · 38 m · The lake at Les Îles, in Sion, at sunset. — Lac du Rosel · Martigny · 23 m · Dive gear laid out on the shore of Lac du Rosel. — Lake Geneva · From Rivaz to Hermance · 300 m · sites: Rivaz Gare, Chillon Castle, Bikini, Hermance, Tougues · Chillon Castle, on the shore of Lake Geneva. |
| N37 | intérêt du formulaire `gift` (aussi accepté par `contact.php`) | Un bon cadeau | A gift voucher |
| N38 | lignes sous la grille PADI (C4) : nom · ligne · prix | Refresher course (ReActivate) · Environ 2 heures (durée reprise de la FAQ) · CHF 80 — Discover Local Diving · ½ journée · CHF 80 | Refresher course (ReActivate) · About 2 hours · CHF 80 — Discover Local Diving · ½ day · CHF 80 |
| N39 | cartes PADI : équivalence, composée à partir du catalogue | « Équivalent » + cours SDI (ex. Équivalent SDI Deep Diver) ; avant : « ≡ SDI Deep Diver » | “Equivalent” + SDI course |
| N40 | PTH70 (I-04) : ligne du Cursus · carte FFESSM | PTH70 · Trimix hypoxique · jusqu'à 70 m, avant le PTH120 · Sur demande — Carte : Trimix hypoxique 70 m · Jusqu'à 70 m · Plongée au trimix hypoxique jusqu'à 70 m : l'étape nécessaire avant la formation PTH120. | PTH70 · Hypoxic trimix · to 70 m, before PTH120 · On request — Card: Hypoxic trimix 70 m · Down to 70 m · Hypoxic trimix diving to 70 m: the step required before the PTH120 course. |

## 3. Sur-titres et profondeurs

| Section (ancre) | Ancien sur-titre | Nouveau sur-titre FR | EN |
|---|---|---|---|
| Hero (`top`) | Formation plongée — Valais, Suisse | — 00 m · Formation plongée · Valais, Suisse | — 00 m · Dive training · Valais, Switzerland |
| Manifeste (`manifesto`) | — | — 03 m · Manifeste | — 03 m · Manifesto |
| Instructeur (`about`) | 01 — Instructeur | — 05 m · L'instructeur | — 05 m · The instructor |
| Cursus (`agencies`) | 02 — Cursus | — 12 m · Cursus | — 12 m · Courses |
| Échelle (`depth`) | — | — 18 m · L'échelle | — 18 m · The scale |
| Comparatif (`compare`) | 03 — Comparatif | — 40 m · Comparatif | — 40 m · Comparison |
| Spécialités (`specialties`) | 04 — Spécialités & formations | — 40 m · Spécialités | — 40 m · Specialties |
| Lieux (`places`) | 05 — Lieux | — 30 m · Lieux | — 30 m · Locations |
| Avant de s'immerger (`prepare`, `gear`, `insurance`) | 06 — Matériel · 07 — Assurances | — 20 m · Matériel & assurances | — 20 m · Gear & insurance |
| Bons cadeaux (`gifts`) | — | — 15 m · Bons cadeaux | — 15 m · Gift vouchers |
| Témoignages (`testimonials`) | 08 — Témoignages | — 10 m · Témoignages | — 10 m · Testimonials |
| FAQ (`faq`) | 09 — FAQ | — 05 m · Palier de sécurité · 3 min | — 05 m · Safety stop · 3 min |
| Contact (`contact`) | 10 — Contact | — 00 m · Surface | — 00 m · Surface |

Les profondeurs du HUD (début → fin de chaque section) suivent `01-direction-artistique.md` §2 ; elles sont dans `src/data/sections.ts`.

## 4. Textes modifiés

| # | Où | Avant | Après | Pourquoi |
|---|---|---|---|---|
| M1 | Instructeur, 1ᵉʳ paragraphe | « Je forme des plongeurs, pas des certifiés. La différence tient… » | Phrase déplacée dans le **Manifeste** (N8) ; l'instructeur commence par « Mes cours se tiennent en petit comité… » | Le manifeste porte la phrase, sans doublon |
| M2 | Titre de l'onglet PADI (FR/EN) | « Le nom le plus connu de la plongée loisir. » (tout en italique) | « Le nom le plus connu *de la plongée loisir.* » / “The best-known name *in recreational diving.*” | Les titres à emphase ont une partie droite et une partie italique |
| M3 | Comparatif, reconnaissance FFESSM | France, DOM-TOM, CMAS | France, Outre-mer, CMAS | Terme actuel, cohérent avec la description FFESSM |
| M4 | Comparatif, sur-titre EN | At a glance | Comparison | Le titre dit déjà « At a glance. » |
| M5 | Spécialités, chapeau EN | Discounts for two-student formations. | Discounts when two of you train together. | Anglais plus naturel |
| M6 | Assurances (FR/EN) | Lamal | LAMal | Graphie officielle |
| M7 | Spécialité TDI Decompression, sous-titre FR | Deco multi-paliers | Déco multi-paliers | Accent |
| M8 | Formulaire, téléphone FR | Téléphone (optionnel) | Téléphone (facultatif) | Français correct |
| M9 | Libellés « Email » FR | Email | E-mail | Graphie française |
| M10 | Formulaire, échec | Erreur d'envoi. Merci de réessayer ou d'utiliser WhatsApp. | Erreur d'envoi. Merci de réessayer, ou de m'écrire directement : (+ e-mail pré-rempli et WhatsApp) | Deux alternatives proposées (`02-architecture.md` §11) |
| M11 | Hero, lieux EN | Lac du Rosel · Les Îles, Sion · Geneva SE | Lac du Rosel · Les Îles, Sion · Lake Geneva SE | « Geneva SE » désignait mal le lac |
| M12 | Lieux, noms | Rosel · Sion · Léman | Lac du Rosel (Martigny) · Les Îles (Sion) · Léman (EN : Lake Geneva, rive sud-est) | Nom du lieu + localité ; EN compréhensible |
| M13 | Portrait, texte alternatif | Nicholas, instructeur plongée, avec un élève en surface sur le lac | Nicholas, en recycleur et combinaison étanche rouge, avec une élève à la surface d'un lac. | Décrit la photo (inventaire de `01-direction-artistique.md` §8) |
| M14 | WhatsApp, bouton | Discuter (et « • online » en anglais sur la page FR) | Discuter sur WhatsApp ; mention « online » retirée | Bouton explicite ; pas de faux statut en ligne |
| M15 | Interludes | aria-label « Plongée sous-marine en Valais » sur une photo de requins-marteaux | Citation + texte alternatif fidèle (N9 à N12) | La photo n'est pas prise en Valais |
| M16 | Pied de page | « © 2026 Bulles en Valais · Nicholas » codé en dur, « Valais · Suisse » en dur | Année calculée au build, textes FR/EN (N32) | Défaut n° 8 de l'audit |
| M17 | Témoignages, page EN | Textes FR sans attribut `lang` | Textes FR avec `lang="fr"` et la mention « Reviews written in French » (en attendant I-09) | Défaut n° 9 de l'audit |
| M18 | Prix « Sur devis » (N5, PTH120) | Sur devis | Sur demande / On request | C3 |
| M19 | Carte FFESSM N1 (Spécialités) | Plongeur autonome · Plongées en autonomie jusqu'à 20 m avec un guide de palanquée, encadré jusqu'à 40 m. Idéal pour débuter en bouteille. | Encadré 20 m · Plongées encadrées par un guide de palanquée jusqu'à 20 m. Idéal pour débuter en bouteille. (EN : Supervised 20 m · Dives to 20 m, led by a dive guide. The entry point for scuba diving.) | Prérogatives officielles (PE20), I-10 b |
| M20 | Prix TDI Nitrox avancé | CHF 250 | CHF 290 (Decompression Procedures reste à CHF 250) | C10, I-10 c |
| M21 | Témoignages | 5 avis | 8 avis : celui d'un second Alexandre F., de Stefano T. et d'Adeline V. ajoutés (N22b) | I-09 |

## 5. `TODO(I-xx)` restants

Commande du brief : `grep -rn "TODO(I-" src/ | wc -l` → **16** lignes, **aucune dans le contenu** (ce sont des exemples dans les tests et les commentaires de l'outil de vérification).

Tous les inputs de S03 sont reçus (01.10.2026) : I-03, I-04, I-05, I-08, I-09 (traduction accordée, lien de la fiche Google), I-10, I-12, I-14 (Instagram ; pas de page Facebook pour l'instant).

## 6. Réponses de Nicholas (Gate 2, 01.10.2026)

1. TDI : Nitrox et Nitrox avancé à CHF 290, Decompression Procedures à CHF 250.
2. Lien « Bons cadeaux » : « l'intégration la plus cohérente » → hors du menu principal (5 liens + « Me contacter »), accessible par le profil de plongée du HUD et le pied de page (D28).
3. Témoignages traduits en anglais, avec « Translated from French ».
4. « Laisser un avis Google » vers la fiche Google ; pas de page Facebook pour l'instant.
5. « le Léman » au lieu de « la partie sud-est du Léman » (hero, Lieux, FAQ).
6. Deux personnes différentes signent « Alexandre F. » : initiale seule, jamais côte à côte.
7. Le site en ligne (`main`) peut garder les anciens prix pour l'instant ; il sera mis à jour au fil des sessions.
8. Textes, sur-titres, lieux, corrections mineures et pages légales acceptés ; pas de rubrique sur les États-Unis ni de délai de réponse dans la politique de confidentialité.
