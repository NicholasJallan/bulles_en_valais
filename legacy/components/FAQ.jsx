const FAQ = ({ t }) => {
  const [open, setOpen] = React.useState(0);
  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="sec-header">
          <div>
            <div className="eyebrow" style={{marginBottom: 20}}>{t.faq.eyebrow}</div>
            <h2>{t.faq.title_1}<br/><em>{t.faq.title_em}</em></h2>
          </div>
          <p className="sec-lead">{t.faq.lead}</p>
        </div>

        <div className="faq-list">
          {t.faq.items.map((item, i) => (
            <div className={`faq-item ${open === i ? 'open' : ''}`} key={i}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <h4 className="serif">{item.q}</h4>
                <div className="faq-toggle">+</div>
              </button>
              <div className="faq-a"><div className="faq-a-inner">{item.a}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
window.FAQ = FAQ;
