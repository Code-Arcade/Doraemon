import React, { useState } from 'react';
import { db } from '../services/db';
import CustomAlert from './CustomAlert';

export default function CheckoutModal({ active, onClose, cartItems, cartTotal, onSubmitOrder, unlockedCoupon, cartList }) {
  // Custom Alert state
  const [alertConfig, setAlertConfig] = useState({
    active: false,
    title: '',
    message: '',
    icon: '🐱🔔'
  });

  const showCustomAlert = (title, message, icon = '🐱🔔') => {
    setAlertConfig({
      active: true,
      title,
      message,
      icon
    });
  };
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [autofillNotice, setAutofillNotice] = useState('');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  if (!active) return null;

  const applyCouponCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'MEMORY15') {
      const discount = cartTotal * 0.15;
      setAppliedCoupon({
        code: 'MEMORY15',
        type: 'percentage',
        value: 15,
        discountAmount: discount,
        description: '15% Off Doraemon Memory Bread Special! 🍞✨'
      });
      setCouponError('');
      showCustomAlert("Coupon Applied! 🎟️", "Doraemon's Memory Bread Coupon applied successfully! You get 15% off your sweets!", "🐱🎉");
    } else if (cleanCode === 'JELLY20') {
      const discount = cartTotal * 0.20;
      setAppliedCoupon({
        code: 'JELLY20',
        type: 'percentage',
        value: 20,
        discountAmount: discount,
        description: '20% Off Translation Jelly Treats! 🍮✨'
      });
      setCouponError('');
      showCustomAlert("Coupon Applied! 🎟️", "Doraemon's Translation Jelly Coupon applied successfully! You get 20% off your order!", "🐱🎉");
    } else if (cleanCode === 'ANYWHEREDELIVERY') {
      setAppliedCoupon({
        code: 'ANYWHEREDELIVERY',
        type: 'shipping',
        value: 0,
        discountAmount: 0,
        description: 'Free Anywhere Door Courier Shipping directly to your dimension! 🚪✨'
      });
      setCouponError('');
      showCustomAlert("Coupon Applied! 🎟️", "Anywhere Door Free Delivery applied successfully! Transport fee will be fully covered!", "🐱🎉");
    } else if (cleanCode === 'COPTERFREE') {
      if (cartTotal < 1000) {
        setCouponError("Requires order over ₹1000! Nobita, add more pastries first! 🧁⚠️");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: 'COPTERFREE',
          type: 'freebie',
          value: 0,
          discountAmount: 0,
          description: 'Free Cloud Mochi Cupcake added to your order! 🧁✨'
        });
        setCouponError('');
        showCustomAlert("Coupon Applied! 🎟️", "Bamboo-Copter Coupon applied successfully! A delicious Cloud Mochi Cupcake will be added to your order!", "🐱🎉");
      }
    } else {
      setCouponError("Unknown futuristic code! Doraemon has no such gadget in his pocket... 🚫");
      setAppliedCoupon(null);
    }
  };

  const handleMobileChange = async (val) => {
    // Restrict to digits only and cap at 10 characters maximum
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setMobile(cleaned);
    
    // Trigger lookup when length is exactly 10 digits
    if (cleaned.length === 10) {
      try {
        const savedAddress = await db.getCustomerAddress(cleaned);
        if (savedAddress) {
          setAddress(savedAddress);
          setAutofillNotice("We found your saved address from the 22nd Century! Auto-filled below. Feel free to modify if you've moved! 🚪✨");
        } else {
          setAutofillNotice('');
        }
      } catch (e) {
        console.error("Autofill lookup failed:", e);
      }
    } else {
      setAutofillNotice('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanMobile = mobile.trim();
    const cleanAddress = address.trim();

    if (!cleanMobile || !cleanAddress) return;

    // Validate exact 10-digit number
    if (cleanMobile.length !== 10) {
      showCustomAlert(
        "Invalid Mobile Number! 🚫",
        "Nobita! A valid 22nd-Century sweets delivery phone number must contain exactly 10 numeric digits! Please correct it.",
        "🐱⚠️"
      );
      return;
    }

    // Enforce 1-coupon-per-week per customer mobile constraint
    if (appliedCoupon) {
      try {
        const pastOrders = await db.getCustomerOrders(cleanMobile);
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const usedCouponRecently = pastOrders.some(ord => {
          const createdTime = new Date(ord.created_at).getTime();
          return createdTime > sevenDaysAgo && parseFloat(ord.coupon_discount || 0) > 0;
        });

        if (usedCouponRecently) {
          showCustomAlert(
            "Weekly Coupon Limit Reached! 🚫",
            `Nobita! The mobile number ${cleanMobile} has already used a 4D Pocket coupon in the last 7 days. The Time Patrol restricts temporal discounts to once a week! Please remove the coupon to proceed.`,
            "🐱⏳"
          );
          return;
        }
      } catch (err) {
        console.error("Failed to check weekly coupon limit:", err);
      }
    }

    // Register or update customer address details in database
    try {
      await db.upsertCustomer(cleanMobile, cleanAddress);
      
      // Store logged in mobile in localStorage
      localStorage.setItem('dora_customer_mobile', cleanMobile);
    } catch (err) {
      console.error("Failed to upsert customer details:", err);
    }

    let finalItems = cartList ? [...cartList] : [];
    let discountVal = 0;
    let transportVal = 0;

    if (appliedCoupon) {
      if (appliedCoupon.code === 'COPTERFREE') {
        finalItems.push({
          name: "🧁 Free Cloud Mochi Cupcake (4D Pocket Gift)",
          price: 0,
          count: 1,
          isCoupon: true
        });
      } else if (appliedCoupon.code === 'ANYWHEREDELIVERY') {
        finalItems.push({
          name: "🎟️ Coupon Applied: ANYWHEREDELIVERY (Free Shipping)",
          price: 0,
          count: 1,
          isCoupon: true
        });
      } else {
        discountVal = appliedCoupon.discountAmount;
        finalItems.push({
          name: `🎟️ Coupon Applied: ${appliedCoupon.code} (-₹${discountVal.toFixed(2)})`,
          price: 0,
          count: 1,
          isCoupon: true
        });
      }
    }

    // Send order to DB
    onSubmitOrder({ 
      mobile: cleanMobile, 
      address: cleanAddress,
      discount: discountVal,
      transport: transportVal,
      items: finalItems
    });
    
    // Close modal immediately so the page transitions cleanly
    handleClose();
  };

  const handleClose = () => {
    // Reset states
    setMobile('');
    setAddress('');
    setAutofillNotice('');
    setCouponInput('');
    setAppliedCoupon(null);
    setCouponError('');
    onClose();
  };

  return (
    <div 
      className="modal-overlay active" 
      role="dialog" 
      aria-modal="true"
      onClick={(e) => {
        if (e.target.classList.contains('modal-overlay')) handleClose();
      }}
    >
      <div className="modal-content" style={{ maxWidth: '460px' }}>
        <button 
          className="modal-close" 
          id="modal-close-btn" 
          aria-label="Close modal"
          onClick={handleClose}
        >
          &times;
        </button>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <h3 className="modal-title" style={{ textAlign: 'center', marginBottom: '24px' }}>Confirm Your Order</h3>
          
          {/* Order summary info */}
          <div style={{ background: 'var(--dora-blue-light)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
            <span className="section-subtitle" style={{ marginBottom: '4px' }}>Order Summary</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>
              Items count: <strong>{cartItems}</strong>
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', marginTop: '4px' }}>
              Subtotal: <strong>₹{cartTotal.toFixed(2)}</strong>
            </p>
            {appliedCoupon && appliedCoupon.discountAmount > 0 && (
              <p style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                Discount: <strong>-₹{appliedCoupon.discountAmount.toFixed(2)}</strong>
              </p>
            )}
            {appliedCoupon && appliedCoupon.type === 'shipping' && (
              <p style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                Delivery: <strong>Free Delivery Applied 🚪✨</strong>
              </p>
            )}
            {appliedCoupon && appliedCoupon.code === 'COPTERFREE' && (
              <p style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                Gift: <strong>Free Cloud Mochi Cupcake added! 🧁✨</strong>
              </p>
            )}
            <p style={{ fontSize: '1.05rem', color: 'var(--dora-blue)', fontWeight: 800, marginTop: '8px', borderTop: '1px dashed rgba(11, 118, 243, 0.2)', paddingTop: '6px' }}>
              Estimated Total: ₹{(cartTotal - (appliedCoupon ? appliedCoupon.discountAmount : 0)).toFixed(2)}
            </p>
          </div>

          <div className="toast-input-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="checkout-mobile" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>
              Mobile Number (10 Digits Only)
            </label>
            <input 
              type="tel" 
              id="checkout-mobile" 
              className="toast-input" 
              placeholder="Enter 10-digit mobile number" 
              maxLength={10}
              required
              value={mobile}
              onChange={(e) => handleMobileChange(e.target.value)}
            />
          </div>

          {autofillNotice && (
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--dora-blue)',
              background: 'var(--dora-blue-light)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--dora-blue)',
              marginBottom: '16px',
              fontWeight: 600,
              lineHeight: '1.4',
              animation: 'slideDownNotice 0.3s ease-out'
            }}>
              <i className="fa-solid fa-magic" style={{ marginRight: '6px' }}></i> {autofillNotice}
            </div>
          )}

          <div className="toast-input-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="checkout-address" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>
              Delivery Address
            </label>
            <textarea 
              id="checkout-address" 
              className="toast-input" 
              rows="3"
              placeholder="Enter complete delivery street address" 
              required
              value={address}
              style={{ resize: 'none', fontFamily: 'inherit' }}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Doraemon's 4D Pocket Coupon Panel */}
          <div className="coupon-panel" style={{
            background: 'var(--dora-blue-light)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1.5px dashed var(--dora-blue)',
            marginBottom: '20px',
            boxShadow: 'inset 0 1px 4px rgba(11, 118, 243, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.2rem', marginRight: '6px' }}>🎟️</span>
              <strong style={{ fontSize: '0.8rem', color: 'var(--dora-blue)' }}>Doraemon's 4D Pocket Coupon</strong>
            </div>

            {/* Quick-apply recommended coupon from 4D Pocket prize */}
            {unlockedCoupon && (!appliedCoupon || appliedCoupon.code !== unlockedCoupon.code) && (
              <div style={{
                fontSize: '0.75rem',
                background: '#fff',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(11, 118, 243, 0.15)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{unlockedCoupon.code}</span> ({unlockedCoupon.emoji} {unlockedCoupon.title})
                </div>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ 
                    padding: '2px 8px', 
                    fontSize: '0.7rem', 
                    background: 'var(--dora-blue)', 
                    color: '#fff', 
                    borderRadius: '4px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(11, 118, 243, 0.3)'
                  }}
                  onClick={() => {
                    setCouponInput(unlockedCoupon.code);
                    applyCouponCode(unlockedCoupon.code);
                  }}
                >
                  Apply Magic ✨
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="toast-input" 
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', textTransform: 'uppercase' }}
                placeholder="Enter coupon code" 
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              <button 
                type="button" 
                className="btn" 
                style={{ 
                  padding: '8px 16px', 
                  fontSize: '0.85rem', 
                  background: '#ffd31d', 
                  color: 'var(--text-dark)', 
                  fontWeight: 700,
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 2px 6px rgba(255, 211, 29, 0.3)'
                }}
                onClick={() => applyCouponCode(couponInput)}
              >
                Apply
              </button>
            </div>

            {couponError && (
              <div style={{ color: 'var(--dora-red)', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '4px' }}></i> {couponError}
              </div>
            )}

            {appliedCoupon && (
              <div style={{ 
                color: '#15803d', 
                background: '#f0fdf4', 
                padding: '8px 10px', 
                borderRadius: 'var(--radius-sm)', 
                marginTop: '10px', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>
                  <i className="fa-solid fa-circle-check" style={{ marginRight: '4px' }}></i> Applied: <strong>{appliedCoupon.code}</strong> - {appliedCoupon.description}
                </span>
                <button 
                  type="button" 
                  style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 700, cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponInput('');
                  }}
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          {/* Local keyframes style for notice entrance */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideDownNotice {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}} />

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
          >
            Submit Request <i className="fa-solid fa-paper-plane" style={{ marginLeft: '6px' }}></i>
          </button>
        </form>
      </div>

      <CustomAlert 
        active={alertConfig.active}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig(prev => ({ ...prev, active: false }))}
        icon={alertConfig.icon}
      />
    </div>
  );
}
