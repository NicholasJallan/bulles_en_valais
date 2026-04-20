const Testimonials = ({ t }) => (
  <section className="testimonials" id="testimonials">
    <div className="container">
      <div className="sec-header">
        <div>
          <div className="eyebrow" style={{marginBottom: 20}}>{t.testimonials.eyebrow}</div>
          <h2>{t.testimonials.title_1}<br/><em>{t.testimonials.title_em}</em></h2>
        </div>
        <p className="sec-lead">{t.testimonials.lead}</p>
      </div>

      <div className="testimonial-empty">
        <h3 className="serif"><em>« … »</em></h3>
        <p>{t.testimonials.ph}</p>
        <a href="#contact" className="btn btn-outline">{t.testimonials.cta} <Icons.Arrow /></a>
        <span className="mono">{t.testimonials.status}</span>
      </div>
    </div>
  </section>
);
window.Testimonials = Testimonials;
