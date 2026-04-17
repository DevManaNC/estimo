"use client";

import { createContext, useContext, useState } from "react";
import { themes, makeSi } from "../styles";

const ThemeContext = createContext(null);

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
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
