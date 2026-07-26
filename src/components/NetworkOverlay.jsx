import { useState, useEffect } from "react";
import { WifiOff, Snail } from "lucide-react";
import { styles } from "../styles/styles";

export default function NetworkOverlay({ slowNetwork }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial state safely
    if (typeof window !== "undefined") {
      setIsOffline(!window.navigator.onLine);
    }

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !slowNetwork) return null;

  const isError = isOffline;
  const Icon = isOffline ? WifiOff : Snail;
  const color = isOffline ? "var(--tomato)" : "var(--leaf-deep)";
  const bg = isOffline ? "var(--tomato)" : "var(--leaf-mid)";
  const title = isOffline ? "No Internet Connection" : "It's taking longer than usual";
  const desc = isOffline 
    ? "Please check your internet connection and try again."
    : "You're on a slow connection. Please wait...";
  const btnText = isOffline ? "Retry" : "Got it";

  return (
    <>
      <div style={{ ...styles.overlay, zIndex: 90 }} />
      <div style={{ ...styles.statusModal, zIndex: 100 }}>
        
        <div style={styles.statusIconWrap}>
          <div style={{ ...styles.statusIconBg, backgroundColor: bg }} />
          <Icon size={32} color={color} strokeWidth={2.5} />
        </div>
        
        <h3 style={styles.statusTitle}>{title}</h3>
        <p style={styles.statusDesc}>{desc}</p>
        
        {isOffline ? (
          <button 
            style={{ ...styles.statusBtn, backgroundColor: color }} 
            onClick={() => window.location.reload()}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {btnText}
          </button>
        ) : (
          <div style={{ width: '100%', height: 6, backgroundColor: 'var(--sage-bg)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: '50%', height: '100%', backgroundColor: color, animation: 'progress 2s infinite ease-in-out' }} />
          </div>
        )}
      </div>
    </>
  );
}
