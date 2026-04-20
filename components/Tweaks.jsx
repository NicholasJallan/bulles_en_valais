const PALETTES = [
  { key: 'default', label: { fr: 'Aquatique', en: 'Aquatic' }, swatch: '#0f3a4f' },
  { key: 'nordic', label: { fr: 'Nordique', en: 'Nordic' }, swatch: '#2d4a3e' },
  { key: 'glacier', label: { fr: 'Glacier', en: 'Glacier' }, swatch: '#7a9bb8' },
  { key: 'sunset', label: { fr: 'Couchant', en: 'Sunset' }, swatch: '#c96a3a' },
];

const HERO_MODES = [
  { key: 'fullscreen', label: { fr: 'Plein écran', en: 'Full bleed' } },
  { key: 'split', label: { fr: 'Split', en: 'Split' } },
  { key: 'minimal', label: { fr: 'Minimal', en: 'Minimal' } },
];

const AGENCY_LAYOUTS = [
  { key: 'tabs', label: { fr: 'Onglets', en: 'Tabs' } },
  { key: 'cards', label: { fr: 'Cartes', en: 'Cards' } },
  { key: 'accordion', label: { fr: 'Accordéon', en: 'Accordion' } },
];

const T_LABELS = {
  fr: { title: 'Tweaks', palette: 'Palette', hero: 'Hero', layout: 'Cursus — Layout', dark: 'Mode sombre' },
  en: { title: 'Tweaks', palette: 'Palette', hero: 'Hero', layout: 'Courses — Layout', dark: 'Dark mode' },
};

const Tweaks = ({ state, setState, open, lang = 'fr' }) => {
  const L = T_LABELS[lang] || T_LABELS.fr;
  return (
    <div className={`tweaks-panel ${open ? 'open' : ''}`}>
      <h5>{L.title}</h5>

      <div className="tweak-group">
        <div className="tweak-label">{L.palette}</div>
        <div className="tweak-swatches">
          {PALETTES.map(p => (
            <button
              key={p.key}
              className={`tweak-sw ${state.palette === p.key ? 'active' : ''}`}
              style={{ background: p.swatch }}
              title={p.label[lang]}
              onClick={() => setState({ ...state, palette: p.key })}
            />
          ))}
        </div>
      </div>

      <div className="tweak-group">
        <div className="tweak-label">{L.hero}</div>
        <div className="tweak-options">
          {HERO_MODES.map(m => (
            <button
              key={m.key}
              className={`tweak-opt ${state.hero === m.key ? 'active' : ''}`}
              onClick={() => setState({ ...state, hero: m.key })}
            >{m.label[lang]}</button>
          ))}
        </div>
      </div>

      <div className="tweak-group">
        <div className="tweak-label">{L.layout}</div>
        <div className="tweak-options">
          {AGENCY_LAYOUTS.map(m => (
            <button
              key={m.key}
              className={`tweak-opt ${state.agencyLayout === m.key ? 'active' : ''}`}
              onClick={() => setState({ ...state, agencyLayout: m.key })}
            >{m.label[lang]}</button>
          ))}
        </div>
      </div>

      <div className="tweak-group">
        <div
          className="tweak-toggle"
          onClick={() => setState({ ...state, dark: !state.dark })}
        >
          <span>{L.dark}</span>
          <div className={`tweak-switch ${state.dark ? 'on' : ''}`} />
        </div>
      </div>
    </div>
  );
};

window.Tweaks = Tweaks;
window.PALETTES = PALETTES;
