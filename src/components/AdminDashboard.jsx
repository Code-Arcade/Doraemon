import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import CustomAlert from './CustomAlert';
import CoolLoader from './CoolLoader';


export default function AdminDashboard({ onExitAdmin, refreshProducts }) {
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

  // Orders filter states
  const [filterDate, setFilterDate] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return localStorage.getItem('dora_admin_auth') === 'true';
  });
  const [loginError, setLoginError] = useState(false);

  // Dashboard states
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products' | 'customers'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filterCustomerSearch, setFilterCustomerSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // CRUD Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null for create, product object for edit
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formEmoji, setFormEmoji] = useState('🥞');
  const [formBg, setFormBg] = useState('#fff');
  const [formImg, setFormImg] = useState('');

  // Invoice Customizer states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceTransport, setInvoiceTransport] = useState(0);
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const [selectedExtraProduct, setSelectedExtraProduct] = useState('');

  const handleDeleteCustomer = (mobile) => {
    showCustomConfirm(
      "Delete Customer Profile? 🗑️",
      `Are you sure you want to delete customer ${mobile} from the 22nd-Century records? This action is permanent!`,
      async () => {
        try {
          await db.deleteCustomer(mobile);
          setCustomers(prev => prev.filter(c => c.mobile !== mobile));
          showCustomAlert("Deleted! 🗑️", "Customer profile was permanently deleted.", "🐱🎉");
        } catch (err) {
          console.error("Failed to delete customer:", err);
        }
      },
      "Delete 🗑️",
      "Cancel",
      "🐱⚠️"
    );
  };

  const handleDeleteOrder = (orderId) => {
    showCustomConfirm(
      "Delete Sweet Order? 🗑️",
      `Are you sure you want to permanently delete order #${orderId} from the database logs?`,
      async () => {
        try {
          await db.deleteOrder(orderId);
          setOrders(prev => prev.filter(o => o.id !== orderId));
          showCustomAlert("Deleted! 🗑️", "Order has been deleted from the database.", "🐱🎉");
        } catch (err) {
          console.error("Failed to delete order:", err);
        }
      },
      "Delete 🗑️",
      "Cancel",
      "🐱⚠️"
    );
  };

  // Order Confirmation / Rejection handlers
  const handleRejectOrder = (orderId) => {
    showCustomConfirm(
      "Reject Sweets Request? ❌",
      "Are you sure you want to reject this pastry request? The customer tracking portal will instantly show a closed status.",
      async () => {
        try {
          const ord = orders.find(o => o.id === orderId);
          if (ord) {
            const updated = await db.updateOrder({ ...ord, status: 'rejected' });
            setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
          }
        } catch (err) {
          console.error("Failed to reject order:", err);
        }
      },
      "Reject ❌",
      "Cancel",
      "🐱🚫"
    );
  };

  const handleWarpOrder = (orderId) => {
    showCustomConfirm(
      "Open Anywhere Door Warp? 🚀🚪",
      "Nobita, do you want to dispatch these pastries and activate the Anywhere Door warp coordinates for this client?",
      async () => {
        try {
          const ord = orders.find(o => o.id === orderId);
          if (ord) {
            const updated = await db.updateOrder({ ...ord, status: 'warping' });
            setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
          }
        } catch (err) {
          console.error("Failed to warp order:", err);
        }
      },
      "Open Warp 🚪",
      "Keep Baking 🥞",
      "🛸✨"
    );
  };

  const handleDeliverOrder = (orderId) => {
    showCustomConfirm(
      "Confirm Delicacy Delivery? 🎁😋",
      "Has Nobita successfully delivered the pastries to the target dimension coordinates?",
      async () => {
        try {
          const ord = orders.find(o => o.id === orderId);
          if (ord) {
            const updated = await db.updateOrder({ ...ord, status: 'delivered' });
            setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
          }
        } catch (err) {
          console.error("Failed to deliver order:", err);
        }
      },
      "Delivered! 🎉",
      "Not Yet",
      "🎉🍰"
    );
  };

  const handleOpenInvoiceEditor = (ord) => {
    let itemsList = ord.items;
    try {
      if (typeof itemsList === 'string') itemsList = JSON.parse(itemsList);
    } catch (e) { }
    if (!Array.isArray(itemsList)) itemsList = [];

    setInvoiceOrder(ord);
    setInvoiceItems(itemsList);
    setInvoiceTransport(parseFloat(ord.transport || 0));
    setInvoiceDiscount(parseFloat(ord.discount || 0));
    setSelectedExtraProduct('');
    setShowInvoiceModal(true);
  };

  const handleUpdateInvoiceItemQty = (index, delta) => {
    setInvoiceItems(prev => {
      const newList = [...prev];
      newList[index] = {
        ...newList[index],
        count: newList[index].count + delta
      };
      return newList.filter(it => it.count > 0);
    });
  };

  const handleAddExtraItemToInvoice = () => {
    if (!selectedExtraProduct) return;
    const prod = products.find(p => p.id === selectedExtraProduct);
    if (!prod) return;

    setInvoiceItems(prev => {
      const existingIdx = prev.findIndex(it => it.id === prod.id || it.name === prod.name);
      if (existingIdx !== -1) {
        const newList = [...prev];
        newList[existingIdx] = {
          ...newList[existingIdx],
          count: newList[existingIdx].count + 1
        };
        return newList;
      }
      return [...prev, { id: prod.id, name: prod.name, price: parseFloat(prod.price), count: 1 }];
    });
    setSelectedExtraProduct('');
  };

  const handleConfirmInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceOrder) return;

    const subtotal = invoiceItems.reduce((acc, it) => acc + (it.price * it.count), 0);
    const transport = parseFloat(invoiceTransport || 0);
    const couponDiscount = parseFloat(invoiceOrder.coupon_discount || 0);
    const discount = parseFloat(invoiceDiscount || 0);
    const grandTotal = subtotal + transport - couponDiscount - discount;

    try {
      const updated = await db.updateOrder({
        ...invoiceOrder,
        items: invoiceItems,
        total: grandTotal,
        transport,
        discount,
        coupon_discount: couponDiscount,
        status: 'confirmed'
      });

      setOrders(prev => prev.map(o => o.id === invoiceOrder.id ? updated : o));
      setShowInvoiceModal(false);
    } catch (err) {
      console.error("Failed to confirm invoice order:", err);
    }
  };

  // Reusable High-Resolution print utility
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

    let items = ord.items;
    try {
      if (typeof items === 'string') items = JSON.parse(items);
    } catch (e) { }
    if (!Array.isArray(items)) items = [];

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

  // Verify authorization
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (password === 'doraemon22') {
      setIsAuthorized(true);
      localStorage.setItem('dora_admin_auth', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  // Load Dashboard Data
  useEffect(() => {
    if (!isAuthorized) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const ords = await db.getOrders();
        const prods = await db.getProducts();
        const custs = await db.getCustomers();
        setOrders(ords);
        setProducts(prods);
        setCustomers(custs);
      } catch (err) {
        console.error("Failed to load admin data:", err);
      }
      setLoading(false);
    };

    loadData();
  }, [isAuthorized]);

  // CRUD Operations
  const handleOpenCreateForm = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormDesc('');
    setFormEmoji('🥞');
    setFormBg('#f0f6ff');
    setFormImg('');
    setShowFormModal(true);
  };

  const handleOpenEditForm = (prod) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormPrice(prod.price);
    setFormDesc(prod.desc);
    setFormEmoji(prod.emoji || '🥞');
    setFormBg(prod.colorBg || '#f0f6ff');
    setFormImg(prod.img || '');
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formName,
      price: parseFloat(formPrice),
      desc: formDesc,
      emoji: formEmoji,
      colorBg: formBg,
      img: formImg
    };

    try {
      if (editingProduct) {
        // Update product
        const updated = await db.updateProduct({ id: editingProduct.id, ...payload });
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      } else {
        // Create product
        const created = await db.createProduct(payload);
        setProducts(prev => [...prev, created]);
      }

      // Refresh home products lists
      refreshProducts();
      setShowFormModal(false);
    } catch (err) {
      console.error("Product submit failed:", err);
    }
  };

  const handleDeleteProduct = (id) => {
    showCustomConfirm(
      "Delete Pastry Product? 🗑️",
      "Nobita, are you absolutely sure you want to delete this sweets pastry product from the 22nd-Century database?",
      async () => {
        try {
          await db.deleteProduct(id);
          setProducts(prev => prev.filter(p => p.id !== id));
          refreshProducts();
        } catch (err) {
          console.error("Product delete failed:", err);
        }
      },
      "Delete 🗑️",
      "Keep Product 🍰",
      "🐱⚠️"
    );
  };

  // Auth gate
  if (!isAuthorized) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
        <div className="toast-customizer-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔑</div>
          <h3>Admin Authorization</h3>
          <p style={{ marginBottom: '24px', fontSize: '0.85rem' }}>Pocket Sweets Admin Dashboard portal requires authorization.</p>

          <form onSubmit={handleLoginSubmit}>
            <div className="toast-input-group" style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label htmlFor="admin-pass">Enter Admin Password</label>
              <input
                type="password"
                id="admin-pass"
                className="toast-input"
                placeholder="Hint: doraemon22"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {loginError && (
                <span style={{ color: 'var(--dora-red)', fontSize: '0.8rem', marginTop: '6px', display: 'block' }}>
                  Incorrect password, try again!
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onExitAdmin}>
                Back to Shop 🛍️
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                Verify 🔑
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Filter orders based on phone number, date, and status queries
  const filteredOrders = orders.filter(ord => {
    // 1. Phone number filter
    if (filterPhone.trim() !== '') {
      if (!ord.mobile.includes(filterPhone.trim())) return false;
    }

    // 2. Status filter
    if (filterStatus !== 'all') {
      if (ord.status !== filterStatus) return false;
    }

    // 3. Date filter
    if (filterDate !== '') {
      if (!ord.created_at) return false;
      const orderDate = new Date(ord.created_at).toISOString().split('T')[0]; // Matches YYYY-MM-DD
      if (orderDate !== filterDate) return false;
    }

    return true;
  });

  return (
    <div className="container" style={{ padding: '60px 24px', minHeight: '80vh' }}>

      {/* Admin header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '40px' }}>
        <div>
          <span className="section-subtitle">22nd-C Control Console</span>
          <h2 className="section-title">Pocket Sweets Admin Panel</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '4px' }}>
            Database Mode: <strong>📁 Local Storage Backend</strong> • URL: <code>/admin</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => {
              localStorage.removeItem('dora_admin_auth');
              setIsAuthorized(false);
              onExitAdmin();
            }}
            title="Log out from Admin mode"
          >
            Logout 🔒
          </button>
          <button type="button" className="btn btn-primary" onClick={onExitAdmin}>
            Exit Admin <i className="fa-solid fa-store" style={{ marginLeft: '6px' }}></i>
          </button>
        </div>
      </div>

      {/* Dashboard navigation tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('orders')}
        >
          Customer Requests ({orders.length})
        </button>
        <button
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('products')}
        >
          Manage Sweets Products ({products.length})
        </button>
        <button
          className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('customers')}
        >
          Manage Customers ({customers.length})
        </button>
      </div>

      {loading ? (
        <CoolLoader text="Synchronizing 22nd-Century temporal registry..." />
      ) : (
        <>
          {/* ORDERS LIST TAB */}
          {activeTab === 'orders' && (
            <div>
              {/* Premium Doraemon Filter Bar */}
              {orders.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                  background: 'var(--dora-blue-light)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid rgba(11, 118, 243, 0.15)',
                  marginBottom: '24px',
                  alignItems: 'flex-end'
                }}>
                  <div style={{ flex: 1, minWidth: '150px' }} className="toast-input-group">
                    <label htmlFor="filter-phone" style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>
                      Filter by Mobile Number
                    </label>
                    <input
                      type="text"
                      id="filter-phone"
                      className="toast-input"
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      placeholder="Search phone..."
                      maxLength={10}
                      value={filterPhone}
                      onChange={(e) => setFilterPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: '150px' }} className="toast-input-group">
                    <label htmlFor="filter-status" style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>
                      Filter by Status
                    </label>
                    <select
                      id="filter-status"
                      className="toast-input"
                      style={{ padding: '8px 12px', fontSize: '0.85rem', fontFamily: 'inherit', background: '#fff' }}
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Statuses 🌍</option>
                      <option value="pending">Pending Callback 📞</option>
                      <option value="confirmed">Confirmed (Baking) 🥞</option>
                      <option value="warping">Warping In Transit 🚀</option>
                      <option value="delivered">Delivered Successfully 🎉</option>
                      <option value="rejected">Rejected ❌</option>
                    </select>
                  </div>

                  <div style={{ flex: 1, minWidth: '150px' }} className="toast-input-group">
                    <label htmlFor="filter-date" style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>
                      Filter by Order Date
                    </label>
                    <input
                      type="date"
                      id="filter-date"
                      className="toast-input"
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                  </div>

                  {(filterPhone || filterDate || filterStatus !== 'all') && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setFilterPhone('');
                        setFilterDate('');
                        setFilterStatus('all');
                      }}
                      style={{ padding: '10px 16px', fontSize: '0.8rem', height: '40px', background: 'var(--white)', borderColor: 'var(--dora-red)', color: 'var(--dora-red)' }}
                    >
                      Clear Filters <i className="fa-solid fa-filter-circle-xmark" style={{ marginLeft: '4px' }}></i>
                    </button>
                  )}
                </div>
              )}

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--white)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
                  <span style={{ fontSize: '3rem' }}>📭</span>
                  <h4 style={{ marginTop: '12px', color: 'var(--text-light)' }}>No active orders in database.</h4>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--white)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--glass-shadow)', width: '100%' }}>
                  <span style={{ fontSize: '4.5rem', display: 'block', marginBottom: '16px', animation: 'float 5s ease-in-out infinite' }}>🔍</span>
                  <h4 style={{ marginBottom: '12px' }}>No orders matched your filters!</h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '24px' }}>Try adjusting your search terms or clear filters to see your requests.</p>
                  <button
                    className="btn btn-primary"
                    style={{ marginInline: 'auto' }}
                    onClick={() => {
                      setFilterPhone('');
                      setFilterDate('');
                      setFilterStatus('all');
                    }}
                  >
                    Reset Filters <i className="fa-solid fa-filter-circle-xmark" style={{ marginLeft: '6px' }}></i>
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', background: 'var(--white)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--dora-blue-light)', borderBottom: '1px solid var(--border-light)' }}>
                        <th style={{ padding: '16px' }}>Order ID</th>
                        <th style={{ padding: '16px' }}>Date</th>
                        <th style={{ padding: '16px' }}>Items Summary</th>
                        <th style={{ padding: '16px' }}>Total</th>
                        <th style={{ padding: '16px' }}>Mobile Number</th>
                        <th style={{ padding: '16px' }}>Delivery Address</th>
                        <th style={{ padding: '16px' }}>Status & Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((ord) => {
                        let parsedItems = ord.items;
                        try {
                          if (typeof ord.items === 'string') parsedItems = JSON.parse(ord.items);
                        } catch (e) { }

                        const itemsDesc = Array.isArray(parsedItems)
                          ? parsedItems.map(it => `${it.name} x${it.count}`).join(', ')
                          : ord.items;

                        return (
                          <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '16px', fontWeight: 700 }}>#{ord.id}</td>
                            <td style={{ padding: '16px', color: 'var(--text-light)' }}>
                              {new Date(ord.created_at).toLocaleString()}
                            </td>
                            <td style={{ padding: '16px', fontWeight: 550 }}>{itemsDesc}</td>
                            <td style={{ padding: '16px', color: 'var(--dora-blue)', fontWeight: 700 }}>
                              ₹{parseFloat(ord.total).toFixed(2)}
                            </td>
                            <td style={{ padding: '16px', fontWeight: 700 }}>{ord.mobile}</td>
                            <td style={{ padding: '16px', color: 'var(--text-light)' }}>{ord.address}</td>
                            <td style={{ padding: '16px' }}>
                              {(() => {
                                // Define dynamic styles for badges based on standard Doraemon theme
                                let badgeText = "Pending Callback 📞";
                                let badgeStyle = {
                                  background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                                  color: '#4f46e5',
                                  border: '1.5px solid rgba(79, 70, 229, 0.15)'
                                };
                                let indicatorColor = '#4f46e5';

                                if (ord.status === 'confirmed') {
                                  badgeText = "Confirmed (Baking) 🥞";
                                  badgeStyle = {
                                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                    color: '#b45309',
                                    border: '1.5px solid rgba(180, 83, 9, 0.15)'
                                  };
                                  indicatorColor = '#b45309';
                                } else if (ord.status === 'warping') {
                                  badgeText = "Warping (In Transit) 🚀";
                                  badgeStyle = {
                                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                                    color: '#1d4ed8',
                                    border: '1.5px solid rgba(29, 78, 216, 0.15)'
                                  };
                                  indicatorColor = '#1d4ed8';
                                } else if (ord.status === 'delivered') {
                                  badgeText = "Delivered Successfully 🎉";
                                  badgeStyle = {
                                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                                    color: '#047857',
                                    border: '1.5px solid rgba(4, 120, 87, 0.15)'
                                  };
                                  indicatorColor = '#047857';
                                } else if (ord.status === 'rejected') {
                                  badgeText = "Rejected ❌";
                                  badgeStyle = {
                                    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                                    color: '#b91c1c',
                                    border: '1.5px solid rgba(185, 28, 28, 0.15)'
                                  };
                                  indicatorColor = '#b91c1c';
                                }

                                const actionBtnStyle = (bgColor, textColor, borderColor) => ({
                                  flex: '1 1 0px',
                                  minWidth: '65px',
                                  padding: '4px 8px',
                                  fontSize: '0.72rem',
                                  fontWeight: '700',
                                  borderRadius: '20px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  height: '28px',
                                  border: borderColor ? `1.5px solid ${borderColor}` : 'none',
                                  background: bgColor,
                                  color: textColor,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  fontFamily: 'var(--font-sans)'
                                });

                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '220px', minWidth: '220px' }}>
                                    {/* Status Badge */}
                                    <div style={{
                                      ...badgeStyle,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      padding: '5px 12px',
                                      borderRadius: '12px',
                                      fontSize: '0.72rem',
                                      fontWeight: '800',
                                      width: '100%',
                                      textAlign: 'center',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.02em',
                                      fontFamily: 'var(--font-sans)'
                                    }}>
                                      {ord.status === 'pending' && (
                                        <span className="live-pulse-dot" style={{
                                          width: '6px',
                                          height: '6px',
                                          borderRadius: '50%',
                                          backgroundColor: indicatorColor,
                                          animation: 'dot-blink 1.2s infinite'
                                        }}></span>
                                      )}
                                      {badgeText}
                                    </div>

                                    {/* Action Group */}
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', width: '100%' }}>
                                      {ord.status === 'confirmed' ? (
                                        <>
                                          <button
                                            onClick={() => handleWarpOrder(ord.id)}
                                            style={actionBtnStyle('var(--dora-blue)', '#fff', null)}
                                            className="btn-primary"
                                          >
                                            <i className="fa-solid fa-door-open"></i> Warp Door
                                          </button>
                                          <button
                                            onClick={() => handlePrintInvoice(ord)}
                                            style={actionBtnStyle('transparent', 'var(--dora-blue)', 'var(--dora-blue)')}
                                            className="btn-secondary"
                                          >
                                            <i className="fa-solid fa-file-pdf"></i> Invoice
                                          </button>
                                        </>
                                      ) : ord.status === 'warping' ? (
                                        <>
                                          <button
                                            onClick={() => handleDeliverOrder(ord.id)}
                                            style={actionBtnStyle('#10b981', '#fff', null)}
                                            className="btn-primary"
                                          >
                                            <i className="fa-solid fa-gift"></i> Deliver
                                          </button>
                                          <button
                                            onClick={() => handlePrintInvoice(ord)}
                                            style={actionBtnStyle('transparent', 'var(--dora-blue)', 'var(--dora-blue)')}
                                            className="btn-secondary"
                                          >
                                            <i className="fa-solid fa-file-pdf"></i> Invoice
                                          </button>
                                        </>
                                      ) : ord.status === 'delivered' ? (
                                        <>
                                          <button
                                            onClick={() => handlePrintInvoice(ord)}
                                            style={{ ...actionBtnStyle('transparent', 'var(--dora-blue)', 'var(--dora-blue)'), flex: '2 1 0px' }}
                                            className="btn-secondary"
                                          >
                                            <i className="fa-solid fa-print"></i> Print Invoice
                                          </button>
                                        </>
                                      ) : ord.status === 'rejected' ? (
                                        <div style={{ flex: '1 1 0px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700 }}>
                                          Closed ❌
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => handleOpenInvoiceEditor(ord)}
                                            style={actionBtnStyle('#10b981', '#fff', null)}
                                            className="btn-primary"
                                          >
                                            <i className="fa-solid fa-phone"></i> Confirm
                                          </button>
                                          <button
                                            onClick={() => handleRejectOrder(ord.id)}
                                            style={actionBtnStyle('transparent', 'var(--dora-red)', 'var(--dora-red)')}
                                            className="btn-secondary"
                                          >
                                            <i className="fa-solid fa-xmark"></i> Reject
                                          </button>
                                        </>
                                      )}
                                      
                                      {/* Danger Deletion Trigger (Standardized across all order card rows) */}
                                      <button
                                        onClick={() => handleDeleteOrder(ord.id)}
                                        style={{
                                          ...actionBtnStyle('rgba(243, 45, 45, 0.05)', 'var(--dora-red)', 'rgba(243, 45, 45, 0.2)'),
                                          flex: ord.status === 'rejected' || ord.status === 'delivered' ? '1 1 0px' : '0 0 28px',
                                          minWidth: ord.status === 'rejected' || ord.status === 'delivered' ? '65px' : '28px',
                                          width: '28px',
                                          padding: '0'
                                        }}
                                        className="btn-secondary"
                                        title="Delete order logs permanently"
                                      >
                                        <i className="fa-solid fa-trash-can"></i>{(ord.status === 'rejected' || ord.status === 'delivered') && " Delete"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PRODUCTS CRUD TAB */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <button className="btn btn-primary" onClick={handleOpenCreateForm}>
                  + Add New Pastry Product
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {products.map((prod) => (
                  <div key={prod.id} className="menu-card" style={{ height: 'auto', padding: '24px', cursor: 'default' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      {prod.img ? (
                        <img src={prod.img} alt={prod.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: prod.colorBg || 'var(--dora-blue-light)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem' }}>
                          {prod.emoji || '🧁'}
                        </div>
                      )}
                      <span className="card-price" style={{ fontSize: '1.25rem' }}>₹{parseFloat(prod.price).toFixed(2)}</span>
                    </div>

                    <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{prod.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '24px', minHeight: '60px' }}>
                      {prod.desc}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                      <button className="btn btn-secondary" style={{ flex: 1, padding: '8px', justifyContent: 'center' }} onClick={() => handleOpenEditForm(prod)}>
                        Edit <i className="fa-solid fa-pen-to-square" style={{ marginLeft: '4px' }}></i>
                      </button>
                      <button className="btn btn-secondary" style={{ flex: 1, padding: '8px', justifyContent: 'center', borderColor: 'var(--dora-red)', color: 'var(--dora-red)' }} onClick={() => handleDeleteProduct(prod.id)}>
                        Delete <i className="fa-solid fa-trash-can" style={{ marginLeft: '4px' }}></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div>
              {/* Premium Customer Search/Filter Bar */}
              <div style={{
                background: 'var(--dora-blue-light)',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid rgba(11, 118, 243, 0.15)',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{ flex: 1 }} className="toast-input-group">
                  <label htmlFor="filter-cust-search" style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>
                    Search Customers by Mobile / Address
                  </label>
                  <input
                    type="text"
                    id="filter-cust-search"
                    className="toast-input"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    placeholder="Search mobile number or delivery address..."
                    value={filterCustomerSearch}
                    onChange={(e) => setFilterCustomerSearch(e.target.value)}
                  />
                </div>
                {filterCustomerSearch && (
                  <button
                    className="btn btn-secondary"
                    style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', marginTop: '20px' }}
                    onClick={() => setFilterCustomerSearch('')}
                  >
                    Clear Search ❌
                  </button>
                )}
              </div>

              {/* Customers table list */}
              {customers.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 40px',
                  background: 'var(--white)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚪✨</div>
                  <h4 style={{ color: 'var(--dora-blue)', fontFamily: 'var(--font-logo)', marginBottom: '8px' }}>Empty Portal Registry!</h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>No customer profiles have warped through the Anywhere Door yet, Nobita!</p>
                </div>
              ) : (
                (() => {
                  const filtered = customers.filter(c => 
                    c.mobile.includes(filterCustomerSearch) || 
                    c.address.toLowerCase().includes(filterCustomerSearch.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <div style={{
                        textAlign: 'center',
                        padding: '50px 40px',
                        background: 'var(--white)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-lg)'
                      }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🐱🔍</div>
                        <h4 style={{ color: 'var(--text-dark)', marginBottom: '8px' }}>No matches found!</h4>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>No coordinates in the temporal database match your search terms.</p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ overflowX: 'auto', background: 'var(--white)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--dora-blue-light)', borderBottom: '1px solid var(--border-light)' }}>
                            <th style={{ padding: '16px' }}>Mobile Number</th>
                            <th style={{ padding: '16px' }}>Saved Delivery Address</th>
                            <th style={{ padding: '16px' }}>First Registered</th>
                            <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(cust => (
                            <tr key={cust.mobile} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '16px', fontWeight: 700, color: 'var(--dora-blue)' }}>{cust.mobile}</td>
                              <td style={{ padding: '16px', color: 'var(--text-dark)' }}>{cust.address}</td>
                              <td style={{ padding: '16px', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                                {new Date(cust.created_at || Date.now()).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--dora-red)', color: 'var(--dora-red)' }}
                                  onClick={() => handleDeleteCustomer(cust.mobile)}
                                >
                                  Delete 🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </>
      )}

      {/* CRUD Product Form Modal */}
      {showFormModal && (
        <div className="modal-overlay active" onClick={(e) => {
          if (e.target.classList.contains('modal-overlay')) setShowFormModal(false);
        }}>
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'left' }}>
            <button className="modal-close" onClick={() => setShowFormModal(false)}>&times;</button>

            <h3 className="modal-title" style={{ textAlign: 'center', marginBottom: '24px' }}>
              {editingProduct ? 'Edit Pastry Product' : 'Add New Pastry Product'}
            </h3>

            <form onSubmit={handleFormSubmit}>
              <div className="toast-input-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="form-prod-name">Product Name</label>
                <input
                  type="text"
                  id="form-prod-name"
                  className="toast-input"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="toast-input-group">
                  <label htmlFor="form-prod-price">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    id="form-prod-price"
                    className="toast-input"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                </div>
                <div className="toast-input-group">
                  <label htmlFor="form-prod-emoji">Emoji Icon</label>
                  <input
                    type="text"
                    id="form-prod-emoji"
                    className="toast-input"
                    placeholder="e.g. 🍩"
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                  />
                </div>
              </div>

              <div className="toast-input-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="form-prod-desc">Description</label>
                <textarea
                  id="form-prod-desc"
                  className="toast-input"
                  rows="3"
                  required
                  style={{ resize: 'none', fontFamily: 'inherit' }}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div className="toast-input-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="form-prod-bg">Background Hex Color (for Card icon)</label>
                <input
                  type="text"
                  id="form-prod-bg"
                  className="toast-input"
                  placeholder="e.g. #ffeaa7"
                  value={formBg}
                  onChange={(e) => setFormBg(e.target.value)}
                />
              </div>

              <div className="toast-input-group" style={{ marginBottom: '24px' }}>
                <label htmlFor="form-prod-img">Product Image Upload</label>
                <input
                  type="file"
                  id="form-prod-img"
                  className="toast-input"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setUploadingImg(true);
                      
                      try {
                        const imgData = await db.uploadProductImage(file);
                        if (imgData) {
                          setFormImg(imgData);
                          showCustomAlert("Image Saved! 🐱📸", "Your pastry image has been stored directly into Local Storage!", "🐱🎉");
                        }
                      } catch (err) {
                        console.error("Local image save failed:", err);
                        showCustomAlert("Image Error! ⚠️", "Could not process image file. Please try another image.", "🐱😿");
                      } finally {
                        setUploadingImg(false);
                      }
                    }
                  }}
                />
                {uploadingImg && (
                  <div style={{ marginTop: '8px' }}>
                    <CoolLoader mini text="Processing image into Local Storage..." />
                  </div>
                )}
                {formImg && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Preview:</span>
                    <img src={formImg} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                    <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--dora-red)', color: 'var(--dora-red)', border: '1px solid var(--dora-red)', background: 'transparent' }} onClick={() => setFormImg('')}>
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Invoice Creator Modal Drawer */}
      {showInvoiceModal && invoiceOrder && (
        <div className="modal-overlay active" onClick={(e) => {
          if (e.target.classList.contains('modal-overlay')) setShowInvoiceModal(false);
        }}>
          <div className="modal-content" style={{ maxWidth: '850px', width: '90%', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <button className="modal-close" onClick={() => setShowInvoiceModal(false)}>&times;</button>

            <h3 className="modal-title" style={{ textAlign: 'center', marginBottom: '24px', fontFamily: 'var(--font-logo)', color: 'var(--dora-blue)', fontSize: '1.6rem' }}>
              🛠️ 22nd-Century Invoice Creator
            </h3>

            {/* Split Grid for Invoice Builder & Live Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>

              {/* Left Column: Form Modifiers */}
              <div style={{ background: 'var(--cream-bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--text-dark)' }}>
                  1. Customize Invoice Delicacies
                </h4>

                {/* Edit Qty items list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {invoiceItems.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--dora-red)', fontWeight: 600 }}>No items in invoice! Add below:</span>
                  ) : (
                    invoiceItems.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--white)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{it.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>₹{parseFloat(it.price).toFixed(2)} each</span>
                        </div>

                        {/* Qty edit buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '2px 8px', fontSize: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '4px', background: '#ffeaa7' }}
                            onClick={() => handleUpdateInvoiceItemQty(idx, -1)}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{it.count}</span>
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '2px 8px', fontSize: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '4px', background: '#a5dbf5' }}
                            onClick={() => handleUpdateInvoiceItemQty(idx, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Extra Item Selector */}
                <div className="toast-input-group" style={{ marginBottom: '20px', borderTop: '1px dashed var(--border-light)', paddingTop: '16px' }}>
                  <label htmlFor="select-extra-product" style={{ fontSize: '0.75rem', fontWeight: 800 }}>Add Additional Sweet Pastry</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <select
                      id="select-extra-product"
                      className="toast-input"
                      style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }}
                      value={selectedExtraProduct}
                      onChange={(e) => setSelectedExtraProduct(e.target.value)}
                    >
                      <option value="">-- Choose pastry --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₹{parseFloat(p.price).toFixed(2)})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      onClick={handleAddExtraItemToInvoice}
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Transport & Discount Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px dashed var(--border-light)', paddingTop: '16px' }}>
                  <div className="toast-input-group">
                    <label htmlFor="transport-charge" style={{ fontSize: '0.75rem', fontWeight: 800 }}>Transport Charge (₹)</label>
                    <input
                      type="number"
                      id="transport-charge"
                      className="toast-input"
                      style={{ padding: '8px 12px', fontSize: '0.9rem', marginTop: '6px' }}
                      min="0"
                      step="0.01"
                      value={invoiceTransport}
                      onChange={(e) => setInvoiceTransport(parseFloat(e.target.value || 0))}
                    />
                  </div>
                  <div className="toast-input-group">
                    <label htmlFor="discount-charge" style={{ fontSize: '0.75rem', fontWeight: 800 }}>Discount Allowed (₹)</label>
                    <input
                      type="number"
                      id="discount-charge"
                      className="toast-input"
                      style={{ padding: '8px 12px', fontSize: '0.9rem', marginTop: '6px' }}
                      min="0"
                      step="0.01"
                      value={invoiceDiscount}
                      onChange={(e) => setInvoiceDiscount(parseFloat(e.target.value || 0))}
                    />
                  </div>
                </div>

              </div>

              {/* Right Column: Live Tax Invoice Draft Preview */}
              <div
                style={{
                  background: 'var(--white)',
                  border: '3px solid var(--dora-blue)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Red ribbon trim */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'var(--dora-red)' }}></div>

                {/* Cute bell mark */}
                <div style={{ width: '20px', height: '20px', background: 'var(--dora-yellow)', border: '1.5px solid var(--text-dark)', borderRadius: '50%', margin: '4px auto 0', position: 'relative' }}>
                  <div style={{ width: '4px', height: '4px', background: 'var(--text-dark)', borderRadius: '50%', position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)' }}></div>
                </div>

                {/* Logo & title block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(15, 23, 42, 0.06)', paddingBottom: '12px', marginTop: '4px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-logo)', color: 'var(--dora-blue)', fontSize: '1.2rem', fontWeight: 700 }}>Pocket Sweets</span>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>22nd Century Baking Laboratory</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800 }}>DRAFT INVOICE</span>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>Order: #{invoiceOrder.id}</p>
                  </div>
                </div>

                {/* Dest details */}
                <div style={{ fontSize: '0.75rem', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontWeight: 800, color: 'var(--text-light)', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem' }}>DESTINATION</span>
                    <p style={{ fontWeight: 700 }}>Mob: {invoiceOrder.mobile}</p>
                    <p style={{ color: 'var(--text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{invoiceOrder.address}</p>
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, color: 'var(--text-light)', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem' }}>INVOICE STATUS</span>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>PAID ON CONFIRM ✅</span>
                  </div>
                </div>

                {/* Items listings preview */}
                <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--dora-blue-light)', borderBottom: '1.5px solid rgba(11, 118, 243, 0.15)' }}>
                        <th style={{ padding: '6px 8px' }}>Sweet</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center' }}>Price</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.05)' }}>
                          <td style={{ padding: '8px' }}><strong>{it.name}</strong></td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>₹{parseFloat(it.price).toFixed(2)}</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>x{it.count}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{(it.price * it.count).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Computations preview panel */}
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px dashed var(--border-light)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>₹{invoiceItems.reduce((acc, it) => acc + (it.price * it.count), 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)' }}>
                    <span>Transport Fee:</span>
                    <span>+₹{parseFloat(invoiceTransport || 0).toFixed(2)}</span>
                  </div>
                  {parseFloat(invoiceOrder?.coupon_discount || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                      <span>Coupon Discount:</span>
                      <span>-₹{parseFloat(invoiceOrder.coupon_discount).toFixed(2)}</span>
                    </div>
                  )}
                  {parseFloat(invoiceDiscount || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--dora-red)', fontWeight: 600 }}>
                      <span>Admin Discount:</span>
                      <span>-₹{parseFloat(invoiceDiscount).toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--dora-blue)', fontWeight: 800, fontSize: '0.95rem', borderTop: '1.5px solid var(--dora-blue)', paddingTop: '6px', marginTop: '4px' }}>
                    <span>Grand Total:</span>
                    <span>
                      ₹{(
                        invoiceItems.reduce((acc, it) => acc + (it.price * it.count), 0) +
                        parseFloat(invoiceTransport || 0) -
                        parseFloat(invoiceOrder?.coupon_discount || 0) -
                        parseFloat(invoiceDiscount || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Actions panel */}
            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setShowInvoiceModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{ flex: 1, justifyContent: 'center', background: 'var(--dora-yellow)', color: 'var(--text-dark)', fontWeight: 700, border: '1px solid var(--text-dark)' }}
                onClick={() => handlePrintInvoice({
                  ...invoiceOrder,
                  items: invoiceItems,
                  transport: invoiceTransport,
                  discount: invoiceDiscount
                })}
              >
                <i className="fa-solid fa-file-pdf"></i> Download PDF Invoice
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1.5, justifyContent: 'center', background: '#10b981', color: '#fff', border: 'none' }}
                onClick={handleConfirmInvoice}
              >
                Confirm & Warp Invoice 🚀
              </button>
            </div>

          </div>
        </div>
      )}

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
    </div>
  );
}
