const Footer = ({ lang }) => (
  <footer className="footer">
    <div>© 2026 Bulles en Valais · Nicholas</div>
    <div>{lang === 'fr' ? 'Valais · Suisse' : 'Valais · Switzerland'}</div>
    <div>dive.bullesenvalais.ch</div>
  </footer>
);

window.Footer = Footer;
