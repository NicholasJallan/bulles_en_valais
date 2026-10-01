// Cards of the specialty tabs (prices and names come from courses.ts, through `course`).
import type { Localized } from '../i18n/types.ts';
import type { CourseId } from './courses.ts';

export const SPECIALTY_TABS = ['sdi', 'tdi', 'padi', 'ffessm'] as const;
export type SpecialtyTabId = (typeof SPECIALTY_TABS)[number];

export interface SpecialtyCard {
  readonly course: CourseId;
  /** Number or level shown on the card: « 01 », « N3 », « PTH120 ». */
  readonly num: string;
  /** Card title when it differs from the course name of the price lists. */
  readonly title?: Localized;
  readonly sub: Localized;
  readonly description: Localized;
  /** For PADI cards: the SDI course with the same content. */
  readonly equivalent?: CourseId;
}

const same = (text: string): Localized => ({ fr: text, en: text });

const SDI_CARDS = [
  {
    course: 'sdi-nitrox',
    num: '01',
    sub: same('Nitrox'),
    description: {
      fr: "Plongez plus longtemps grâce aux mélanges suroxygénés — jusqu'à 40 % d'oxygène pour repousser vos limites sans décompression.",
      en: 'Dive longer with oxygen-enriched mixes — up to 40% oxygen to push your no-decompression limits.',
    },
  },
  {
    course: 'sdi-deep',
    num: '02',
    sub: same('40 m'),
    description: {
      fr: "Prérogatives jusqu'à 40 mètres, gestion de la profondeur et de la narcose.",
      en: 'Prerogatives to 40 metres, depth and narcosis management.',
    },
  },
  {
    course: 'sdi-navigation',
    num: '03',
    sub: same('Navigation'),
    description: {
      fr: "Compas, repères naturels, lecture du site : savoir où l'on est, toujours.",
      en: 'Compass, natural cues, site reading — always knowing where you are.',
    },
  },
  {
    course: 'sdi-altitude',
    num: '04',
    sub: same('> 300 m'),
    description: {
      fr: 'Plongée en altitude — calculs, tables adaptées aux lacs alpins.',
      en: 'Altitude diving — calculations, tables adapted for alpine lakes.',
    },
  },
  {
    course: 'sdi-drysuit',
    num: '05',
    sub: { fr: 'Étanche', en: 'Dry' },
    description: {
      fr: 'La combinaison étanche : flottabilité, purge, confort en eau froide.',
      en: 'The dry suit: buoyancy, venting, comfort in cold water.',
    },
  },
  {
    course: 'sdi-dsmb',
    num: '06',
    sub: { fr: 'Parachute', en: 'Marker' },
    description: {
      fr: 'Déploiement du parachute de palier, signalisation en surface.',
      en: 'Deploying the delayed surface marker buoy, signalling.',
    },
  },
  {
    course: 'sdi-search-recovery',
    num: '07',
    sub: { fr: 'Recherche', en: 'Search' },
    description: {
      fr: 'Techniques de recherche sous-marine, utilisation du parachute de levage.',
      en: 'Underwater search techniques, use of the lift bag.',
    },
  },
  {
    course: 'sdi-night',
    num: '08',
    sub: { fr: 'Nuit', en: 'Night' },
    description: {
      fr: 'La vie nocturne du lac, gestion de la lampe, orientation dans le noir.',
      en: 'The lake by night, torch handling, orientation in the dark.',
    },
  },
  {
    course: 'sdi-wreck',
    num: '09',
    sub: { fr: 'Épaves', en: 'Wrecks' },
    description: {
      fr: 'Approche et exploration des épaves, pénétration basique en sécurité.',
      en: 'Approach and exploration of wrecks, basic safe penetration.',
    },
  },
  {
    course: 'sdi-buoyancy',
    num: '10',
    sub: { fr: 'Flottabilité', en: 'Buoyancy' },
    description: {
      fr: "L'art de la flottabilité fine. La différence entre nager et flotter.",
      en: 'The art of fine buoyancy. The difference between swimming and floating.',
    },
  },
] as const satisfies readonly SpecialtyCard[];

