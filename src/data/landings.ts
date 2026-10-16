import type { Interest } from './contact.ts';
import type { CourseId } from './courses.ts';
import type { RouteId } from '../i18n/routes.ts';
import type { Localized } from '../i18n/types.ts';

export interface LandingFact {
  readonly label: Localized;
  readonly value: Localized;
}

export interface LandingHighlight {
  readonly title: Localized;
  readonly description: Localized;
  readonly icon: string;
}

export interface LandingStep {
  readonly num: string;
  readonly title: Localized;
  readonly duration: Localized;
  readonly description: Localized;
}

export interface LandingFaqItem {
  readonly question: Localized;
  readonly answer: Localized;
}

export interface LandingPageData {
  readonly id: 'baptism' | 'drysuit' | 'openwater';
  readonly route: RouteId;
  readonly contactInterest: Interest;
  /** Course whose price the structured data offers (the entry price of the page). */
  readonly primaryCourseId: CourseId;
  /** Courses the page presents: the only ones its texts may quote with `{price:<id>}`. */
  readonly courseIds: readonly CourseId[];
  readonly meta: {
    readonly title: Localized;
    readonly description: Localized;
    readonly ogTitle: Localized;
    readonly ogDescription: Localized;
  };
  readonly hero: {
    readonly eyebrow: Localized;
    readonly title: {
      readonly before: Localized;
      readonly em: Localized;
      readonly after: Localized;
    };
    readonly lead: Localized;
    readonly primaryCta: Localized;
    readonly secondaryCta: Localized;
  };
  readonly facts: readonly LandingFact[];
  readonly highlightsTitle: Localized;
  readonly highlights: readonly LandingHighlight[];
  readonly stepsTitle: Localized;
  readonly stepsLead: Localized;
  readonly steps: readonly LandingStep[];
  readonly faqTitle: Localized;
  readonly faq: readonly LandingFaqItem[];
  readonly descentTeaser: {
    readonly eyebrow: Localized;
    readonly title: Localized;
    readonly lead: Localized;
    readonly cta: Localized;
  };
}

