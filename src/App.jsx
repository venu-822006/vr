import { useState, useEffect, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { io } from "socket.io-client";

import { styles, fontFace, vars, darkVars } from "./styles/styles";
import { PRODUCTS, CUSTOM_ID_START } from "./data/products";
import { TXT } from "./data/translations";
import { SLOTS, RETAIL_KG_STEP, WHOLESALE_KG_STEP, PIECE_STEP } from "./data/constants";
import { money } from "./utils/helpers";
import { storage, getJSON, setJSON } from "./utils/storage";
import { createSession, loadSession, clearSession } from "./utils/session";

import LoginScreen from "./components/LoginScreen";
import OwnerDashboard from "./components/OwnerDashboard";
import Ticker from "./components/Ticker";
import UtilityBar from "./components/UtilityBar";
import Header from "./components/Header";
import CategoryTabs from "./components/CategoryTabs";
import PriceModeToggle from "./components/PriceModeToggle";
import ProductCard from "./components/ProductCard";
import CartDrawer from "./components/CartDrawer";
import Checkout from "./components/Checkout";
import ContactBar from "./components/ContactBar";
import AccountPage from "./components/AccountPage";
import Footer from "./components/Footer";

import dynamic from 'next/dynamic';
const Tracking = dynamic(() => import('./components/Tracking'), { ssr: false });
import SplashScreen from "./components/SplashScreen";
import BottomNav from "./components/BottomNav";
import SkeletonCard from "./components/SkeletonCard";
import Confetti from "./components/Confetti";
import DarkModeToggle from "./components/DarkModeToggle";
import SearchSuggestions from "./components/SearchSuggestions";
import FrequentlyBought from "./components/FrequentlyBought";
import ImageLightbox from "./components/ImageLightbox";
import { ProductRating, ReviewModal } from "./components/ReviewSystem";
import {
  getCustomerRecord, updateCustomerName, addAddress, removeAddress,
  toggleFavorite, migrateCustomerRecord,
} from "./utils/customerProfile";

const PRICES_KEY = "vr-veg-prices";
const PRICES_UPDATED_KEY = "vr-veg-prices-updated";
const CUSTOM_PRODUCTS_KEY = "vr-veg-custom-products";
const ORDERS_KEY = "vr-veg-orders";

export default function App({ initialProducts = [] }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined' && navigator.language && navigator.language.startsWith('te')) {
      return 'te';
    }
    return 'en';
  });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vr-dark-mode') === 'true';
    }
    return false;
  });
  const [showSplash, setShowSplash] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [screen, setScreen] = useState("login"); // login | app | ownerDashboard
  const [customer, setCustomer] = useState(null);
  const [customerRecord, setCustomerRecord] = useState({ name: "", addresses: [], favorites: [] });
  const [town, setTown] = useState("Tirupati");
  const [frequentItems, setFrequentItems] = useState([]);

  useEffect(() => {
    if (customer?.phone) {
      fetch(`/api/orders/frequent/${customer.phone}`)
        .then(res => res.ok ? res.json() : [])
        .then(setFrequentItems)
        .catch(() => setFrequentItems([]));
    } else {
      setFrequentItems([]);
    }
  }, [customer?.phone]);

  // Owner-editable state: live prices/stock overrides + owner-added vegetables.
  const [livePrices, setLivePrices] = useState({}); // { [id]: { retail, wholesale, inStock } }
  const [pricesUpdatedAt, setPricesUpdatedAt] = useState(null);
  const [customProducts, setCustomProducts] = useState([]);

  const [view, setView] = useState("catalog"); // catalog | checkout | tracking
  const [category, setCategory] = useState("All");
  const [priceMode, setPriceMode] = useState("retail"); // retail | wholesale
  const [query, setQuery] = useState("");
  const [recentViews, setRecentViews] = useState([]);
  const [cart, setCart] = useState({}); // "id_mode" -> qty
  const [cartOpen, setCartOpen] = useState(false);
  const [area, setArea] = useState("");
  const [slot, setSlot] = useState(SLOTS[0]);
  const [payment, setPayment] = useState("cod");
  const [orderId, setOrderId] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastOrderStatus, setLastOrderStatus] = useState(null);
  const socketRef = useRef(null);
  const tokenRef = useRef(null);

  const t = TXT[lang];

  // Dark mode persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vr-dark-mode', darkMode);
    }
  }, [darkMode]);

  const activeVars = darkMode ? darkVars : vars;

  const [allProducts, setAllProducts] = useState(initialProducts);
  const [loadingProducts, setLoadingProducts] = useState(initialProducts.length === 0);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        const safeData = data.map(p => {
          if (p.image && typeof p.image === 'string' && p.image.includes('loremflickr')) {
            return { ...p, image: `https://placehold.co/400x300?text=${encodeURIComponent(p.name)}` };
          }
          return p;
        });
        setAllProducts(safeData);
        setLoadingProducts(false);
        return;
      }
    } catch (err) {
      console.warn("Backend offline. Loading offline products catalog.");
    } 
    
    // Fallback if backend is down
    const defaultProducts = PRODUCTS.map(p => ({
      ...p,
      image: `https://placehold.co/400x300?text=${encodeURIComponent(p.name)}`
    }));
    setAllProducts(defaultProducts);
    setLoadingProducts(false);
  };

  // ---------------------------------------------------------------------
  // Load products from backend on first render
  // ---------------------------------------------------------------------
  useEffect(() => {
    loadProducts();
    (async () => {
      const session = await loadSession();
      if (session) {
        setCustomer({ name: session.name, phone: session.phone });
        setScreen("app");
      }
    })();

    // Socket.IO connection
    const socket = io({ 
      path: '/socket.io', 
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      reconnectionDelay: 2000
    });
    socketRef.current = socket;
    socket.on('connect', () => console.log('Socket connected:', socket.id));
    socket.on('connect_error', () => { /* Suppress error to avoid console spam */ });
    return () => socket.disconnect();
  }, []);

  // Auto-refresh JWT every 12 minutes (token expires in 15m)
  useEffect(() => {
    const refreshToken = async () => {
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        if (res.ok) {
          const { token } = await res.json();
          tokenRef.current = token;
          if (customer) setCustomer(prev => ({ ...prev, token }));
        }
      } catch (e) { /* silent */ }
    };
    const int = setInterval(refreshToken, 12 * 60 * 1000);
    return () => clearInterval(int);
  }, []);

  // Toast helper
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Poll active order for status changes and notify customer
  useEffect(() => {
    if (!orderId || view !== 'tracking') return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status && data.status !== lastOrderStatus) {
          setLastOrderStatus(data.status);
          const labels = { processing: '📦 Your order is being packed!', out_for_delivery: '🚗 Your order is on the way!', delivered: '✅ Order delivered!', cancelled: '❌ Order was cancelled.' };
          if (labels[data.status]) showToast(labels[data.status], data.status === 'cancelled' ? 'error' : 'success');
        }
      } catch (e) { /* silent */ }
    }, 5000);
    return () => clearInterval(poll);
  }, [orderId, view, lastOrderStatus]);

  useEffect(() => {
    if (!customer?.phone) return;
    const loadCart = async () => {
      try {
        const c = await storage.get("vr-veg-cart", true);
        if (c && c.value) {
          let parsed = JSON.parse(c.value);
          parsed = parsed.map(item => {
            if (item.image && typeof item.image === 'string' && item.image.includes('loremflickr')) {
              return { ...item, image: `https://placehold.co/400x300?text=${encodeURIComponent(item.name)}` };
            }
            return item;
          });
          setCart(parsed);
        }
      } catch (e) {
        setCart([]);
      }
    };
    loadCart();
    
    (async () => {
      const record = await getCustomerRecord(customer.phone, customer.name);
      setCustomerRecord(record);
    })();
  }, [customer?.phone]);

  useEffect(() => {
    try {
      const v = localStorage.getItem("vr-veg-recent");
      if (v) setRecentViews(JSON.parse(v));
    } catch (e) {}
  }, []);

  const handleViewProduct = (p) => {
    setLightboxSrc(getImage(p));
    setRecentViews(prev => {
      const next = [p.id, ...prev.filter(id => id !== p.id)].slice(0, 8);
      localStorage.setItem("vr-veg-recent", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (view !== "tracking") return;
    setStageIndex(0);
    const t1 = setTimeout(() => setStageIndex(1), 1800);
    const t2 = setTimeout(() => setStageIndex(2), 3600);
    const t3 = setTimeout(() => setStageIndex(3), 5600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [view]);

  // ---------------------------------------------------------------------
  // Price / stock helpers
  // ---------------------------------------------------------------------
  const getPrice = (product, mode) => {
    if (mode === "wholesale" && product.bulkAvailable) return product.wholesalePrice;
    return product.price;
  };

  const isInStock = (product) => {
    return product.inStock !== false;
  };

  const getImage = (product) => {
    const stored = livePrices[product.id];
    let finalImg = product.image;

    if (stored && typeof stored.image === 'string' && stored.image.trim() !== "" && !stored.image.includes('loremflickr')) {
      finalImg = stored.image;
    }

    if (finalImg && typeof finalImg === 'string' && finalImg.includes('loremflickr')) {
      return `https://placehold.co/400x300?text=${encodeURIComponent(product.name)}`;
    }

    return finalImg || null;
  };

  const savePrices = async (draft) => {
    setLivePrices(draft);
    await setJSON(PRICES_KEY, draft, true);
    const now = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    setPricesUpdatedAt(now);
    await storage.set(PRICES_UPDATED_KEY, now, true);
  };

  const addCustomProduct = async (partial) => {
    const nextId = Math.max(CUSTOM_ID_START - 1, ...customProducts.map((p) => p.id)) + 1;
    const product = { id: nextId, ...partial };
    const next = [...customProducts, product];
    setCustomProducts(next);
    await setJSON(CUSTOM_PRODUCTS_KEY, next, true);
  };

  const removeCustomProduct = async (id) => {
    const next = customProducts.filter((p) => p.id !== id);
    setCustomProducts(next);
    await setJSON(CUSTOM_PRODUCTS_KEY, next, true);
    // Also drop any cart entries for the removed item.
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[`${id}_retail`];
      delete copy[`${id}_wholesale`];
      return copy;
    });
  };

  // ---------------------------------------------------------------------
  // Catalogue filtering + cart derivations
  // ---------------------------------------------------------------------
  const visibleProducts = allProducts.filter(
    (p) =>
      (priceMode === "retail" || p.bulkAvailable) &&
      (category === "All" || p.cat === category) &&
      (lang === "te" ? p.te : p.name).toLowerCase().includes(query.toLowerCase())
  );

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([key, qty]) => {
      const [idStr, mode] = key.split("_");
      const product = allProducts.find((p) => p.id === Number(idStr));
      return product ? { key, product, mode, qty, price: getPrice(product, mode) } : null;
    })
    .filter(Boolean);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = 0; // Delivery is free, but minimum order is 150
  const total = subtotal + deliveryFee;
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  // Quantity stepper: retail vegetables move in quarter-kilo steps, bulk
  // orders move in 5kg jumps, and piece/bunch/100g items step by whole units.
  const step = (product, mode, delta) => {
    if (delta > 0 && mode === "wholesale") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
    const key = `${product.id}_${mode}`;
    const inc = mode === "wholesale" ? WHOLESALE_KG_STEP : product.unit === "kg" ? RETAIL_KG_STEP : PIECE_STEP;
    setCart((prev) => {
      const next = Math.max(0, (prev[key] || 0) + delta * inc);
      return { ...prev, [key]: Math.round(next * 100) / 100 };
    });
  };

  // ---------------------------------------------------------------------
  // Order placement
  // ---------------------------------------------------------------------
  const placeOrder = async ({ checkoutName, checkoutPhone, discount = 0, couponId = null, finalTotal, substitutionPref } = {}) => {
    setPlacingOrder(true);
    const newOrderId = "VR" + Math.floor(100000 + Math.random() * 900000);
    const computedTotal = finalTotal !== undefined ? finalTotal : total;
    
    // Automatically set the customer in state if they checked out as a guest
    if (!customer?.phone && checkoutPhone && checkoutName) {
      setCustomer({ phone: checkoutPhone, name: checkoutName });
      createSession({ phone: checkoutPhone, name: checkoutName }).catch(console.error);
    }

    const order = {
      id: newOrderId,
      customerName: checkoutName || customer?.name || "",
      phone: checkoutPhone || customer?.phone || "",
      town, area, slot, payment,
      items: cartItems.map(i => ({ name: i.product.name, te: i.product.te, qty: i.qty, mode: i.mode, price: i.price })),
      subtotal, deliveryFee,
      total: computedTotal,
      placedAt: new Date().toISOString(),
      couponId,
      discount,
      substitutionPref: substitutionPref || "substitute"
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (!response.ok) throw new Error('Failed to place order via API');
    } catch (e) {
      console.error(e);
      const list = await getJSON(ORDERS_KEY, true, []);
      list.push(order);
      await setJSON(ORDERS_KEY, list, true);
    }

    setOrderId(newOrderId);
    setLastOrderStatus('pending');
    setView("tracking");
    setCartOpen(false);
    setPlacingOrder(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  useEffect(() => {
    if (customer?.phone) {
      getCustomerRecord(customer.phone, customer.name, customer.token).then(setCustomerRecord);
    }
  }, [customer]);

  const handleUpdateName = async (newName) => {
    setCustomer((prev) => ({ ...prev, name: newName }));
    const record = await updateCustomerName(customer.phone, newName, customer?.token);
    setCustomerRecord(record);
    await createSession({ name: newName, phone: customer.phone });
  };

  const handleChangePhone = async (newPhone) => {
    const record = await migrateCustomerRecord(customer.phone, newPhone);
    setCustomer((prev) => ({ ...prev, phone: newPhone }));
    setCustomerRecord(record);
    await createSession({ name: customer.name, phone: newPhone });
  };

  const handleAddAddress = async (address) => {
    const record = await addAddress(customer.phone, address, customer?.token);
    setCustomerRecord(record);
  };

  const handleRemoveAddress = async (addressId) => {
    const record = await removeAddress(customer.phone, addressId, customer?.token);
    setCustomerRecord(record);
  };

  const handleToggleFavorite = async (productId) => {
    const record = await toggleFavorite(customer.phone, productId);
    setCustomerRecord(record);
  };

  // Re-add every item from a past order into the current cart, matching by
  // product name since ids can shift for owner-added vegetables over time.
  const handleReorder = (order) => {
    setCart((prev) => {
      const next = { ...prev };
      order.items.forEach((item) => {
        const product = allProducts.find((p) => p.name === item.name);
        if (!product) return;
        const key = `${product.id}_${item.mode}`;
        next[key] = Math.round(((next[key] || 0) + item.qty) * 100) / 100;
      });
      return next;
    });
    setView("catalog");
    setCartOpen(true);
  };

  const resetToShopping = () => {
    setCart({});
    setArea("");
    setView("catalog");
  };

  const handleCustomerLogin = async (details, remember = true) => {
    setCustomer(details);
    await createSession(details, remember);
    setScreen("app");
  };

  const handleOwnerLogin = () => setScreen("ownerDashboard");

  const handleLogout = async () => {
    await clearSession();
    setCustomer(null);
    setCustomerRecord({ name: "", addresses: [], favorites: [] });
    setScreen("login");
    resetToShopping();
    setCart({});
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div style={{ ...styles.appRoot, ...activeVars }}>
      <style>{fontFace}</style>
      <Confetti show={showConfetti} />
      {lightboxSrc && <ImageLightbox src={lightboxSrc} alt="Product" onClose={() => setLightboxSrc(null)} />}
      {reviewProduct && <ReviewModal productId={reviewProduct.id} productName={reviewProduct.name} token={customer?.token} onClose={() => setReviewProduct(null)} />}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, padding: '12px 20px', borderRadius: 10, fontWeight: 600,
          fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', maxWidth: '90vw',
          backgroundColor: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#b91c1c' : '#15803d',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          animation: 'slideDown 0.3s ease'
        }}>
          {toast.msg}
        </div>
      )}

      {screen === "login" && (
        <LoginScreen lang={lang} setLang={setLang} onCustomerLogin={handleCustomerLogin} onOwnerLogin={handleOwnerLogin} t={t} />
      )}

      {screen === "ownerDashboard" && (
        <OwnerDashboard
          lang={lang}
          setLang={setLang}
          t={t}
          products={allProducts}
          getPrice={getPrice}
          onLogout={handleLogout}
          refreshProducts={loadProducts}
        />
      )}

      {screen === "app" && (
        <div style={styles.app}>
          <Ticker lang={lang} products={allProducts} />
          <UtilityBar lang={lang} setLang={setLang} town={town} setTown={setTown} t={t} />
          <Header
            cartCount={cartCount}
            onCartClick={() => setView("checkout")}
            onAccountClick={() => setView("account")}
            query={query}
            setQuery={setQuery}
            showBack={view !== "catalog"}
            onBack={() => setView("catalog")}
            showSearch={view === "catalog"}
            t={t}
          />

          {view === "catalog" && (
            <>
              <CategoryTabs category={category} setCategory={setCategory} lang={lang} />
              <PriceModeToggle priceMode={priceMode} setPriceMode={setPriceMode} t={t} />

              {frequentItems.length > 0 && query === "" && category === "All" && (
                <div style={{ padding: '0 16px', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, color: 'var(--ink-main)', marginBottom: 12, fontWeight: 700 }}>Reorder your usual</h3>
                  <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
                    {frequentItems.map(f => allProducts.find(p => p.name === f.name)).filter(Boolean).map((p, idx) => (
                      <div key={`freq-${p.id}-${idx}`} style={{ flexShrink: 0, width: 140 }}>
                        <ProductCard
                          p={{ ...p, inStock: isInStock(p), image: getImage(p) }}
                          lang={lang}
                          mode={priceMode}
                          price={getPrice(p, priceMode)}
                          qty={cart[`${p.id}_${priceMode}`] || 0}
                          onStep={step}
                          t={t}
                          onView={handleViewProduct}
                          setReviewProduct={setReviewProduct}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recentViews.length > 0 && query === "" && category === "All" && (
                <div style={{ padding: '0 16px', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, color: 'var(--ink-main)', marginBottom: 12, fontWeight: 700 }}>Recently Viewed</h3>
                  <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
                    {recentViews.map(id => allProducts.find(p => p.id === id)).filter(Boolean).map(p => (
                      <div key={`recent-${p.id}`} style={{ flexShrink: 0, width: 140 }}>
                        <ProductCard
                          p={{ ...p, inStock: isInStock(p), image: getImage(p) }}
                          lang={lang}
                          mode={priceMode}
                          price={getPrice(p, priceMode)}
                          qty={cart[`${p.id}_${priceMode}`] || 0}
                          onStep={step}
                          t={t}
                          onView={handleViewProduct}
                          setReviewProduct={setReviewProduct}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Frequently Bought Together */}
              {cartItems.length > 0 && (
                <FrequentlyBought
                  cartItems={cartItems}
                  allProducts={allProducts.map(p => ({ ...p, inStock: isInStock(p) }))}
                  lang={lang}
                  onAdd={(p) => step(p, priceMode, 1)}
                  t={t}
                />
              )}

              <div style={styles.grid} className="responsive-grid">
                {loadingProducts ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                ) : visibleProducts.length > 0 ? (
                  visibleProducts.map((p, index) => (
                    <ProductCard
                      key={p.id}
                      p={{ ...p, inStock: isInStock(p), image: getImage(p) }}
                      lang={lang}
                      mode={priceMode}
                      price={getPrice(p, priceMode)}
                      qty={cart[`${p.id}_${priceMode}`] || 0}
                      onStep={step}
                      t={t}
                      isFavorite={(customerRecord.favorites || []).includes(p.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onView={handleViewProduct}
                      setReviewProduct={setReviewProduct}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    />
                  ))
                ) : (
                  <div style={styles.emptyState}>
                    <p>{t.noMatch(query)}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {view === "account" && (
            <AccountPage
              t={t} lang={lang}
              customer={customer}
              customerRecord={customerRecord}
              allProducts={allProducts}
              onUpdateName={handleUpdateName}
              onChangePhone={handleChangePhone}
              onAddAddress={handleAddAddress}
              onRemoveAddress={handleRemoveAddress}
              onToggleFavorite={handleToggleFavorite}
              onReorder={handleReorder}
              onLogout={handleLogout}
            />
          )}

          {view === "checkout" && (
            <Checkout
              t={t} lang={lang}
              customer={customer}
              town={town} setTown={setTown}
              area={area} setArea={setArea}
              slot={slot} setSlot={setSlot}
              payment={payment} setPayment={setPayment}
              cartItems={cartItems}
              subtotal={subtotal} deliveryFee={deliveryFee} total={total}
              onPlaceOrder={placeOrder}
              placingOrder={placingOrder}
              onCancel={() => setView("catalog")}
              savedAddresses={customerRecord.addresses}
              onSaveAddress={handleAddAddress}
            />
          )}

          {view === "tracking" && (
            <Tracking
              t={t} lang={lang}
              orderId={orderId}
              stageIndex={stageIndex}
              area={area} town={town} slot={slot} total={total}
              cartItems={cartItems}
              onNewOrder={resetToShopping}
              socket={socketRef.current}
            />
          )}

          <CartDrawer
            t={t}
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            items={cartItems}
            lang={lang}
            onStep={step}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            onCheckout={() => { setCartOpen(false); setView("checkout"); }}
            allProducts={allProducts}
          />

          {!cartOpen && cartCount > 0 && view === "catalog" && (
            <button 
              className="floating-cart-responsive"
              style={{ ...styles.floatingCart, transition: 'transform 0.2s ease' }} 
              onClick={() => setView("checkout")}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.transform = 'scale(1.1)'; }}
              onDragLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.transform = 'scale(1)';
                const data = e.dataTransfer.getData("application/json");
                if (data) {
                  const { p, mode } = JSON.parse(data);
                  step(p, mode, 1);
                  showToast(`${p.name} added to cart via drag-and-drop!`, 'success');
                }
              }}
            >
              <ShoppingCart size={18} />
              <span>{cartCount} {t.inBasket}</span>
              <span style={styles.floatingCartTotal}>{money(subtotal)}</span>
            </button>
          )}

          <ContactBar t={t} />
          <Footer t={t} onAccountClick={() => setView("account")} />

          {/* Bottom Navigation Bar */}
          <BottomNav
            activeView={view}
            onNavigate={(v) => setView(v)}
            cartCount={cartCount}
            t={t}
          />

          {/* Dark Mode Toggle (floating) */}
          <div style={{ position: 'fixed', top: 80, right: 12, zIndex: 50 }}>
            <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>
        </div>
      )}
    </div>
  );
}