const TDI_CARDS = [
  {
    course: 'tdi-nitrox',
    num: '01',
    title: same('Enriched Air Nitrox'),
    sub: same('EANx ≤ 40 %'),
    description: {
      fr: "Mélanges suroxygénés jusqu'à 40 % d'O₂ pour des plongées sans déco plus longues. Prérequis : certification OW.",
      en: 'Oxygen-enriched mixes up to 40% O₂ for longer no-deco dives. Prerequisite: OW certification.',
    },
  },
  {
    course: 'tdi-advanced-nitrox',
    num: '02',
    title: same('Advanced Nitrox'),
    sub: same('EANx 21–100 %'),
    description: {
      fr: "Utilisation de mélanges enrichis jusqu'à 100 % pour les paliers de décompression. Introduction aux tables tech. Prérequis : TDI Nitrox ou équivalent.",
      en: 'Enriched mixes up to 100% for decompression stops. Introduction to technical tables. Prerequisite: TDI Nitrox or equivalent.',
    },
  },
  {
    course: 'tdi-deco',
    num: '03',
    title: same('Decompression Procedures'),
    sub: { fr: 'Déco multi-paliers', en: 'Multi-stop deco' },
    description: {
      fr: "Planification de plongées décompressives, gestion des paliers obligatoires, procédures d'urgence. Prérequis : Advanced Nitrox.",
      en: 'Planning and executing decompression dives, managing mandatory stops, emergency procedures. Prerequisite: Advanced Nitrox.',
    },
  },
  {
    course: 'tdi-dpv',
    num: '04',
    title: same('DPV Diver'),
    sub: { fr: 'Scooter sous-marin', en: 'Underwater scooter' },
    description: {
      fr: "Pilotage sécurisé d'un propulseur sous-marin (DPV) : maniabilité, navigation, gestion de la flottabilité et procédures d'urgence. Prérequis : certification OW + 25 plongées.",
      en: 'Safe operation of a diver propulsion vehicle (DPV): handling, navigation, buoyancy management and emergency procedures. Prerequisite: OW certification + 25 logged dives.',
    },
  },
] as const satisfies readonly SpecialtyCard[];

/** PADI version of an SDI card: same content and instructor, PADI name and price. */
const padiVersion = (
  course: CourseId,
  num: string,
  equivalent: CourseId,
  sub: Localized,
  description: Localized,
): SpecialtyCard => ({ course, num, equivalent, sub, description });

const PADI_CARDS = [
  padiVersion('padi-nitrox', '01', 'sdi-nitrox', same('Nitrox'), {
    fr: 'La version PADI de la formation aux mélanges suroxygénés. Mêmes prérogatives, même reconnaissance internationale.',
    en: 'The PADI version of the oxygen-enriched mixes course. Same prerogatives, same international recognition.',
  }),
  padiVersion('padi-deep', '02', 'sdi-deep', same('40 m'), {
    fr: "La version PADI de la spécialité profondeur — prérogatives jusqu'à 40 mètres, gestion de la narcose. Contenu identique.",
    en: 'The PADI version of the deep specialty — prerogatives to 40 metres, narcosis management. Identical content.',
  }),
  padiVersion('padi-navigation', '03', 'sdi-navigation', same('Navigation'), {
    fr: 'La version PADI de la formation navigation — compas, repères naturels, lecture du site.',
    en: 'The PADI version of the navigation course — compass, natural cues, site reading.',
  }),
  padiVersion('padi-altitude', '04', 'sdi-altitude', same('> 300 m'), {
    fr: 'La version PADI de la plongée en altitude — calculs, tables adaptées aux lacs alpins.',
    en: 'The PADI version of altitude diving — calculations, tables adapted for alpine lakes.',
  }),
  padiVersion(
    'padi-drysuit',
    '05',
    'sdi-drysuit',
    { fr: 'Étanche', en: 'Dry' },
    {
      fr: 'La version PADI de la formation combinaison étanche — flottabilité, purge, confort en eau froide.',
      en: 'The PADI version of the dry suit course — buoyancy, venting, comfort in cold water.',
    },
  ),
  padiVersion(
    'padi-dsmb',
    '06',
    'sdi-dsmb',
    { fr: 'Parachute', en: 'Marker' },
    {
      fr: 'La version PADI du déploiement de parachute de palier et de la signalisation en surface.',
      en: 'The PADI version of delayed surface marker buoy deployment and surface signalling.',
    },
  ),
  padiVersion(
    'padi-search-recovery',
    '07',
    'sdi-search-recovery',
    { fr: 'Recherche', en: 'Search' },
    {
      fr: "La version PADI des techniques de recherche sous-marine et d'utilisation du parachute de levage.",
      en: 'The PADI version of underwater search techniques and lift bag use.',
    },
  ),
  padiVersion(
    'padi-night',
    '08',
    'sdi-night',
    { fr: 'Nuit', en: 'Night' },
    {
      fr: 'La version PADI de la plongée de nuit — gestion de la lampe, orientation dans le noir.',
      en: 'The PADI version of night diving — torch handling, orientation in the dark.',
    },
  ),
  padiVersion(
    'padi-wreck',
    '09',
    'sdi-wreck',
    { fr: 'Épaves', en: 'Wrecks' },
    {
      fr: "La version PADI de l'exploration d'épaves et de la pénétration basique en sécurité.",
      en: 'The PADI version of wreck exploration and basic safe penetration.',
    },
  ),
  padiVersion(
    'padi-buoyancy',
    '10',
    'sdi-buoyancy',
    { fr: 'Flottabilité', en: 'Buoyancy' },
    {
      fr: 'La version PADI de la flottabilité fine — la différence entre nager et flotter.',
      en: 'The PADI version of fine buoyancy — the difference between swimming and floating.',
    },
  ),
];

