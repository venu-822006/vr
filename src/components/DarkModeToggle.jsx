import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle({ darkMode, setDarkMode }) {
  return (
    <button
      onClick={() => setDarkMode(d => !d)}
      aria-label="Toggle dark mode"
      style={{
        background: darkMode ? "rgba(74,222,128,0.15)" : "rgba(40,80,47,0.1)",
        border: "1px solid " + (darkMode ? "rgba(74,222,128,0.3)" : "rgba(40,80,47,0.2)"),
        borderRadius: 20,
        padding: "6px 12px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
        transition: "all 0.3s ease",
        color: darkMode ? "#4ade80" : "#28502F",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {darkMode ? <Sun size={14} /> : <Moon size={14} />}
      {darkMode ? "Light" : "Dark"}
    </button>
  );
}
