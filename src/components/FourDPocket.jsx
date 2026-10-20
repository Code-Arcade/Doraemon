import React from 'react';

export default function FourDPocket({ onTriggerPrize }) {
  return (
    <section className="container" id="pocket">
      <div className="pocket-card">
        <div className="pocket-text">
          <h2>Retrieve Future Tickets</h2>
          <p>Reach inside Doraemon's signature 4D pocket for randomized gadget coupons and discounts.</p>
        </div>

        <div 
          className="pocket-trigger" 
          id="pocket-clickable-widget" 
          role="button" 
          aria-label="Interact with 4D Pocket"
          onClick={onTriggerPrize}
        >
          <div className="pocket-trigger-lip"></div>
          <span className="pocket-trigger-label">4D Pocket</span>
        </div>
      </div>
    </section>
  );
}
