import { useState } from "react";
import { Home, Search, ShoppingCart, User } from "lucide-react";
import { styles } from "../styles/styles";

const TABS = [
  { key: "home", icon: Home, labelKey: "navHome" },
  { key: "search", icon: Search, labelKey: "navSearch" },
  { key: "cart", icon: ShoppingCart, labelKey: "navCart" },
  { key: "account", icon: User, labelKey: "navAccount" },
];

const ACTIVE_COLOR = "#16a34a";
const INACTIVE_COLOR = "var(--ink-soft)";

export default function BottomNav({ activeView, onNavigate, cartCount, t }) {
  const [hoveredTab, setHoveredTab] = useState(null);

  if (activeView === "checkout" || activeView === "tracking") return null;

  return (
    <nav style={navStyles.bar}>
      {TABS.map(({ key, icon: Icon, labelKey }) => {
        const isActive = activeView === key;
        const isHovered = hoveredTab === key;
        const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
        const iconSize = isActive ? 22 : 20;

        return (
          <button
            key={key}
            style={{
              ...navStyles.tab,
              ...(isActive ? navStyles.tabActive : {}),
              ...(isHovered && !isActive ? navStyles.tabHover : {}),
            }}
            onClick={() => onNavigate(key)}
            onMouseEnter={() => setHoveredTab(key)}
            onMouseLeave={() => setHoveredTab(null)}
            aria-label={t[labelKey] || key}
          >
            <div style={navStyles.iconWrap}>
              <Icon size={iconSize} color={color} strokeWidth={isActive ? 2.5 : 2} />
              {key === "cart" && cartCount > 0 && (
                <span style={navStyles.badge}>{cartCount > 99 ? "99+" : cartCount}</span>
              )}
            </div>
            <span
              style={{
                ...navStyles.label,
                color,
                fontWeight: isActive ? 700 : 500,
              }}
            >
              {t[labelKey] || key}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

const navStyles = {
  bar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    background: "#fff",
    borderTop: "1px solid var(--sage-line)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    zIndex: 50,
    boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
  },
  tab: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px 0",
    transition: "all 0.2s ease",
    height: "100%",
  },
  tabActive: {
    background: "rgba(22,163,74,0.06)",
  },
  tabHover: {
    background: "rgba(0,0,0,0.02)",
  },
  iconWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    background: "var(--tomato)",
    color: "#fff",
    fontSize: 9,
    fontWeight: 700,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
    lineHeight: 1,
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.2,
    transition: "all 0.2s ease",
  },
};
