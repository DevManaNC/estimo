"use client";

import { useTheme } from "../lib/ThemeContext";
import { fmt } from "../utils/format";
import { calcProject } from "../utils/calc";

export default function Dashboard({ projects, onOpen, onCreate, onDuplicate, onDelete, confirmDelete, setConfirmDelete, onSignOut, userEmail }) {
  const { C, si } = useTheme();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ position: "relative", background: `linear-gradient(135deg,${C.headerBg1},${C.headerBg2})`, borderBottom: `1px solid ${C.cardBorder}`, padding: "28px 20px 22px", textAlign: "center" }}>
        {userEmail && (
          <div style={{ position: "absolute", top: 14, left: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.gold + "22", border: `1px solid ${C.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.gold, flexShrink: 0 }}>
              {userEmail[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 11, color: C.muted, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail}
            </span>
            <button onClick={onSignOut} title="Se déconnecter" style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", padding: 4, display: "flex", alignItems: "center", flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        )}
        <div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}>Investissement locatif</div>
        <h1 style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 800, background: "linear-gradient(90deg,#c9a96e,#e8d5a8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ESTIMO</h1>
        <p style={{ color: C.dim, fontSize: 13, margin: "8px 0 0" }}>{projects.length} projet{projects.length !== 1 ? "s" : ""}</p>
      </div>

      <div style={{ maxWidth: 700, margin: "20px auto", padding: "0 16px" }}>
        <button onClick={onCreate} style={{ width: "100%", padding: 18, background: `linear-gradient(135deg,${C.gold},#8b6b3d)`, border: "none", borderRadius: 12, color: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", marginBottom: 12 }}>
          + Nouveau chiffrage
        </button>

        {projects.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.dim }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
            <p>Aucun projet. Créez votre premier chiffrage.</p>
          </div>
        )}

        {[...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map(p => {
          const pc = calcProject(p);
          return (
            <div key={p.id} style={{ ...si.card, marginBottom: 12 }}>
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: C.gold, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: C.dim }}>{p.info.adresse ? `${p.info.adresse}, ` : ""}{p.info.cp} {p.info.ville}{p.info.surface ? ` — ${p.info.surface} m²` : ""}</div>
                    <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>Modifié {new Date(p.updatedAt).toLocaleDateString("fr-FR")} {new Date(p.updatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => onOpen(p.id)} style={si.btn(C.gold + "22", C.gold)}>Ouvrir</button>
                    <button onClick={() => onDuplicate(p.id)} style={si.btn(C.btnBg, C.muted)} title="Dupliquer">&#x29C9;</button>
                    {confirmDelete !== p.id
                      ? <button onClick={() => setConfirmDelete(p.id)} style={si.btn(C.red + "22", C.red)}>&#x2715;</button>
                      : <button onClick={() => onDelete(p.id)} style={si.btn(C.red, "#fff")}>Confirmer</button>
                    }
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  {[
                    { l: "Projet", v: pc.montantTotal > 0 ? fmt(pc.montantTotal) : "—", c: C.green },
                    { l: "Travaux", v: pc.totalTTC > 0 ? fmt(pc.totalTTC) : "—", c: C.blue },
                    { l: "Loyer", v: pc.loyerMensuel > 0 ? `${fmt(pc.loyerMensuel)}/m` : "—", c: C.blue },
                    { l: "Renta brute", v: pc.rentaBrute > 0 ? pc.rentaBrute.toFixed(1) + "%" : "—", c: pc.rentaBrute >= 8 ? C.green : pc.rentaBrute >= 5 ? "#f1c40f" : C.red },
                    { l: "Renta nette", v: pc.rentaNette > 0 ? pc.rentaNette.toFixed(1) + "%" : "—", c: pc.rentaNette >= 6 ? C.green : pc.rentaNette >= 4 ? "#f1c40f" : C.red },
                  ].map((m, i) => (
                    <div key={i} style={{ padding: "6px 10px", background: C.surface, borderRadius: 6 }}>
                      <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase" }}>{m.l}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: m.c }}>{m.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ textAlign: "center", padding: "24px 0 12px", fontSize: 11, color: C.dim }}>
          <a href="/mentions-legales" style={{ color: C.dim, textDecoration: "none" }}>Mentions légales</a>
        </div>
      </div>
    </div>
  );
}
