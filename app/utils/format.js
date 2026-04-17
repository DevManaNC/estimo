export const fmt = (n) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " €";
export const fmtDec = (n) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " €";
export const fmtPct = (n) => n.toFixed(2) + "%";
export const genId = () => crypto.randomUUID();
