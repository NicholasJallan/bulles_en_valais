// Floating WhatsApp chat bubble — bottom right
// When the user sends a message, it opens wa.me with the prefilled text,
// routing the conversation directly to Nicholas's WhatsApp Business.
const WhatsAppChat = ({ t }) => {
  const [open, setOpen] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const PHONE = '41794368112'; // E.164 without the +
  const BUSINESS_NAME = 'Nicholas · Bulles en Valais';

  const send = () => {
    const text = msg.trim() || (t.chat.intro);
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
    setMsg('');
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <button
        className={`wa-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={t.chat.open}
      >
        {open ? <Icons.Close /> : <Icons.Whatsapp />}
      </button>

      <div className={`wa-chat ${open ? 'open' : ''}`} role="dialog" aria-label={t.chat.title}>
        <div className="wa-head">
          <div className="wa-avatar"><Icons.Whatsapp /></div>
          <div className="wa-head-text">
            <strong>{BUSINESS_NAME}</strong>
            <span>{t.chat.sub}</span>
          </div>
          <button className="wa-close" onClick={() => setOpen(false)} aria-label="close"><Icons.Close /></button>
        </div>

        <div className="wa-body">
          <div className="wa-bubble">
            <div className="wa-bubble-name">Nicholas</div>
            <div className="wa-bubble-text">{t.chat.intro}</div>
            <div className="wa-bubble-time">• online</div>
          </div>
        </div>

        <div className="wa-input-row">
          <textarea
            className="wa-input"
            rows={1}
            placeholder={t.chat.placeholder}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={onKey}
          />
          <button className="wa-send" onClick={send} aria-label={t.chat.send}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="wa-footer">{t.chat.send}</div>
      </div>
    </>
  );
};
window.WhatsAppChat = WhatsAppChat;
