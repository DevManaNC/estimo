export const C = {
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
};

export const si = {
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
    fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600,
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
