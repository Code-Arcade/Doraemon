import React, { useState } from 'react';

export default function AnywhereDoor({ activeThemeName, toggleTheme, playBubbleSound }) {
  const [doorOpen, setDoorOpen] = useState(false);

  const handleDoorClick = () => {
    playBubbleSound();
    setDoorOpen(true);

    // Teleport background theme
    setTimeout(() => {
      toggleTheme();
    }, 400);

    // Shut door slowly
    setTimeout(() => {
      setDoorOpen(false);
    }, 1200);
  };

  return (
    <section className="container" id="anywhere-door">
      <div className="anywhere-door-section">
        <div className="door-widget-container">
          <div className="door-widget-left">
            <span className="section-subtitle">Dimension Portal</span>
            <h3 id="current-theme-name">Current Dimension: {activeThemeName}</h3>
            <p>Click the custom Anywhere Door on the right to teleport your surroundings!</p>
          </div>
          
          <div className="door-action-wrapper">
            <div 
              className={`door-toggle-btn ${doorOpen ? 'open' : ''}`} 
              id="magical-door" 
              role="button" 
              aria-label="Toggle Portal"
              onClick={handleDoorClick}
            >
              <div className="door-toggle-portal">
                <div className="portal-particles"></div>
              </div>
              <div className="door-toggle-leaf" id="magic-door-leaf">
                <div className="door-toggle-knob"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
