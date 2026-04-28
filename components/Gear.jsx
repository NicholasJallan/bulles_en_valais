const Gear = ({ t }) => (
  <section className="gear" id="gear">
    <div className="container">
      <div className="sec-header">
        <div>
          <div className="eyebrow" style={{marginBottom: 20}}>{t.gear.eyebrow}</div>
          <h2>{t.gear.title_1}<br/><em>{t.gear.title_em}</em></h2>
        </div>
        <p className="sec-lead">{t.gear.lead}</p>
      </div>

      <div className="gear-grid">
        <div className="gear-image reveal" />
        <div className="gear-items">
          {t.gear.items.map((it, i) => (
            <div className="gear-item" key={i}>
              <h4 className="serif">{it.t}</h4>
              {it.html ? <p dangerouslySetInnerHTML={{__html: it.d}} /> : <p>{it.d}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
window.Gear = Gear;
