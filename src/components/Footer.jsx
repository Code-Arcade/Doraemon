import React from 'react';

export default function Footer({ onAdminClick }) {
  return (
    <footer>
      <div className="container">
        <div className="footer-top">
          <a href="#" className="logo">
            <div className="logo-bell" aria-hidden="true"></div>
            <span className="logo-text">Pocket Sweets</span>
          </a>
          <div className="footer-socials">
            <a href="#" className="social-link" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
            <a href="#" className="social-link" aria-label="Twitter"><i className="fa-brands fa-twitter"></i></a>
            <a href="/admin" className="social-link" title="Admin Portal (/admin)" onClick={(e) => { e.preventDefault(); onAdminClick(); }}><i className="fa-solid fa-lock"></i></a>
          </div>
        </div>
        <div className="footer-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
            Developed by <a href="https://codearcade20.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--dora-blue)', fontWeight: 700, textDecoration: 'underline' }}>Codearcade</a>
          </p>
          <p style={{ fontSize: '0.85rem' }}>
            Premium 22nd Century Baking Lab • <a href="/admin" onClick={(e) => { e.preventDefault(); onAdminClick(); }} style={{ color: 'var(--dora-blue)', fontWeight: 600, textDecoration: 'none' }}>Local Admin Page (/admin)</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
