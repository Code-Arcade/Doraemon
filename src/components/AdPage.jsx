import React, { useEffect, useRef } from 'react';

const STARS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  top: `${Math.round((i * 37 + 11) % 90 + 3)}%`,
  left: `${Math.round((i * 53 + 7) % 90 + 3)}%`,
  size: `${Math.round((i * 13 + 8) % 14 + 6)}px`,
  delay: `${((i * 0.4) % 2.5).toFixed(1)}s`,
  duration: `${((i * 0.7 + 2.8) % 2.5 + 2.5).toFixed(1)}s`,
}));

const SERVICES = [
  { emoji: '🌐', title: 'Business Websites', desc: 'Stunning, fast sites that turn visitors into customers.' },
  { emoji: '🎨', title: 'Portfolio Sites', desc: 'Showcase your work with a beautiful personal brand.' },
  { emoji: '🛒', title: 'Online Stores', desc: 'Sell anything online with a fully custom storefront.' },
  { emoji: '📱', title: 'Mobile-Ready Apps', desc: 'Responsive on every device — phones, tablets, desktops.' },
];

export default function AdPage({ onBack }) {
  const doraRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="ad-page-root">
      {/* Animated starfield bg */}
      <div className="ad-starfield" aria-hidden="true">
        {STARS.map(s => (
          <span
            key={s.id}
            className="ad-star"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}
      </div>

      {/* Minimal header */}
      <header className="ad-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a
            href="/"
            className="logo"
            onClick={e => { e.preventDefault(); onBack(); }}
            aria-label="Back to Pocket Sweets"
          >
            <div className="logo-bell" aria-hidden="true" />
            <span className="logo-text">Pocket Sweets</span>
          </a>
          <button className="btn btn-secondary" onClick={onBack} style={{ fontSize: '0.85rem' }}>
            ← Back to Shop
          </button>
        </div>
      </header>

      <main className="ad-main">
        {/* Hero section */}
        <section className="ad-hero">
          <div className="ad-hero-inner container">

            {/* Doraemon character panel */}
            <div className="ad-dora-panel">
              <div className="ad-dora-wrapper" ref={doraRef}>
                {/* Doraemon SVG-style illustration using CSS + emoji */}
                <div className="ad-dora-figure">
                  {/* Speech bubble */}
                  <div className="ad-speech-bubble">
                    <span>Do you need a website for your business or portfolio? <br /><br /></span>
                  </div>
                  {/* Doraemon image */}
                  <img
                    src="/assets/images/doraemon_ad.png"
                    alt="Doraemon"
                    className="ad-dora-img"
                  />
                </div>
              </div>
            </div>

            {/* Main message */}
            <div className="ad-message-panel">
              <div className="ad-badge-tag">✨ Special Announcement from Doraemon</div>
              <h1 className="ad-headline">
                Need a Website for Your<br />
                <span className="ad-headline-accent">Business or Portfolio?</span>
              </h1>
              <p className="ad-subtext">
                From the 22nd century, Doraemon says — even future gadgets need a great website!
                Whether it's a business, a personal portfolio, or an online store, the right web presence makes all the difference.
              </p>

              <div className="ad-cta-card">
                <div className="ad-cta-inner">
                  <div className="ad-cta-logo">
                    <span className="ad-cta-logo-icon">🕹️</span>
                    <span className="ad-cta-logo-text">CodeArcade</span>
                  </div>
                  <p className="ad-cta-desc">
                    Contact <strong>CodeArcade</strong> — they build beautiful, high-performance websites and apps for businesses, creators, and professionals. From idea to launch! 🚀
                  </p>
                  <div className="ad-cta-buttons">
                    <a
                      href="mailto:contact@codearcade.dev"
                      className="btn btn-primary ad-cta-btn-main"
                      id="ad-contact-btn"
                    >
                      📩 Contact CodeArcade
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services grid */}
        <section className="ad-services-section">
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center' }}>
              <span className="section-subtitle">What They Build</span>
              <h2 className="section-title">Everything You Need Online</h2>
            </div>
            <div className="ad-services-grid">
              {SERVICES.map((s, i) => (
                <div className="ad-service-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="ad-service-emoji">{s.emoji}</div>
                  <h3 className="ad-service-title">{s.title}</h3>
                  <p className="ad-service-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA banner */}
        <section className="ad-bottom-banner">
          <div className="container">
            <div className="ad-banner-card">
              <div className="ad-banner-dora-emoji">🤖</div>
              <div className="ad-banner-text">
                <h2>Ready to Build Something Amazing?</h2>
                <p>
                  Doraemon approves! Reach out to <strong>CodeArcade</strong> today and turn your idea into a world-class digital experience.
                </p>
              </div>
              <div className="ad-banner-actions">
                <a
                  href="mailto:contact@codearcade.dev"
                  className="btn btn-primary"
                  id="ad-bottom-contact-btn"
                  style={{ fontSize: '1rem', padding: '14px 32px' }}
                >
                  Get in Touch 🚀
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="ad-footer">
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.82rem', opacity: 0.6 }}>
            This page is brought to you by <strong>Pocket Sweets</strong> 🍡 × <strong>CodeArcade</strong> 🕹️ — crafting the web, one pixel at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
