"use client";

import { createContext, useContext, useState } from "react";
import { themes, makeSi } from "../styles";

const ThemeContext = createContext(null);

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("estimo-theme") || "dark";
    }
    return "dark";
  });

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem("estimo-theme", next);
      return next;
    });
  };

  const C = themes[theme];
  const si = makeSi(C);

  return (
    <ThemeContext.Provider value={{ C, si, theme, toggleTheme }}>
      {children}
      <button
        onClick={toggleTheme}
        title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
        style={{
          position: "fixed",
          top: 14,
          right: 14,
          zIndex: 9999,
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: C.card,
          border: `1px solid ${C.cardBorder}`,
          color: C.muted,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          transition: "background 0.2s, color 0.2s",
        }}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