export const LANDINGS: Readonly<Record<'baptism' | 'drysuit' | 'openwater', LandingPageData>> = {
  baptism: {
    id: 'baptism',
    route: 'baptism',
    contactInterest: 'baptism',
    primaryCourseId: 'padi-dsd',
    courseIds: ['padi-dsd'],
    meta: {
      title: {
        fr: 'Baptême de plongée en Valais — Initiation lac ({price:padi-dsd})',
        en: 'Try Scuba Diving in Valais — Alpine Lake Dive ({price:padi-dsd})',
      },
      description: {
        fr: 'Premier baptême de plongée sous-marine en Valais au lac du Rosel ou à Sion. Encadrement privé ou duo avec Nicholas Jallan, matériel inclus.',
        en: 'Experience your first scuba dive in Valais at Lac du Rosel or Sion. Private or duo tuition with certified instructor Nicholas Jallan, gear included.',
      },
      ogTitle: {
        fr: 'Baptême de plongée en Valais — Votre première respiration sous l’eau',
        en: 'Try Scuba Diving in Valais — Your first breath underwater',
      },
      ogDescription: {
        fr: 'Initiez-vous à la plongée sous-marine au cœur des Alpes valaisannes. En solo ou à deux avec un instructeur breveté d’État, dans un cadre serein et sécurisé.',
        en: 'Discover scuba diving in the heart of the Swiss Alps. Solo or duo with a certified instructor in a calm, safe alpine lake.',
      },
    },
    hero: {
      eyebrow: {
        fr: 'Initiation & Découverte · Valais, Suisse',
        en: 'Discovery & Try-Dive · Valais, Switzerland',
      },
      title: {
        before: { fr: 'Votre premier', en: 'Your first' },
        em: { fr: 'baptême de plongée', en: 'scuba dive' },
        after: { fr: 'au cœur des Alpes.', en: 'in the Swiss Alps.' },
      },
      lead: {
        fr: 'Une première respiration sous l’eau dans les eaux calmes et cristallines du lac du Rosel (Martigny) ou des Îles (Sion). Encadrement individuel sur-mesure, matériel complet inclus.',
        en: 'Take your first breath underwater in the clear, calm waters of Lac du Rosel (Martigny) or Les Îles (Sion). Private one-to-one or duo tuition, full scuba gear included.',
      },
      primaryCta: {
        fr: 'Réserver mon baptême',
        en: 'Book my try-dive',
      },
      secondaryCta: {
        fr: 'Écrire sur WhatsApp',
        en: 'Chat on WhatsApp',
      },
    },
    facts: [
      {
        label: { fr: 'Tarif tout compris', en: 'All-inclusive price' },
        value: { fr: '{price:padi-dsd}', en: '{price:padi-dsd}' },
      },
      {
        label: { fr: 'Durée totale', en: 'Total duration' },
        value: { fr: '~2 heures', en: '~2 hours' },
      },
      {
        label: { fr: 'Format', en: 'Group size' },
        value: { fr: 'Privé (1 à 2 pers.)', en: 'Private (1 or 2 max)' },
      },
      {
        label: { fr: 'Âge minimum', en: 'Minimum age' },
        value: { fr: 'Dès 10 ans', en: 'From 10 years old' },
      },
    ],
    highlightsTitle: {
      fr: 'Pourquoi faire votre baptême avec Bulles en Valais ?',
      en: 'Why do your try-dive with Bulles en Valais?',
    },
    highlights: [
      {
        title: { fr: 'Zéro stress, écoute totale', en: 'Zero stress, personalized pace' },
        description: {
          fr: 'Pas de groupe impersonnel. Nicholas reste à vos côtés à chaque seconde, s’adapte à vos appréhensions et vous guide tout en douceur.',
          en: 'No crowded groups. Nicholas stays by your side every second, adapting to your comfort level with calm, supportive guidance.',
        },
        icon: 'user',
      },
      {
        title: { fr: 'Un cadre alpin idyllique', en: 'Idyllic alpine waters' },
        description: {
          fr: 'Le lac du Rosel à Martigny offre une eau remarquablement claire et un accès en pente douce, sans courant ni vagues.',
          en: 'Lac du Rosel in Martigny offers clear, serene water and a gentle walk-in entry, free of currents and swell.',
        },
        icon: 'map-pin',
      },
      {
        title: { fr: 'Équipement haut de gamme', en: 'High-end thermal gear' },
        description: {
          fr: 'Combinaisons néoprène épaisses et confortables, détendeurs de qualité supérieure révisés, masque adapté à votre visage.',
          en: 'Thick, comfortable neoprene suits, premium serviced regulators, and a mask fitted to your face for warmth and comfort.',
        },
        icon: 'shield',
      },
      {
        title: { fr: 'Reconnaissance internationale', en: 'Recognized certificate' },
        description: {
          fr: 'Votre baptême peut être crédité pour débuter le brevet Open Water Scuba Diver (SDI ou PADI) sans repartir de zéro.',
          en: 'Your try-dive counts towards your Open Water Diver certification (SDI or PADI) if you decide to continue your journey.',
        },
        icon: 'award',
      },
    ],
    stepsTitle: {
      fr: 'Comment se déroule votre baptême ?',
      en: 'How does your try-dive unfold?',
    },
    stepsLead: {
      fr: 'Une approche progressive pensée pour vous mettre en confiance avant même de mettre la tête sous l’eau.',
      en: 'A step-by-step approach designed to build confidence before you even put your face underwater.',
    },
    steps: [
      {
        num: '01',
        title: { fr: 'Accueil & Équipement', en: 'Welcome & Fitting' },
        duration: { fr: '~25 min', en: '~25 min' },
        description: {
          fr: 'Prise de contact au bord du lac, choix d’une combinaison thermique ajustée et présentation conviviale du matériel.',
          en: 'Meet at the lakeside, fit your thermal suit, and get introduced to your scuba gear in a relaxed atmosphere.',
        },
      },
      {
        num: '02',
        title: { fr: 'Briefing & Respiration', en: 'Briefing & Breathing' },
        duration: { fr: '~20 min', en: '~20 min' },
        description: {
          fr: 'Explication simple des signes sous-marins, de l’équilibrage des oreilles et de la respiration fluide dans le détendeur.',
          en: 'Simple explanations of hand signals, ear equalization, and natural breathing through your regulator.',
        },
      },
      {
        num: '03',
        title: { fr: 'L’immersion tout en douceur', en: 'Gentle Immersion' },
        duration: { fr: '~40-45 min', en: '~40-45 min' },
        description: {
          fr: 'Mise à l’eau là où vous avez pied. Dès que vous êtes à l’aise, descente progressive guidé par la main de Nicholas entre 2 et 6 mètres.',
          en: 'Walk in where you can stand. Once comfortable, glide gently between 2 and 6 meters with Nicholas guiding your hand.',
        },
      },
      {
        num: '04',
        title: { fr: 'Remontée & Échanges', en: 'Debriefing & Smiles' },
        duration: { fr: '~15 min', en: '~15 min' },
        description: {
          fr: 'Retour à la surface, partage des sensations vécues, remise du certificat souvenir et conseils pour la suite si vous souhaitez continuer.',
          en: 'Surface slowly, share your impressions, receive your souvenir certificate, and get advice on continuing your diving journey.',
        },
      },
    ],
    faqTitle: {
      fr: 'Questions fréquentes sur le baptême',
      en: 'Frequently Asked Questions about try-dives',
    },
    faq: [
      {
        question: {
          fr: 'Faut-il avoir peur d’avoir froid en lac ?',
          en: 'Will I be cold in an alpine lake?',
        },
        answer: {
          fr: 'Non : nous fournissons des combinaisons néoprène adaptées à la température de l’eau (avec cagoule et sous-combinaison si nécessaire). L’immersion reste courte et confortable.',
          en: 'No: we provide warm neoprene suits matched to water temperature (including hoods and underlayers). The dive is kept pleasant and comfortable.',
        },
      },
      {
        question: {
          fr: 'Et si je me sens mal ou stressé(e) sous l’eau ?',
          en: 'What if I feel uncomfortable or anxious underwater?',
        },
        answer: {
          fr: 'C’est une réaction naturelle très courante. Nous commençons là où vous avez pied. Un simple signe de la main suffit et nous remontons immédiatement à la surface en 5 secondes.',
          en: 'That is completely normal. We start where you can easily stand. A simple hand signal is all it takes to surface gently in 5 seconds.',
        },
      },
      {
        question: {
          fr: 'Quels sont les prérequis pour faire un baptême ?',
          en: 'What are the prerequisites for a try-dive?',
        },
        answer: {
          fr: 'Être âgé d’au moins 10 ans, être à l’aise dans l’eau (savoir nager) et ne pas présenter de contre-indication médicale majeure (asthme sévère, problème cardiaque, tympans perforés).',
          en: 'Be at least 10 years old, able to swim comfortably, and have no major medical contraindications (severe asthma, heart conditions, perforated eardrums).',
        },
      },
    ],
    descentTeaser: {
      eyebrow: {
        fr: 'Expérience immersive',
        en: 'Immersive experience',
      },
      title: {
        fr: 'Envie d’explorer tout l’univers de Bulles en Valais ?',
        en: 'Want to discover the full Bulles en Valais universe?',
      },
      lead: {
        fr: 'Découvrez notre page contemplative « La Descente », notre philosophie de formation et les spots de plongée du Valais et du Léman.',
        en: 'Explore our contemplative experience "La Descente", our training philosophy, and iconic alpine dive sites.',
      },
      cta: {
        fr: 'Explorer La Descente →',
        en: 'Experience La Descente →',
      },
    },
  },

  drysuit: {
    id: 'drysuit',
    route: 'drysuit',
    contactInterest: 'specialty',
    primaryCourseId: 'sdi-drysuit',
    courseIds: ['sdi-drysuit', 'padi-drysuit'],
    meta: {
      title: {
        fr: 'Formation Combinaison Étanche Valais — Dry Suit ({price:sdi-drysuit})',
        en: 'Dry Suit Diving Course in Valais — SDI & PADI ({price:sdi-drysuit})',
      },
      description: {
        fr: 'Plongez au chaud toute l’année dans les lacs suisses. Spécialité Combinaison Étanche SDI & PADI en Valais avec Nicholas Jallan, instructeur breveté.',
        en: 'Learn to dive warm year-round in Swiss alpine lakes. SDI & PADI Dry Suit Diver specialty in Valais with certified instructor Nicholas Jallan.',
      },
      ogTitle: {
        fr: 'Formation Combinaison Étanche en Valais — Plongez au chaud tout l’hiver',
        en: 'Dry Suit Diving Course in Valais — Stay warm diving all winter',
      },
      ogDescription: {
        fr: 'Maîtrisez la flottabilité, la purge et la sécurité en combinaison étanche dans les lacs alpins et sur le Léman. Brevets reconnus SDI et PADI.',
        en: 'Master buoyancy, venting, and dry suit safety in alpine lakes and Lake Geneva. Internationally recognized SDI and PADI certifications.',
      },
    },
    hero: {
      eyebrow: {
        fr: 'Spécialité & Confort Hivernal · Valais, Suisse',
        en: 'Specialty & Winter Warmth · Valais, Switzerland',
      },
      title: {
        before: { fr: 'Formation', en: 'Specialty' },
        em: { fr: 'Combinaison Étanche', en: 'Dry Suit Diver' },
        after: { fr: 'en lac alpin.', en: 'in alpine lakes.' },
      },
      lead: {
        fr: 'Ne laissez plus le froid écourter vos plongées. Apprenez à plonger au sec et au chaud toute l’année dans les eaux cristallines du Valais et sur les tombants du Léman. Certifications SDI & PADI.',
        en: 'Never let cold water cut your dive short. Learn to stay warm and dry year-round in the crystal-clear winter waters of Valais and Lake Geneva. SDI & PADI certifications.',
      },
      primaryCta: {
        fr: 'Planifier ma formation Étanche',
        en: 'Plan my Dry Suit course',
      },
      secondaryCta: {
        fr: 'Poser une question WhatsApp',
        en: 'Ask a question on WhatsApp',
      },
    },
    facts: [
      {
        label: { fr: 'Tarif de la formation', en: 'Course tuition' },
        value: {
          fr: '{price:sdi-drysuit} (SDI) / {price:padi-drysuit} (PADI)',
          en: '{price:sdi-drysuit} (SDI) / {price:padi-drysuit} (PADI)',
        },
      },
      {
        label: { fr: 'Immersion', en: 'Open water dives' },
        value: { fr: '2 plongées lac + atelier', en: '2 lake dives + workshop' },
      },
      {
        label: { fr: 'Format', en: 'Coaching format' },
        value: { fr: 'Micro-groupe ou solo', en: 'Micro-group or private' },
      },
      {
        label: { fr: 'Prérequis', en: 'Prerequisite' },
        value: { fr: 'Open Water ou Niveau 1', en: 'Open Water or equivalent' },
      },
    ],
    highlightsTitle: {
      fr: 'Pourquoi plonger en étanche en Suisse ?',
      en: 'Why dive dry in Switzerland?',
    },
    highlights: [
      {
        title: {
          fr: 'Une visibilité exceptionnelle en hiver',
          en: 'Crystal-clear winter visibility',
        },
        description: {
          fr: 'En automne et en hiver, les algues disparaissent et l’eau des lacs devient translucide. La combinaison étanche vous ouvre cette saison magique.',
          en: 'In autumn and winter, algae vanish and alpine lakes turn crystal clear. A dry suit unlocks this breathtaking diving season.',
        },
        icon: 'eye',
      },
      {
        title: { fr: 'Chaleur et confort inégalés', en: 'Unmatched warmth and comfort' },
        description: {
          fr: 'Fini le frisson au palier. Vous portez des sous-vêtements thermiques isolants et terminez votre plongée totalement sec et réchauffé.',
          en: 'No more shivering at safety stops. Insulating thermal undergarments keep you warm and dry from descent to surface.',
        },
        icon: 'shield',
      },
      {
        title: { fr: 'Maîtrise fine de la flottabilité', en: 'Precision buoyancy control' },
        description: {
          fr: 'L’étanche devient votre deuxième volume d’air. Nicholas vous enseigne les réflexes de purge parfaits, l’équilibre horizontal et la gestion des pieds.',
          en: 'The suit becomes a second air cell. Nicholas teaches precise venting reflexes, horizontal trim, and foot-pocket air control.',
        },
        icon: 'compass',
      },
      {
        title: { fr: 'Passerelle vers le Tek & la Glace', en: 'Gateway to Tech and Ice diving' },
        description: {
          fr: 'La certification Dry Suit est le prérequis indispensable pour la plongée sous glace au lac Lioson, les tombants profonds du Léman et la filière TDI.',
          en: 'Dry suit certification is mandatory for ice diving (Lac Lioson), deep Lake Geneva walls, and TDI technical diving courses.',
        },
        icon: 'award',
      },
    ],
    stepsTitle: {
      fr: 'Le programme de votre spécialité',
      en: 'Course curriculum and milestones',
    },
    stepsLead: {
      fr: 'Une journée intensive ou deux demi-journées pour acquérir une autonomie totale et sereine en combinaison étanche.',
      en: 'One intensive day or two half-days to build total confidence and ease diving dry.',
    },
    steps: [
      {
        num: '01',
        title: { fr: 'Théorie & Choix du matériel', en: 'Theory & Equipment Choice' },
        duration: { fr: '~1h30', en: '~1h30' },
        description: {
          fr: 'Différences néoprène vs trilaminé, types de fermetures étanches, choix des sous-vêtements thermiques et entretien des manchons latex/silicone.',
          en: 'Neoprene vs trilaminate differences, waterproof zipper care, thermal layer selection, and seal maintenance.',
        },
      },
      {
        num: '02',
        title: { fr: 'Atelier en eau calme', en: 'Confined Water Skills' },
        duration: { fr: '~45 min', en: '~45 min' },
        description: {
          fr: 'Mise en pratique à faible profondeur : connexion de l’inflateur, gestion de l’air dans la combinaison, purge d’épaule et stabilisation.',
          en: 'Shallow water drills: low-pressure inflator connection, suit inflation, shoulder dump valve control, and hover trim.',
        },
      },
      {
        num: '03',
        title: { fr: 'Plongée 1 : Équilibre & Sécurité', en: 'Dive 1: Trim & Emergency drills' },
        duration: { fr: '~45 min', en: '~45 min' },
        description: {
          fr: 'Immersion en milieu naturel (Lac du Rosel). Rétablissement en cas d’air dans les pieds, déconnexion d’inflateur bloqué et remontée contrôlée.',
          en: 'Open water dive (Lac du Rosel). Inversion roll recovery, stuck inflator disconnect drills, and controlled safety stop ascent.',
        },
      },
      {
        num: '04',
        title: {
          fr: 'Plongée 2 : Exploration & Validation',
          en: 'Dive 2: Exploration & Certification',
        },
        duration: { fr: '~50 min', en: '~50 min' },
        description: {
          fr: 'Plongée d’exploration complète en autonomie avec votre binôme, validation des compétences et délivrance de votre brevet international SDI ou PADI.',
          en: 'Full exploratory dive with your buddy, mastery evaluation, and issuance of your permanent SDI or PADI Dry Suit certification.',
        },
      },
    ],
    faqTitle: {
      fr: 'Questions fréquentes sur l’Étanche',
      en: 'Frequently Asked Questions about Dry Suit diving',
    },
    faq: [
      {
        question: {
          fr: 'Dois-je déjà posséder ma propre combinaison étanche ?',
          en: 'Do I need to own my own dry suit?',
        },
        answer: {
          fr: 'Pas nécessairement : vous pouvez louer une combinaison adaptée pour le cours ou venir avec votre propre équipement. Nicholas vous conseillera précisément sur les modèles adaptés à votre morphologie.',
          en: 'Not necessarily: you can rent a suit for the course or bring your own. Nicholas will advise you on the best models for your body shape and diving goals.',
        },
      },
      {
        question: {
          fr: 'Est-ce difficile d’apprendre à plonger en étanche ?',
          en: 'Is dry suit diving difficult to learn?',
        },
        answer: {
          fr: 'Ce n’est pas difficile, mais les sensations sont différentes de la combinaison humide. En 2 plongées bien encadrées, les automatismes de purge et de trim sont parfaitement acquis.',
          en: 'It is not difficult, but feels different from a wetsuit. With two structured training dives, buoyancy control and venting reflexes become second nature.',
        },
      },
      {
        question: {
          fr: 'Quelle est la différence entre les brevets SDI et PADI ?',
          en: 'What is the difference between SDI and PADI certification?',
        },
        answer: {
          fr: 'Les deux certifications sont reconnues dans le monde entier sans restriction. SDI met l’accent sur une approche moderne et pratique ; PADI offre la notoriété globale de son réseau.',
          en: 'Both certifications are recognized worldwide without restrictions. SDI emphasizes modern, practical skills, while PADI offers its global brand network.',
        },
      },
    ],
    descentTeaser: {
      eyebrow: {
        fr: 'Expérience immersive',
        en: 'Immersive experience',
      },
      title: {
        fr: 'Envie d’explorer tout l’univers de Bulles en Valais ?',
        en: 'Want to discover the full Bulles en Valais universe?',
      },
      lead: {
        fr: 'Découvrez notre page contemplative « La Descente », notre philosophie de formation et les spots de plongée du Valais et du Léman.',
        en: 'Explore our contemplative experience "La Descente", our training philosophy, and iconic alpine dive sites.',
      },
      cta: {
        fr: 'Explorer La Descente →',
        en: 'Experience La Descente →',
      },
    },
  },
  openwater: {
    id: 'openwater',
    route: 'openwater',
    contactInterest: 'sdi-owd',
    primaryCourseId: 'sdi-owsd',
    courseIds: ['sdi-owsd', 'padi-owd'],
    meta: {
      title: {
        fr: 'Cours Open Water Valais — Brevet de Plongée ({price:sdi-owsd})',
        en: 'Open Water Scuba Course Valais — Dive Licence ({price:sdi-owsd})',
      },
      description: {
        fr: 'Devenez plongeur autonome à 18m. Cours Open Water SDI ou PADI en Valais avec Nicholas Jallan : petit comité, lac alpin et horaire modulable sur mesure.',
        en: 'Become a certified autonomous diver to 18m. SDI or PADI Open Water course in Valais with Nicholas Jallan: small groups, alpine lake and flexible schedule.',
      },
      ogTitle: {
        fr: 'Cours Open Water en Valais — Votre passeport pour explorer le monde sous-marin',
        en: 'Open Water Course in Valais — Your passport to explore the underwater world',
      },
      ogDescription: {
        fr: 'Obtenez votre brevet de plongée international reconnu à vie avec Nicholas Jallan. Formation sur mesure au lac du Rosel et aux Îles de Sion.',
        en: 'Earn your lifetime international scuba certification with Nicholas Jallan. Tailored training at Lac du Rosel and Les Îles in Sion.',
      },
    },
    hero: {
      eyebrow: {
        fr: 'Formation Débutant · Brevet International · Valais, Suisse',
        en: 'Beginner Course · International Certification · Valais, Switzerland',
      },
      title: {
        before: {
          fr: 'Formation ',
          en: 'Your ',
        },
        em: {
          fr: 'Open Water Diver',
          en: 'Open Water Diver',
        },
        after: {
          fr: ' en lac alpin.',
          en: ' scuba licence.',
        },
      },
      lead: {
        fr: 'Le brevet indispensable pour plonger en autonomie jusqu’à 18 mètres partout sur la planète. Apprentissage personnalisé en petit comité (1 à 3 élèves) au lac du Rosel et à Sion.',
        en: 'The essential certification to dive autonomously down to 18 meters worldwide. Tailored coaching in small groups (1 to 3 students) at Lac du Rosel and Sion.',
      },
      primaryCta: {
        fr: 'Planifier ma formation Open Water',
        en: 'Plan your Open Water course',
      },
      secondaryCta: {
        fr: 'Poser une question WhatsApp',
        en: 'Ask on WhatsApp',
      },
    },
    facts: [
      {
        label: {
          fr: 'Tarif de la formation',
          en: 'Course fee',
        },
        value: {
          fr: '{price:sdi-owsd} (SDI) / {price:padi-owd} (PADI)',
          en: '{price:sdi-owsd} (SDI) / {price:padi-owd} (PADI)',
        },
      },
      {
        label: {
          fr: 'Prérequis',
          en: 'Prerequisites',
        },
        value: {
          fr: 'Dès 10-12 ans · Savoir nager',
          en: 'Age 10-12+ · Basic swimming',
        },
      },
      {
        label: {
          fr: 'Format des cours',
          en: 'Format',
        },
        value: {
          fr: '1 à 3 élèves (personnalisé)',
          en: '1 to 3 students (private coaching)',
        },
      },
      {
        label: {
          fr: 'Durée moyenne',
          en: 'Duration',
        },
        value: {
          fr: '3 à 4 jours modulables',
          en: '3 to 4 flexible days',
        },
      },
    ],
    highlightsTitle: {
      fr: 'Pourquoi passer son brevet avec Bulles en Valais ?',
      en: 'Why take your Open Water with Bulles en Valais?',
    },
    highlights: [
      {
        title: {
          fr: 'Brevet international reconnu à vie',
          en: 'Lifetime international licence',
        },
        description: {
          fr: 'Valable dans le monde entier sans restriction. Que vous voyagiez en Mer Rouge ou aux Caraïbes, votre carte SDI ou PADI est reconnue partout.',
          en: 'Recognized worldwide without restrictions. Whether you travel to the Red Sea or the Caribbean, your card is accepted everywhere.',
        },
        icon: 'award',
      },
      {
        title: {
          fr: 'Une vraie aisance dans l’eau',
          en: 'Genuine underwater comfort',
        },
        description: {
          fr: 'Pas de formation expédiée au rabais. Vous apprenez la vraie stabilisation, la gestion du souffle et la sécurité pour être 100 % autonome et serein.',
          en: 'No rushed training. You master real buoyancy, breathing control, and safety skills to become a truly autonomous diver.',
        },
        icon: 'shield',
      },
      {
        title: {
          fr: 'Théorie en ligne à votre rythme',
          en: 'Self-paced digital e-learning',
        },
        description: {
          fr: 'Étudiez la théorie confortablement chez vous sur smartphone ou tablette via l’application e-learning officielle avant de vous jeter à l’eau.',
          en: 'Study theory at home on your phone or tablet with official e-learning materials before heading to the lake.',
        },
        icon: 'compass',
      },
      {
        title: {
          fr: 'Équipement complet fourni',
          en: 'Complete scuba gear included',
        },
        description: {
          fr: 'Bouteille, détendeurs haut de gamme, gilet stabilisateur, combinaison chaude 7 mm et ordinateur de plongée inclus pendant toute votre formation.',
          en: 'Tanks, top-tier regulators, BCD, warm 7 mm wetsuit, and dive computer included throughout your entire course.',
        },
        icon: 'check',
      },
    ],
    stepsTitle: {
      fr: 'Le déroulement de votre formation',
      en: 'Course progression & steps',
    },
    stepsLead: {
      fr: 'De vos premiers exercices en eau calme jusqu’à vos explorations profondes en autonomie en lac.',
      en: 'From your first shallow exercises to autonomous deep exploration in alpine lakes.',
    },
    steps: [
      {
        num: '01',
        title: {
          fr: 'E-learning & Théorie en ligne',
          en: 'Online E-Learning & Theory',
        },
        duration: {
          fr: 'À votre rythme',
          en: 'At your pace',
        },
        description: {
          fr: 'Vidéos, quiz et modules interactifs pour acquérir les bases de la physique, de la physiologie et de la sécurité en plongée depuis chez vous.',
          en: 'Videos, quizzes, and interactive modules covering diving physics, physiology, and safety rules at your own pace.',
        },
      },
      {
        num: '02',
        title: {
          fr: 'Séance en eau calme (Milieu protégé)',
          en: 'Confined Water Skills Workshop',
        },
        duration: {
          fr: '~3h',
          en: '~3 hours',
        },
        description: {
          fr: 'Premières respirations sous l’eau à faible profondeur au Lac du Rosel ou en piscine pour maîtriser le vidage de masque, le détendeur et l’équilibrage.',
          en: 'First breaths underwater in shallow calm water to master mask clearing, regulator recovery, and ear equalization.',
        },
      },
      {
        num: '03',
        title: {
          fr: '4 Plongées en milieu naturel (Lac alpin)',
          en: '4 Open Water Lake Dives',
        },
        duration: {
          fr: '2 jours',
          en: '2 days',
        },
        description: {
          fr: 'Mise en application progressive entre 5 et 18 mètres de profondeur au lac du Rosel et aux Îles de Sion. Exploration de la faune, navigation et flottabilité.',
          en: 'Progressive real-world application between 5 and 18 meters at Lac du Rosel and Les Îles. Wildlife exploration, navigation, and trim.',
        },
      },
      {
        num: '04',
        title: {
          fr: 'Certification internationale immédiate',
          en: 'Immediate International Certification',
        },
        duration: {
          fr: 'Validation',
          en: 'Certification',
        },
        description: {
          fr: 'Débriefing personnalisé, signature de votre carnet de plongée et émission immédiate de votre carte numérique de plongeur autonome SDI ou PADI.',
          en: 'Personal debrief, logbook endorsement, and instant delivery of your digital SDI or PADI autonomous diver certification.',
        },
      },
    ],
    faqTitle: {
      fr: 'Questions fréquentes sur l’Open Water',
      en: 'Frequently asked questions about Open Water',
    },
    faq: [
      {
        question: {
          fr: 'Quelle est la différence entre l’Open Water SDI et PADI ?',
          en: 'What is the difference between SDI and PADI Open Water?',
        },
        answer: {
          fr: 'Aucune sur vos prérogatives : les deux brevets sont régis par les mêmes standards mondiaux RSTC et vous autorisent à plonger jusqu’à 18 m en autonomie partout sur terre. SDI offre une approche plus moderne et axée sur l’ordinateur de plongée ; PADI bénéficie de sa renommée commerciale historique.',
          en: 'None in terms of privileges: both share the exact same global RSTC standards, allowing you to dive down to 18 m autonomously anywhere in the world. SDI emphasizes modern computer diving; PADI has historic global brand awareness.',
        },
      },
      {
        question: {
          fr: 'Faut-il être un grand sportif pour débuter la plongée ?',
          en: 'Do I need to be an athlete to start scuba diving?',
        },
        answer: {
          fr: 'Non, la plongée sous-marine n’est pas un sport de vitesse ou de force brute. Il suffit d’être en bonne santé générale, de savoir nager 200 mètres à son rythme et d’être à l’aise dans l’eau. Un questionnaire médical standard est rempli au préalable.',
          en: 'No, scuba diving is not about physical strength or endurance. You just need to be in good health, able to swim 200 meters comfortably at your own pace, and relaxed in the water. A simple medical questionnaire is completed beforehand.',
        },
      },
      {
        question: {
          fr: 'L’eau n’est-elle pas trop froide dans les lacs suisses ?',
          en: 'Isn’t the water too cold in Swiss lakes?',
        },
        answer: {
          fr: 'Nous fournissons des combinaisons néoprène 7 mm avec surveste, cagoule et gants de haute qualité qui maintiennent parfaitement la chaleur corporelle. Dès le mois de mai jusqu’en octobre, la couche de surface se réchauffe très agréablement.',
          en: 'We provide premium 7 mm wetsuits with hoods, gloves, and over-vests that retain body heat remarkably well. From May through October, surface lake layers warm up comfortably.',
        },
      },
      {
        question: {
          fr: 'Comment s’organise le calendrier des cours ?',
          en: 'How is the course schedule organized?',
        },
        answer: {
          fr: 'Le calendrier est totalement sur mesure selon vos disponibilités. La formation se réalise typiquement sur 2 week-ends consécutifs ou sur 3 à 4 jours en semaine selon votre emploi du temps.',
          en: 'Scheduling is completely tailored to your availability. Training typically takes place over two consecutive weekends or 3 to 4 weekdays to match your calendar.',
        },
      },
    ],
    descentTeaser: {
      eyebrow: {
        fr: 'Expérience immersive',
        en: 'Immersive experience',
      },
      title: {
        fr: 'Envie d’explorer tout l’univers de Bulles en Valais ?',
        en: 'Want to discover the full Bulles en Valais universe?',
      },
      lead: {
        fr: 'Découvrez notre page contemplative « La Descente », notre philosophie de formation et les spots de plongée du Valais et du Léman.',
        en: 'Explore our contemplative experience "La Descente", our training philosophy, and iconic alpine dive sites.',
      },
      cta: {
        fr: 'Explorer La Descente →',
        en: 'Experience La Descente →',
      },
    },
  },
};
