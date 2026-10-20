import React from 'react';

export default function Header({ cartCount, onCartClick, onMyOrdersClick, onAdminClick, isMusicPlaying, onToggleMusic }) {
  return (
    <header id="site-header">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" className="logo" id="header-logo" aria-label="Pocket Sweets Home" onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}>
          <div className="logo-bell" aria-hidden="true"></div>
          <span className="logo-text">Pocket Sweets</span>
        </a>

        <nav aria-label="Main Navigation">
          <ul className="nav-links" id="main-nav-links">
            <li><a href="#hero">Home</a></li>
            <li><a href="#menu">Menu</a></li>
            <li><a href="#customizer">Memory Bread</a></li>
            <li><a href="#anywhere-door">Portal</a></li>
            <li><a href="/orders" onClick={(e) => { e.preventDefault(); onMyOrdersClick(); }} style={{ color: 'var(--door-pink)', fontWeight: 700 }}>Track Orders 🛸</a></li>
            <li style={{ display: 'none' }}><a href="/admin" onClick={(e) => { e.preventDefault(); onAdminClick(); }} style={{ color: 'var(--dora-blue)', fontWeight: 700 }} title="Local Admin Dashboard">Admin 🔐</a></li>
          </ul>
        </nav>

        <div className="header-actions">
          {/* Quick Doraemon Theme Music Toggle */}
          <button 
            type="button"
            className={`music-toggle-btn ${isMusicPlaying ? 'playing' : ''}`}
            id="header-music-toggle"
            aria-label="Toggle Doraemon Theme Music"
            onClick={onToggleMusic}
            title={isMusicPlaying ? "Doraemon Theme Playing (Soft Ambience) - Click to Pause" : "Play Doraemon Theme Music"}
            style={{ display: 'none' }}
          >
            <i className={`fa-solid ${isMusicPlaying ? 'fa-music' : 'fa-volume-xmark'}`}></i>
            <span>{isMusicPlaying ? 'Music 🎶' : 'Muted'}</span>
          </button>

          <button className="cart-icon" id="header-cart-btn" aria-label="Cart" onClick={onCartClick}>
            <i className="fa-solid fa-basket-shopping"></i>
            <span className="cart-badge" id="cart-badge-count">{cartCount}</span>
          </button>
          <a href="#menu" className="btn btn-primary" id="nav-order-btn" onClick={(e) => { e.preventDefault(); onCartClick(); }}>Order Now</a>
        </div>
      </div>
    </header>
  );
}
