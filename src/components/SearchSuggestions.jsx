import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

// Fuzzy match score (lower is better)
function fuzzyScore(query, target) {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return 0;
  if (t.startsWith(q[0])) return 1;
  // Levenshtein-lite: check how many chars match in order
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length ? 2 : 99;
}

// Common Telugu-to-English mappings for quick search
const TELUGU_MAP = {
  "alu": "potato", "aloo": "potato", "bangala": "brinjal", "vankaya": "brinjal",
  "tamata": "tomato", "tomata": "tomato", "ulli": "onion", "carrot": "carrot",
  "bendakaya": "okra", "dondakaya": "ivy gourd", "beerakaya": "ridge gourd",
  "sorakaya": "bottle gourd", "kakarakaya": "bitter gourd", "kakara": "bitter gourd",
  "mullangi": "radish", "cabbage": "cabbage", "cauliflower": "cauliflower",
  "beans": "green beans", "drumstick": "drumstick", "chilli": "green chillies",
  "mirchi": "green chillies", "dosakaya": "cucumber", "cucumber": "cucumber",
  "palakura": "spinach", "methi": "fenugreek", "pudina": "mint",
};

export default function SearchSuggestions({ query, products, lang, onSelect, onQueryChange }) {
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getMatches = () => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    
    // Check Telugu mapping first
    const mapped = TELUGU_MAP[q];
    
    return products
      .map(p => {
        const nameEn = (p.name || "").toLowerCase();
        const nameTe = (p.te || "").toLowerCase();
        let score = Math.min(fuzzyScore(q, nameEn), fuzzyScore(q, nameTe));
        if (mapped && nameEn.includes(mapped)) score = -1; // Perfect match via mapping
        return { product: p, score };
      })
      .filter(r => r.score < 10)
      .sort((a, b) => a.score - b.score)
      .slice(0, 6);
  };

  const matches = focused ? getMatches() : [];

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: 1, maxWidth: 420 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "var(--sage-bg)", border: "1px solid var(--sage-line)",
        borderRadius: matches.length ? "20px 20px 0 0" : 20,
        padding: "8px 14px", transition: "border-radius 0.2s"
      }}>
        <Search size={16} color="var(--ink-soft)" />
        <input
          type="text"
          placeholder="Search vegetables... (try 'alu', 'tamata')"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setFocused(true)}
          style={{
            border: "none", background: "transparent", flex: 1,
            fontSize: 14, color: "var(--ink)", outline: "none"
          }}
        />
      </div>

      {matches.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: "var(--paper)", border: "1px solid var(--sage-line)",
          borderTop: "none", borderRadius: "0 0 16px 16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden",
          animation: "fadeIn 0.2s ease"
        }}>
          {matches.map(({ product: p }) => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setFocused(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", padding: "10px 16px", border: "none",
                background: "transparent", cursor: "pointer", textAlign: "left",
                borderBottom: "1px solid var(--sage-line)", transition: "background 0.15s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--sage-bg)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 24 }}>{p.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>
                  {lang === "te" ? p.te : p.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                  {lang === "te" ? p.name : p.te}
                </div>
              </div>
              <span style={{ fontWeight: 700, color: "var(--leaf-deep)", fontSize: 14 }}>
                ₹{p.price}/{p.unit}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
