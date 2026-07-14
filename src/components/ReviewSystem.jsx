import { useState } from "react";
import { Star } from "lucide-react";
import { getJSON, setJSON } from "../utils/storage";

const REVIEWS_KEY = "vr-veg-reviews";

// Demo reviews for popular items
const DEMO_REVIEWS = {
  1: [{ name: "Lakshmi", rating: 5, text: "Very fresh onions! 👌" }, { name: "Ravi", rating: 4, text: "Good quality" }],
  2: [{ name: "Priya", rating: 5, text: "Best potatoes in town" }],
  3: [{ name: "Suresh", rating: 5, text: "Fresh and red tomatoes 🍅" }, { name: "Anitha", rating: 4, text: "Nice quality" }],
  4: [{ name: "Kumar", rating: 4, text: "Good brinjal, very fresh" }],
  5: [{ name: "Meena", rating: 5, text: "Perfect okra, tender ones" }],
  7: [{ name: "Venkat", rating: 5, text: "Crunchy carrots!" }],
};

function StarRating({ rating, size = 14, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          fill={(hover || rating) >= i ? "#fbbf24" : "none"}
          color={(hover || rating) >= i ? "#fbbf24" : "#d1d5db"}
          style={{ cursor: interactive ? "pointer" : "default", transition: "all 0.15s" }}
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
        />
      ))}
    </div>
  );
}

export function ProductRating({ productId }) {
  const reviews = DEMO_REVIEWS[productId] || [];
  if (reviews.length === 0) return null;
  
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
      <StarRating rating={Math.round(avg)} size={11} />
      <span style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 500 }}>
        ({reviews.length})
      </span>
    </div>
  );
}

export function ReviewModal({ productId, productName, onClose }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const reviews = DEMO_REVIEWS[productId] || [];

  const submit = () => {
    if (rating === 0) return;
    // In production, this would POST to the backend
    setSubmitted(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9990, animation: "fadeIn 0.2s ease"
    }} onClick={onClose}>
      <div style={{
        background: "var(--paper)", borderRadius: 20, padding: 24,
        maxWidth: 360, width: "90%", boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        animation: "scaleIn 0.3s ease"
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 4px", fontSize: 18, color: "var(--ink)" }}>
          Rate {productName}
        </h3>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <p style={{ fontWeight: 600, color: "var(--leaf-deep)" }}>Thanks for your review!</p>
          </div>
        ) : (
          <>
            <div style={{ margin: "16px 0", textAlign: "center" }}>
              <StarRating rating={rating} size={32} interactive onChange={setRating} />
            </div>
            <textarea
              placeholder="Share your experience... (optional)"
              value={text}
              onChange={e => setText(e.target.value)}
              style={{
                width: "100%", padding: 12, borderRadius: 10, border: "1px solid var(--sage-line)",
                fontSize: 14, resize: "none", height: 80, background: "var(--sage-bg)",
                color: "var(--ink)"
              }}
            />
            <button
              disabled={rating === 0}
              onClick={submit}
              style={{
                width: "100%", padding: 12, marginTop: 12, borderRadius: 10,
                border: "none", background: rating > 0 ? "var(--leaf-deep)" : "#ccc",
                color: "#fff", fontWeight: 700, fontSize: 15, cursor: rating > 0 ? "pointer" : "default"
              }}
            >
              Submit Review
            </button>

            {reviews.length > 0 && (
              <div style={{ marginTop: 16, borderTop: "1px solid var(--sage-line)", paddingTop: 12 }}>
                <h4 style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 8px" }}>Recent Reviews</h4>
                {reviews.map((r, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</span>
                      <StarRating rating={r.rating} size={10} />
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--ink-soft)" }}>{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
