// Magical Doraemon Dessert Shop Script - Minimal Redesign

let cartCount = 0;
let currentThemeIndex = 0;

const themes = [
  { name: "🌾 Dorayaki Meadow", bodyClass: "" },
  { name: "🍭 Candy Cloud World", bodyClass: "theme-candy-cloud" },
  { name: "🌌 Cosmic Gelato Orbit", bodyClass: "theme-cosmic-gelato" }
];

const doraemonQuotes = [
  "My absolute favorite is the red-bean Dorayaki! 🥞",
  "Tap the Anywhere Door to teleport our parlor to different sweet dimensions! 🚪",
  "Reach into my 4D Pocket on the right! I hid secret coupons from the 22nd century! ✨",
  "Need to memorize something? Try printing your formulas on our Memory Bread! 🍞",
  "Baking joy and happiness, one Dorayaki at a time. Have a super sweet day! ☀️"
];

const gadgets = [
  {
    emoji: "🍞",
    title: "Memory Bread Coupon",
    desc: "15% off your entire order of futuristic sweets.",
    code: "MEMORY15"
  },
  {
    emoji: "🚁",
    title: "Bamboo-Copter Deal",
    desc: "Free Cloud Mochi Cupcake with any order over $15.",
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

const sweetEmojis = ['🍡', '🥞', '🍩', '🍧', '🧁', '🍪', '🍮'];

// Load Listeners
document.addEventListener("DOMContentLoaded", () => {
  initAnywhereDoor();
  init4DPocket();
  initDoraemonSpeech();
  initMemoryBreadCustomizer();
  initBambooCopterSpawner();
});

// 1. Anywhere Door Switching
function initAnywhereDoor() {
  const doorBtn = document.getElementById("magical-door");
  const themeNameDisplay = document.getElementById("current-theme-name");

  if (!doorBtn) return;

  doorBtn.addEventListener("click", () => {
    playSynthesizedBubbleSound();
    doorBtn.classList.add("open");

    setTimeout(() => {
      // Remove old theme
      const oldTheme = themes[currentThemeIndex];
      if (oldTheme.bodyClass) {
        document.body.classList.remove(oldTheme.bodyClass);
      }

      // Increment
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      const newTheme = themes[currentThemeIndex];

      // Add new theme
      if (newTheme.bodyClass) {
        document.body.classList.add(newTheme.bodyClass);
      }

      themeNameDisplay.textContent = `Current Dimension: ${newTheme.name}`;
      triggerConfettiThemeSwitch();
    }, 400);

    setTimeout(() => {
      doorBtn.classList.remove("open");
    }, 1200);
  });
}

// 2. 4D Pocket Modal prize
function init4DPocket() {
  const pocketWidget = document.getElementById("pocket-clickable-widget");
  const modalOverlay = document.getElementById("gadget-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  const modalEmoji = document.getElementById("modal-gadget-emoji");
  const modalTitle = document.getElementById("modal-title-heading");
  const modalDesc = document.getElementById("modal-gadget-desc");
  const modalCoupon = document.getElementById("modal-coupon-code");

  if (!pocketWidget || !modalOverlay) return;

  pocketWidget.addEventListener("click", () => {
    playSynthesizedSwooshSound();
    
    // Pick random prize
    const randomGadget = gadgets[Math.floor(Math.random() * gadgets.length)];
    
    modalEmoji.textContent = randomGadget.emoji;
    modalTitle.textContent = randomGadget.title;
    modalDesc.textContent = randomGadget.desc;
    modalCoupon.textContent = `CODE: ${randomGadget.code}`;

    modalOverlay.classList.add("active");
    triggerConfettiPocketPrize();
  });

  const closeModal = () => {
    modalOverlay.classList.remove("active");
    playSynthesizedBubbleSound();
  };

  modalCloseBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

// 3. Doraemon Dialogue Speech Bubble
function initDoraemonSpeech() {
  const speechBubble = document.getElementById("doraemon-speech");
  const speechText = document.getElementById("speech-text");
  const doraemonHeroImg = document.getElementById("hero-doraemon-img");

  if (!speechBubble || !speechText) return;

  speechBubble.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * doraemonQuotes.length);
    speechText.textContent = doraemonQuotes[randomIndex];
    
    playSynthesizedBubbleSound();

    if (doraemonHeroImg) {
      doraemonHeroImg.style.transform = "scale(1.04) rotate(2deg)";
      setTimeout(() => {
        doraemonHeroImg.style.transform = "";
      }, 400);
    }
  });
}

// 4. Memory Bread Customizer Input Handler
function initMemoryBreadCustomizer() {
  const customInput = document.getElementById("bread-custom-text");
  const liveText = document.getElementById("toast-live-text");

  if (!customInput || !liveText) return;

  customInput.addEventListener("input", () => {
    liveText.textContent = customInput.value || "2 + 3 = 5";
  });
}

// 5. Bamboo Copter Floating Spawner
function initBambooCopterSpawner() {
  const spawnerBtn = document.getElementById("bamboo-spawner");
  if (!spawnerBtn) return;

  spawnerBtn.addEventListener("click", () => {
    playSynthesizedBubbleSound();

    // Spawn 8 flying sweets with propellers
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        spawnFlyingSweet();
      }, i * 150);
    }
  });
}

function spawnFlyingSweet() {
  const flyingItem = document.createElement("div");
  flyingItem.className = "flying-copter-sweet";
  
  // Pick random sweet emoji
  const randomEmoji = sweetEmojis[Math.floor(Math.random() * sweetEmojis.length)];
  flyingItem.textContent = randomEmoji;

  // Set horizontal randomize positioning
  const randomX = Math.random() * 85 + 5; // 5vw to 90vw
  flyingItem.style.left = `${randomX}vw`;
  
  // Set random size scaling
  const scale = 0.6 + Math.random() * 0.7; // 0.6 to 1.3
  flyingItem.style.transform = `scale(${scale})`;

  // Add to DOM body
  document.body.appendChild(flyingItem);

  // Auto clean up after float finishes
  setTimeout(() => {
    flyingItem.remove();
  }, 4100);
}

// 6. Cart management
function addToCart(itemName, price) {
  cartCount++;
  const cartBadge = document.getElementById("cart-badge-count");
  if (cartBadge) {
    cartBadge.textContent = cartCount;
  }

  playSynthesizedBubbleSound();

  // Burst soft sweet confetti
  confetti({
    particleCount: 20,
    spread: 30,
    origin: { y: 0.8 },
    colors: ['#0b76f3', '#ffd31d', '#f32d2d']
  });

  console.log(`Added ${itemName} to pocket cart. Cart count: ${cartCount}`);
}

// --- Synthesized Playful Web Audio API (No files required!) ---
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSynthesizedBubbleSound() {
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
}

function playSynthesizedSwooshSound() {
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
}

// --- Confetti details ---
function triggerConfettiThemeSwitch() {
  const colors = ['#0b76f3', '#ff5c8a', '#ffd31d', '#ffffff'];
  confetti({
    particleCount: 40,
    spread: 60,
    origin: { y: 0.6 },
    colors: colors
  });
}

function triggerConfettiPocketPrize() {
  confetti({
    particleCount: 80,
    spread: 50,
    origin: { y: 0.65 },
    colors: ['#0b76f3', '#ffd31d', '#ffffff']
  });
}
