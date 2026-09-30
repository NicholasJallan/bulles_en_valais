const CONTACT_EMAIL = 'nicholas@bullesenvalais.ch';
// website is a honeypot: hidden from people, filled in by naive bots.
const EMPTY_FORM = { name: '', email: '', phone: '', interest: 'sdi-owd', message: '', website: '' };

const mailtoHref = (form) => {
  try {
    const subject = encodeURIComponent(`Contact — ${form.name}`);
    const body = encodeURIComponent(`Nom / Name: ${form.name}\nEmail: ${form.email}\nTéléphone / Phone: ${form.phone}\nIntérêt / Interest: ${form.interest}\n\n${form.message}`);
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  } catch (err) {
    return `mailto:${CONTACT_EMAIL}`; // text with a lone surrogate cannot be URI-encoded
  }
};

const Contact = ({ t }) => {
  const [status, setStatus] = React.useState(null); // null | 'sending' | 'ok' | 'err'
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [invalid, setInvalid] = React.useState([]); // fields rejected by the server
  const shownAt = React.useRef(performance.now());
  const confirmedRef = React.useRef(null);
  const nameRef = React.useRef(null);
  const refocusName = React.useRef(false);
  const update = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (invalid.includes(k)) setInvalid(invalid.filter((f) => f !== k));
  };
  const fieldProps = (k) => ({
    id: `contact-${k}`,
    'aria-invalid': invalid.includes(k) || undefined,
    'aria-describedby': invalid.includes(k) ? 'contact-form-error' : undefined,
  });

  React.useEffect(() => {
    if (status === 'ok' && confirmedRef.current) confirmedRef.current.focus();
    if (status === null && refocusName.current && nameRef.current) {
      refocusName.current = false;
      nameRef.current.focus();
    }
  }, [status]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setInvalid([]);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, elapsed: Math.round(performance.now() - shownAt.current), locale: document.documentElement.lang }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null); // nginx 413/429/5xx pages are HTML
        setInvalid(data && Array.isArray(data.fields) ? data.fields : []);
        throw new Error('http ' + res.status);
      }
      setStatus('ok');
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus('err');
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="contact-grid">

          <div className="contact-left">
            <div className="eyebrow" style={{marginBottom: 16}}>{t.contact.eyebrow}</div>
            <h2 className="contact-title">{t.contact.title_1}<br/><em>{t.contact.title_em}</em></h2>
            <p className="sec-lead contact-lead">{t.contact.lead}</p>

            <div className="contact-channels">
              <a href="https://wa.me/41794368112" target="_blank" rel="noopener noreferrer" className="contact-channel">
                <div className="contact-channel-icon"><Icons.Whatsapp /></div>
                <div className="contact-channel-text">
                  <span className="mono">{t.contact.whatsapp}</span>
                  <span className="val">+41 79 436 81 12</span>
                </div>
              </a>
              <a href="tel:+41794368112" className="contact-channel">
                <div className="contact-channel-icon"><Icons.Phone /></div>
                <div className="contact-channel-text">
                  <span className="mono">{t.contact.phone}</span>
                  <span className="val">+41 79 436 81 12</span>
                </div>
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="contact-channel">
                <div className="contact-channel-icon"><Icons.Mail /></div>
                <div className="contact-channel-text">
                  <span className="mono">{t.contact.email}</span>
                  <span className="val">{CONTACT_EMAIL}</span>
                </div>
              </a>
            </div>

            <div style={{marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: 'rgba(240,237,230,0.5)', lineHeight: 1.7}}>
              <span className="mono" style={{display:'block', marginBottom: 8, letterSpacing: '0.14em'}}>{t.contact.certs}</span>
              DEJEPS{' '}<a href="https://recherche-educateur.sports.gouv.fr/CartePro/07425ED0350" target="_blank" rel="noopener noreferrer" style={{color:'inherit', textDecoration:'underline', textUnderlineOffset:3}}>07425ED0350</a><br/>
              <br/>
              FFESSM E4<br/>
              PADI MSDT #525399<br/>
              SDI-TDI #35812<br/>
              <br/>
              CAH 2B
            </div>
          </div>

          {status === 'ok' ? (
            <div className="contact-form form-confirmed" role="status" tabIndex={-1} ref={confirmedRef}>
              <div className="form-confirmed-icon" aria-hidden="true">✓</div>
              <p className="form-confirmed-msg">{t.contact.form.success}</p>
              <button className="form-confirmed-reset" onClick={() => { refocusName.current = true; setStatus(null); }}>
                {t.contact.form.sendAnother}
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submit}>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="contact-name">{t.contact.form.name}</label>
                  <input type="text" required maxLength={100} ref={nameRef} {...fieldProps('name')} value={form.name} onChange={update('name')} placeholder={t.contact.form.namePh} />
                </div>
                <div className="form-field">
                  <label htmlFor="contact-email">{t.contact.form.email}</label>
                  <input type="email" required maxLength={254} {...fieldProps('email')} value={form.email} onChange={update('email')} placeholder={t.contact.form.emailPh} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="contact-phone">{t.contact.form.phone}</label>
                  <input type="tel" maxLength={40} {...fieldProps('phone')} value={form.phone} onChange={update('phone')} placeholder={t.contact.form.phonePh} />
                </div>
                <div className="form-field">
                  <label htmlFor="contact-interest">{t.contact.form.interest}</label>
                  <select id="contact-interest" value={form.interest} onChange={update('interest')}>
                    {t.contact.interests.map(i => <option key={i.v} value={i.v}>{i.l}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-field" style={{marginBottom: 8}}>
                <label htmlFor="contact-message">{t.contact.form.message}</label>
                <textarea maxLength={5000} {...fieldProps('message')} value={form.message} onChange={update('message')} placeholder={t.contact.form.messagePh} />
              </div>
              <div className="hp" aria-hidden="true">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
              </div>
              <button type="submit" className="form-submit" disabled={status === 'sending'}>
                {status === 'sending' ? '…' : t.contact.form.submit}
              </button>
              {status === 'err' && (
                <div className="form-error" role="alert" id="contact-form-error">
                  {invalid.length > 0 && t.contact.form.errorFields
                    ? `${t.contact.form.errorFields} ${invalid.map((k) => (t.contact.form.fieldNames || {})[k] || k).join(', ')}.`
                    : t.contact.form.error}{' '}
                  <a href={mailtoHref(form)}>{t.contact.form.errorMail}</a>
                </div>
              )}
            </form>
          )}

        </div>
      </div>
    </section>
  );
};
window.Contact = Contact;
