import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { db } from './services/db';

// Import custom components
import Header from './components/Header';
import Hero from './components/Hero';
import AnywhereDoor from './components/AnywhereDoor';
import Menu from './components/Menu';
import ToastCustomizer from './components/ToastCustomizer';
import FourDPocket from './components/FourDPocket';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import CopterSpawner from './components/CopterSpawner';
import Modal from './components/Modal';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './components/AdminDashboard';
import MyOrders from './components/MyOrders';
import AdPage from './components/AdPage';
import CustomAlert from './components/CustomAlert';
import CoolLoader from './components/CoolLoader';
import MusicPlayer from './components/MusicPlayer';


const themes = [
  { name: "🌾 Dorayaki Meadow", bodyClass: "" },
  { name: "🍭 Candy Cloud World", bodyClass: "theme-candy-cloud" },
  { name: "🌌 Cosmic Gelato Orbit", bodyClass: "theme-cosmic-gelato" }
];

export default function App() {
  const [productsList, setProductsList] = useState([]);
  const [cartList, setCartList] = useState([]);
  const [themeIndex, setThemeIndex] = useState(0);
  const [customBreadText, setCustomBreadText] = useState("2 + 3 = 5");
  const [modalActive, setModalActive] = useState(false);
  const [checkoutActive, setCheckoutActive] = useState(false);
  const [adminMode, setAdminMode] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.startsWith('/admin') || hash === '#admin';
  });
  const [myOrdersMode, setMyOrdersMode] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.startsWith('/orders') || hash === '#orders' || hash === '#my-orders';
  });
  const [adMode, setAdMode] = useState(() => {
    return window.location.pathname.toLowerCase().startsWith('/ad');
  });
  const [activePrize, setActivePrize] = useState(null);
  const [customAlert, setCustomAlert] = useState({ active: false, title: '', message: '' });
  const [appLoading, setAppLoading] = useState(true);

  // Doraemon Theme Background Music State (Soft Ambience)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(() => {
    const saved = localStorage.getItem('dora_bgm_volume');
    return saved !== null ? parseFloat(saved) : 0.18; // 18% soft ambient volume
  });

  const toggleMusic = () => {
    setIsMusicPlaying(prev => !prev);
  };

  // Browser URL Navigation Routing (/admin, /orders, /ad, /)
  const navigateTo = (path) => {
    if (path === '/admin') {
      setAdminMode(true);
      setMyOrdersMode(false);
      setAdMode(false);
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
    } else if (path === '/orders') {
      setAdminMode(false);
      setMyOrdersMode(true);
      setAdMode(false);
      if (window.location.pathname !== '/orders') {
        window.history.pushState(null, '', '/orders');
      }
    } else if (path === '/ad') {
      setAdminMode(false);
      setMyOrdersMode(false);
      setAdMode(true);
      if (window.location.pathname !== '/ad') {
        window.history.pushState(null, '', '/ad');
      }
    } else {
      setAdminMode(false);
      setMyOrdersMode(false);
      setAdMode(false);
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
    }
  };

  // Sync state with browser location (back/forward history and direct URL entry)
  useEffect(() => {
    const syncRouteFromLocation = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash === '#admin') {
        setAdminMode(true);
        setMyOrdersMode(false);
        setAdMode(false);
      } else if (path.startsWith('/orders') || hash === '#orders' || hash === '#my-orders') {
        setAdminMode(false);
        setMyOrdersMode(true);
        setAdMode(false);
      } else if (path.startsWith('/ad')) {
        setAdminMode(false);
        setMyOrdersMode(false);
        setAdMode(true);
      } else {
        setAdminMode(false);
        setMyOrdersMode(false);
        setAdMode(false);
      }
    };

    window.addEventListener('popstate', syncRouteFromLocation);
    window.addEventListener('hashchange', syncRouteFromLocation);
    return () => {
      window.removeEventListener('popstate', syncRouteFromLocation);
      window.removeEventListener('hashchange', syncRouteFromLocation);
    };
  }, []);

  // Synchronize products on mount
  const loadProducts = async () => {
    try {
      const prods = await db.getProducts();
      setProductsList(prods);
    } catch (err) {
      console.error("Failed to load products list:", err);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      await loadProducts();
      // Gorgeous 1.2s warp intro simulation to wow the customer!
      setTimeout(() => {
        setAppLoading(false);
      }, 1200);
    };
    initApp();
  }, []);

  // Synchronize theme classes on document body
  useEffect(() => {
    themes.forEach((t) => {
      if (t.bodyClass) document.body.classList.remove(t.bodyClass);
    });

    const activeTheme = themes[themeIndex];
    if (activeTheme.bodyClass) {
      document.body.classList.add(activeTheme.bodyClass);
    }
  }, [themeIndex]);

  // Audio Context Synthesizer
  let audioCtx = null;
  const getAudioContext = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  };

  const playBubbleSound = () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.12);

      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch (e) {}
  };

  const playSwooshSound = () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(90, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.25);

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch (e) {}
  };

  // State Triggers
  const handleAddToCart = (itemName, price) => {
    setCartList((prev) => {
      const existing = prev.find((item) => item.name === itemName);
      if (existing) {
        return prev.map((item) =>
          item.name === itemName ? { ...item, count: item.count + 1 } : item
        );
      }
      return [...prev, { name: itemName, price, count: 1 }];
    });

    playBubbleSound();

    confetti({
      particleCount: 20,
      spread: 30,
      origin: { y: 0.8 },
      colors: ['#0b76f3', '#ffd31d', '#f32d2d']
    });
  };

  const handleToggleTheme = () => {
    setThemeIndex((prev) => (prev + 1) % themes.length);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#0b76f3', '#ff5c8a', '#ffd31d', '#ffffff']
    });
  };

  const handleTriggerPrize = async () => {
    // Check device cooling down first (LocalStorage)
    const lastGenTimeStr = localStorage.getItem('dora_last_coupon_gen_time');
    if (lastGenTimeStr) {
      const lastGenTime = parseInt(lastGenTimeStr, 10);
      const cooldown = 7 * 24 * 60 * 60 * 1000; // 7 days
      if (Date.now() - lastGenTime < cooldown) {
        const daysLeft = Math.ceil((cooldown - (Date.now() - lastGenTime)) / (24 * 60 * 60 * 1000));
        setCustomAlert({
          active: true,
          title: "4D Pocket Cooling Down! 🐱⏳",
          message: `Nobita! Doraemon's 4D Pocket temporal portals need time to recharge. You can pull another gadget ticket in ${daysLeft} day${daysLeft > 1 ? 's' : ''}! Please wait for the weekly cooling cycle.`
        });
        return;
      }
    }

    // Check database cooling down if logged in
    const activeMobile = localStorage.getItem('dora_customer_mobile');
    if (activeMobile) {
      try {
        const pastOrders = await db.getCustomerOrders(activeMobile);
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const usedCouponRecently = pastOrders.some(ord => {
          const createdTime = new Date(ord.created_at).getTime();
          return createdTime > sevenDaysAgo && parseFloat(ord.coupon_discount || 0) > 0;
        });

        if (usedCouponRecently) {
          setCustomAlert({
            active: true,
            title: "Weekly Coupon Limit! 🐱⏳",
            message: `Nobita! The mobile number ${activeMobile} has already used a 4D Pocket coupon in the last 7 days. Doraemon's pocket won't supply more tickets until the weekly portal warp resets!`
          });
          return;
        }
      } catch (err) {
        console.error("Failed to check gacha cooling:", err);
      }
    }

    playSwooshSound();
    
    // Pick random prize from gadgets list
    const gadgetsList = [
      {
        emoji: "🍞",
        title: "Memory Bread Coupon",
        desc: "15% off your entire order of futuristic sweets.",
        code: "MEMORY15"
      },
      {
        emoji: "🚁",
        title: "Bamboo-Copter Deal",
        desc: "Free Cloud Mochi Cupcake with any order over ₹1000.",
        code: "COPTERFREE"
      },
      {
        emoji: "🚪",
        title: "Anywhere Door Delivery",
        desc: "Free courier shipping directly to your dimension.",
        code: "ANYWHEREDELIVERY"
      },
      {
        emoji: "🍮",
        title: "Translation Jelly Treat",
        desc: "20% off all jelly, mochi, and custard delicacies.",
        code: "JELLY20"
      }
    ];

    const randomGadget = gadgetsList[Math.floor(Math.random() * gadgetsList.length)];
    setActivePrize(randomGadget);
    setModalActive(true);

    confetti({
      particleCount: 80,
      spread: 50,
      origin: { y: 0.65 },
      colors: ['#0b76f3', '#ffd31d', '#ffffff']
    });
  };

  const handleCloseModal = () => {
    setModalActive(false);
    playBubbleSound();
  };

  // Checkout triggers
  const handleOpenCheckout = () => {
    if (cartList.length === 0) {
      setCustomAlert({
        active: true,
        title: "Your Pocket is Empty!",
        message: "Your shopping pocket is currently empty, Nobita! Add some delicious pastry treats first so Doraemon can prepare the delivery warp!"
      });
      return;
    }
    setCheckoutActive(true);
  };

  const handleSubmitCheckout = async ({ mobile, address, discount = 0, transport = 0, items }) => {
    const finalItems = items || cartList;
    const subtotal = finalItems.reduce((acc, item) => acc + item.price * item.count, 0);
    const couponDiscountVal = parseFloat(discount || 0);
    const total = subtotal + parseFloat(transport) - couponDiscountVal;
    
    try {
      const orderResult = await db.createOrder({
        items: finalItems,
        total,
        mobile,
        address,
        discount: 0,
        coupon_discount: couponDiscountVal,
        transport: parseFloat(transport)
      });

      // Save active order locally with a 10 minutes target countdown timestamp
      const newActiveOrder = {
        id: orderResult.id || Math.random().toString(36).substr(2, 9),
        items: [...finalItems],
        total,
        mobile,
        address,
        discount: 0,
        coupon_discount: couponDiscountVal,
        transport: parseFloat(transport),
        targetTime: Date.now() + 10 * 60 * 1000, // 10 minutes countdown
        created_at: new Date().toISOString()
      };

      const existing = localStorage.getItem('dora_customer_orders');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newActiveOrder);
      localStorage.setItem('dora_customer_orders', JSON.stringify(list));

      // Clear cart
      setCartList([]);

      // Clear active prize coupon upon application
      setActivePrize(null);

      if (couponDiscountVal > 0) {
        localStorage.setItem('dora_last_coupon_gen_time', Date.now().toString());
      }

      // Transition to the My Orders countdown tracker page
      navigateTo('/orders');
    } catch (error) {
      console.error("Order submission failed:", error);
    }
  };

  // Header cart display total
  const cartTotalItems = cartList.reduce((acc, item) => acc + item.count, 0);
  const cartTotalPrice = cartList.reduce((acc, item) => acc + item.price * item.count, 0);

  if (appLoading) {
    return (
      <CoolLoader text="Warping to 22nd-Century Sweets Shop..." fullScreen />
    );
  }

  if (adminMode) {
    return (
      <>
        <MusicPlayer 
          isPlaying={isMusicPlaying} 
          setIsPlaying={setIsMusicPlaying} 
          volume={musicVolume} 
          setVolume={setMusicVolume} 
        />
        <AdminDashboard 
          onExitAdmin={() => navigateTo('/')} 
          refreshProducts={loadProducts} 
        />
      </>
    );
  }

  if (myOrdersMode) {
    return (
      <>
        <MusicPlayer 
          isPlaying={isMusicPlaying} 
          setIsPlaying={setIsMusicPlaying} 
          volume={musicVolume} 
          setVolume={setMusicVolume} 
        />
        <MyOrders 
          onExitOrders={() => navigateTo('/')} 
        />
      </>
    );
  }

  if (adMode) {
    return (
      <AdPage onBack={() => navigateTo('/')} />
    );
  }

  return (
    <>
      {/* Floating Doraemon Theme Music Player */}
      <MusicPlayer 
        isPlaying={isMusicPlaying} 
        setIsPlaying={setIsMusicPlaying} 
        volume={musicVolume} 
        setVolume={setMusicVolume} 
      />

      {/* Floating Bamboo Copter Screen Sweet Spawner */}
      <CopterSpawner playBubbleSound={playBubbleSound} />

      <Header 
        cartCount={cartTotalItems} 
        onCartClick={handleOpenCheckout} 
        onMyOrdersClick={() => navigateTo('/orders')}
        onAdminClick={() => navigateTo('/admin')} 
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={toggleMusic}
      />

      {/* Cart order button trigger helper inside header */}
      <div style={{ display: 'none' }}>
        <button id="cart-checkout-trigger" onClick={handleOpenCheckout}></button>
      </div>

      <main>
        {/* Click cart badge to open checkout directly! */}
        <div style={{ position: 'relative' }}>
          <Hero playBubbleSound={playBubbleSound} />
        </div>

        <AnywhereDoor 
          activeThemeName={themes[themeIndex].name}
          toggleTheme={handleToggleTheme}
          playBubbleSound={playBubbleSound}
        />

        {/* Dynamic products list fetched from CRUD database! */}
        <Menu products={productsList} onAddToCart={handleAddToCart} />

        <ToastCustomizer 
          customBreadText={customBreadText}
          setCustomBreadText={setCustomBreadText}
        />

        <FourDPocket onTriggerPrize={handleTriggerPrize} />

        <Reviews />
      </main>

      <Footer onAdminClick={() => navigateTo('/admin')} />

      {/* Prize Modal */}
      <Modal 
        active={modalActive} 
        onClose={handleCloseModal} 
        prize={activePrize} 
      />

      {/* Checkout Input Collector Modal */}
      <CheckoutModal
        active={checkoutActive}
        onClose={() => setCheckoutActive(false)}
        cartItems={cartTotalItems}
        cartTotal={cartTotalPrice}
        onSubmitOrder={handleSubmitCheckout}
        unlockedCoupon={activePrize}
        cartList={cartList}
      />

      {/* Doraemon Custom Alert Pop-up */}
      <CustomAlert 
        active={customAlert.active}
        title={customAlert.title}
        message={customAlert.message}
        onClose={() => setCustomAlert(prev => ({ ...prev, active: false }))}
      />
    </>
  );
}
