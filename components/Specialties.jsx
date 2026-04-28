const Specialties = ({ t }) => {
  const [tab, setTab] = React.useState('padi');
  const tabData = t.specialties.tabs[tab];

  return (
    <section className="specialties" id="specialties">
      <div className="container">
        <div className="sec-header">
          <div>
            <div className="eyebrow" style={{marginBottom: 20}}>{t.specialties.eyebrow}</div>
            <h2 style={{color: '#fff'}}>{t.specialties.title_1} <em>{t.specialties.title_em}</em></h2>
          </div>
          <p className="sec-lead">{t.specialties.lead}</p>
        </div>

        <div className="spec-tabs">
          {['padi','sdi','tdi','ffessm'].map(k => (
            <button
              key={k}
              className={`spec-tab ${tab === k ? 'active' : ''}`}
              onClick={() => setTab(k)}
            >
              {t.specialties.tabs[k].label}
            </button>
          ))}
        </div>

        <div className="spec-tab-lead">{tabData.lead}</div>

        <div className="spec-grid">
          {tabData.items.map((s, i) => (
            <div className="spec-cell" key={i}>
              <div>
                <div className="spec-num">{s.num} · {s.sub}</div>
                <div className="spec-name serif" style={{marginTop: 14}}>{s.name}</div>
                {s.equiv && <div className="spec-equiv">≡ {s.equiv}</div>}
              </div>
              <div>
                <div className="spec-desc">{s.desc}</div>
                <div className="spec-price" style={{marginTop: 14}}>{s.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
window.Specialties = Specialties;
