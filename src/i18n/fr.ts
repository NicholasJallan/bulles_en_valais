import type { Dictionary } from './dictionary.ts';
import { legalFr } from './legal/fr.ts';

// French is the source language: texts of legacy/components/i18n.jsx (S03), plus the new lines of
// plans/refonte-la-descente/01-direction-artistique.md §9. Typography (curly apostrophes, French
// no-break spaces) is applied when rendering, so the strings stay easy to edit.

export const fr: Dictionary = {
  meta: {
    title: 'Cours de plongée en Valais — Bulles en Valais',
    description:
      'Cours de plongée SDI/TDI, PADI et FFESSM en Valais : lac du Rosel, Îles de Sion et Léman. Petits groupes, un instructeur, votre rythme.',
    ogTitle: 'Descendre, lentement, vers le silence — Bulles en Valais',
    ogDescription:
      'Formation plongée en Valais avec Nicholas Jallan, instructeur SDI/TDI, PADI et FFESSM. Du baptême au trimix, à votre rythme.',
    ogImageAlt:
      'Bulles en Valais : le lac du Rosel et le titre « Descendre, lentement, vers le silence ».',
    structuredData: {
      jobTitle: 'Instructeur de plongée SDI/TDI, PADI et FFESSM',
      catalogName: 'Cours de plongée',
    },
  },
  a11y: {
    skipLink: 'Aller au contenu',
    mainNav: 'Navigation principale',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    closeDialog: 'Fermer',
    newTab: "(s'ouvre dans un nouvel onglet)",
    languageSwitch: 'Langue',
    languageNames: { fr: 'français', en: 'anglais' },
    home: 'Bulles en Valais, retour en haut de page',
  },
  nav: {
    about: 'Instructeur',
    courses: 'Cursus',
    specialties: 'Spécialités',
    places: 'Lieux',
    gifts: 'Bons cadeaux',
    faq: 'FAQ',
    contact: 'Me contacter',
  },
  hud: {
    gauge: 'Profondimètre',
    depth: 'Profondeur',
    temperature: 'Température',
    diveTime: 'Durée de plongée',
    safetyStop: 'Palier',
    slowAscent: 'Lent',
    diveProfile: 'Profil de plongée',
    openProfile: 'Afficher le profil de plongée',
    closeProfile: 'Fermer le profil de plongée',
    entry: "Mise à l'eau",
    note: 'Profondeur imaginaire : elle suit votre lecture de la page.',
  },
  hero: {
    eyebrow: 'Formation plongée · Valais, Suisse',
    title: { before: 'Descendre,', em: 'lentement,', after: 'vers le silence.' },
    lead: 'Cours multi-écoles SDI/TDI, PADI et FFESSM au lac du Rosel, aux Îles de Sion et sur le Léman. Un instructeur, trois certifications, votre rythme.',
    primaryCta: 'Planifier une session',
    secondaryCta: 'Découvrir les cursus',
    places: 'Lac du Rosel · Les Îles, Sion · Léman',
    imageAlt:
      "Le lac du Rosel, près de Martigny : une eau si claire qu'on voit le fond depuis la rive.",
  },
  manifesto: {
    eyebrow: 'Manifeste',
    title: { before: 'Je forme des plongeurs,', em: 'pas des certifiés.' },
    body: "La différence tient dans l'aisance, la lecture du milieu, et cette économie de geste qui ne vient qu'avec des heures d'immersion.",
  },
  instructor: {
    eyebrow: "L'instructeur",
    title: { before: "L'école,", em: "c'est une personne." },
    lead: "Nicholas, instructeur SDI/TDI, MSDT PADI et instructeur trimix E4 FFESSM. Plus de vingt ans sous la surface, et la conviction qu'une bonne formation se construit à deux — un élève, un instructeur, et tout le temps nécessaire.",
    body: [
      "Mes cours se tiennent en petit comité — souvent en un-à-un, rarement plus de trois élèves. Chacun progresse à son rythme, et le contenu s'adapte au profil, pas l'inverse.",
      "En tant qu'instructeur triple-certifié, je peux vous emmener vers le cursus le plus adapté à vos projets : SDI pour le loisir et TDI pour la filière technique, réunis dans un seul système ; PADI, si vous tenez à la carte la plus connue au monde ; ou le cadre fédéral français (FFESSM/CMAS). Ou les trois.",
    ],
    portraitAlt:
      "Nicholas, en recycleur et combinaison étanche rouge, avec une élève à la surface d'un lac.",
    credentialsTitle: 'Certifications',
    verifyCredential: 'Vérifier sur le registre officiel',
  },
  courses: {
    eyebrow: 'Cursus',
    title: { before: 'Trois écoles,', em: 'un instructeur.' },
    lead: 'SDI/TDI et PADI partagent exactement les mêmes standards RSTC — même contenu, même reconnaissance. FFESSM dépend de la CMAS. Vous pouvez suivre un cursus unique, ou mélanger les trois (criss-cross) pour plonger sans restriction partout où vous irez.',
    tabsLabel: 'Choisir une école',
    priceListTitle: 'Cours & tarifs',
    onRequest: 'Sur demande',
    askAbout: 'Me renseigner',
    agencies: {
      'sdi-tdi': {
        label: 'SDI / TDI',
        sub: 'Récréative & technique',
        headline: { before: 'Du baptême au trimix,', em: 'un seul système.' },
        description:
          "SDI est l'un des organismes fondateurs des standards RSTC qui régissent la plongée loisir dans le monde entier — les mêmes que n'importe quelle certification internationale. Vos prérogatives sont interchangeables avec n'importe quelle carte RSTC, y compris pour voyager. Là où SDI va plus loin, c'est via TDI : Trimix, recycleur, plongée profonde, caverne — la filière technique la plus complète, sans jamais changer d'organisme ni d'instructeur.",
        highlights: [
          'Un seul système, du baptême à la plongée technique complète',
          'Filière TDI : Nitrox avancé, décompression, Trimix, recycleur',
          "Prérogatives reconnues comme n'importe quelle certification RSTC internationale",
          'Accompagnement sur mesure, cross-over simple depuis une autre certification',
        ],
        note: 'Tarifs de base ci-dessus. Les formations les plus avancées (Trimix, recycleur, caverne) se construisent sur mesure — contactez-moi pour étudier votre profil et définir le package adapté.',
      },
      padi: {
        label: 'PADI',
        sub: 'Récréative · Internationale',
        headline: { before: 'Le nom le plus connu', em: 'de la plongée loisir.' },
        description:
          "PADI est la marque la plus reconnue du grand public — un vrai argument si vous plongez surtout en voyage organisé ou si vos futurs binômes de palanquée en ont l'habitude. Sur le fond, la formation suit les mêmes standards RSTC que SDI : même contenu, mêmes prérogatives. Une carte PADI est reconnue dans plus de 180 pays.",
        highlights: [
          'La certification la plus reconnue par le grand public',
          'E-learning multilingue, accessible en continu',
          'Progression modulaire : Open Water → Advanced → Rescue → Divemaster',
          "Certifications délivrées directement par l'instructeur",
        ],
      },
      ffessm: {
        label: 'FFESSM',
        sub: 'Fédérale française · CMAS',
        headline: { before: 'Le cursus fédéral,', em: 'pour plonger en France.' },
        description:
          "Le cursus FFESSM (affilié à la CMAS) est à privilégier si vous plongez en France métropolitaine, en Corse, en Outre-Mer (Martinique, Guadeloupe, Guyane, Polynésie, Réunion) — ou si vos amis plongeurs sont sur ce système. La théorie est plus dense : j'assure l'enseignement en complément des supports en ligne que la fédération développe.",
        highlights: [
          'Brevets N1 à N4 (le N4 est le Guide de Palanquée)',
          "Instructeur Trimix E4 : formations jusqu'au PTH120",
          'Double certification FFESSM/CMAS reconnue dans 100+ pays',
          'Théorie assurée en face-à-face, format intensif ou étalé',
          'Passerelles possibles depuis/vers SDI et PADI',
        ],
        note: "Les cours fédéraux demandent plus d'interactions directes. Contactez-moi pour définir un calendrier adapté à votre rythme et à vos objectifs.",
      },
    },
  },
  interludes: {
    descent: {
      quote: "Descendre, c'est d'abord apprendre à respirer lentement.",
      imageAlt: 'Un plongeur et des requins-marteaux dans le bleu du large.',
      credit: 'Photo © Nicholas Jallan',
    },
    light: {
      quote: 'À quarante mètres, le rouge a disparu. Seule la lampe se souvient des couleurs.',
      imageAlt:
        "Des plongeurs en recycleur explorent l'épave de l'Hirondelle, dans le Léman ; leurs lampes rouges percent l'eau sombre.",
      credit: "L'Hirondelle, dans le Léman",
    },
  },
  depthLadder: {
    eyebrow: "L'échelle",
    title: { before: "Jusqu'où", em: 'irez-vous ?' },
    lead: "Chaque certification ouvre une nouvelle profondeur. Voici jusqu'où chacune vous emmène, du baptême au trimix.",
    youAreHere: 'Vous êtes ici',
    legend: 'Profondeur maximale de chaque certification',
    scaleNote: "Au-delà de 40 m, l'échelle est resserrée.",
    ascent: 'Remontée',
  },
  compare: {
    eyebrow: 'Comparatif',
    title: { before: 'En un coup', em: "d'œil." },
    lead: "Trois philosophies, des prérogatives qui se recoupent, et un principe à garder en tête : ce qui compte, c'est l'eau sous vos palmes — pas le logo sur la carte.",
    caption: 'Les trois écoles comparées : SDI/TDI, PADI et FFESSM',
    criterion: 'Critère',
    columns: { 'sdi-tdi': 'Récré. & technique', padi: 'Récréative', ffessm: 'Fédérale / CMAS' },
    rows: [
      {
        label: 'Organisme parent',
        values: {
          'sdi-tdi': 'RSTC (privé, international)',
          padi: 'RSTC (privé, international)',
          ffessm: 'CMAS (fédération)',
        },
      },
      {
        label: 'Théorie',
        values: {
          'sdi-tdi': 'E-learning + sessions',
          padi: 'E-learning en ligne',
          ffessm: 'Cours en présentiel',
        },
      },
      {
        label: 'Reconnaissance',
        values: { 'sdi-tdi': '100+ pays', padi: '180+ pays', ffessm: 'France, Outre-mer, CMAS' },
      },
      {
        label: 'Rythme',
        values: {
          'sdi-tdi': 'Modulaire, technique',
          padi: 'Rapide, modulaire',
          ffessm: 'Progressif, fédéral',
        },
      },
      {
        label: 'Premier niveau',
        values: {
          'sdi-tdi': 'Open Water Scuba · 18 m',
          padi: 'Open Water Diver · 18 m',
          ffessm: 'Niveau 1 · 20 m encadré',
        },
      },
      {
        label: 'Filière technique',
        values: {
          'sdi-tdi': 'Complète (Nitrox, Trimix, CCR)',
          padi: 'Tec Rec',
          ffessm: "Trimix jusqu'au PTH120",
        },
      },
      {
        label: 'Licence annuelle',
        values: { 'sdi-tdi': 'Aucune', padi: 'Aucune', ffessm: 'Oui (~ 50 €)' },
      },
      {
        label: 'Idéal pour',
        values: {
          'sdi-tdi': 'Aller plus profond',
          padi: 'Voyager, débuter',
          ffessm: 'Plonger en France',
        },
      },
    ],
    footnote:
      'Hésitation ? SDI/TDI est souvent le point de départ le plus complet — récréatif et technique dans un seul système, avec des passerelles simples vers PADI ou FFESSM selon vos destinations. Je vous aide à tracer ce chemin.',
  },
  specialties: {
    eyebrow: 'Spécialités',
    title: { before: 'Toujours plus loin,', em: 'toujours mieux.' },
    lead: "SDI, TDI, PADI, FFESSM — mêmes fondamentaux, quatre chemins. Choisissez l'organisme qui correspond à votre projet, ou mixez-les : les passerelles existent. Réductions pour formations à deux.",
    tabsLabel: 'Choisir un organisme',
    tabs: {
      sdi: {
        label: 'SDI',
        lead: "Scuba Diving International — le standard RSTC sous son nom d'origine. Théorie flexible, prérogatives reconnues partout dans le monde, et passerelle directe vers la filière technique TDI.",
      },
      tdi: {
        label: 'TDI',
        lead: 'Technical Diving International — la voie vers la plongée technique. Mélanges enrichis, décompression planifiée, profondeurs au-delà du récréatif.',
      },
      padi: {
        label: 'PADI',
        lead: 'Les dix mêmes spécialités que chez SDI, sous le nom PADI — pour ceux qui tiennent à cette carte-là. Même contenu, même instructeur.',
      },
      ffessm: {
        label: 'FFESSM',
        lead: "Le cursus fédéral français, reconnu en Suisse et en Europe. Du premier niveau autonome jusqu'à la direction de plongée — une progression progressive et rigoureuse.",
      },
    },
    equivalent: 'Équivalent',
  },
  places: {
    eyebrow: 'Lieux',
    title: { before: "Trois plans d'eau,", em: 'trois ambiances.' },
    lead: "Les cours se donnent principalement au lac du Rosel près de Martigny, aux Îles de Sion, et sur le Léman. Des stages avec hébergement sont possibles — n'hésitez pas à demander.",
    route: 'Le Rhône, de Sion au Léman',
    openMap: 'ouvrir dans Google Maps',
    facts: {
      maxDepth: 'Profondeur max',
      sites: 'Quelques sites',
    },
  },
  prepare: {
    eyebrow: 'Matériel & assurances',
    title: { before: 'Avant de', em: "s'immerger." },
    lead: 'Deux questions à régler avant la première plongée : ce que vous portez, et ce qui vous couvre.',
    gear: {
      title: { before: 'Fourni, prêté,', em: 'ou investi ?' },
      lead: 'Une partie du matériel vous est fournie selon les tailles et disponibilités. Le reste se loue — et pour les pièces personnelles, un conseil avant achat évite bien des déconvenues.',
      items: [
        {
          title: 'Fourni pour le cours',
          text: [
            {
              text: 'Selon votre taille et les disponibilités, une partie du matériel est incluse dans la formation — bloc, détendeur, gilet, combinaison.',
            },
          ],
        },
        {
          title: 'À investir : PMT',
          text: [
            {
              text: "Palmes, masque, tuba : votre set personnel. Un conseil avant d'acheter peut éviter un choix inadapté à votre morphologie ou au type de plongée visé.",
            },
          ],
        },
        {
          title: 'À louer sur place',
          text: [
            {
              text: 'Le matériel non disponible pour vous est à louer et reste à votre charge. Tarifs préférentiels auprès de mes partenaires (',
            },
            { link: { label: 'plongee.ch', href: 'https://www.plongee.ch', external: true } },
            { text: ' et ' },
            { link: { label: 'scubashop.ch', href: 'https://www.scubashop.ch', external: true } },
            { text: ').' },
          ],
        },
      ],
      imageAlt: "Du matériel de plongée sur le pont d'un bateau.",
    },
    insurance: {
      title: { before: 'Couverts,', em: 'bien couverts.' },
      lead: 'Les frais médicaux en plongée — traitements en caisson hyperbare notamment — peuvent grimper très vite. Mieux vaut en parler avant, pas après.',
      items: [
        {
          badge: 'Pendant le cours',
          title: 'Assurance DAN',
          text: "En tant qu'élève, vous êtes couvert par DAN Europe durant la formation. Après le cours, je vous conseille vivement une souscription à titre personnel.",
        },
        {
          badge: 'Résidents suisses',
          title: 'LAMal + accident',
          text: 'Si vous êtes assuré en Suisse via la LAMal avec couverture accident, vous êtes normalement couvert. Vérifiez les plafonds et la prise en charge hyperbare.',
        },
        {
          badge: 'Mon assurance pro',
          title: 'FSSS / Orion + Vaudoise',
          text: "En tant qu'élève, vous êtes également couvert par mon assurance FSSS, adossée aux compagnies Orion et La Vaudoise.",
        },
      ],
    },
  },
  gifts: {
    eyebrow: 'Bons cadeaux',
    title: { before: 'Offrir une première', em: "respiration sous l'eau." },
    lead: 'Un bon cadeau à utiliser à son rythme, en petit comité.',
    offersTitle: 'Les offres',
    offers: {
      baptism: {
        title: 'Un baptême',
        text: "Environ deux heures pour une première respiration sous l'eau, encadrée de près.",
      },
      course: {
        title: 'Une formation',
        text: 'Open Water, spécialité ou niveau fédéral : le bon couvre le cours choisi.',
      },
      amount: {
        title: 'Un montant libre',
        text: 'Vous fixez le montant, la personne choisit sa plongée.',
      },
    },
    stepsTitle: 'Comment ça marche',
    steps: [
      {
        title: 'Vous choisissez',
        text: 'Dites-moi pour qui est le bon et ce que vous souhaitez offrir : un message suffit.',
      },
      {
        title: 'Vous recevez le bon',
        text: 'Je vous envoie le bon en PDF, à imprimer ou à transmettre.',
      },
      {
        title: 'La personne plonge',
        text: "Elle choisit sa date avec moi, dans l'année qui suit.",
      },
    ],
    conditionsTitle: 'Conditions',
    conditions: [
      'Valable un an.',
      'Paiement : le moyen qui vous arrange.',
      "Report ou remboursement : au cas par cas, il suffit d'en parler.",
    ],
    cta: 'Offrir un bon cadeau',
    card: { label: 'Bon cadeau', validity: 'Valable 1 an' },
  },
  testimonials: {
    eyebrow: 'Témoignages',
    title: { before: 'Ils sont passés', em: 'par ici.' },
    lead: 'Ils ont plongé avec moi — leurs mots valent mieux que les miens.',
    prompt: 'Vous venez de plonger avec moi ?',
    cta: 'Laisser un avis Google',
    previous: 'Témoignage précédent',
    next: 'Témoignage suivant',
    readMore: "Lire l'avis en entier",
    source: 'Avis publiés sur Google',
    languageNote: 'Avis rédigés en français',
    items: [
      {
        author: 'Maude M.',
        course: 'PADI Open Water + Dry Suit',
        text: [
          "J'ai passé mon PADI Open water avec Nicholas (+dry suit car fait en hiver), et la formation était très qualitative. Très bon accompagnement, et formation qui m'a donné un niveau au top. J'ai pu plonger au Mexique en toute confiance, et les accompagnateurs ont confirmé que j'avais eu une excellente formation 👌",
          'Merci Nicholas !',
        ],
        lang: 'fr',
        translated: false,
      },
      {
        author: 'Florent Q.',
        course: 'PADI Open Water · CMAS Niveau 1',
        text: [
          'PADI Open Water et CMAS Niv 1 passé avec Nicholas, formation de qualité par un instructeur passionné et rigoureux. Grand merci !',
        ],
        lang: 'fr',
        translated: false,
      },
      {
        author: 'Alexandre F.',
        course: 'PADI Open Water',
        text: [
          'Nous avons passé le Open Water avec Nicholas. Une franche réussite, son accompagnement permet une vraie progression ! Merci Nicholas 🤘',
        ],
        lang: 'fr',
        translated: false,
      },
      {
        author: 'Marthe T.',
        course: 'Nitrox · Deep · Étanche · Niveau 3 · RIFAP · Rescue',
        text: [
          "J'ai passé plusieurs certifications avec Nicholas (Nitrox, Deep, étanche, ainsi que Niveau 3, RIFAP et Rescue), et l'expérience a été vraiment top du début à la fin.",
          "Très pédagogue et à l'écoute, il sait s'adapter à chacun, ce qui permet de progresser rapidement tout en prenant plaisir à plonger.",
          'On se sent en confiance, bien encadré, et on progresse rapidement.',
          'Je recommande sans hésiter.',
        ],
        lang: 'fr',
        translated: false,
      },
      {
        author: 'Guillaume L.',
        course: 'PADI Open Water',
        text: [
          'Open water fait avec Nicholas, au top 👌',
          'Une super approche de la plongée, qui donne envie de continuer ! …',
        ],
        lang: 'fr',
        translated: false,
      },
      {
        author: 'Stefano T.',
        course: 'PADI Open Water',
        text: [
          "J'ai passé mon PADI Open Water avec Nicolas et je ne pouvais pas rêver meilleur accompagnement !",
          'Une formation sérieuse, complète et toujours dans une super ambiance. Nicolas a su me mettre en confiance, me faire progresser et surtout me donner de très bonnes bases pour continuer à évoluer en plongée.',
          "Et puis il y a les petits moments qui font aussi partie de la formation… comme la pause dîner où Monsieur se prend tranquillement une crêpe complète… suivie d'une crêpe au Nutella ! 😂😂 Ça, forcément, ça crée des souvenirs !",
          "J'attends maintenant avec impatience un créneau en octobre pour trois nouvelles plongées avec lui, dont ma toute première plongée de nuit 🌙🤿… et ensuite, direction le niveau 2 ! 😁",
          "Merci Nicolas pour ta patience, tes conseils et tous ces bons moments. Au-delà de l'instructeur, j'ai surtout eu la chance de rencontrer quelqu'un que je considère aujourd'hui comme un ami.",
          "À très vite sous l'eau ! 🤿",
        ],
        lang: 'fr',
        translated: false,
      },
      {
        author: 'Adeline V.',
        course: 'Baptême offert',
        text: [
          "J'ai offert un baptême de plongée et je peux clairement dire que mon compagnon était enchanté! Un super moment avec un super instructeur. Merci !",
        ],
        lang: 'fr',
        translated: false,
      },
      {
        author: 'Alexandre F.',
        course: 'Open Water · Nitrox',
        text: [
          "J'ai passé mon Open Waters et Nitrox avec Nicholas et cela a été une super expérience ! Très bon instructeur et sa formation est très complète !",
          'Si vous cherchez à passer votre formation en Suisse Romande, je vous recommande à la passer avec Nicholas.',
        ],
        lang: 'fr',
        translated: false,
      },
    ],
  },
  faq: {
    eyebrow: 'Palier de sécurité · 3 min',
    title: { before: 'Vos questions,', em: 'mes réponses.' },
    lead: "Les sujets qui reviennent le plus souvent. Si la vôtre n'est pas ici, un message suffit — je réponds en général dans la journée.",
    items: [
      {
        question: 'Je débute : par quel cursus commencer ?',
        answer:
          'Pour la plupart des débutants, je recommande le SDI Open Water Scuba Diver : théorie e-learning, progression rapide, reconnaissance internationale — les mêmes standards que PADI. Si vous plongez surtout en France, FFESSM Niveau 1 est une excellente alternative. Un coup de fil de 10 minutes et on trace ensemble le bon chemin.',
      },
      {
        question: 'Puis-je mélanger les écoles ?',
        answer:
          "Oui — c'est même souvent une bonne idée. On appelle ça le criss-cross : valider certains niveaux en SDI ou PADI, d'autres en FFESSM. Votre formation est un peu plus longue, mais vous plongez ensuite sans restriction partout où vous irez.",
      },
      {
        question: 'Quelle est la différence entre SDI et PADI ?',
        answer:
          "Aucune, en pratique. SDI et PADI suivent les mêmes standards RSTC. Les certifications ont les mêmes prérogatives, sont acceptées partout de la même manière, et les passerelles entre les deux sont immédiates. SDI est simplement moins médiatisé que PADI — c'est pourtant l'organisme que j'utilise par défaut.",
      },
      {
        question: 'Faut-il acheter du matériel avant de commencer ?',
        answer:
          "Non. Une grande partie du matériel vous est fournie selon les tailles disponibles. Seul le set « palmes, masque, tuba » mérite d'être personnel — et je vous conseille de demander avant d'acheter pour éviter les mauvais choix.",
      },
      {
        question: 'Où se déroulent les cours ?',
        answer:
          'Principalement au lac du Rosel près de Martigny, aux Îles de Sion, et sur le Léman. Des formations en mode stage, avec hébergement, sont également possibles — contactez-moi pour en discuter.',
      },
      {
        question: 'Combien de temps dure une formation ?',
        answer:
          "De deux heures pour un baptême à plusieurs semaines pour un Divemaster. L'Open Water se boucle en 3 jours minimum, l'Advanced en 2 jours, le Rescue en 3 jours. Le rythme peut être intensif ou étalé selon vos disponibilités.",
      },
      {
        question: 'Je suis déjà certifié ailleurs : que faire ?',
        answer:
          'Apportez votre carte et votre carnet de plongée. Selon votre profil, une passerelle ou un simple refresher (ReActivate, ~2h, CHF 80) permet de reprendre dans les meilleures conditions. On évalue ensemble avant toute décision.',
      },
    ],
  },
  contact: {
    eyebrow: 'Surface',
    title: { before: "Sous l'eau, on ne parle pas.", em: 'Remontons.' },
    subtitle: { before: 'On en parle', em: 'de vive voix ?' },
    lead: 'La meilleure formation commence par une discussion. Dix minutes pour cerner votre projet, vos disponibilités, vos envies — puis on construit ensemble le parcours.',
    channels: {
      whatsapp: 'WhatsApp · le plus rapide',
      phone: 'Téléphone · Suisse',
      email: 'E-mail',
    },
    credentialsTitle: 'Certifications',
    form: {
      name: 'Nom',
      namePlaceholder: 'Votre nom',
      email: 'E-mail',
      emailPlaceholder: 'vous@exemple.ch',
      phone: 'Téléphone (facultatif)',
      phonePlaceholder: '+41 …',
      interest: 'Je suis intéressé·e par',
      message: 'Votre message',
      messagePlaceholder: 'Niveau actuel, disponibilités, questions, projet de voyage…',
      honeypot: 'Laissez ce champ vide',
      noScript:
        'Sans JavaScript, ce formulaire ne peut pas partir : écrivez-moi plutôt par WhatsApp, par téléphone ou par e-mail.',
      submit: 'Envoyer le message',
      sending: 'Envoi en cours…',
      success: 'Merci — votre message a bien été envoyé. Je vous réponds au plus vite.',
      sendAnother: 'Envoyer un autre message',
      errorSummary: 'Merci de vérifier :',
      errorDelivery: "Erreur d'envoi. Merci de réessayer, ou de m'écrire directement :",
      errorRateLimit:
        "Trop d'envois en peu de temps. Réessayez dans une minute, ou écrivez-moi directement :",
      errorBusy:
        "Le formulaire a reçu beaucoup de messages aujourd'hui et fait une pause. Votre message est prêt, écrivez-moi directement :",
      sendByEmail: 'Envoyer mon message par e-mail',
      sendByWhatsApp: 'Écrire sur WhatsApp',
      fieldNames: {
        name: 'le nom',
        email: "l'adresse e-mail",
        phone: 'le téléphone',
        message: 'le message',
      },
      errors: {
        required: 'Ce champ est obligatoire.',
        email: "Vérifiez l'adresse e-mail, par exemple vous@exemple.ch.",
        tooLong: 'Ce texte est trop long.',
      },
      mail: {
        subject: 'Contact depuis le site',
        name: 'Nom',
        email: 'E-mail',
        phone: 'Téléphone',
        interest: 'Intérêt',
      },
    },
  },
  whatsapp: {
    open: 'Discuter sur WhatsApp',
    title: 'Discuter avec Nicholas',
    subtitle: 'Réponse via WhatsApp',
    intro: "Bonjour ! Posez-moi votre question, elle m'arrive directement sur WhatsApp.",
    placeholder: 'Votre message…',
    send: 'Envoyer sur WhatsApp',
    defaultMessage: 'Bonjour Nicholas, je vous écris depuis votre site.',
  },
  footer: {
    region: 'Valais · Suisse',
    copyright: 'Bulles en Valais · Nicholas Jallan',
    creditsTitle: 'Crédits',
    credits: {
      photos: 'Photos : © Nicholas Jallan',
    },
    legalLinks: { privacy: 'Confidentialité', legalNotice: 'Mentions légales' },
    calmMode: {
      label: 'Mode calme',
      short: 'Calme',
      description: 'Coupe les animations et le défilement doux.',
      on: 'activé',
      off: 'désactivé',
    },
    cookies: 'Gérer les cookies',
    social: 'Réseaux',
    backToSurface: 'Remonter à la surface',
  },
  consent: {
    label: 'Consentement aux cookies',
    title: 'Quelques cookies, avec votre accord',
    description:
      "J'utilise Google Analytics pour savoir comment le site est lu, et Google Ads pour mesurer les demandes venues de mes annonces. Aucun de leurs cookies n'est déposé sans votre accord, et vous pouvez changer d'avis à tout moment avec « Gérer les cookies », en bas de page.",
    acceptAll: 'Tout accepter',
    rejectAll: 'Tout refuser',
    showPreferences: 'Choisir',
    preferences: {
      title: 'Gérer les cookies',
      intro:
        'Choisissez ce que vous acceptez. Sans votre accord, Google ne reçoit que des signaux anonymes, sans cookie ni identifiant.',
      save: 'Enregistrer mes choix',
      close: 'Fermer',
      categories: {
        necessary: {
          title: 'Nécessaires',
          description:
            "Toujours actifs : ils mémorisent seulement votre choix de consentement et, si vous l'activez, le Mode calme.",
        },
        analytics: {
          title: "Mesure d'audience",
          description:
            'Google Analytics : pages vues et parcours, de façon agrégée, pour améliorer le site.',
        },
        marketing: {
          title: 'Publicité',
          description:
            "Google Ads : mesurer les demandes venues de mes annonces. Aucune publicité n'est affichée sur ce site.",
        },
      },
      moreTitle: 'En savoir plus',
      moreDescription:
        'Le nom, le fournisseur et la durée de chaque cookie, ainsi que vos droits, sont détaillés dans la politique de confidentialité.',
    },
    privacyLink: 'Politique de confidentialité',
  },
  notFound: {
    meta: {
      title: 'Page introuvable — Bulles en Valais',
      description:
        "Cette page n'existe pas ou plus. Les cours de plongée de Bulles en Valais vous attendent sur la page d'accueil.",
    },
    eyebrow: 'Erreur 404',
    title: { before: 'Cette page est restée', em: 'au fond.' },
    lead: "Le lien est peut-être ancien, ou l'adresse mal saisie. Remontons ensemble à la surface.",
    back: "Retour à l'accueil",
  },
  legal: legalFr,
};
