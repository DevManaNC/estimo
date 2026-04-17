"use client";

import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { useTheme } from "../lib/ThemeContext";

export default function Paywall() {
  const { profile, signOut, supabase } = useAuth();
  const { C, si } = useTheme();
  const [loading, setLoading] = useState(false);

  const isExpiredTrial = profile?.subscription_status === "trialing" &&
    new Date(profile.trial_ends_at) <= new Date();

  async function handleSubscribe() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
        },
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 440, padding: "0 20px", textAlign: "center" }}>
        <div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}>Investissement locatif</div>
        <h1 style={{ margin: "4px 0 24px", fontSize: 26, fontWeight: 800, background: "linear-gradient(90deg,#c9a96e,#e8d5a8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ESTIMO</h1>

        <div style={{ ...si.card, padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            {isExpiredTrial ? "Votre essai gratuit est terminé" : "Abonnement requis"}
          </h2>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.5 }}>
            {isExpiredTrial
              ? "Pour continuer à utiliser Estimo, souscrivez à un abonnement."
              : "Votre abonnement n'est plus actif. Réactivez-le pour accéder à vos projets."
            }
          </p>

          <div style={{ ...si.card, padding: 20, marginBottom: 24, background: C.surfaceAlt }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.gold }}>20€<span style={{ fontSize: 14, fontWeight: 500, color: C.muted }}>/mois</span></div>
            <ul style={{ textAlign: "left", fontSize: 13, color: C.text, listStyle: "none", padding: 0, marginTop: 16 }}>
              {["Projets illimités", "Estimation par département", "Simulation crédit & cash-flow", "Fiscalité LMNP", "Export JSON"].map(f => (
                <li key={f} style={{ padding: "4px 0", display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: C.green }}>&#10003;</span> {f}
                </li>
              ))}
            </ul>
          </div>

          <button onClick={handleSubscribe} disabled={loading} style={{
            ...si.btn(C.gold, "#fff"), width: "100%", opacity: loading ? 0.6 : 1,
            background: `linear-gradient(135deg,${C.gold},#8b6b3d)`, fontSize: 15, padding: 14,
          }}>
            {loading ? "Redirection..." : "S'abonner — 20€/mois"}
          </button>

          <button onClick={signOut} style={{
            background: "none", border: "none", color: C.dim, cursor: "pointer",
            fontSize: 12, fontFamily: "'DM Sans',sans-serif", marginTop: 16,
          }}>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
