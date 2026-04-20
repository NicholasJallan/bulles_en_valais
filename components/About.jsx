const About = ({ t }) => (
  <section className="about" id="about">
    <div className="container">
      <div className="sec-header">
        <div>
          <div className="eyebrow" style={{marginBottom: 20}}>{t.about.eyebrow}</div>
          <h2>{t.about.title_1}<br/><em>{t.about.title_em}</em></h2>
        </div>
        <p className="sec-lead">{t.about.lead}</p>
      </div>

      <div className="about-grid">
        <div className="about-portrait reveal">
          <div className="about-portrait-placeholder">{t.about.portrait_ph}</div>
        </div>

        <div className="about-text reveal">
          <p className="lead">{t.about.body_1}</p>
          <p>{t.about.body_2}</p>
          <p>{t.about.body_3}</p>

          <div className="about-credentials">
            <div className="cred">FFESSM<strong>E3 #28663</strong></div>
            <div className="cred">PADI<strong>MSDT #525399</strong></div>
            <div className="cred">SDI/TDI<strong>#35812</strong></div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
window.About = About;
