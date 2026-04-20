const Hero = ({ mode, t }) => {
  const HERO_IMG = 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=2400&q=85';
  const HERO_MIN = 'https://images.unsplash.com/photo-1551789897-da88ee0a7b4d?w=1400&q=85';

  if (mode === 'split') {
    return (
      <section className="hero hero-split" id="top">
        <div className="hero-text-side">
          <div className="hero-eyebrow">{t.hero.eyebrow}</div>
          <h1 className="serif" style={{fontSize: 'clamp(48px, 6vw, 92px)'}}>
            {t.hero.title_1}<em>{t.hero.title_em}</em> {t.hero.title_2}
          </h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <div className="hero-cta-row">
            <a href="#contact" className="btn btn-primary">{t.hero.cta_primary} <Icons.Arrow /></a>
            <a href="#agencies" className="btn btn-ghost">{t.hero.cta_secondary}</a>
          </div>
        </div>
        <div className="hero-bg hero-bg-side" style={{ backgroundImage: `url(${HERO_IMG})`, position: 'relative' }} />
      </section>
    );
  }

  if (mode === 'minimal') {
    return (
      <section className="hero hero-minimal" id="top">
        <div className="hero-content" style={{position: 'relative', zIndex: 3}}>
          <div className="hero-eyebrow">Valais · Suisse</div>
          <h1 className="serif" style={{fontSize: 'clamp(52px, 7vw, 110px)', color: 'var(--ink)'}}>
            {t.hero.title_1}<em style={{color: 'var(--deep)'}}>{t.hero.title_em}</em> {t.hero.title_2}
          </h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <div className="hero-cta-row">
            <a href="#contact" className="btn btn-primary">{t.hero.cta_primary} <Icons.Arrow /></a>
            <a href="#agencies" className="btn btn-ghost" style={{color: 'var(--ink)', borderColor: 'var(--line)'}}>{t.hero.cta_secondary}</a>
          </div>
        </div>
        <div className="hero-image-wrap" style={{ backgroundImage: `url(${HERO_MIN})` }} />
      </section>
    );
  }

  return (
    <section className="hero" id="top">
      <div className="hero-bg" style={{ backgroundImage: `url(${HERO_IMG})` }} />
      <div className="hero-grain" />
      <div className="hero-credentials">FFESSM E3 #28663 — PADI MSDT #525399 — SDI/TDI #35812</div>
      <div className="hero-content">
        <div className="hero-eyebrow">{t.hero.eyebrow}</div>
        <h1 className="serif">{t.hero.title_1}<em>{t.hero.title_em}</em><br/>{t.hero.title_2}</h1>
        <p className="hero-sub">{t.hero.sub}</p>
        <div className="hero-cta-row">
          <a href="#contact" className="btn btn-primary">{t.hero.cta_primary} <Icons.Arrow /></a>
          <a href="#agencies" className="btn btn-ghost">{t.hero.cta_secondary}</a>
        </div>
      </div>
      <div className="hero-meta">
        <strong>{t.hero.meta}</strong>
        46°14′N · 7°22′E
      </div>
    </section>
  );
};

window.Hero = Hero;
