import { Check, AlertCircle, Clock, Lock, X } from "lucide-react";
import { styles } from "../styles/styles";

export default function StatusModal({ open, type, title, message, buttonText, onAction, onClose }) {
  if (!open) return null;

  const config = {
    success: { icon: Check, color: "var(--leaf-mid)", bg: "var(--leaf-mid)" },
    error: { icon: AlertCircle, color: "var(--tomato)", bg: "var(--tomato)" },
    expired: { icon: Clock, color: "#f97316", bg: "#f97316" }, // Orange
    permission: { icon: Lock, color: "#6366f1", bg: "#6366f1" }, // Indigo
  };

  const { icon: Icon, color, bg } = config[type] || config.success;

  return (
    <>
      <div style={{ ...styles.overlay, zIndex: 65 }} onClick={onClose} />
      <div style={{ ...styles.statusModal, zIndex: 70 }}>
        {onClose && (
          <button 
            style={{ ...styles.iconBtn, position: 'absolute', top: 16, right: 16 }} 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        )}
        
        <div style={styles.statusIconWrap}>
          <div style={{ ...styles.statusIconBg, backgroundColor: bg }} />
          <Icon size={32} color={color} strokeWidth={2.5} />
        </div>
        
        <h3 style={styles.statusTitle}>{title}</h3>
        <p style={styles.statusDesc}>{message}</p>
        
        <button 
          style={{ ...styles.statusBtn, backgroundColor: color }} 
          onClick={onAction}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          {buttonText}
        </button>
      </div>
    </>
  );
}
