import React, { useState } from 'react';

const doraemonQuotes = [
  "My absolute favorite is the red-bean Dorayaki! 🥞",
  "Tap the Anywhere Door below to teleport our parlor to different sweet dimensions! 🚪",
  "Reach into my 4D Pocket! I hid secret coupons from the 22nd century! ✨",
  "Need to memorize something? Try printing your formulas on our Memory Bread! 🍞",
  "Baking joy and happiness, one Dorayaki at a time. Have a super sweet day! ☀️"
];

export default function Hero({ playBubbleSound }) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [tilt, setTilt] = useState(false);

  const handleSpeechBubbleClick = () => {
    // Increment quote
    setQuoteIndex((prev) => (prev + 1) % doraemonQuotes.length);
    playBubbleSound();

    // Trigger visual tilt feedback
    setTilt(true);
    setTimeout(() => setTilt(false), 400);
  };

  return (
    <section className="hero" id="hero">
      <div className="container hero-grid">
        <div className="hero-content">
          <div className="hero-tag" id="hero-mini-tag">
            22nd Century Sweet Delights
          </div>
          <h1 className="hero-title" id="hero-headline">
            Futuristic Sweetness.<br />Perfected.
          </h1>
          <p className="hero-desc" id="hero-paragraph">
            Nobita's favorite premium dessert laboratory. Crafted with organic ingredients, magic gadgets, and childhood nostalgia.
          </p>
          <div className="hero-buttons">
            <a href="#menu" className="btn btn-primary" id="hero-primary-btn">Sweets Menu</a>
            <a href="#pocket" className="btn btn-secondary" id="hero-secondary-btn">Open 4D Pocket</a>
          </div>
        </div>

        <div className="hero-img-container">
          <div className="speech-bubble" id="doraemon-speech" role="button" onClick={handleSpeechBubbleClick}>
            <span id="speech-text">{doraemonQuotes[quoteIndex]}</span>
          </div>

          <div className="hero-img-wrapper" style={{ transform: tilt ? 'scale(1.04) rotate(2deg)' : 'none' }}>
            <img src="/assets/images/doraemon_dessert_hero.png" alt="Doraemon Dessert Platter" className="hero-img" id="hero-doraemon-img" />
          </div>
        </div>
      </div>
    </section>
  );
}
