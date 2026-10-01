import type { Dictionary } from '../dictionary.ts';

// Texts to be reviewed by Nicholas: this is not legal advice. The cookie table comes in S11.

export const legalFr: Dictionary['legal'] = {
  privacy: {
    meta: {
      title: 'Confidentialité — Bulles en Valais',
      description:
        'Les données que Bulles en Valais traite, pourquoi, combien de temps, et comment exercer vos droits (nLPD et RGPD).',
    },
    title: 'Politique de confidentialité',
    updated: 'Dernière mise à jour : 1er octobre 2026',
    intro:
      "Cette page explique quelles données personnelles sont traitées quand vous visitez ce site ou que vous me contactez, pourquoi, pendant combien de temps, et quels sont vos droits. Elle s'appuie sur la loi fédérale sur la protection des données (nLPD) et, pour les visiteurs de l'Union européenne, sur le règlement général sur la protection des données (RGPD).",
    sections: [
      {
        heading: 'Responsable du traitement',
        paragraphs: [
          [{ text: 'Nicholas Jallan, Bulles en Valais. Adresse : TODO(I-08).' }],
          [
            { text: 'E-mail : ' },
            {
              link: {
                label: 'nicholas@bullesenvalais.ch',
                href: 'mailto:nicholas@bullesenvalais.ch',
              },
            },
            { text: ' · Téléphone : ' },
            { link: { label: '+41 79 436 81 12', href: 'tel:+41794368112' } },
          ],
        ],
      },
      {
        heading: 'Données traitées',
        paragraphs: [
          [
            {
              text: 'Selon la façon dont vous utilisez le site, les données suivantes sont traitées :',
            },
          ],
        ],
        list: [
          'Formulaire de contact : votre nom, votre adresse e-mail, votre téléphone (facultatif), le sujet qui vous intéresse, votre message et la langue de la page.',
          'Échanges que vous engagez par WhatsApp, par téléphone ou par e-mail : les données que vous choisissez de me transmettre.',
          "Journaux du serveur, enregistrés automatiquement à chaque visite : adresse IP, date et heure, page demandée, page d'origine et navigateur.",
          "Mesure d'audience et publicité, seulement si vous les acceptez : données de navigation recueillies par Google Analytics et Google Ads (voir « Cookies »).",
        ],
      },
      {
        heading: 'Finalités',
        paragraphs: [
          [
            {
              text: 'Ces données servent uniquement aux fins suivantes. Elles ne sont jamais vendues, et votre adresse ne reçoit aucune publicité par e-mail.',
            },
          ],
        ],
        list: [
          'répondre à vos demandes et organiser vos cours ;',
          'assurer la sécurité et le bon fonctionnement du site, par exemple en bloquant les envois abusifs du formulaire ;',
          "mesurer l'audience du site et l'efficacité des annonces, si vous y consentez.",
        ],
      },
      {
        heading: 'Bases légales',
        paragraphs: [
          [
            {
              text: "En Suisse, le traitement respecte les principes de la nLPD : licéité, bonne foi, proportionnalité, finalité, exactitude et sécurité. Pour les visiteurs de l'Union européenne, il repose sur les bases suivantes :",
            },
          ],
        ],
        list: [
          'vos demandes et la préparation de votre formation : mesures précontractuelles et exécution du contrat (art. 6, par. 1, let. b RGPD) ;',
          'la sécurité du site et du formulaire : mon intérêt légitime à les protéger (art. 6, par. 1, let. f RGPD) ;',
          "la mesure d'audience et la publicité : votre consentement (art. 6, par. 1, let. a RGPD), que vous pouvez retirer à tout moment.",
        ],
      },
      {
        heading: 'Destinataires et sous-traitants',
        paragraphs: [
          [{ text: "Vos données ne sont communiquées qu'aux prestataires nécessaires :" }],
        ],
        list: [
          "Hébergement : le site est hébergé sur un serveur que j'exploite moi-même, en Suisse.",
          'Google (Gmail) : les messages du formulaire me sont acheminés par la messagerie de Google.',
          'WhatsApp (Meta), si vous choisissez de me contacter par ce moyen.',
          'Google Analytics et Google Ads, seulement après votre consentement.',
        ],
      },
      {
        heading: 'Transferts hors de Suisse',
        paragraphs: [
          [
            {
              text: "Google et Meta peuvent traiter des données aux États-Unis. Ces transferts sont encadrés par le Swiss-U.S. Data Privacy Framework (et, pour l'Union européenne, par l'EU-U.S. Data Privacy Framework) ou par des clauses contractuelles types.",
            },
          ],
        ],
      },
      {
        heading: 'Durées de conservation',
        paragraphs: [
          [
            {
              text: 'Les données sont conservées le temps nécessaire à leur finalité, puis supprimées :',
            },
          ],
        ],
        list: [
          'messages reçus (formulaire, e-mail, WhatsApp) : TODO(I-08) ;',
          'journaux du serveur : TODO(I-08).',
        ],
      },
      {
        heading: 'Vos droits',
        paragraphs: [
          [
            {
              text: "Vous pouvez à tout moment demander l'accès à vos données, leur rectification ou leur effacement, vous opposer à un traitement ou en demander la limitation, recevoir vos données dans un format courant, et retirer votre consentement, sans effet sur les traitements déjà effectués. Il suffit de m'écrire à ",
            },
            {
              link: {
                label: 'nicholas@bullesenvalais.ch',
                href: 'mailto:nicholas@bullesenvalais.ch',
              },
            },
            { text: ' : je réponds dans un délai de 30 jours.' },
          ],
          [
            {
              text: 'Si vous estimez que vos droits ne sont pas respectés, vous pouvez vous adresser au Préposé fédéral à la protection des données et à la transparence (',
            },
            { link: { label: 'PFPDT', href: 'https://www.edoeb.admin.ch', external: true } },
            { text: "), ou, dans l'Union européenne, à l'autorité de contrôle de votre pays." },
          ],
        ],
      },
      {
        heading: 'Cookies et stockage local',
        paragraphs: [
          [
            {
              text: "Aucun cookie de mesure ou de publicité n'est déposé sans votre accord. Le bandeau de consentement vous laisse accepter ou refuser chaque catégorie, et le lien « Gérer les cookies », en bas de chaque page, permet de changer d'avis à tout moment.",
            },
          ],
        ],
        list: [
          "Nécessaires, toujours actifs : votre choix de consentement et, si vous l'activez, la préférence du Mode calme.",
          "Mesure d'audience (Google Analytics) : seulement avec votre accord.",
          'Publicité (Google Ads) : seulement avec votre accord, pour mesurer les demandes venues des annonces.',
        ],
      },
      {
        heading: 'Sécurité',
        paragraphs: [
          [
            {
              text: "Le site est servi uniquement en HTTPS. Le formulaire est protégé contre les abus (limite d'envois, filtre anti-spam), et vos messages me sont transmis sans être conservés sur le serveur du site.",
            },
          ],
        ],
      },
      {
        heading: 'Modifications',
        paragraphs: [
          [
            {
              text: 'Cette politique peut évoluer, par exemple quand le site change. La date de la dernière mise à jour figure en haut de la page.',
            },
          ],
        ],
      },
    ],
  },
  legalNotice: {
    meta: {
      title: 'Mentions légales — Bulles en Valais',
      description:
        'Éditeur, coordonnées, hébergement, propriété intellectuelle et crédits du site de Bulles en Valais.',
    },
    title: 'Mentions légales',
    updated: 'Dernière mise à jour : 1er octobre 2026',
    intro: "Informations sur l'éditeur du site dive.bullesenvalais.ch et sur son utilisation.",
    sections: [
      {
        heading: 'Éditeur',
        paragraphs: [
          [{ text: 'Nicholas Jallan, Bulles en Valais' }],
          [{ text: 'Forme juridique : TODO(I-08)' }],
          [{ text: 'Adresse : TODO(I-08)' }],
          [{ text: 'Numéro IDE : TODO(I-08)' }],
          [
            { text: 'E-mail : ' },
            {
              link: {
                label: 'nicholas@bullesenvalais.ch',
                href: 'mailto:nicholas@bullesenvalais.ch',
              },
            },
          ],
          [
            { text: 'Téléphone : ' },
            { link: { label: '+41 79 436 81 12', href: 'tel:+41794368112' } },
          ],
        ],
      },
      {
        heading: 'Hébergement',
        paragraphs: [
          [{ text: "Le site est hébergé sur un serveur exploité par l'éditeur, en Suisse." }],
        ],
      },
      {
        heading: 'Propriété intellectuelle',
        paragraphs: [
          [
            {
              text: 'Les textes et les photographies de ce site appartiennent à Nicholas Jallan, sauf mention contraire. Toute reproduction, même partielle, demande son accord écrit.',
            },
          ],
          [
            {
              text: 'Les noms SDI, TDI, PADI, FFESSM et CMAS appartiennent à leurs détenteurs respectifs ; ils ne sont cités que pour désigner les formations proposées.',
            },
          ],
        ],
      },
      {
        heading: 'Crédits',
        paragraphs: [],
        list: [
          'Photographies : © Nicholas Jallan.',
          'Interlude « Lumière » : visuel généré par intelligence artificielle ; il ne représente ni un lieu ni une personne réels.',
        ],
      },
      {
        heading: 'Responsabilité',
        paragraphs: [
          [
            {
              text: "Les informations de ce site sont données à titre indicatif et peuvent évoluer. Les tarifs et le contenu des formations sont confirmés au moment de l'inscription.",
            },
          ],
          [
            {
              text: "Les liens vers d'autres sites sont proposés pour votre commodité ; leur contenu n'engage pas l'éditeur.",
            },
          ],
        ],
      },
      {
        heading: 'Droit applicable',
        paragraphs: [[{ text: 'Ce site et son utilisation sont soumis au droit suisse.' }]],
      },
    ],
  },
};
