const Insurance = ({ t }) => (
  <section className="insurance" id="insurance">
    <div className="container">
      <div className="sec-header">
        <div>
          <div className="eyebrow" style={{marginBottom: 20}}>{t.insurance.eyebrow}</div>
          <h2>{t.insurance.title_1}<br/><em>{t.insurance.title_em}</em></h2>
        </div>
        <p className="sec-lead">{t.insurance.lead}</p>
      </div>

      <div className="insurance-grid">
        {t.insurance.items.map((it, i) => (
          <div className="ins-card reveal" key={i}>
            <div className="ins-badge">{it.b}</div>
            <h4 className="serif">{it.t}</h4>
            <p>{it.d}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
window.Insurance = Insurance;
