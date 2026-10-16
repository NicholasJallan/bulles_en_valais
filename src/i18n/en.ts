import type { Dictionary } from './dictionary.ts';
import { legalEn } from './legal/en.ts';

// British spelling, as on the current site (recognised, metres). A real translation of fr.ts, not a
// word-for-word one; the structure must stay identical (parity.test.ts).

export const en: Dictionary = {
  meta: {
    title: 'Scuba diving courses & school in Valais — Bulles en Valais',
    description:
      'Try-dives and scuba courses in Valais: SDI/TDI, PADI & FFESSM at Lac du Rosel, Sion & Lake Geneva. Tailored private training with a dedicated instructor.',
    ogTitle: 'Descending, slowly, into the silence — Bulles en Valais',
    ogDescription:
      'Scuba diving school in Valais with Nicholas Jallan, SDI/TDI, PADI and FFESSM instructor. From try-dive to trimix in small groups, at your own pace.',
    ogImageAlt:
      'Bulles en Valais: Lac du Rosel and the title “Descending, slowly, into the silence”.',
    structuredData: {
      jobTitle: 'SDI/TDI, PADI and FFESSM scuba diving instructor',
      catalogName: 'Scuba diving courses',
    },
  },
  a11y: {
    skipLink: 'Skip to content',
    mainNav: 'Main navigation',
    openMenu: 'Open the menu',
    closeMenu: 'Close the menu',
    closeDialog: 'Close',
    newTab: '(opens in a new tab)',
    languageSwitch: 'Language',
    languageNames: { fr: 'French', en: 'English' },
    home: 'Bulles en Valais, back to top',
  },
  nav: {
    about: 'Instructor',
    courses: 'Courses',
    specialties: 'Specialties',
    places: 'Locations',
    gifts: 'Gift vouchers',
    faq: 'FAQ',
    contact: 'Get in touch',
  },
  hud: {
    gauge: 'Depth gauge',
    depth: 'Depth',
    temperature: 'Temperature',
    diveTime: 'Dive time',
    safetyStop: 'Safety stop',
    slowAscent: 'Slow',
    diveProfile: 'Dive profile',
    openProfile: 'Show the dive profile',
    closeProfile: 'Close the dive profile',
    entry: 'Water entry',
    note: 'Imaginary depth: it follows your reading of the page.',
  },
  hero: {
    eyebrow: 'Dive training · Valais, Switzerland',
    title: { before: 'Descending,', em: 'slowly,', after: 'into the silence.' },
    lead: 'Scuba diving school in Valais: courses and try-dives (SDI/TDI, PADI, FFESSM) at Lac du Rosel (Martigny), Les Îles in Sion and Lake Geneva. One dedicated instructor, your own pace.',
    primaryCta: 'Book a session',
    secondaryCta: 'Explore the courses',
    places: 'Lac du Rosel · Les Îles, Sion · Lake Geneva',
    imageAlt: 'Lac du Rosel near Martigny: water so clear you can see the bottom from the shore.',
  },
  manifesto: {
    eyebrow: 'Manifesto',
    title: { before: 'I train divers,', em: 'not certificate holders.' },
    body: 'The difference shows in ease, in how you read the environment, and in that economy of movement that only comes with hours of immersion.',
  },
  instructor: {
    eyebrow: 'The instructor',
    title: { before: 'A school is, above all,', em: 'a person.' },
    lead: 'Nicholas — certified scuba instructor in Valais and Western Switzerland (SDI/TDI, PADI MSDT, FFESSM E4 Trimix). Over twenty years under the surface, and the belief that good training is built between two people — a student, an instructor, and all the time it takes.',
    body: [
      'My scuba classes are small — often one-on-one, rarely more than three students. Everyone progresses at their own pace, and the teaching adapts to your profile, not the other way around.',
      'As a triple-certified instructor in Switzerland, I can guide you toward the curriculum that best fits your plans: SDI for recreational diving and TDI for the technical path, united in a single system; PADI, if you value the most recognised card worldwide; or the French federal system (FFESSM/CMAS). Or all three.',
    ],
    portraitAlt:
      'Nicholas, wearing a rebreather and a red drysuit, with a student at the surface of a lake.',
    credentialsTitle: 'Certifications',
    verifyCredential: 'Check on the official register',
  },
  courses: {
    eyebrow: 'Courses',
    title: { before: 'Three schools,', em: 'one instructor.' },
    lead: 'SDI/TDI and PADI share exactly the same international RSTC standards — same syllabus, same worldwide recognition. FFESSM reports to CMAS. You can follow a single curriculum (Open Water, Advanced, Rescue, Divemaster), or mix all three to dive without restriction wherever you go.',
    tabsLabel: 'Choose a school',
    priceListTitle: 'Courses & fees',
    onRequest: 'On request',
    askAbout: 'Ask about it',
    agencies: {
      'sdi-tdi': {
        label: 'SDI / TDI',
        sub: 'Recreational & technical',
        headline: { before: 'From try-dive to trimix,', em: 'one single system.' },
        description:
          'SDI is one of the founding agencies behind the RSTC standards that govern recreational diving worldwide — the same standards behind any international certification. Your prerogatives are interchangeable with any RSTC card, including for travel. The recreational path follows the same progression as PADI, up to Divemaster, the first professional level. Where SDI extends further is through TDI: Trimix, rebreather, deep diving, cavern — the most complete technical path, without ever changing agency or instructor.',
        highlights: [
          'One single system, from try-dive to full technical diving',
          'Recreational progression: Open Water → Advanced → Rescue → Divemaster',
          'TDI technical path: Nitrox, advanced Nitrox, decompression, Trimix, rebreather',
          'Prerogatives recognised the same as any international RSTC certification',
          'Tailored support, simple cross-over from another certification',
        ],
        note: 'Base rates above. The most advanced courses (Trimix, rebreather, cavern) are built case by case — get in touch so we can review your profile and define the right package.',
      },
      padi: {
        label: 'PADI',
        sub: 'Recreational · International',
        headline: { before: 'The best-known name', em: 'in recreational diving.' },
        description:
          'PADI is the brand the general public recognises most — a real advantage if you mostly dive on organised trips or if your future dive buddies are used to it. Underneath, the training follows the same RSTC standards as SDI: same content, same prerogatives, same progression up to Divemaster. Just like SDI, your certification is recognised worldwide.',
        highlights: [
          'The certification most widely recognised by the general public',
          'Multilingual e-learning, available anytime',
          'Modular progression: Open Water → Advanced → Rescue → Divemaster',
          'Certifications issued directly by the instructor',
        ],
      },
      ffessm: {
        label: 'FFESSM',
        sub: 'French federation · CMAS',
        headline: { before: 'The federal route,', em: 'to dive in France.' },
        description:
          'The FFESSM curriculum (affiliated with CMAS) is the way to go if you dive mainly in mainland France, Corsica, or French overseas territories (Martinique, Guadeloupe, Guyane, Polynesia, Réunion) — or if your dive buddies are on this system. The theory is denser: I teach it in person alongside the online material the federation is developing.',
        highlights: [
          'Levels N1 to N4 (N4 is the Guide de Palanquée / dive leader brevet)',
          'Trimix E4 instructor: training up to PTH120',
          'Dual FFESSM/CMAS certification recognised in 100+ countries',
          'Theory taught face-to-face, intensive or spaced format',
          'Bridges available to and from SDI and PADI',
        ],
        note: 'Federal courses need more direct interaction. Reach out so we can define a schedule that suits your pace and goals.',
      },
    },
  },
  interludes: {
    descent: {
      quote: 'Going down starts with learning to breathe slowly.',
      imageAlt: 'A diver and hammerhead sharks in the deep blue of the open sea.',
      credit: 'Photo © Nicholas Jallan',
    },
    light: {
      quote: 'At forty metres, red is gone. Only the torch remembers colour.',
      imageAlt:
        'Rebreather divers explore the wreck of the Hirondelle in Lake Geneva, their red torches cutting through dark water.',
      credit: 'The Hirondelle, in Lake Geneva · Photo © Nicholas Jallan',
    },
  },
  depthLadder: {
    eyebrow: 'The scale',
    title: { before: 'How deep', em: 'will you go?' },
    lead: 'Each certification opens up a new depth. Here is how far each one takes you, from try-dive to trimix.',
    youAreHere: 'You are here',
    legend: 'Maximum depth of each certification',
    scaleNote: 'Below 40 m, the scale is compressed.',
    ascent: 'Ascent',
  },
  compare: {
    eyebrow: 'Comparison',
    title: { before: 'At', em: 'a glance.' },
    lead: 'Three philosophies, overlapping prerogatives, and one principle to remember: what matters is the water under your fins — not the logo on the card.',
    caption: 'The three schools compared: SDI/TDI, PADI and FFESSM',
    criterion: 'Criterion',
    columns: { 'sdi-tdi': 'Rec. & technical', padi: 'Recreational', ffessm: 'Federal / CMAS' },
    rows: [
      {
        label: 'Parent body',
        values: {
          'sdi-tdi': 'RSTC (private, international)',
          padi: 'RSTC (private, international)',
          ffessm: 'CMAS (federation)',
        },
      },
      {
        label: 'Theory',
        values: {
          'sdi-tdi': 'E-learning + sessions',
          padi: 'Online e-learning',
          ffessm: 'In-person classes',
        },
      },
      {
        label: 'Recognition',
        values: {
          'sdi-tdi': 'Worldwide',
          padi: 'Worldwide',
          ffessm: 'France, overseas, CMAS',
        },
      },
      {
        label: 'Pace',
        values: {
          'sdi-tdi': 'Modular, technical',
          padi: 'Fast, modular',
          ffessm: 'Progressive, federal',
        },
      },
      {
        label: 'First level',
        values: {
          'sdi-tdi': 'Open Water Scuba · 18 m',
          padi: 'Open Water Diver · 18 m',
          ffessm: 'Niveau 1 · 20 m supervised',
        },
      },
      {
        label: 'Technical path',
        values: {
          'sdi-tdi': 'Full (Nitrox, Trimix, CCR)',
          padi: 'Tec Rec',
          ffessm: 'Trimix up to PTH120',
        },
      },
      {
        label: 'Annual licence',
        values: { 'sdi-tdi': 'None', padi: 'None', ffessm: 'Yes (~ €50)' },
      },
      {
        label: 'Best for',
        values: {
          'sdi-tdi': 'Going deeper',
          padi: 'Travel, starting out',
          ffessm: 'Diving in France',
        },
      },
    ],
    footnote:
      'Unsure? SDI/TDI is often the most complete starting point — recreational and technical in one single system, with simple bridges to PADI or FFESSM depending on where you travel. I help you plan the route.',
  },
  specialties: {
    eyebrow: 'Specialties',
    title: { before: 'Further, deeper,', em: 'better.' },
    lead: 'Drysuit, Nitrox, deep diving, Trimix: essential specialties for diving alpine lakes or preparing for travel. Choose the agency that fits your goals (SDI, TDI, PADI, FFESSM) with direct cross-overs. Discounts when two of you train together.',
    tabsLabel: 'Choose an agency',
    tabs: {
      sdi: {
        label: 'SDI',
        lead: 'Scuba Diving International — the standard RSTC: Open Water training, drysuit, navigation and a direct route to the TDI technical branch.',
      },
      tdi: {
        label: 'TDI',
        lead: 'Technical Diving International — the world reference in technical diving: advanced Nitrox, staged decompression, normoxic and hypoxic Trimix.',
      },
      padi: {
        label: 'PADI',
        lead: 'PADI specialties (Dry Suit, Deep Diver, Enriched Air Nitrox, Wreck) to complete your logbook with the most recognised international brand. Same content, same instructor.',
      },
      ffessm: {
        label: 'FFESSM',
        lead: 'The French federal curriculum (CMAS), recognised in Switzerland and worldwide: from Level 1 to Level 4 (dive guide) and Trimix certifications for rigorous training.',
      },
    },
    equivalent: 'Equivalent',
  },
  places: {
    eyebrow: 'Locations',
    title: { before: 'Three bodies of water,', em: 'three atmospheres.' },
    lead: 'Courses and try-dives take place at Lac du Rosel near Martigny, Les Îles in Sion, and on Lake Geneva. Ideal sites for training and exploration in Valais and Western Switzerland, with accommodation options for intensive courses.',
    route: 'The Rhône, from Sion to Lake Geneva',
    openMap: 'open in Google Maps',
    facts: {
      maxDepth: 'Max depth',
      sites: 'Some of the sites',
    },
  },
  prepare: {
    eyebrow: 'Gear & insurance',
    title: { before: 'Before you', em: 'go under.' },
    lead: 'Two things to settle before your first dive: what you wear, and what covers you.',
    gear: {
      title: { before: 'Provided, rented,', em: 'or bought?' },
      lead: 'Some gear is provided based on sizes and availability. The rest is rented — and for personal pieces, a word before you buy can save a costly mistake.',
      items: [
        {
          title: 'Provided for the course',
          text: [
            {
              text: 'Depending on your size and availability, a share of the gear is included in the training — tank, regulator, BCD, wetsuit.',
            },
          ],
        },
        {
          title: 'Worth owning: MFS',
          text: [
            {
              text: 'Mask, fins, snorkel: your personal set. Ask before you buy to avoid a choice that does not suit your morphology or intended use.',
            },
          ],
        },
        {
          title: 'Rented locally',
          text: [
            {
              text: 'Gear we cannot provide is rented and at your expense. Preferred rates with my partners (',
            },
            { link: { label: 'plongee.ch', href: 'https://www.plongee.ch', external: true } },
            { text: ' and ' },
            { link: { label: 'scubashop.ch', href: 'https://www.scubashop.ch', external: true } },
            { text: ').' },
          ],
        },
      ],
      imageAlt: 'Dive gear on the deck of a boat.',
    },
    insurance: {
      title: { before: 'Covered,', em: 'properly covered.' },
      lead: 'Diving medical costs — hyperbaric chamber treatment in particular — can rise very fast. Better to talk about this before, not after.',
      items: [
        {
          badge: 'During the course',
          title: 'DAN insurance',
          text: 'As a student, you are covered by DAN Europe during the training. After the course, I strongly recommend a personal subscription.',
        },
        {
          badge: 'Swiss residents',
          title: 'LAMal + accident',
          text: 'If you are insured in Switzerland through LAMal with accident cover, you are normally covered. Check limits and hyperbaric coverage.',
        },
        {
          badge: 'My professional cover',
          title: 'FSSS / Orion + Vaudoise',
          text: 'As a student, you are also covered under my FSSS professional insurance, backed by Orion and La Vaudoise.',
        },
      ],
    },
  },
  gifts: {
    eyebrow: 'Gift vouchers',
    title: { before: 'Give someone their first', em: 'breath underwater.' },
    lead: 'Give a gift voucher for a try-dive, a full certification course or a specialty in Valais. Valid for one year, at their own pace.',
    offersTitle: 'The offers',
    offers: {
      baptism: {
        title: 'A try-dive',
        text: 'About two hours of introductory diving for a first breath underwater in open water, closely and safely supervised.',
      },
      course: {
        title: 'A course',
        text: 'Open Water, a specialty or a federal level: the voucher covers the chosen course.',
      },
      amount: {
        title: 'Any amount',
        text: 'You set the amount, they choose their dive.',
      },
    },
    stepsTitle: 'How it works',
    steps: [
      {
        title: 'You choose',
        text: 'Tell me who the voucher is for and what you would like to give: a message is enough.',
      },
      {
        title: 'You receive the voucher',
        text: 'I send you the voucher as a PDF, ready to print or forward.',
      },
      {
        title: 'They dive',
        text: 'They pick a date with me within the following year.',
      },
    ],
    conditionsTitle: 'Terms',
    conditions: [
      'Valid for one year.',
      'Payment: whichever method suits you.',
      'Rescheduling or refund: case by case, just ask.',
    ],
    cta: 'Give a gift voucher',
    card: { label: 'Gift voucher', validity: 'Valid for 1 year' },
  },
  testimonials: {
    eyebrow: 'Testimonials',
    title: { before: 'They came', em: 'through here.' },
    lead: 'They dived with me — their words say it better than mine.',
    prompt: 'Just dived with me?',
    cta: 'Leave a Google review',
    previous: 'Previous testimonial',
    next: 'Next testimonial',
    readMore: 'Read the full review',
    source: 'Reviews published on Google',
    languageNote: 'Translated from French',
    items: [
      {
        author: 'Maude M.',
        course: 'PADI Open Water + Dry Suit',
        text: [
          "I did my PADI Open Water with Nicholas (plus Dry Suit, as it was in winter), and the training was excellent. Great support, and a course that gave me a really solid level. I was able to dive in Mexico with complete confidence, and the guides there confirmed I'd had excellent training 👌",
          'Thank you, Nicholas!',
        ],
        lang: 'en',
        translated: true,
      },
      {
        author: 'Florent Q.',
        course: 'PADI Open Water · CMAS Niveau 1',
        text: [
          'PADI Open Water and CMAS Level 1 with Nicholas: quality training from a passionate, rigorous instructor. Many thanks!',
        ],
        lang: 'en',
        translated: true,
      },
      {
        author: 'Alexandre F.',
        course: 'PADI Open Water',
        text: [
          'We did our Open Water with Nicholas. A real success — his guidance makes for genuine progress! Thanks, Nicholas 🤘',
        ],
        lang: 'en',
        translated: true,
      },
      {
        author: 'Marthe T.',
        course: 'Nitrox · Deep · Dry Suit · Niveau 3 · RIFAP · Rescue',
        text: [
          "I've done several certifications with Nicholas (Nitrox, Deep, Dry Suit, as well as Level 3, RIFAP and Rescue), and the experience was truly great from start to finish.",
          'A gifted teacher who really listens, he adapts to each person, so you progress quickly while enjoying your dives.',
          'You feel confident and well supervised, and you progress fast.',
          'I recommend him without hesitation.',
        ],
        lang: 'en',
        translated: true,
      },
      {
        author: 'Guillaume L.',
        course: 'PADI Open Water',
        text: [
          'Did my Open Water with Nicholas, brilliant 👌',
          'A great approach to diving that makes you want to keep going! …',
        ],
        lang: 'en',
        translated: true,
      },
      {
        author: 'Stefano T.',
        course: 'PADI Open Water',
        text: [
          "I did my PADI Open Water with Nicolas and couldn't have dreamed of better support!",
          'Serious, thorough training, always in a great atmosphere. Nicolas gave me confidence, helped me progress and, above all, gave me very solid foundations to keep growing as a diver.',
          "And then there are the little moments that are part of the training too… like the lunch break when the man himself calmly has a ham, egg and cheese crêpe… followed by a Nutella one! 😂😂 That's bound to make memories!",
          "I'm now looking forward to a slot in October for three more dives with him, including my very first night dive 🌙🤿… and then on to Level 2! 😁",
          'Thank you, Nicolas, for your patience, your advice and all the good times. More than an instructor, I was lucky enough to meet someone I now consider a friend.',
          'See you very soon underwater! 🤿',
        ],
        lang: 'en',
        translated: true,
      },
      {
        author: 'Adeline V.',
        course: 'Gifted try-dive',
        text: [
          'I gave a try-dive as a gift, and I can honestly say my partner was delighted! A wonderful moment with a wonderful instructor. Thank you!',
        ],
        lang: 'en',
        translated: true,
      },
      {
        author: 'Alexandre F.',
        course: 'Open Water · Nitrox',
        text: [
          'I did my Open Water and Nitrox with Nicholas and it was a great experience! A very good instructor, and his training is very thorough!',
          "If you're looking to train in French-speaking Switzerland, I recommend doing it with Nicholas.",
        ],
        lang: 'en',
        translated: true,
      },
    ],
  },
  faq: {
    eyebrow: 'Safety stop · 3 min',
    title: { before: 'Your questions,', em: 'my answers.' },
    lead: 'Frequently asked questions about courses, try-dives and dive gear in Valais. If yours is not listed here, just drop me a message — I usually reply within the day.',
    items: [
      {
        question: 'Beginner: should I choose a try-dive or an Open Water course?',
        answer:
          'Two options for beginners: a try-dive (about 2 hours) to discover underwater sensations in a lake, or directly the Open Water course (SDI or PADI) to become an autonomous diver down to 18 metres anywhere in the world. E-learning theory, small-group lake practice, flexible schedule. A 10-minute call helps you choose the right path.',
      },
      {
        question: 'Can I mix certification agencies (criss-cross)?',
        answer:
          'Yes — this is one of Bulles en Valais’s key strengths. Criss-crossing allows you to complete an initial level with SDI or PADI for convenience and global recognition, then take advanced levels or specialties with FFESSM/CMAS or TDI. You will then dive without restriction wherever you go.',
      },
      {
        question: 'What is the difference between SDI and PADI?',
        answer:
          "In practice, none. SDI and PADI share the same RSTC standards. Certifications have the same prerogatives, are accepted in the same way everywhere, and cross-overs between the two are immediate. SDI is simply less advertised than PADI — it's still the agency I use by default.",
      },
      {
        question: 'Do I need to buy gear before starting?',
        answer:
          'No. A large share of the equipment is provided based on available sizes (tank, regulator, BCD, wetsuit or drysuit). Only the mask/fins/snorkel set is worth owning — and I advise asking before buying to avoid wrong choices.',
      },
      {
        question: 'Where do the diving courses and try-dives take place?',
        answer:
          'Mainly at Lac du Rosel near Martigny, Les Îles in Sion, and on Lake Geneva wall dives (Rivaz, Chillon, St-Gingolph, Hermance). These Swiss sites offer calm, safe training conditions accessible year-round. Dive camp packages with accommodation in Valais are also available on request.',
      },
      {
        question: 'How long does a diving course take?',
        answer:
          'From two hours for a try-dive to several weeks for a Divemaster internship. Open Water takes a minimum of 3 days (typically over one or two weekends), Advanced takes 2 days, and Rescue 3 days. The schedule is fully adaptable to your availability.',
      },
      {
        question: 'I am already certified with another agency: what should I do?',
        answer:
          'Bring your certification card (PADI, SSI, CMAS, NAUI...) and your logbook. An equivalent cross-over or a tailored refresher (ReActivate, ~2 hours, CHF 80) will restore your confidence for diving Swiss lakes or continuing toward a higher qualification.',
      },
    ],
  },
  contact: {
    eyebrow: 'Surface',
    title: { before: "Underwater, we don't talk.", em: "Let's surface." },
    subtitle: { before: 'Shall we', em: 'talk it through?' },
    lead: 'The best training starts with a conversation. Ten minutes to scope your project, your availability, your wishes — then we build the journey together.',
    channels: {
      whatsapp: 'WhatsApp · fastest',
      phone: 'Phone · Switzerland',
      email: 'Email',
    },
    credentialsTitle: 'Certifications',
    form: {
      name: 'Name',
      namePlaceholder: 'Your name',
      email: 'Email',
      emailPlaceholder: 'you@example.com',
      phone: 'Phone (optional)',
      phonePlaceholder: '+41 …',
      interest: "I'm interested in",
      message: 'Your message',
      messagePlaceholder: 'Current level, availability, questions, travel plans…',
      honeypot: 'Leave this field empty',
      noScript:
        'Without JavaScript, this form cannot be sent: please reach me on WhatsApp, by phone or by e-mail instead.',
      submit: 'Send the message',
      sending: 'Sending…',
      success: 'Thanks — your message is on its way. I will reply as soon as possible.',
      sendAnother: 'Send another message',
      errorSummary: 'Please check:',
      errorDelivery: 'Sending failed. Please try again, or write to me directly:',
      sendByEmail: 'Send my message by email',
      errorRateLimit:
        'Too many messages in a short time. Try again in a minute, or write to me directly:',
      errorBusy:
        'The form has had a lot of messages today and is taking a break. Your message is ready, write to me directly:',
      sendByWhatsApp: 'Write on WhatsApp',
      fieldNames: {
        name: 'your name',
        email: 'your email address',
        phone: 'your phone number',
        message: 'your message',
      },
      errors: {
        required: 'This field is required.',
        email: 'Please check the email address, for example you@example.com.',
        tooLong: 'This text is too long.',
      },
      mail: {
        subject: 'Contact from the website',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        interest: 'Interest',
      },
    },
  },
  whatsapp: {
    open: 'Chat on WhatsApp',
    title: 'Chat with Nicholas',
    subtitle: 'Reply via WhatsApp',
    intro: 'Hi! Send your question — it lands directly in my WhatsApp.',
    placeholder: 'Your message…',
    send: 'Send on WhatsApp',
    defaultMessage: 'Hello Nicholas, I am writing from your website.',
  },
  footer: {
    region: 'Valais · Switzerland',
    copyright: 'Bulles en Valais · Nicholas Jallan',
    credits: {
      photos: 'Photos: © Nicholas Jallan',
    },
    coursesTitle: 'Courses',
    courses: {
      baptism: 'Try scuba diving',
      drysuit: 'Dry suit diving',
      openwater: 'Open Water course',
    },
    legalLinks: { privacy: 'Privacy', legalNotice: 'Legal notice' },
    calmMode: {
      label: 'Calm mode',
      short: 'Calm',
      description: 'Turns off animations and smooth scrolling.',
      on: 'on',
      off: 'off',
    },
    cookies: 'Manage cookies',
    social: 'Social media',
    backToSurface: 'Back to the surface',
  },
  consent: {
    label: 'Cookie consent',
    title: 'A few cookies, with your consent',
    description:
      "I use Google Analytics to learn how the site is read, and Google Ads to measure the enquiries that come from my ads. None of their cookies is set without your consent, and you can change your mind at any time with 'Manage cookies', at the bottom of the page.",
    acceptAll: 'Accept all',
    rejectAll: 'Reject all',
    showPreferences: 'Choose',
    preferences: {
      title: 'Manage cookies',
      intro:
        'Choose what you accept. Without your consent, Google only receives anonymous signals, with no cookie or identifier.',
      save: 'Save my choices',
      close: 'Close',
      categories: {
        necessary: {
          title: 'Necessary',
          description:
            'Always on: they only remember your consent choice and, if you turn it on, Calm mode.',
        },
        analytics: {
          title: 'Audience measurement',
          description:
            'Google Analytics: pages viewed and paths through the site, aggregated, to improve it.',
        },
        marketing: {
          title: 'Advertising',
          description:
            'Google Ads: measuring the enquiries that come from my ads. No ads are shown on this site.',
        },
      },
      moreTitle: 'Learn more',
      moreDescription:
        'The name, provider and duration of each cookie, and your rights, are set out in the privacy policy.',
    },
    privacyLink: 'Privacy policy',
  },
  landing: {
    highlightsEyebrow: 'Benefits and safety',
    stepsEyebrow: 'Progression and method',
    faqEyebrow: 'Questions and answers',
    contactEyebrow: 'Booking and contact',
    contactTitle: { before: "Let's plan your", em: 'session', after: 'together.' },
    contactLead:
      'Fill out the form below or message me directly on WhatsApp. Flexible scheduling around your calendar.',
    channelsTitle: 'Direct channels',
    breadcrumbHome: 'Home',
  },
  notFound: {
    meta: {
      title: 'Page not found — Bulles en Valais',
      description:
        'This page does not exist, or no longer does. The diving courses of Bulles en Valais are waiting on the home page.',
    },
    eyebrow: 'Error 404',
    title: { before: 'This page stayed', em: 'at the bottom.' },
    lead: "The link may be old, or the address mistyped. Let's head back to the surface together.",
    back: 'Back to the home page',
  },
  legal: legalEn,
};
