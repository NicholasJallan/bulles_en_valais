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

      <div className="testimonial-grid">
        {t.testimonials.items.map((item, i) => (
          <div className="testimonial-card reveal" key={i}>
            <div className="testimonial-quote">❝</div>
            <p className="testimonial-text">{item.text}</p>
            <div className="testimonial-author">
              <span className="testimonial-name">{item.author}</span>
              <span className="testimonial-course mono">{item.course}</span>
            </div>
          </div>
        ))}
        <div className="testimonial-cta reveal">
          <p>Vous venez de plonger avec moi ?</p>
          <a href="#contact" className="btn btn-outline">{t.testimonials.cta} <Icons.Arrow /></a>
        </div>
      </div>
    </div>
  </section>
);
window.Testimonials = Testimonials;
