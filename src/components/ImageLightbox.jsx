import { useState, useCallback } from "react";
import { X } from "lucide-react";

export default function ImageLightbox({ src, alt, onClose }) {
  const [scale, setScale] = useState(1);

  const handleDoubleClick = useCallback(() => {
    setScale((prev) => (prev > 1 ? 1 : 2.5));
  }, []);

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <>
      <style>{`
        @keyframes lightboxFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes lightboxImageIn {
          0% { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div style={lbStyles.overlay} onClick={handleOverlayClick}>
        <button
          style={lbStyles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <X size={22} color="#fff" />
        </button>
        <img
          src={src}
          alt={alt || ""}
          style={{
            ...lbStyles.image,
            transform: `scale(${scale})`,
          }}
          onDoubleClick={handleDoubleClick}
          draggable={false}
        />
      </div>
    </>
  );
}

const lbStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    background: "rgba(0, 0, 0, 0.88)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "lightboxFadeIn 0.25s ease forwards",
    cursor: "zoom-out",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 101,
    transition: "all 0.2s ease",
    backdropFilter: "blur(8px)",
  },
  image: {
    maxWidth: "90vw",
    maxHeight: "90vh",
    objectFit: "contain",
    borderRadius: 8,
    touchAction: "pinch-zoom",
    transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    animation: "lightboxImageIn 0.3s ease forwards",
    cursor: "zoom-in",
    userSelect: "none",
  },
};
