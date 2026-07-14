import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";

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

export function ProductRating({ avgRating, reviewCount, onClick }) {
  if (!reviewCount || reviewCount === 0) return null;
  
  return (
    <div 
      style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <StarRating rating={Math.round(avgRating)} size={11} />
      <span style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 500 }}>
        ({reviewCount})
      </span>
    </div>
  );
}

export function ReviewModal({ productId, productName, token, onClose }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`)
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [productId]);

  const submit = async () => {
    if (rating === 0) return;
    if (!token) {
      setError("You must be logged in to leave a review.");
      return;
    }
    
    setError("");
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ rating, comment: text })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }
      
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        // optionally trigger a reload of products to update the avg rating
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
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
        animation: "scaleIn 0.3s ease", maxHeight: "80vh", display: "flex", flexDirection: "column"
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
          <div style={{ overflowY: "auto", paddingRight: 4, margin: "0 -4px", padding: "0 4px" }}>
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
                color: "var(--ink)", boxSizing: "border-box"
              }}
            />
            {error && <p style={{ color: "var(--tomato)", fontSize: 12, marginTop: 8, marginBottom: 0, textAlign: "center" }}>{error}</p>}
            
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

            {loading ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Loader2 size={24} color="var(--ink-soft)" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
              </div>
            ) : reviews.length > 0 ? (
              <div style={{ marginTop: 24, borderTop: "1px solid var(--sage-line)", paddingTop: 16 }}>
                <h4 style={{ fontSize: 14, color: "var(--ink-main)", margin: "0 0 12px" }}>Recent Reviews</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {reviews.map((r, i) => (
                    <div key={i} style={{ background: "var(--sage-bg)", padding: 12, borderRadius: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink-main)" }}>{r.user_name}</span>
                        <StarRating rating={r.rating} size={11} />
                      </div>
                      {r.comment && <p style={{ margin: 0, fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.4 }}>{r.comment}</p>}
                      <div style={{ fontSize: 10, color: "var(--ink-soft)", marginTop: 6, opacity: 0.6 }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 24, textAlign: "center", color: "var(--ink-soft)", fontSize: 13 }}>
                No reviews yet. Be the first to review!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
