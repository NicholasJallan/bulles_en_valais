function BdeTransition() {
  const sectionRef = React.useRef(null);
  const cursorRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const lastBubbleTime = React.useRef(0);
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setRevealed(true); },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    const el = sectionRef.current;
    const img = imgRef.current;
    if (!el || !img) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.style.transform = 'translateY(' + (progress * 80) + 'px) scale(1.1)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const spawnBubble = (x, y) => {
    const now = Date.now();
    if (now - lastBubbleTime.current < 55) return;
    lastBubbleTime.current = now;
    const container = sectionRef.current;
    if (!container) return;

    const bubble = document.createElement('div');
    bubble.className = 'hirondelle-bubble';
    const size = 6 + Math.random() * 14;
    const drift = (Math.random() - 0.5) * 60;
    const dur = 1000 + Math.random() * 1000;
    bubble.style.left = x + 'px';
    bubble.style.top = y + 'px';
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.setProperty('--drift', drift + 'px');
    bubble.style.animationDuration = dur + 'ms';
    container.appendChild(bubble);
    bubble.addEventListener('animationend', () => bubble.remove(), { once: true });
  };

  const handleMouseMove = (e) => {
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (cursorRef.current) {
      cursorRef.current.style.left = x + 'px';
      cursorRef.current.style.top = y + 'px';
      cursorRef.current.style.opacity = '1';
    }
    spawnBubble(x, y);
  };

  const handleMouseLeave = () => {
    if (cursorRef.current) cursorRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={sectionRef}
      className={'hirondelle-section' + (revealed ? ' is-revealed' : '')}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label="Plongée sous-marine en Valais"
    >
      <img
        ref={imgRef}
        src="images/bde.jpg"
        alt=""
        className="hirondelle-img"
        aria-hidden="true"
        loading="lazy"
      />
      <div className="hirondelle-vignette" aria-hidden="true" />
      <div ref={cursorRef} className="hirondelle-cursor" aria-hidden="true" />
    </div>
  );
}

window.BdeTransition = BdeTransition;
