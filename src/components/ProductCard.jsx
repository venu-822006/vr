import { useState } from "react";
import { Plus, Minus, Leaf, Ban, Heart } from "lucide-react";
import { styles } from "../styles/styles";
import { money, pname } from "../utils/helpers";
import { ProductRating } from "./ReviewSystem";

export default function ProductCard({ p, lang, mode, price, qty, onStep, t, isFavorite, onToggleFavorite, onView, setReviewProduct, style }) {
  const [isHovered, setIsHovered] = useState(false);
  const [favBtnHovered, setFavBtnHovered] = useState(false);
  const [stepBtnHovered, setStepBtnHovered] = useState(null);
  const rotate = (p.id % 5) - 2;
  const unitLabel = mode === "wholesale" ? "kg" : p.unit;
  const outOfStock = p.inStock === false;

  return (
    <div 
      style={{ ...styles.card, ...(isHovered && !outOfStock ? styles.cardHover : {}), ...(outOfStock ? styles.cardOutOfStock : {}), ...style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="product-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ p, mode }));
      }}
    >
      {onToggleFavorite && (
        <button
          style={{...styles.favoriteBtn, ...(favBtnHovered ? styles.favoriteBtnHover : {})}}
          onClick={() => onToggleFavorite(p.id)}
          onMouseEnter={() => setFavBtnHovered(true)}
          onMouseLeave={() => setFavBtnHovered(false)}
          aria-label={t.tabFavorites}
        >
          <Heart size={15} fill={isFavorite ? "var(--tomato)" : "none"} color="var(--tomato)" />
        </button>
      )}
      <div style={styles.cardTop}>
        {p.image ? (
          <img src={p.image} alt={pname(p, lang)} style={{ ...styles.cardImage, cursor: onView ? 'pointer' : 'default' }} onClick={() => onView && onView(p)} />
        ) : (
          <span style={{ ...styles.cardEmoji, cursor: onView ? 'pointer' : 'default' }} onClick={() => onView && onView(p)}>{p.emoji}</span>
        )}
        {outOfStock ? (
          <span style={styles.outOfStockBadge}><Ban size={11} /> {t.outOfStockBadge}</span>
        ) : (p.stockQty <= (p.lowStockThreshold || 10) && p.stockQty > 0) ? (
          <span style={{ ...styles.outOfStockBadge, background: '#fef08a', color: '#854d0e' }}>Only {p.stockQty} left!</span>
        ) : p.organic ? (
          <span style={styles.organicBadge}><Leaf size={11} /> {t.organic}</span>
        ) : null}
      </div>
      <div style={styles.cardBody}>
        <h3 style={styles.cardName}>{pname(p, lang)}</h3>
        <ProductRating avgRating={p.avgRating} reviewCount={p.reviewCount} onClick={() => setReviewProduct && setReviewProduct(p)} />
        <div style={{ ...styles.priceTag, transform: `rotate(${rotate}deg)` }}>
          {money(price)} <span style={styles.perUnit}>/ {unitLabel}</span>
        </div>
        
        {/* Weight / Quantity Clarity Indicators */}
        {unitLabel === "piece" && (
          <div style={{ fontSize: 10, color: 'var(--ink-soft)', marginTop: 4, textAlign: 'center', backgroundColor: 'var(--sage-bg)', padding: '2px 6px', borderRadius: 4 }}>1 piece = ~200g - 300g</div>
        )}
        {unitLabel === "bunch" && (
          <div style={{ fontSize: 10, color: 'var(--ink-soft)', marginTop: 4, textAlign: 'center', backgroundColor: 'var(--sage-bg)', padding: '2px 6px', borderRadius: 4 }}>1 bunch = ~100g</div>
        )}
        {unitLabel === "100g" && (
          <div style={{ fontSize: 10, color: 'var(--ink-soft)', marginTop: 4, textAlign: 'center', backgroundColor: 'var(--sage-bg)', padding: '2px 6px', borderRadius: 4 }}>Pre-packed in 100g</div>
        )}

        {p.updatedAt && (
          <div style={{ fontSize: 10, color: 'var(--ink-soft)', marginTop: 4, textAlign: 'center', opacity: 0.7 }}>
            Prices updated: {new Date(p.updatedAt).toLocaleDateString()}
          </div>
        )}
      </div>
      <div style={styles.cardFooter}>
        {outOfStock ? (
          <button style={{ ...styles.addBtn, ...styles.addBtnDisabled }} disabled>
            <Ban size={14} /> {t.outOfStock}
          </button>
        ) : qty > 0 ? (
          <>
            <div style={styles.lineTotal}>{qty}{unitLabel === "bunch" ? "" : unitLabel} × {money(price)} = <b>{money(price * qty)}</b></div>
            <div style={styles.stepper}>
              <button 
                style={{...styles.stepBtn, ...(stepBtnHovered === 'minus' ? styles.stepBtnHover : {})}}
                onClick={() => onStep(p, mode, -1)}
                onMouseEnter={() => setStepBtnHovered('minus')}
                onMouseLeave={() => setStepBtnHovered(null)}
              >
                <Minus size={14} />
              </button>
              <span style={styles.stepQty}>{qty}{unitLabel === "bunch" ? "" : "kg"}</span>
              <button 
                style={{...styles.stepBtn, ...(stepBtnHovered === 'plus' ? styles.stepBtnHover : {})}}
                onClick={() => onStep(p, mode, 1)}
                onMouseEnter={() => setStepBtnHovered('plus')}
                onMouseLeave={() => setStepBtnHovered(null)}
              >
                <Plus size={14} />
              </button>
            </div>
            {p.unit === "kg" && mode === "retail" && <p style={styles.weightStepHint}>{t.weightStep}</p>}
          </>
        ) : (
          <button style={styles.addBtn} onClick={() => onStep(p, mode, 1)}><Plus size={14} /> {t.add}</button>
        )}
      </div>
    </div>
  );
}
