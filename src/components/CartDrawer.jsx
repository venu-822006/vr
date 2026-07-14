import { X, Plus, Minus } from "lucide-react";
import { styles } from "../styles/styles";
import { money, pname } from "../utils/helpers";
import Row from "./Row";

export default function CartDrawer({ t, open, onClose, items, lang, onStep, subtotal, deliveryFee, total, onCheckout, allProducts }) {
  return (
    <>
      {open && <div style={styles.overlay} onClick={onClose} />}
      <aside style={{ ...styles.drawer, transform: open ? "translateX(0)" : "translateX(105%)" }}>
        <div style={styles.drawerHeader}>
          <h3 style={{ margin: 0 }}>{t.basket}</h3>
          <button style={styles.iconBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={styles.drawerList}>
          {items.length === 0 && <p style={{ color: "var(--ink-soft)", padding: "12px 4px" }}>{t.emptyBasket}</p>}
          {items.map((i) => (
            <div key={i.key} style={styles.drawerItem}>
              <span style={{ fontSize: 22 }}>{i.product.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{pname(i.product, lang)} {i.mode === "wholesale" && <span style={styles.wholesaleTag}>{t.wholesale}</span>}</div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{money(i.price)} / kg</div>
              </div>
              <div style={styles.stepper}>
                <button style={styles.stepBtn} onClick={() => onStep(i.product, i.mode, -1)}><Minus size={12} /></button>
                <span style={styles.stepQty}>{i.qty}</span>
                <button style={styles.stepBtn} onClick={() => onStep(i.product, i.mode, 1)}><Plus size={12} /></button>
              </div>
            </div>
          ))}

          {allProducts && allProducts.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--leaf-deep)", marginBottom: 12 }}>You might also like</p>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none" }}>
                {allProducts
                  .filter(p => !items.find(i => i.product.id === p.id) && p.inStock)
                  .slice(0, 5)
                  .map(p => (
                    <div key={p.id} style={{ minWidth: 100, border: "1px solid var(--sage-line)", borderRadius: 12, padding: 8, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: 24, marginBottom: 4 }}>{p.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>{pname(p, lang)}</span>
                      <span style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 6 }}>{money(p.price)}/kg</span>
                      <button 
                        style={{ ...styles.secondaryBtnSmall, width: "100%", padding: "4px 0", fontSize: 11 }}
                        onClick={() => onStep(p, "retail", 1)}
                      >
                        <Plus size={12} style={{ display: "inline", verticalAlign: "middle" }} /> Add
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div style={styles.drawerFooter}>
            <Row label={t.subtotal} value={money(subtotal)} />
            <Row label={t.delivery} value={deliveryFee === 0 ? t.free : money(deliveryFee)} />
            <Row label={t.total} value={money(total)} bold />
            <button 
              style={{ ...styles.primaryBtn, ...(subtotal < 150 ? styles.addBtnDisabled : {}) }} 
              disabled={subtotal < 150} 
              onClick={onCheckout}
            >
              {t.checkoutBtn}
            </button>
            {subtotal < 150 && (
              <div style={{ color: "var(--tomato)", fontSize: 11, textAlign: "center", marginTop: 6, fontWeight: 600 }}>
                Minimum order: {money(150)}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
