import React from 'react';

export default function ToastCustomizer({ customBreadText, setCustomBreadText }) {
  return (
    <section className="toast-section" id="customizer">
      <div className="container toast-grid">
        <div className="toast-customizer-card">
          <span className="section-subtitle">Interactive Magic</span>
          <h3>Memory Toast Printer</h3>
          <p>Type your math formulas, study notes, or sweet wishes below and watch them print instantly onto your Memory Bread slice in real-time!</p>
          
          <div className="toast-input-group">
            <label htmlFor="bread-custom-text">Enter Custom Formula / Notes</label>
            <input 
              type="text" 
              id="bread-custom-text" 
              className="toast-input" 
              placeholder="e.g. E = mc² or Love you!" 
              value={customBreadText}
              onChange={(e) => setCustomBreadText(e.target.value)}
              maxLength="25" 
            />
          </div>
        </div>

        <div className="toast-preview-container">
          <div className="toast-slice" id="bread-toast-render">
            <div className="toast-crust-indent"></div>
            <span className="toast-text-overlay" id="toast-live-text">
              {customBreadText || "2 + 3 = 5"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
