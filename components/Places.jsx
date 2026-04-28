const Places = ({ t }) => {
  const IMGS = [
    'images/dive_rosel.jpg',
    'images/dive_sion.jpg',
    'images/dive_leman.jpg',
  ];
  return (
    <section className="places" id="places">
      <div className="container">
        <div className="sec-header">
          <div>
            <div className="eyebrow" style={{marginBottom: 20}}>{t.places.eyebrow}</div>
            <h2>{t.places.title_1}<br/><em>{t.places.title_em}</em></h2>
          </div>
          <p className="sec-lead">{t.places.lead}</p>
        </div>

        <div className="places-grid">
          {t.places.items.map((p, i) => (
            <div className="place-card reveal" key={i}>
              <div className="place-img" style={{ backgroundImage: `url(${IMGS[i]})` }} />
              <div className="place-info">
                <span className="mono">{p.coord}</span>
                <h3 className="serif">{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
window.Places = Places;
