import { useEffect, useState } from "react";

const COLORS = ["#16a34a", "#4ade80", "#fbbf24", "#f97316", "#C98A1E", "#C1440E", "#22c55e", "#ff6b6b"];
const EMOJIS = ["🥬", "🥕", "🍅", "🌽", "🥦", "🌶️", "🧅", "🥒"];

function ConfettiPiece({ index }) {
  const isEmoji = Math.random() > 0.6;
  const left = Math.random() * 100;
  const delay = Math.random() * 1.5;
  const duration = 2 + Math.random() * 2;
  const size = isEmoji ? 20 : (6 + Math.random() * 10);
  const color = COLORS[index % COLORS.length];
  const emoji = EMOJIS[index % EMOJIS.length];
  
  return (
    <div style={{
      position: "fixed",
      left: `${left}%`,
      top: -20,
      fontSize: isEmoji ? size : 0,
      width: isEmoji ? "auto" : size,
      height: isEmoji ? "auto" : size,
      backgroundColor: isEmoji ? "transparent" : color,
      borderRadius: isEmoji ? 0 : (Math.random() > 0.5 ? "50%" : "2px"),
      animation: `confettiFall ${duration}s ease-in ${delay}s forwards`,
      zIndex: 99999,
      pointerEvents: "none",
    }}>
      {isEmoji ? emoji : ""}
    </div>
  );
}

export default function Confetti({ show }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (show) {
      setPieces(Array.from({ length: 50 }, (_, i) => i));
      const timer = setTimeout(() => setPieces([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!pieces.length) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none", overflow: "hidden" }}>
      {pieces.map(i => <ConfettiPiece key={i} index={i} />)}
    </div>
  );
}
