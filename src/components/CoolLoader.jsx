import React from 'react';

export default function CoolLoader({ text = "Loading time streams...", fullScreen = false, mini = false }) {
  if (mini) {
    return (
      <span className="cool-loader-mini">
        <span className="mini-bell-spin">🔔</span> {text}
      </span>
    );
  }

  return (
    <div className={`cool-loader-container ${fullScreen ? 'full-screen' : 'inline-card'}`}>
      {/* Time-warp cosmic star field */}
      {fullScreen && (
        <div className="starfield-warp">
          <div className="warp-star s1"></div>
          <div className="warp-star s2"></div>
          <div className="warp-star s3"></div>
          <div className="warp-star s4"></div>
          <div className="warp-star s5"></div>
        </div>
      )}

      <div className="loader-content-box">
        {/* Glow-pulsing Pink Anywhere Door Portal */}
        <div className="loader-portal-door">
          <div className="portal-swirl"></div>
          {/* Animated 3D-like Golden Doraemon Bell */}
          <div className="animated-bell-wrapper">
            <span className="animated-bell">🔔</span>
          </div>
        </div>

        {/* Dynamic status feedback */}
        <div className="loader-text-wrapper">
          <h4 className="loader-pulsing-text">{text}</h4>
          <p className="loader-subtext">22nd-Century Spatial Coordination System Active</p>
        </div>
        
        {/* Little decorative futuristic dials */}
        <div className="loader-dials">
          <span className="dial-dot d1"></span>
          <span className="dial-dot d2"></span>
          <span className="dial-dot d3"></span>
        </div>
      </div>
    </div>
  );
}
