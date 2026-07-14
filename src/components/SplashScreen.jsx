import { useEffect } from "react";

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <>
      <style>{`
        @keyframes splashScaleIn {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes splashBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
        @keyframes splashFadeIn {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
      <div style={splashStyles.wrapper}>
        <div style={splashStyles.content}>
          <div style={splashStyles.vrText}>VR</div>
          <div style={splashStyles.emoji}>🥬</div>
          <div style={splashStyles.subtitle}>Venkataramana Vegetables</div>
          <div style={splashStyles.dotsRow}>
            <span style={{ ...splashStyles.dot, animationDelay: "0s" }} />
            <span style={{ ...splashStyles.dot, animationDelay: "0.2s" }} />
            <span style={{ ...splashStyles.dot, animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    </>
  );
}

const splashStyles = {
  wrapper: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "linear-gradient(145deg, #16a34a 0%, #28502F 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  vrText: {
    fontFamily: "'Fraunces', serif",
    fontSize: 72,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: 6,
    textShadow: "0 4px 24px rgba(0,0,0,0.25)",
    animation: "splashScaleIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
  },
  emoji: {
    fontSize: 48,
    animation: "splashBounce 1s ease-in-out infinite",
    marginTop: 4,
  },
  subtitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: 18,
    fontWeight: 500,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 1.5,
    marginTop: 10,
    opacity: 0,
    animation: "splashFadeIn 0.6s ease 0.5s forwards",
  },
  dotsRow: {
    display: "flex",
    gap: 8,
    marginTop: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.8)",
    animation: "splashPulse 1s ease-in-out infinite",
  },
};
