const Nav = ({ heroMode, lang, setLang, t }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#about', label: t.nav.instructor },
    { href: '#agencies', label: t.nav.curriculum },
    { href: '#specialties', label: t.nav.specialties },
    { href: '#places', label: t.nav.places },
    { href: '#faq', label: t.nav.faq },
  ];

  const heroIsDark = heroMode === 'fullscreen';
  const navClass = `nav ${scrolled ? 'scrolled' : ''} ${heroIsDark && !scrolled ? 'hero-white' : ''}`;

  return (
    <>
      <nav className={navClass}>
        <a href="#top" className="nav-logo">
          <span className="nav-logo-mark">
            <img src="images/logo.png" width="14" height="14" alt="" />
          </span>
          <span>Bulles en Valais</span>
        </a>

        <div className="nav-links">
          {links.map(l => (<a key={l.href} href={l.href} className="nav-link">{l.label}</a>))}
          <div className="lang-switch">
            <span className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</span>
            <span>·</span>
            <span className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</span>
          </div>
          <a href="#contact" className="nav-cta">{t.nav.cta}</a>
        </div>

        <button className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span style={{transform: menuOpen ? 'rotate(45deg) translate(4px,4px)' : 'none'}}/>
          <span style={{opacity: menuOpen ? 0 : 1}}/>
          <span style={{transform: menuOpen ? 'rotate(-45deg) translate(4px,-4px)' : 'none'}}/>
        </button>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {links.map(l => (<a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>))}
        <a href="#contact" onClick={() => setMenuOpen(false)}>{t.nav.cta} →</a>
      </div>
    </>
  );
};
window.Nav = Nav;
