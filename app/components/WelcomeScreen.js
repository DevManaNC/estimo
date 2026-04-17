"use client";

import { C, si } from "../styles";

export default function WelcomeScreen({ onContinue }) {
  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'DM Sans',sans-serif", display: "flex",
      alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: "100%", maxWidth: 440, padding: "0 20px", textAlign: "center" }}>
        <div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}>
          Investissement locatif
        </div>
        <h1 style={{
          margin: "4px 0 32px", fontSize: 26, fontWeight: 800,
          background: "linear-gradient(90deg,#c9a96e,#e8d5a8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          ESTIMO
        </h1>

        <div style={{ ...si.card, padding: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Bienvenue sur Estimo !
          </h2>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 28, lineHeight: 1.6 }}>
            Votre compte est créé. Profitez de <strong style={{ color: C.gold }}>7 jours d'essai gratuit</strong> pour explorer toutes les fonctionnalités.
          </p>

          <div style={{ ...si.card, padding: 20, marginBottom: 28, background: "#0a0a14" }}>
            <ul style={{ textAlign: "left", fontSize: 13, color: C.text, listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Projets illimités",
                "Estimation par département",
                "Simulation crédit & cash-flow",
                "Fiscalité LMNP",
                "Export JSON",
              ].map(f => (
                <li key={f} style={{ padding: "5px 0", display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: C.green }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.inputBorder}`, fontSize: 12, color: C.muted }}>
              Puis 20€/mois — annulable à tout moment
            </div>
          </div>

          <button
            onClick={onContinue}
            style={{
              ...si.btn(C.gold, "#fff"), width: "100%",
              background: `linear-gradient(135deg,${C.gold},#8b6b3d)`,
              fontSize: 15, padding: 14,
            }}
          >
            Commencer mon essai gratuit
          </button>
        </div>
      </div>
    </div>
  );
}
