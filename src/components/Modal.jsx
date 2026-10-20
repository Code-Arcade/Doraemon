import React from 'react';

export default function Modal({ active, onClose, prize }) {
  if (!prize) return null;

  return (
    <div 
      className={`modal-overlay ${active ? 'active' : ''}`} 
      role="dialog" 
      aria-modal="true"
      onClick={(e) => {
        if (e.target.classList.contains('modal-overlay')) onClose();
      }}
    >
      <div className="modal-content">
        <button 
          className="modal-close" 
          id="modal-close-btn" 
          aria-label="Close modal"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="modal-emoji" id="modal-gadget-emoji">{prize.emoji}</div>
        <h3 className="modal-title" id="modal-title-heading">{prize.title}</h3>
        <p className="modal-desc" id="modal-gadget-desc">{prize.desc}</p>
        <div className="coupon-box" id="modal-coupon-code">CODE: {prize.code}</div>
      </div>
    </div>
  );
}
