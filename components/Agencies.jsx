const AgencyPanel = ({ a, priceCardTitle }) => (
  <div className="agency-panel" key={a.key}>
    <div className="agency-panel-content">
      <h3 className="serif">{a.headline.split(',').map((part, i, arr) => (
        <React.Fragment key={i}>{i === arr.length - 1 ? <em>{part}</em> : part}{i < arr.length - 1 && ','}</React.Fragment>
      ))}</h3>
      <p className="agency-desc">{a.desc}</p>
      <ul className="agency-highlights">{a.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
    </div>

    <div className="price-card">
      <h4>{priceCardTitle}</h4>
      {a.prices.map((p, i) => (
        <div className="price-row" key={i}>
          <div style={{flex: 1}}>
            <div className="price-name">{p.name}</div>
            <div className="price-meta">{p.meta}</div>
          </div>
          {p.amt ? <div className="price-amt">{p.amt}</div> : <div className="price-custom">{p.custom}</div>}
        </div>
      ))}
      {a.note && <div className="price-note">{a.note}</div>}
    </div>
  </div>
);

const Agencies = ({ layout, t }) => {
  const [active, setActive] = React.useState('padi');
  const [openAcc, setOpenAcc] = React.useState('padi');
  const agencies = { padi: {...t.agencies.padi, key:'padi'}, tdi: {...t.agencies.tdi, key:'tdi'}, ffessm: {...t.agencies.ffessm, key:'ffessm'} };
  const a = agencies[active];

  return (
    <section className="agencies" id="agencies" data-agency-layout={layout}>
      <div className="container">
        <div className="sec-header">
          <div>
            <div className="eyebrow" style={{marginBottom: 20}}>{t.agencies.eyebrow}</div>
            <h2>{t.agencies.title_1}<br/><em>{t.agencies.title_em}</em></h2>
          </div>
          <p className="sec-lead">{t.agencies.lead}</p>
        </div>

        {layout === 'tabs' && (
          <>
            <div className="agency-selector">
              {Object.values(agencies).map(ag => (
                <button key={ag.key} className={`agency-tab ${active === ag.key ? 'active' : ''}`} onClick={() => setActive(ag.key)}>
                  <span className="t-label serif">{ag.label}</span>
                  <span className="t-sub">{ag.sub}</span>
                </button>
              ))}
            </div>
            <AgencyPanel a={a} priceCardTitle={t.agencies.priceCardTitle} />
          </>
        )}

        {layout === 'cards' && (
          <div className="agency-cards">
            {Object.values(agencies).map(ag => (
              <div className="agency-card" key={ag.key}>
                <div className="eyebrow" style={{marginBottom: 16}}>{ag.sub}</div>
                <h3 className="serif">{ag.label}</h3>
                <p className="agency-desc" style={{fontSize: 15, marginBottom: 20, marginTop: 16}}>{ag.desc.substring(0, 180)}…</p>
                <ul className="agency-highlights" style={{marginBottom: 28}}>
                  {ag.highlights.slice(0, 3).map((h, i) => <li key={i} style={{fontSize: 14}}>{h}</li>)}
                </ul>
                <div style={{marginTop: 'auto'}}>
                  {ag.prices.slice(0, 3).map((p, i) => (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop:'1px solid var(--line)', fontSize: 13}}>
                      <span>{p.name}</span>
                      <span style={{color:'var(--deep)', fontFamily:'var(--font-mono)'}}>{p.amt || p.custom}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {layout === 'accordion' && (
          <div className="accordion-items">
            {Object.values(agencies).map(ag => (
              <div className={`accordion-item ${openAcc === ag.key ? 'open' : ''}`} key={ag.key}>
                <button className="accordion-head" onClick={() => setOpenAcc(openAcc === ag.key ? null : ag.key)}>
                  <div>
                    <div className="eyebrow" style={{marginBottom: 10}}>{ag.sub}</div>
                    <h3 className="serif">{ag.label} — {ag.headline.split(',')[0]}</h3>
                  </div>
                  <div className="accordion-toggle">{openAcc === ag.key ? '−' : '+'}</div>
                </button>
                {openAcc === ag.key && (
                  <div className="accordion-body"><AgencyPanel a={ag} priceCardTitle={t.agencies.priceCardTitle} /></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
window.Agencies = Agencies;
