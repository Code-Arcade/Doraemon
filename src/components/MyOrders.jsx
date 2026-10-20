import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import CustomAlert from './CustomAlert';
import CoolLoader from './CoolLoader';


export default function MyOrders({ onExitOrders }) {
  // Custom Alert/Confirm states
  const [alertConfig, setAlertConfig] = useState({
    active: false,
    title: '',
    message: '',
    isConfirm: false,
    confirmText: '',
    cancelText: '',
    onConfirm: null,
    icon: '🐱🔔'
  });

  const showCustomAlert = (title, message, icon = '🐱🔔') => {
    setAlertConfig({
      active: true,
      title,
      message,
      isConfirm: false,
      icon
    });
  };

  const showCustomConfirm = (title, message, onConfirm, confirmText = "Confirm 👍", cancelText = "Cancel ❌", icon = '🐱❓') => {
    setAlertConfig({
      active: true,
      title,
      message,
      isConfirm: true,
      confirmText,
      cancelText,
      onConfirm,
      icon
    });
  };
  const [orders, setOrders] = useState([]);
  const [tick, setTick] = useState(0);

  // Frictionless Mobile-Based Session states
  const [customerMobile, setCustomerMobile] = useState(localStorage.getItem('dora_customer_mobile') || '');
  const [searchMobile, setSearchMobile] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Sync customer orders with central database dynamically
  useEffect(() => {
    if (!customerMobile) {
      setOrders([]);
      return;
    }

    const syncOrders = async () => {
      try {
        // Fetch only matching orders from database securely
        const matched = await db.getCustomerOrders(customerMobile);

        const mapped = matched.map(dbMatch => {
          let parsedItems = dbMatch.items;
          try {
            if (typeof dbMatch.items === 'string') parsedItems = JSON.parse(dbMatch.items);
          } catch (e) { }

          // Calculate targetTime (10 minutes from creation) dynamically
          const orderPlacedMs = Date.parse(dbMatch.created_at);
          const targetTime = orderPlacedMs + 10 * 60 * 1000;

          return {
            id: dbMatch.id,
            items: Array.isArray(parsedItems) ? parsedItems : [],
            total: parseFloat(dbMatch.total),
            mobile: dbMatch.mobile,
            address: dbMatch.address,
            status: dbMatch.status || 'pending',
            transport: parseFloat(dbMatch.transport || 0),
            discount: parseFloat(dbMatch.discount || 0),
            created_at: dbMatch.created_at,
            targetTime
          };
        });

        setOrders(mapped);
      } catch (err) {
        console.error("Failed to sync customer orders:", err);
      }
    };

    syncOrders();
    const syncInterval = setInterval(syncOrders, 5000); // Poll every 5s for live updates
    return () => clearInterval(syncInterval);
  }, [customerMobile]);

  // Keep state in sync with localStorage updates (e.g. fresh checkouts)
  useEffect(() => {
    const activeMobile = localStorage.getItem('dora_customer_mobile') || '';
    if (activeMobile && activeMobile !== customerMobile) {
      setCustomerMobile(activeMobile);
    }
  }, [tick, customerMobile]);

  // Update countdown clock ticks every second
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const handleSignOut = () => {
    showCustomConfirm(
      "Switch Spaceship Profile? 🛸",
      "Are you sure you want to sign out and switch your sweets tracking account? This will clear your current active device session logs.",
      () => {
        localStorage.removeItem('dora_customer_mobile');
        setCustomerMobile('');
        setOrders([]);
      },
      "Sign Out 🚪",
      "Keep Profile 🐱",
      "🐱❓"
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const clean = searchMobile.trim();
    if (!clean) return;

    if (clean.length !== 10) {
      showCustomAlert(
        "Invalid Mobile Number! 🚫",
        "Nobita! To retrieve 22nd-Century sweets delivery status, your mobile number must contain exactly 10 numeric digits! Please check and try again.",
        "🐱⚠️"
      );
      return;
    }

    setLoadingHistory(true);
    setTimeout(() => {
      localStorage.setItem('dora_customer_mobile', clean);
      setCustomerMobile(clean);
      setLoadingHistory(false);
    }, 800); // Cute warp simulation delay
  };

  // Highly premium, self-contained printable Invoice Generator
  const handlePrintInvoice = (ord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showCustomAlert(
        "Popup Blocker Active! 🚫",
        "Nobita! Please enable/allow popups in your browser settings to warp and print your invoice PDF successfully! 🖨️✨",
        "🐱🔔"
      );
      return;
    }

    const items = ord.items || [];
    const subtotal = items.reduce((acc, it) => acc + (it.price * it.count), 0);
    const transport = parseFloat(ord.transport || 0);
    const couponDiscount = parseFloat(ord.coupon_discount || 0);
    const discount = parseFloat(ord.discount || 0);
    const grandTotal = subtotal + transport - couponDiscount - discount;

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pocket Sweets Invoice #${ord.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #0f172a;
            margin: 40px;
            background: #ffffff;
            line-height: 1.5;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            border: 4px solid #0b76f3;
            border-radius: 20px;
            padding: 32px;
            position: relative;
            background: #fff;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          }
          .collar-ribbon {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 12px;
            background: #f32d2d;
            border-radius: 16px 16px 0 0;
          }
          .bell-mark {
            width: 32px;
            height: 32px;
            background: #ffd31d;
            border: 2px solid #0f172a;
            border-radius: 50%;
            margin: 12px auto 0;
            position: relative;
            box-shadow: 0 4px 10px rgba(255, 211, 29, 0.3);
          }
          .bell-mark::after {
            content: '';
            position: absolute;
            width: 6px;
            height: 6px;
            background: #0f172a;
            border-radius: 50%;
            bottom: 6px;
            left: 50%;
            transform: translateX(-50%);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid rgba(15, 23, 42, 0.06);
            padding-bottom: 20px;
            margin-top: 12px;
            margin-bottom: 32px;
          }
          .logo-text {
            font-family: 'Fredoka', sans-serif;
            font-size: 1.8rem;
            color: #0b76f3;
          }
          .meta-title {
            font-size: 1.5rem;
            font-weight: 800;
            text-align: right;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 40px;
            margin-bottom: 32px;
          }
          .section-title {
            font-size: 0.8rem;
            font-weight: 800;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
            border-bottom: 1px solid rgba(15, 23, 42, 0.06);
            padding-bottom: 6px;
          }
          .info-block p {
            margin: 4px 0;
            font-size: 0.95rem;
          }
          .info-block strong {
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 32px;
          }
          th {
            background: #f0f6ff;
            color: #0b76f3;
            font-weight: 700;
            padding: 12px 16px;
            text-align: left;
            font-size: 0.9rem;
            border-bottom: 2px solid rgba(11, 118, 243, 0.15);
          }
          td {
            padding: 16px;
            border-bottom: 1px solid rgba(15, 23, 42, 0.06);
            font-size: 0.95rem;
          }
          .summary-table {
            width: 320px;
            margin-left: auto;
            margin-bottom: 0;
          }
          .summary-table td {
            padding: 8px 16px;
            border: none;
          }
          .grand-total {
            color: #0b76f3;
            font-weight: 800;
            font-size: 1.25rem;
          }
          .footer-note {
            text-align: center;
            font-size: 0.85rem;
            color: #475569;
            margin-top: 48px;
            border-top: 1px dashed rgba(15, 23, 42, 0.1);
            padding-top: 24px;
          }
          .print-btn {
            display: block;
            width: fit-content;
            margin: 24px auto 0;
            background: #0b76f3;
            color: #fff;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: 700;
            border: none;
            cursor: pointer;
            font-size: 0.95rem;
            box-shadow: 0 4px 10px rgba(11, 118, 243, 0.3);
            transition: all 0.2s ease;
          }
          .print-btn:hover {
            background: #085ec4;
            transform: translateY(-1px);
          }
          @media print {
            .print-btn { display: none; }
            body { margin: 0; }
            .invoice-box { border: none; padding: 0; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="collar-ribbon"></div>
          <div class="bell-mark"></div>
          
          <div class="header">
            <div>
              <div class="logo-text">Pocket Sweets</div>
              <p style="font-size: 0.85rem; color: #475569; margin-top: 4px;">22nd Century Baking Laboratory</p>
            </div>
            <div>
              <div class="meta-title">TAX INVOICE</div>
              <p style="font-size: 0.85rem; color: #475569; text-align: right; margin-top: 4px;">Order ID: #${ord.id}</p>
            </div>
          </div>

          <div class="details-grid">
            <div class="info-block">
              <div class="section-title">Delivery Destination</div>
              <p><strong>Mobile:</strong> ${ord.mobile}</p>
              <p><strong>Address:</strong> ${ord.address}</p>
              <p><strong>Date Issued:</strong> ${new Date(ord.created_at).toLocaleString()}</p>
            </div>
            <div class="info-block">
              <div class="section-title">Payment & Status</div>
              <p><strong>Invoice Status:</strong> <span style="color: #10b981; font-weight: 800;">PAID & CONFIRMED ✅</span></p>
              <p><strong>Method:</strong> UPI / Cash on Confirm</p>
              <p style="font-size: 0.8rem; color: #475569; margin-top: 4px;">*Transport charge is fully included below.</p>
            </div>
          </div>

          <div class="section-title">Sweets Itemized Listing</div>
          <table>
            <thead>
              <tr>
                <th>Pastry / Sweet</th>
                <th style="text-align: center;">Price</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(it => `
                <tr>
                  <td><strong>${it.name}</strong></td>
                  <td style="text-align: center;">₹${parseFloat(it.price).toFixed(2)}</td>
                  <td style="text-align: center;">x${it.count}</td>
                  <td style="text-align: right; font-weight: 600;">₹${(it.price * it.count).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <table class="summary-table">
            <tbody>
              <tr>
                <td>Subtotal:</td>
                <td style="text-align: right; font-weight: 600;">₹${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Transport Fee:</td>
                <td style="text-align: right; font-weight: 600; color: #475569;">+₹${transport.toFixed(2)}</td>
              </tr>
              ${couponDiscount > 0 ? `
                <tr>
                  <td style="color: #16a34a;">Coupon Discount:</td>
                  <td style="text-align: right; font-weight: 600; color: #16a34a;">-₹${couponDiscount.toFixed(2)}</td>
                </tr>
              ` : ''}
              ${discount > 0 ? `
                <tr>
                  <td style="color: #f32d2d;">Admin Discount:</td>
                  <td style="text-align: right; font-weight: 600; color: #f32d2d;">-₹${discount.toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr style="border-top: 2px solid #0b76f3;">
                <td class="grand-total">Grand Total:</td>
                <td style="text-align: right;" class="grand-total">₹${grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer-note">
            <p>Thank you for choosing Pocket Sweets! 🥞✨</p>
            <p style="font-size: 0.75rem; color: #94a3b8; margin-top: 6px;">Warped directly from the 22nd Century by Doraemon & Nobita.</p>
          </div>
        </div>

        <button class="print-btn" onclick="window.print()">Download Invoice PDF / Print 🖨️</button>
      </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  return (
    <div className="container" style={{ padding: '60px 24px', minHeight: '85vh' }}>

      {/* Header banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '40px' }}>
        <div>
          <span className="section-subtitle">22nd-C Delivery Portal</span>
          <h2 className="section-title">My Magic Orders</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '4px' }}>
            Track your futuristic Doraemon desserts warping to your address.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onExitOrders} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-arrow-left"></i> Back to Sweets Shop
          </button>
        </div>
      </div>

      {!customerMobile ? (
        /* Order Space Tracker Gate (User Account Login) */
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
          <div className="toast-customizer-card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '40px 32px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'float 5s ease-in-out infinite' }}>🛸🛸</div>
            <h3 style={{ marginBottom: '12px', fontFamily: 'var(--font-logo)', color: 'var(--dora-blue)', fontSize: '1.5rem' }}>
              Order Space Portal
            </h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '28px' }}>
              Nobita is checking his pockets for sweets! Enter your Mobile Number to retrieve and track your active pastry order history dynamically from the database!
            </p>

            <form onSubmit={handleSearchSubmit}>
              <div className="toast-input-group" style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label htmlFor="gate-mobile" style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  Enter Mobile Number
                </label>
                <input
                  type="tel"
                  id="gate-mobile"
                  className="toast-input"
                  placeholder="Enter 10-digit mobile number"
                  required
                  maxLength={10}
                  value={searchMobile}
                  onChange={(e) => setSearchMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
                disabled={loadingHistory}
              >
                {loadingHistory ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Warping portal logs...
                  </>
                ) : (
                  <>
                    Retrieve My Sweets <i className="fa-solid fa-rocket" style={{ marginLeft: '6px' }}></i>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 40px',
          background: 'var(--white)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--glass-shadow)'
        }}>
          <span style={{ fontSize: '5rem', display: 'block', marginBottom: '20px', animation: 'float 6s ease-in-out infinite' }}>😭</span>
          <h3 style={{ marginBottom: '12px' }}>Your pocket is currently empty!</h3>
          <p style={{ color: 'var(--text-light)', maxWidth: '400px', margin: '0 auto 8px', fontSize: '0.95rem', lineHeight: '1.6' }}>
            No sweets or active tracking logs were found under the mobile number:
          </p>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--dora-blue)', marginBottom: '32px' }}>
            {customerMobile}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={handleSignOut}>
              Use Different Mobile
            </button>
            <button className="btn btn-primary" onClick={onExitOrders}>
              Order Delicious Pastries <i className="fa-solid fa-cookie-bite" style={{ marginLeft: '6px' }}></i>
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'var(--dora-blue-light)', padding: '12px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Logged in: <strong style={{ color: 'var(--dora-blue)' }}>{customerMobile}</strong> ({orders.length} orders found)
            </span>
            <button className="btn btn-secondary" onClick={handleSignOut} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              Switch Profile
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {orders.map((ord) => {
              const status = ord.status || 'pending';
              const isConfirmed = status === 'confirmed' || status === 'warping' || status === 'delivered';
              const isWarping = status === 'warping';
              const isDelivered = status === 'delivered';
              const isRejected = status === 'rejected';
              const isPending = status === 'pending';

              // Calculate remaining countdown seconds for CALLBACK ONLY
              const remainingMs = ord.targetTime - Date.now();
              const remainingSecs = isConfirmed || isRejected ? 0 : Math.max(0, Math.floor(remainingMs / 1000));

              const mins = Math.floor(remainingSecs / 60);
              const secs = remainingSecs % 60;
              const countdownStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

              // Check if callback has elapsed / delayed (exceeded targetTime by > 5 mins, total elapsed > 15 mins)
              const orderPlacedMs = ord.created_at ? Date.parse(ord.created_at) : Date.now();
              const isCallbackDelayed = isPending && (Date.now() - orderPlacedMs) > 15 * 60 * 1000;

              // Determine current timeline step based on remaining seconds & active status
              let currentStep = 1;
              let statusText = "Order request received by the 22nd Century database! Doraemon is logging your details.";
              let statusEmoji = "📩";
              let timeLabel = "Callback Pending";

              if (isDelivered) {
                currentStep = 5;
                statusText = "Delicacy Delivered! The sweets have arrived safely at your coordinates. Enjoy your pocket-sweet magic! 🎉😋";
                statusEmoji = "🎉";
                timeLabel = "Delivered";
              } else if (isWarping) {
                currentStep = 4;
                statusText = "Futuristic Warp Active! Your sweets have been dispatched from the baking lab and are warping through the Anywhere Door directly to your dimension! 🚀🚪";
                statusEmoji = "🚪";
                timeLabel = "In Transit";
              } else if (status === 'confirmed') {
                currentStep = 3;
                statusText = "Order Confirmed & Invoiced! Our shop manager spoke with you, confirmed details, received payment, and invoice is generated. Sweets are now baking in the laboratory! 🥞✨";
                statusEmoji = "🥞";
                timeLabel = "Baking & Preparing";
              } else if (isRejected) {
                currentStep = 1;
                statusText = "Order Request Rejected. Our shop manager was unable to confirm your order details over phone. Please try again! ❌";
                statusEmoji = "🚫";
                timeLabel = "Rejected";
              } else {
                // Pending callback countdown active
                if (isCallbackDelayed) {
                  currentStep = 2;
                  statusText = "Our shop manager is preparing to dial your number shortly. We apologize for the delay! Nobita is helping trace the order logs...";
                  statusEmoji = "⏳";
                  timeLabel = "Tracing Callback...";
                } else if (remainingSecs === 0) {
                  currentStep = 2;
                  statusText = "Our shop manager is dialling your mobile number right now to verify details! Please keep your phone ready. 📞";
                  statusEmoji = "🔔";
                  timeLabel = "Calling Now!";
                } else if (remainingSecs <= 420) { // Under 7 mins
                  currentStep = 2;
                  statusText = "Our shop manager is dialling your mobile number shortly to verify and confirm your sweets request...";
                  statusEmoji = "📞";
                  timeLabel = "Callback Imminent";
                } else {
                  currentStep = 1;
                  statusText = "Order request sent! Doraemon is checking his pocket logs and preparing the telephonic callback...";
                  statusEmoji = "💬";
                  timeLabel = "Checking Pocket";
                }
              }

              // Compute prices dynamically
              const itemsList = ord.items || [];
              const subtotal = itemsList.reduce((acc, it) => acc + (it.price * it.count), 0);
              const transport = parseFloat(ord.transport || 0);
              const couponDiscount = parseFloat(ord.coupon_discount || 0);
              const discount = parseFloat(ord.discount || 0);
              const grandTotal = subtotal + transport - couponDiscount - discount;

              // Responsive status border and styling
              let cardBorderColor = 'var(--border-light)';
              let rightCircleBg = 'var(--dora-blue-light)';
              if (isDelivered) {
                cardBorderColor = '#10b981';
                rightCircleBg = 'rgba(16, 185, 129, 0.08)';
              } else if (isWarping) {
                cardBorderColor = 'var(--dora-blue)';
                rightCircleBg = 'rgba(11, 118, 243, 0.08)';
              } else if (status === 'confirmed') {
                cardBorderColor = 'var(--dora-yellow)';
                rightCircleBg = 'rgba(255, 211, 29, 0.08)';
              } else if (isRejected) {
                cardBorderColor = 'var(--dora-red)';
                rightCircleBg = 'rgba(243, 45, 45, 0.06)';
              }

              return (
                <div
                  key={ord.id}
                  className="toast-customizer-card"
                  style={{
                    padding: '32px',
                    background: 'var(--white)',
                    border: `3px solid ${cardBorderColor}`,
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--glass-shadow)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.5s ease'
                  }}
                >
                  {/* Decorative background circle */}
                  <div style={{
                    position: 'absolute',
                    top: '-60px',
                    right: '-60px',
                    width: '180px',
                    height: '180px',
                    background: rightCircleBg,
                    borderRadius: '50%',
                    zIndex: 0,
                    pointerEvents: 'none'
                  }}></div>

                  {/* Header info of order card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px', marginBottom: '24px', zIndex: 1, position: 'relative' }}>
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: isDelivered ? '#10b981' : (isWarping ? 'var(--dora-blue)' : (status === 'confirmed' ? '#b89200' : (isRejected ? 'var(--dora-red)' : 'var(--dora-blue)'))),
                        textTransform: 'uppercase',
                        tracking: '0.05em'
                      }}>
                        {isDelivered ? "ORDER DELIVERED 🎉" : (isWarping ? "FUTURISTIC WARP IN TRANSIT 🚀" : (status === 'confirmed' ? "ORDER CONFIRMED & BAKING 🥞" : (isRejected ? "ORDER REJECTED ❌" : "PHONE CALLBACK PENDING 📞")))}
                      </span>
                      <h4 style={{ fontSize: '1.25rem', marginTop: '4px' }}>Order ID: <span style={{ fontFamily: 'monospace' }}>#{ord.id}</span></h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '2px' }}>
                        Ordered on {ord.created_at ? new Date(ord.created_at).toLocaleString() : 'Just now'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{timeLabel}</span>
                      {isPending ? (
                        remainingSecs > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dora-blue)', fontWeight: 800, fontSize: '1.75rem', marginTop: '2px' }}>
                            <i className="fa-regular fa-clock fa-spin" style={{ fontSize: '1.4rem' }}></i>
                            <span>{countdownStr}</span>
                          </div>
                        ) : isCallbackDelayed ? (
                          <div style={{ color: 'var(--dora-blue)', fontWeight: 800, fontSize: '1.1rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-spinner fa-spin"></i> <span>Tracing Logs...</span>
                          </div>
                        ) : (
                          <div style={{ color: 'var(--dora-red)', fontWeight: 800, fontSize: '1.2rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', animation: 'pulse-bounce 1s infinite' }}>
                            <i className="fa-solid fa-phone-volume"></i> <span>Incoming Call!</span>
                          </div>
                        )
                      ) : isDelivered ? (
                        <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1.4rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Arrived!</span> 🎉
                        </div>
                      ) : isWarping ? (
                        <div style={{ color: 'var(--dora-blue)', fontWeight: 800, fontSize: '1.4rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Warp Active!</span> 🚀
                        </div>
                      ) : status === 'confirmed' ? (
                        <div style={{ color: '#b89200', fontWeight: 800, fontSize: '1.4rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Baking sweets...</span> 🥞
                        </div>
                      ) : (
                        <div style={{ color: 'var(--dora-red)', fontWeight: 800, fontSize: '1.4rem', marginTop: '2px' }}>
                          <span>Closed</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Real-time Stage Description */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    background: isDelivered ? 'rgba(16, 185, 129, 0.08)' : (isWarping ? 'rgba(11, 118, 243, 0.05)' : (status === 'confirmed' ? 'rgba(255, 211, 29, 0.05)' : (isRejected ? 'rgba(243, 45, 45, 0.05)' : 'var(--dora-blue-light)'))),
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '32px',
                    border: isDelivered ? '1px dashed #10b981' : (isWarping ? '1px dashed var(--dora-blue)' : (status === 'confirmed' ? '1px dashed #b89200' : (isRejected ? '1px dashed var(--dora-red)' : '1px dashed rgba(11, 118, 243, 0.15)'))),
                    zIndex: 1,
                    position: 'relative'
                  }}>
                    <div style={{ fontSize: '2.5rem', animation: isPending && !isCallbackDelayed ? 'pulse-bounce 2s infinite' : 'none' }}>
                      {statusEmoji}
                    </div>
                    <div>
                      <h5 style={{ fontSize: '1rem', color: isDelivered ? '#10b981' : (isWarping ? 'var(--dora-blue)' : (status === 'confirmed' ? '#b89200' : (isRejected ? 'var(--dora-red)' : 'var(--dora-blue)'))), fontWeight: 700 }}>
                        {isDelivered ? "Sweets Delivered!" : (isWarping ? "Warp Gate Active!" : (status === 'confirmed' ? "Invoice Generated!" : (isRejected ? "Enquiry Failed" : "Verification Stage")))}
                      </h5>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', marginTop: '4px', lineHeight: '1.4' }}>
                        {statusText}
                      </p>
                    </div>
                  </div>

                  {/* Doraemon Theme Progress Timeline */}
                  {!isRejected && (
                    <div style={{ marginBottom: '32px', padding: '0 8px', zIndex: 1, position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '12px' }}>

                        {/* Gray connector line in background: center offset left:45px right:45px */}
                        <div style={{
                          position: 'absolute',
                          top: '18px',
                          left: '45px',
                          right: '45px',
                          height: '4px',
                          background: 'rgba(15, 23, 42, 0.08)',
                          zIndex: 0
                        }}></div>

                        {/* Active progress connector: center offset left:45px right:45px */}
                        <div style={{
                          position: 'absolute',
                          top: '18px',
                          left: '45px',
                          width: `${((currentStep - 1) / 4) * 100}%`,
                          // Reduce active width slightly so it ends precisely at center of nodes
                          maxWidth: 'calc(100% - 90px)',
                          height: '4px',
                          background: isDelivered ? '#10b981' : (isWarping ? 'var(--dora-blue)' : 'var(--dora-yellow)'),
                          zIndex: 1,
                          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}></div>

                        {/* Timeline Steps: FontAwesome Solid Icons instead of raw emojis */}
                        {[
                          { step: 1, icon: <i className="fa-solid fa-paper-plane"></i>, label: "Request Sent" },
                          { step: 2, icon: <i className="fa-solid fa-phone-volume"></i>, label: "Phone Callback" },
                          { step: 3, icon: <i className="fa-solid fa-file-invoice-dollar"></i>, label: "Confirm & Invoice" },
                          { step: 4, icon: <i className="fa-solid fa-door-open"></i>, label: "Anywhere Warp" },
                          { step: 5, icon: <i className="fa-solid fa-gift"></i>, label: "Deliver!" }
                        ].map((item) => {
                          const isDone = currentStep > item.step;
                          const isActive = currentStep === item.step;

                          let nodeBg = 'var(--white)';
                          let nodeBorderColor = 'rgba(15, 23, 42, 0.12)';
                          let nodeIconColor = 'var(--text-light)';

                          if (isDone) {
                            nodeBg = item.step >= 3 ? '#10b981' : 'var(--dora-blue)';
                            nodeBorderColor = item.step >= 3 ? '#10b981' : 'var(--dora-blue)';
                            nodeIconColor = '#ffffff';
                          } else if (isActive) {
                            nodeBg = 'var(--dora-yellow)';
                            nodeBorderColor = 'var(--dora-yellow)';
                            nodeIconColor = 'var(--dora-blue)';
                          }

                          return (
                            <div
                              key={item.step}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                zIndex: 2,
                                position: 'relative',
                                width: '90px' // Expanded from 60px to accommodate labels and align center
                              }}
                            >
                              {/* Circle Node */}
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: nodeBg,
                                border: `3px solid ${nodeBorderColor}`,
                                color: nodeIconColor,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '1rem',
                                fontWeight: 700,
                                boxShadow: isActive ? '0 0 15px rgba(255, 211, 29, 0.6)' : 'none',
                                transform: isActive ? 'scale(1.2)' : 'none',
                                transition: 'all 0.4s ease'
                              }}>
                                {item.icon}
                              </div>

                              {/* Label */}
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: isActive || isDone ? 700 : 500,
                                color: isActive ? 'var(--dora-blue)' : (isDone ? 'var(--text-dark)' : 'var(--text-light)'),
                                marginTop: '8px',
                                textAlign: 'center',
                                whiteSpace: 'nowrap'
                              }}>
                                {item.label}
                              </span>
                            </div>
                          );
                        })}

                      </div>
                    </div>
                  )}

                  {/* Summary of Items */}
                  <div style={{
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '20px',
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 0.8fr',
                    gap: '24px',
                    fontSize: '0.9rem',
                    zIndex: 1,
                    position: 'relative'
                  }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>
                        {isConfirmed ? "INVOICE ITEMIZED LIST" : "YOUR DELICACIES"}
                      </span>
                      <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {itemsList.map((it, idx) => (
                          <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 550 }}>
                            <span>{it.name} <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>x{it.count}</span></span>
                            <span>₹{(it.price * it.count).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Display calculations for invoice */}
                      <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border-light)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Subtotal:</span>
                          <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        {couponDiscount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                            <span>Coupon Discount:</span>
                            <span>-₹{couponDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        {(isConfirmed || transport > 0) && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)' }}>
                            <span>Transport Charge:</span>
                            <span>+₹{transport.toFixed(2)}</span>
                          </div>
                        )}
                        {discount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--dora-red)', fontWeight: 600 }}>
                            <span>Admin Discount:</span>
                            <span>-₹{discount.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {/* Download PDF button for customer */}
                      {isConfirmed && (
                        <button
                          className="btn btn-primary"
                          onClick={() => handlePrintInvoice(ord)}
                          style={{
                            marginTop: '20px',
                            background: 'var(--dora-yellow)',
                            color: 'var(--text-dark)',
                            fontWeight: 800,
                            padding: '8px 20px',
                            fontSize: '0.85rem',
                            border: '1px solid var(--text-dark)'
                          }}
                        >
                          <i className="fa-solid fa-file-pdf"></i> Download PDF Invoice
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '1px solid var(--border-light)', paddingLeft: '24px' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-light)', display: 'block', fontSize: '0.75rem' }}>
                          MOBILE NUMBER
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{ord.mobile}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-light)', display: 'block', fontSize: '0.75rem' }}>
                          DELIVERY ADDRESS
                        </span>
                        <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', display: 'block', lineHeight: '1.3' }}>
                          {ord.address}
                        </span>
                      </div>
                      <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>Total Bill:</span>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: isConfirmed ? '#10b981' : 'var(--dora-blue)' }}>₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Keyframes injected into body */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1) translateY(-4px); }
        }
        .warp-pulse {
          animation: warp-glow 1.5s infinite alternate;
        }
        @keyframes warp-glow {
          from { box-shadow: 0 0 10px rgba(11, 118, 243, 0.1); }
          to { box-shadow: 0 0 20px rgba(11, 118, 243, 0.35); }
        }
      `}} />

      {/* Developed by Codearcade Shared Footer */}
      <footer style={{ marginTop: '60px', borderTop: '1px solid var(--border-light)', paddingTop: '24px', paddingBottom: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-light)' }}>

          <p>
            Developed by <a href="https://codearcade20.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--dora-blue)', fontWeight: 700, textDecoration: 'underline' }}>Codearcade</a>
          </p>
        </div>
      </footer>

      <CustomAlert
        active={alertConfig.active}
        title={alertConfig.title}
        message={alertConfig.message}
        isConfirm={alertConfig.isConfirm}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertConfig(prev => ({ ...prev, active: false }))}
        icon={alertConfig.icon}
      />

      {loadingHistory && (
        <CoolLoader text="Opening Anywhere Door portal to retrieve sweets history..." fullScreen />
      )}
    </div>
  );
}
