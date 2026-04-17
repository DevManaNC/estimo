export const themes = {
  dark: {
    bg: "#080810",
    card: "#0e0e1a",
    cardBorder: "#1e1e3a",
    input: "#12122a",
    inputBorder: "#252545",
    gold: "#c9a96e",
    green: "#2ecc71",
    blue: "#3498db",
    red: "#e74c3c",
    orange: "#f39c12",
    text: "#e0e0e0",
    muted: "#888",
    dim: "#555",
    surface: "#08080f",
    surfaceAlt: "#0a0a14",
    btnBg: "#1a1a2e",
    headerBg1: "#0f0f1a",
    headerBg2: "#161628",
  },
  light: {
    bg: "#f4f4f0",
    card: "#ffffff",
    cardBorder: "#e0e0ea",
    input: "#f0f0f5",
    inputBorder: "#d0d0da",
    gold: "#8b6020",
    green: "#1a9e55",
    blue: "#1a6fa8",
    red: "#c0392b",
    orange: "#c07010",
    text: "#1a1a2e",
    muted: "#606070",
    dim: "#909098",
    surface: "#f8f8fc",
    surfaceAlt: "#ededf5",
    btnBg: "#e4e4f0",
    headerBg1: "#f0f0f8",
    headerBg2: "#e8e8f5",
  },
};

export function makeSi(C) {
  return {
    input: {
      background: C.input, border: `1px solid ${C.inputBorder}`, borderRadius: 6,
      color: C.text, padding: "7px 10px", fontSize: 13, fontFamily: "'DM Sans',sans-serif",
      outline: "none", width: "100%", boxSizing: "border-box",
    },
    inputSm: {
      background: C.input, border: `1px solid ${C.inputBorder}`, borderRadius: 5,
      color: C.text, padding: "6px 8px", fontSize: 12, fontFamily: "'DM Sans',sans-serif",
      outline: "none", width: "100%", boxSizing: "border-box", textAlign: "right",
    },
    label: {
      fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600,
    },
    card: {
      background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12,
      marginBottom: 12, overflow: "hidden",
    },
    btn: (bg, cl) => ({
      padding: "10px 18px", background: bg, border: "none", borderRadius: 8,
      color: cl, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif",
    }),
    row: {
      display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10,
    },
  };
}

// Dark defaults (backward compat for files that haven't migrated)
export const C = themes.dark;
export const si = makeSi(C);
