import type { Interest } from './contact.ts';
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
  readonly id: 'baptism' | 'drysuit';
  readonly route: RouteId;
  readonly contactInterest: Interest;
  readonly price: { readonly amount: number; readonly currency: 'CHF' };
  readonly meta: {
    readonly title: Localized;
    readonly description: Localized;
    readonly ogTitle: Localized;
    readonly ogDescription: Localized;
  };
  readonly hero: {
    readonly eyebrow: Localized;
    readonly title: { readonly before: Localized; readonly em: Localized; readonly after: Localized };
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

export const LANDINGS: Readonly<Record<'baptism' | 'drysuit', LandingPageData>> = {
  baptism: {
    id: 'baptism',
    route: 'baptism',
    contactInterest: 'baptism',
    price: { amount: 90, currency: 'CHF' },
    meta: {
      title: {
        fr: 'Baptême de plongée en Valais — Initiation lac (CHF 90)',
        en: 'Try Scuba Diving in Valais — Alpine Lake Dive (CHF 90)',
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
        value: { fr: 'CHF 90', en: 'CHF 90' },
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
    price: { amount: 250, currency: 'CHF' },
    meta: {
      title: {
        fr: 'Formation Combinaison Étanche Valais — Dry Suit (CHF 250)',
        en: 'Dry Suit Diving Course in Valais — SDI & PADI (CHF 250)',
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
        value: { fr: 'CHF 250 (SDI) / 300 (PADI)', en: 'CHF 250 (SDI) / 300 (PADI)' },
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
        title: { fr: 'Une visibilité exceptionnelle en hiver', en: 'Crystal-clear winter visibility' },
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
        title: { fr: 'Plongée 2 : Exploration & Validation', en: 'Dive 2: Exploration & Certification' },
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
};
