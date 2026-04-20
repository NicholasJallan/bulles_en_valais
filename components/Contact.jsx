const Contact = ({ t }) => {
  const [status, setStatus] = React.useState(null); // null | 'sending' | 'ok' | 'err'
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', interest: 'padi-owd', message: '' });
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      // Posts to the site's own mail endpoint served by the Pi (nginx → sendmail bridge).
      // If the endpoint is not reachable (e.g. dev preview), falls back to mailto:.
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('http ' + res.status);
      setStatus('ok');
      setForm({ name: '', email: '', phone: '', interest: 'padi-owd', message: '' });
    } catch (err) {
      // Graceful fallback — open the user's mail client pre-filled
      const subject = encodeURIComponent(`Contact — ${form.name}`);
      const body = encodeURIComponent(`Nom / Name: ${form.name}\nEmail: ${form.email}\nTéléphone / Phone: ${form.phone}\nIntérêt / Interest: ${form.interest}\n\n${form.message}`);
      window.location.href = `mailto:nicholas@bullesenvalais.ch?subject=${subject}&body=${body}`;
      setStatus('ok');
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="sec-header">
          <div>
            <div className="eyebrow" style={{marginBottom: 20}}>{t.contact.eyebrow}</div>
            <h2>{t.contact.title_1}<br/><em>{t.contact.title_em}</em></h2>
          </div>
          <p className="sec-lead">{t.contact.lead}</p>
        </div>

        <div className="contact-grid">
          <div className="contact-channels">
            <a href="https://wa.me/41794368112" target="_blank" rel="noopener" className="contact-channel">
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
            <a href="mailto:nicholas@bullesenvalais.ch" className="contact-channel">
              <div className="contact-channel-icon"><Icons.Mail /></div>
              <div className="contact-channel-text">
                <span className="mono">{t.contact.email}</span>
                <span className="val">nicholas@bullesenvalais.ch</span>
              </div>
            </a>

            <div style={{marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: 'rgba(240,237,230,0.6)', lineHeight: 1.7}}>
              <span className="mono" style={{display:'block', marginBottom: 10, letterSpacing: '0.14em'}}>{t.contact.certs}</span>
              FFESSM E3 #28663<br/>
              PADI MSDT #525399<br/>
              SDI-TDI #35812
            </div>
          </div>

          <form className="contact-form" onSubmit={submit}>
            <div className="form-row">
              <div className="form-field">
                <label>{t.contact.form.name}</label>
                <input type="text" required value={form.name} onChange={update('name')} placeholder={t.contact.form.namePh} />
              </div>
              <div className="form-field">
                <label>{t.contact.form.email}</label>
                <input type="email" required value={form.email} onChange={update('email')} placeholder={t.contact.form.emailPh} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>{t.contact.form.phone}</label>
                <input type="tel" value={form.phone} onChange={update('phone')} placeholder={t.contact.form.phonePh} />
              </div>
              <div className="form-field">
                <label>{t.contact.form.interest}</label>
                <select value={form.interest} onChange={update('interest')}>
                  {t.contact.interests.map(i => <option key={i.v} value={i.v}>{i.l}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field" style={{marginBottom: 8}}>
              <label>{t.contact.form.message}</label>
              <textarea value={form.message} onChange={update('message')} placeholder={t.contact.form.messagePh} />
            </div>
            <button type="submit" className="form-submit" disabled={status === 'sending'}>
              {status === 'sending' ? '…' : t.contact.form.submit}
            </button>
            {status === 'ok' && <div className="form-success">{t.contact.form.success}</div>}
            {status === 'err' && <div className="form-success" style={{background: 'rgba(184,92,59,0.25)'}}>{t.contact.form.error}</div>}
          </form>
        </div>
      </div>
    </section>
  );
};
window.Contact = Contact;
