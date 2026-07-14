// Frequently Bought Together - suggests products commonly bought with current cart items
const COMBOS = {
  "Tomato": ["Onion", "Green Chillies", "Coriander Leaves"],
  "Onion": ["Tomato", "Potato", "Green Chillies"],
  "Potato": ["Onion", "Tomato", "Green Beans"],
  "Green Chillies": ["Tomato", "Onion", "Curry Leaves"],
  "Brinjal": ["Onion", "Tomato", "Green Chillies"],
  "Okra": ["Onion", "Tomato", "Green Chillies"],
  "Carrot": ["Beetroot", "Green Beans", "Cabbage"],
  "Cabbage": ["Carrot", "Green Beans", "Cauliflower"],
  "Cauliflower": ["Potato", "Carrot", "Green Beans"],
  "Beetroot": ["Carrot", "Onion", "Potato"],
  "Ridge Gourd": ["Onion", "Tomato", "Green Chillies"],
  "Bottle Gourd": ["Onion", "Tomato", "Green Chillies"],
  "Bitter Gourd": ["Onion", "Tomato", "Green Chillies"],
  "Drumstick": ["Onion", "Tomato", "Tamarind"],
  "Radish": ["Onion", "Tomato", "Green Chillies"],
  "Cucumber": ["Tomato", "Onion", "Carrot"],
  "Green Beans": ["Carrot", "Potato", "Cauliflower"],
};

export default function FrequentlyBought({ cartItems, allProducts, lang, onAdd, t }) {
  // Get product names in cart
  const cartNames = cartItems.map(i => i.product.name);
  
  // Find suggestions
  const suggestedNames = new Set();
  cartNames.forEach(name => {
    const combos = COMBOS[name] || [];
    combos.forEach(c => {
      if (!cartNames.includes(c)) suggestedNames.add(c);
    });
  });
  
  // Map to actual products
  const suggestions = allProducts
    .filter(p => suggestedNames.has(p.name) && p.inStock !== false)
    .slice(0, 4);

  if (suggestions.length === 0) return null;

  return (
    <div style={{
      margin: "16px 20px", padding: 16, background: "var(--paper)",
      borderRadius: 14, border: "1px solid var(--sage-line)"
    }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
        🛒 Frequently Bought Together
      </h3>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
        {suggestions.map(p => (
          <button
            key={p.id}
            onClick={() => onAdd(p)}
            style={{
              flex: "0 0 auto", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6, padding: "12px 16px",
              background: "var(--sage-bg)", border: "1px solid var(--sage-line)",
              borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
              minWidth: 90
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.borderColor = "var(--leaf-mid)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "var(--sage-line)"; }}
          >
            <span style={{ fontSize: 28 }}>{p.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", textAlign: "center" }}>
              {lang === "te" ? p.te : p.name}
            </span>
            <span style={{ fontSize: 11, color: "var(--leaf-deep)", fontWeight: 700 }}>
              + ₹{p.price}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
