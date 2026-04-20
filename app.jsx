const DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "default",
  "hero": "fullscreen",
  "agencyLayout": "tabs",
  "dark": false
}/*EDITMODE-END*/;

function App() {
  const [state, setState] = React.useState(DEFAULTS);
  const [editMode, setEditMode] = React.useState(false);
  const [lang, setLang] = React.useState(() => {
    const saved = localStorage.getItem('bv_lang');
    if (saved === 'fr' || saved === 'en') return saved;
    return (navigator.language || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';
  });
  const t = window.useT(lang);

  React.useEffect(() => { localStorage.setItem('bv_lang', lang); document.documentElement.lang = lang; }, [lang]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-palette', state.palette);
    document.documentElement.setAttribute('data-theme', state.dark ? 'dark' : 'light');
  }, [state.palette, state.dark]);

  React.useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [state.hero, state.agencyLayout, lang]);

  React.useEffect(() => {
    const handler = (e) => {
      if (!e.data || !e.data.type) return;
      if (e.data.type === '__activate_edit_mode') setEditMode(true);
      if (e.data.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const updateState = (next) => {
    setState(next);
    const edits = {};
    Object.keys(next).forEach(k => { if (next[k] !== state[k]) edits[k] = next[k]; });
    if (Object.keys(edits).length) {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    }
  };

  return (
    <>
      <Nav heroMode={state.hero} lang={lang} setLang={setLang} t={t} />
      <Hero mode={state.hero} t={t} />
      <About t={t} />
      <Agencies layout={state.agencyLayout} t={t} />
      <Compare t={t} />
      <Specialties t={t} />
      <Places t={t} />
      <Gear t={t} />
      <Insurance t={t} />
      <Testimonials t={t} />
      <FAQ t={t} />
      <Contact t={t} />
      <Footer lang={lang} />

      <WhatsAppChat t={t} />
      <Tweaks state={state} setState={updateState} open={editMode} lang={lang} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
