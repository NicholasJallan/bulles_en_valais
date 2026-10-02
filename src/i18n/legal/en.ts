import type { Dictionary } from '../dictionary.ts';

// Texts to be reviewed by Nicholas: this is not legal advice. Cookie table (S11): names and
// durations from Google's documentation, to be checked in the browser once in production (S13).

export const legalEn: Dictionary['legal'] = {
  privacy: {
    meta: {
      title: 'Privacy — Bulles en Valais',
      description:
        'What personal data Bulles en Valais processes, why, for how long, and how to exercise your rights (Swiss FADP and GDPR).',
    },
    title: 'Privacy policy',
    updated: 'Last updated: 2 October 2026',
    intro:
      'This page explains which personal data is processed when you visit this website or contact me, why, for how long, and what your rights are. It is based on the Swiss Federal Act on Data Protection (FADP) and, for visitors from the European Union, on the General Data Protection Regulation (GDPR).',
    sections: [
      {
        heading: 'Controller',
        paragraphs: [
          [{ text: 'Nicholas Jallan, Bulles en Valais (UID CHE-249.028.561).' }],
          [
            { text: 'Email: ' },
            {
              link: {
                label: 'nicholas@bullesenvalais.ch',
                href: 'mailto:nicholas@bullesenvalais.ch',
              },
            },
            { text: ' · Phone: ' },
            { link: { label: '+41 79 436 81 12', href: 'tel:+41794368112' } },
          ],
        ],
      },
      {
        heading: 'Data processed',
        paragraphs: [
          [{ text: 'Depending on how you use the website, the following data is processed:' }],
        ],
        list: [
          'Contact form: your name, email address, phone number (optional), the topic you are interested in, your message and the language of the page.',
          'Conversations you start by WhatsApp, phone or email: the data you choose to send me.',
          'Server logs, recorded automatically on every visit: IP address, date and time, requested page, referring page and browser.',
          'Audience measurement and advertising, only if you accept them: browsing data collected by Google Analytics and Google Ads (see “Cookies”).',
        ],
      },
      {
        heading: 'Purposes',
        paragraphs: [
          [
            {
              text: 'This data is used for the following purposes only. It is never sold, and your address never receives advertising emails.',
            },
          ],
        ],
        list: [
          'answering your requests and organising your courses;',
          'keeping the website secure and working, for example by blocking abusive form submissions;',
          'measuring the audience of the website and the performance of ads, if you consent to it.',
        ],
      },
      {
        heading: 'Legal bases',
        paragraphs: [
          [
            {
              text: 'In Switzerland, processing follows the principles of the FADP: lawfulness, good faith, proportionality, purpose limitation, accuracy and security. For visitors from the European Union, it relies on the following bases:',
            },
          ],
        ],
        list: [
          'your requests and the preparation of your training: pre-contractual steps and performance of a contract (Art. 6(1)(b) GDPR);',
          'the security of the website and the form: my legitimate interest in protecting them (Art. 6(1)(f) GDPR);',
          'audience measurement and advertising: your consent (Art. 6(1)(a) GDPR), which you can withdraw at any time.',
        ],
      },
      {
        heading: 'Recipients and processors',
        paragraphs: [[{ text: 'Your data is only shared with the service providers needed:' }]],
        list: [
          'Hosting: the website runs on a server I operate myself, in Switzerland.',
          "Google (Gmail): messages sent through the form reach me via Google's email service.",
          'WhatsApp (Meta), if you choose to contact me that way.',
          'Google Analytics and Google Ads, only after your consent.',
        ],
      },
      {
        heading: 'Retention',
        paragraphs: [[{ text: 'Data is kept for as long as its purpose requires, then deleted:' }]],
        list: [
          'messages received (form, email, WhatsApp): kept as long as they serve your request or your training, and deleted on request;',
          'server logs: kept for the security of the website, then deleted.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          [
            {
              text: 'At any time, you can ask to access your data, have it corrected or erased, object to its processing or ask for it to be restricted, receive your data in a common format, and withdraw your consent, without affecting processing already carried out. Simply write to me at ',
            },
            {
              link: {
                label: 'nicholas@bullesenvalais.ch',
                href: 'mailto:nicholas@bullesenvalais.ch',
              },
            },
            { text: '.' },
          ],
          [
            {
              text: 'If you believe your rights are not respected, you can contact the Swiss Federal Data Protection and Information Commissioner (',
            },
            { link: { label: 'FDPIC', href: 'https://www.edoeb.admin.ch', external: true } },
            { text: ') or, in the European Union, the supervisory authority of your country.' },
          ],
        ],
      },
      {
        heading: 'Cookies and local storage',
        paragraphs: [
          [
            {
              text: 'No audience or advertising cookie is set without your consent. The consent banner lets you accept or refuse each category, and the “Manage cookies” link at the bottom of every page lets you change your mind at any time.',
            },
          ],
          [
            {
              text: "Until you accept, the Google tag only sends anonymous signals, with no cookie or identifier, used to estimate traffic as a whole (Google's consent mode).",
            },
          ],
        ],
        list: [
          'Necessary, always active: your consent choice and, if you turn it on, the Calm mode preference.',
          'Audience measurement (Google Analytics): only with your consent.',
          'Advertising (Google Ads): only with your consent, to measure the requests that come from ads.',
        ],
        table: {
          caption: 'Cookies and local storage used by the website',
          headers: ['Name', 'Provider', 'Purpose', 'Duration'],
          rows: [
            ['cc_cookie', 'Bulles en Valais', 'Remember your consent choice', '6 months'],
            [
              'bv-calm (local storage)',
              'Bulles en Valais',
              'Remember Calm mode, if you turn it on',
              'Until you turn it off',
            ],
            ['_ga', 'Google Analytics', 'Tell visitors apart (audience measurement)', '2 years'],
            ['_ga_QG5ZCVY1Z7', 'Google Analytics', 'Keep the state of the visit', '2 years'],
            [
              '_gcl_au, _gcl_aw',
              'Google Ads',
              'Link an enquiry to the ad that brought it',
              '90 days',
            ],
          ],
        },
      },
      {
        heading: 'Security',
        paragraphs: [
          [
            {
              text: "The website is served over HTTPS only. The form is protected against abuse (rate limit, spam filter), and your messages are passed on to me without being stored on the website's server.",
            },
          ],
        ],
      },
      {
        heading: 'Changes',
        paragraphs: [
          [
            {
              text: 'This policy may change, for example when the website does. The date of the last update is shown at the top of the page.',
            },
          ],
        ],
      },
    ],
  },
  legalNotice: {
    meta: {
      title: 'Legal notice — Bulles en Valais',
      description:
        'Publisher, contact details, hosting, intellectual property and credits of the Bulles en Valais website.',
    },
    title: 'Legal notice',
    updated: 'Last updated: 1 October 2026',
    intro: 'Information about the publisher of dive.bullesenvalais.ch and the use of the website.',
    sections: [
      {
        heading: 'Publisher',
        paragraphs: [
          [{ text: 'Nicholas Jallan, Bulles en Valais' }],
          [{ text: 'Business identification number (UID): CHE-249.028.561' }],
          [
            { text: 'Email: ' },
            {
              link: {
                label: 'nicholas@bullesenvalais.ch',
                href: 'mailto:nicholas@bullesenvalais.ch',
              },
            },
          ],
          [{ text: 'Phone: ' }, { link: { label: '+41 79 436 81 12', href: 'tel:+41794368112' } }],
        ],
      },
      {
        heading: 'Hosting',
        paragraphs: [
          [
            {
              text: 'The website is hosted on a server operated by the publisher, in Switzerland.',
            },
          ],
        ],
      },
      {
        heading: 'Intellectual property',
        paragraphs: [
          [
            {
              text: 'The texts and photographs of this website belong to Nicholas Jallan, unless stated otherwise. Any reproduction, even partial, requires his written consent.',
            },
          ],
          [
            {
              text: 'The names SDI, TDI, PADI, FFESSM and CMAS belong to their respective owners; they are only mentioned to identify the courses on offer.',
            },
          ],
        ],
      },
      {
        heading: 'Credits',
        paragraphs: [],
        list: [
          'Photographs: © Nicholas Jallan.',
          '“Light” interlude: image generated by artificial intelligence; it shows no real place or person.',
        ],
      },
      {
        heading: 'Liability',
        paragraphs: [
          [
            {
              text: 'The information on this website is given for guidance and may change. Course fees and content are confirmed at registration.',
            },
          ],
          [
            {
              text: 'Links to other websites are provided for your convenience; the publisher is not responsible for their content.',
            },
          ],
        ],
      },
      {
        heading: 'Applicable law',
        paragraphs: [[{ text: 'This website and its use are governed by Swiss law.' }]],
      },
    ],
  },
};
