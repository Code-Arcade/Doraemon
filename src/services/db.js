// Local Storage Database Service for Pocket Sweets
// Fully offline, persistent, browser-native backend

const STORAGE_KEYS = {
  PRODUCTS: 'dora_products',
  ORDERS: 'dora_orders',
  CUSTOMERS: 'dora_customers'
};

// Default Products data to seed localStorage on first launch
const defaultProducts = [
  {
    id: "dorayaki",
    name: "Red-Bean Dorayaki",
    price: 220.00,
    desc: "Doraemon's favorite. House-made sweet red bean paste layered inside fluffy honey pancakes.",
    img: "/assets/images/doraemon_desserts.png"
  },
  {
    id: "memory-bread",
    name: "Memory French Toast",
    price: 350.00,
    desc: "Sweet caramelized French brioche slice embossed with sweet edible numbers.",
    img: "/assets/images/memory_french_toast.jpg"
  },
  {
    id: "anywhere-door-tart",
    name: "Anywhere Door Tart",
    price: 450.00,
    desc: "Molten dark chocolate tart topped with fresh raspberries and custom strawberry glazes.",
    img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80"
  },
  {
    id: "copter-cupcake",
    name: "Bamboo Cloud Mochi",
    price: 280.00,
    desc: "Sponge velvet cupcake topped with light cloud vanilla mochi and miniature prop details.",
    img: "/assets/images/bamboo_cloud_mochi.jpg"
  }
];

// Local Storage Helper Utilities
function getStoredProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
      return [...defaultProducts];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
      return [...defaultProducts];
    }
    // Migrate: if any stored product still uses emoji (no img), update from defaultProducts
    let migrated = false;
    const updated = parsed.map(p => {
      if (!p.img) {
        const def = defaultProducts.find(d => d.id === p.id);
        if (def && def.img) { migrated = true; return { ...p, img: def.img, emoji: undefined, colorBg: undefined }; }
      }
      return p;
    });
    if (migrated) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      return updated;
    }
    return parsed;
  } catch (e) {
    console.error("Error reading products from localStorage:", e);
    return [...defaultProducts];
  }
}

function saveStoredProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error("Error saving products to localStorage:", e);
  }
}

function getStoredOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading orders from localStorage:", e);
    return [];
  }
}

function saveStoredOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error("Error saving orders to localStorage:", e);
  }
}

function getStoredCustomers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Support previous object-hash format { [mobile]: address } or array format
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.entries(parsed).map(([mobile, addr]) => ({
        mobile,
        address: typeof addr === 'string' ? addr : (addr?.address || ''),
        created_at: addr?.created_at || new Date().toISOString()
      }));
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error reading customers from localStorage:", e);
    return [];
  }
}

function saveStoredCustomers(customers) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (e) {
    console.error("Error saving customers to localStorage:", e);
  }
}

// Database Service Interface (100% Local Storage Powered)
export const db = {
  isLocalStorageMode: () => true,

  // --- PRODUCTS CRUD ---
  getProducts: async () => {
    return getStoredProducts();
  },

  createProduct: async (product) => {
    const products = getStoredProducts();
    const newProd = {
      id: Math.random().toString(36).substring(2, 11),
      ...product,
      price: parseFloat(product.price) || 0
    };
    products.push(newProd);
    saveStoredProducts(products);
    return newProd;
  },

  updateProduct: async (product) => {
    const products = getStoredProducts();
    const updatedProd = {
      ...product,
      price: parseFloat(product.price) || 0
    };
    const idx = products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      products[idx] = updatedProd;
      saveStoredProducts(products);
    }
    return updatedProd;
  },

  deleteProduct: async (id) => {
    const products = getStoredProducts();
    const filtered = products.filter(p => p.id !== id);
    saveStoredProducts(filtered);
    return true;
  },

  // --- ORDERS READ/WRITE ---
  getOrders: async () => {
    const orders = getStoredOrders();
    return orders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  getCustomerOrders: async (mobile) => {
    const cleanMobile = (mobile || '').trim();
    if (!cleanMobile) return [];
    const orders = getStoredOrders();
    return orders
      .filter(o => (o.mobile || '').trim() === cleanMobile)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  createOrder: async (order) => {
    const newOrder = {
      id: Math.random().toString(36).substring(2, 11),
      items: typeof order.items === 'string' ? order.items : JSON.stringify(order.items),
      total: parseFloat(order.total) || 0,
      mobile: order.mobile || '',
      address: order.address || '',
      status: order.status || 'pending',
      transport: parseFloat(order.transport || 0),
      discount: parseFloat(order.discount || 0),
      coupon_discount: parseFloat(order.coupon_discount || 0),
      created_at: new Date().toISOString()
    };

    const orders = getStoredOrders();
    orders.unshift(newOrder);
    saveStoredOrders(orders);
    return newOrder;
  },

  updateOrder: async (order) => {
    const orders = getStoredOrders();
    const updatedOrder = {
      id: order.id,
      items: typeof order.items === 'string' ? order.items : JSON.stringify(order.items),
      total: parseFloat(order.total) || 0,
      mobile: order.mobile,
      address: order.address,
      status: order.status,
      transport: parseFloat(order.transport || 0),
      discount: parseFloat(order.discount || 0),
      coupon_discount: parseFloat(order.coupon_discount || 0),
      created_at: order.created_at || new Date().toISOString()
    };

    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      orders[idx] = {
        ...orders[idx],
        ...updatedOrder
      };
      saveStoredOrders(orders);
    }
    return updatedOrder;
  },

  deleteOrder: async (id) => {
    const orders = getStoredOrders();
    const filtered = orders.filter(o => o.id !== id);
    saveStoredOrders(filtered);
    return true;
  },

  // --- CUSTOMERS / USER ACCOUNTS ---
  getCustomerAddress: async (mobile) => {
    const cleanMobile = (mobile || '').trim();
    if (!cleanMobile) return null;
    const customers = getStoredCustomers();
    const found = customers.find(c => c.mobile === cleanMobile);
    return found ? found.address : null;
  },

  upsertCustomer: async (mobile, address) => {
    const cleanMobile = (mobile || '').trim();
    const cleanAddress = (address || '').trim();
    if (!cleanMobile || !cleanAddress) return null;

    const customers = getStoredCustomers();
    const existingIdx = customers.findIndex(c => c.mobile === cleanMobile);
    const payload = {
      mobile: cleanMobile,
      address: cleanAddress,
      created_at: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      customers[existingIdx] = {
        ...customers[existingIdx],
        address: cleanAddress
      };
    } else {
      customers.push(payload);
    }

    saveStoredCustomers(customers);
    return payload;
  },

  getCustomers: async () => {
    const customers = getStoredCustomers();
    return customers.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  deleteCustomer: async (mobile) => {
    const cleanMobile = (mobile || '').trim();
    const customers = getStoredCustomers();
    const filtered = customers.filter(c => c.mobile !== cleanMobile);
    saveStoredCustomers(filtered);
    return true;
  },

  // --- PRODUCT IMAGE CONVERTER / STORAGE ---
  uploadProductImage: async (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = (err) => {
        console.error("Local file reader error:", err);
        reject(err);
      };
      reader.readAsDataURL(file);
    });
  }
};