const FFESSM_CARDS = [
  {
    course: 'ffessm-n1',
    num: 'N1',
    title: same('Niveau 1'),
    // Official prerogatives (I-10 b): supervised to 20 m (PE20).
    sub: { fr: 'Encadré 20 m', en: 'Supervised 20 m' },
    description: {
      fr: "Plongées encadrées par un guide de palanquée jusqu'à 20 m. Idéal pour débuter en bouteille.",
      en: 'Dives to 20 m, led by a dive guide. The entry point for scuba diving.',
    },
  },
  {
    course: 'ffessm-n2',
    num: 'N2',
    title: same('Niveau 2'),
    sub: { fr: 'Autonomie 20 m', en: 'Autonomous 20 m' },
    description: {
      fr: "Plongeur autonome jusqu'à 20 m, encadré jusqu'à 40 m. Maîtrise de la flottabilité, de la remontée et de la gestion du binôme.",
      en: 'Autonomous to 20 m, supervised to 40 m. Buoyancy mastery, controlled ascent, buddy management.',
    },
  },
  {
    course: 'ffessm-n3',
    num: 'N3',
    title: same('Niveau 3'),
    sub: { fr: 'Autonomie 60 m', en: 'Autonomous 60 m' },
    description: {
      fr: "Plongeur autonome jusqu'à 60 m. Plongées profondes, gestion de la décompression, bilan de plongée. Prérequis : N2.",
      en: 'Autonomous to 60 m. Deep dives, decompression management, dive briefing. Prerequisite: N2.',
    },
  },
  {
    course: 'ffessm-n4',
    num: 'N4',
    title: { fr: 'Guide de Palanquée', en: 'Dive Guide' },
    sub: { fr: 'Encadrement 40 m', en: 'Leadership 40 m' },
    description: {
      fr: "Encadrement de palanquées jusqu'à 40 m. Gestion du groupe, briefing, sécurité sur site. Je prépare à l'examen fédéral ; la certification elle-même est délivrée par la fédération, indépendamment de la formation. Passerelle vers l'enseignement.",
      en: 'Leading dive groups to 40 m. Group management, site briefing, in-water safety. I prepare you for the federal exam; the certification itself is awarded by the federation, independently of the training. A bridge toward becoming an instructor.',
    },
  },
  {
    course: 'ffessm-n5',
    num: 'N5',
    title: { fr: 'Directeur de Plongée', en: 'Dive Director' },
    sub: same('Direction'),
    description: {
      fr: "Direction de l'activité plongée : sécurité, organisation du poste de secours, responsabilité de l'ensemble de la sortie.",
      en: 'Directing the full diving activity: safety, rescue station organisation, overall responsibility.',
    },
  },
  {
    course: 'ffessm-pth70',
    num: 'PTH70',
    title: { fr: 'Trimix hypoxique 70 m', en: 'Hypoxic trimix 70 m' },
    sub: { fr: "Jusqu'à 70 m", en: 'Down to 70 m' },
    description: {
      fr: "Plongée au trimix hypoxique jusqu'à 70 m : l'étape nécessaire avant la formation PTH120.",
      en: 'Hypoxic trimix diving to 70 m: the step required before the PTH120 course.',
    },
  },
  {
    course: 'ffessm-pth120',
    num: 'PTH120',
    title: { fr: 'Trimix Hélium', en: 'Trimix (Helium)' },
    sub: {
      fr: 'Formation 0–80 m · évolution 120 m',
      en: 'Training 0–80 m · progression to 120 m',
    },
    description: {
      fr: "Formation Trimix jusqu'au PTH120, le niveau fédéral le plus élevé que je peux délivrer. Les plongées de formation se déroulent entre 0 et 80 m ; une fois certifié, l'évolution permet d'aller jusqu'à 120 m.",
      en: 'Trimix training up to PTH120, the highest federal level I can deliver. Training dives take place between 0 and 80 m; once certified, progression allows diving to 120 m.',
    },
  },
] as const satisfies readonly SpecialtyCard[];

/** Cards of each specialty tab, in the order of the tabs. */
export const SPECIALTIES: Readonly<Record<SpecialtyTabId, readonly SpecialtyCard[]>> = {
  sdi: SDI_CARDS,
  tdi: TDI_CARDS,
  padi: PADI_CARDS,
  ffessm: FFESSM_CARDS,
};
