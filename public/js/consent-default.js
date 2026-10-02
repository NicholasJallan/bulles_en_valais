// Consent Mode v2 (plans/refonte-la-descente/02-architecture.md §12). Synchronous, right after
// boot.js, and an external file: the CSP forbids inline scripts. It sets the default consent
// before anything else, then loads the Google tag on the production host only, so development and
// preproduction never send any data. Same mapping as src/lib/analytics/consent-mode.ts.
(function () {
  var PRODUCTION_HOST = 'dive.bullesenvalais.ch';
  var ADS_ID = 'AW-10798308119';
  // TODO(I-06): set to 'G-QG5ZCVY1Z7' only if Tag Assistant shows that the Google tag does not
  // already send to this GA4 property (a second config would count every page twice).
  var GA4_ID = null;
  // TODO(I-07): 'advanced' (the tag loads at once, cookieless pings until consent) or 'basic' (the
  // tag waits for consent). Advanced by default until Nicholas chooses.
  var MODE = 'advanced';
  var CONSENT_COOKIE = 'cc_cookie';

  var w = window;
  w.dataLayer = w.dataLayer || [];
  function gtag() {
    w.dataLayer.push(arguments);
  }
  w.gtag = gtag;

  // Categories stored by the banner (vanilla-cookieconsent: URI-encoded JSON), so that a returning
  // visitor's choice applies before the banner library has loaded.
  function storedCategories() {
    var match = document.cookie.match(new RegExp('(?:^|; )' + CONSENT_COOKIE + '=([^;]*)'));
    if (!match) return [];
    try {
      var value = JSON.parse(decodeURIComponent(match[1]));
      return value && Object.prototype.toString.call(value.categories) === '[object Array]'
        ? value.categories
        : [];
    } catch (e) {
      return [];
    }
  }

  function signal(granted) {
    return granted ? 'granted' : 'denied';
  }

  var accepted = storedCategories();
  var ads = signal(accepted.indexOf('marketing') !== -1);
  var analytics = signal(accepted.indexOf('analytics') !== -1);

  gtag('consent', 'default', {
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
    analytics_storage: analytics,
    wait_for_update: 500,
  });
  // Without ad_storage, strip the ad click identifiers from what is sent.
  gtag('set', 'ads_data_redaction', true);
  gtag('js', new Date());
  gtag('config', ADS_ID);
  if (GA4_ID) gtag('config', GA4_ID);

  var loaded = false;
  // Called again by the banner (src/components/consent/consent.ts) once something is granted,
  // which is what loads the tag in basic mode. Idempotent.
  w.bvLoadGoogleTag = function () {
    if (loaded || location.hostname !== PRODUCTION_HOST) return;
    loaded = true;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ADS_ID;
    document.head.appendChild(script);
  };

  if (MODE === 'advanced' || ads === 'granted' || analytics === 'granted') w.bvLoadGoogleTag();
})();
