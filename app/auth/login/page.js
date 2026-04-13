"use client";

import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { C, si } from "../../styles";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = getSupabase();
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        });
        if (error) throw error;
        setMessage("Lien de réinitialisation envoyé par email.");
        setLoading(false);
        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMessage("Vérifiez votre email pour confirmer votre inscription.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/";
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleGoogle() {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}>Investissement locatif</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 800, background: "linear-gradient(90deg,#c9a96e,#e8d5a8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ESTIMO</h1>
        </div>

        <div style={{ ...si.card, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>
            {mode === "login" ? "Connexion" : mode === "signup" ? "Inscription" : "Mot de passe oublié"}
          </h2>

          <button onClick={handleGoogle} style={{
            width: "100%", padding: 12, background: "#fff", border: "none", borderRadius: 8,
            color: "#333", cursor: "pointer", fontSize: 14, fontWeight: 600,
            fontFamily: "'DM Sans',sans-serif", marginBottom: 16, display: "flex",
            alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continuer avec Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: C.inputBorder }} />
            <span style={{ fontSize: 11, color: C.dim }}>ou</span>
            <div style={{ flex: 1, height: 1, background: C.inputBorder }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={si.label}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ ...si.input, marginTop: 4 }} placeholder="vous@email.com" />
            </div>

            {mode !== "forgot" && (
              <div style={{ marginBottom: 16 }}>
                <label style={si.label}>Mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  minLength={6} style={{ ...si.input, marginTop: 4 }} placeholder="6 caractères minimum" />
              </div>
            )}

            {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{error}</div>}
            {message && <div style={{ color: C.green, fontSize: 12, marginBottom: 12 }}>{message}</div>}

            <button type="submit" disabled={loading} style={{
              ...si.btn(C.gold, "#fff"), width: "100%", opacity: loading ? 0.6 : 1,
              background: `linear-gradient(135deg,${C.gold},#8b6b3d)`,
            }}>
              {loading ? "..." : mode === "login" ? "Se connecter" : mode === "signup" ? "Créer un compte" : "Envoyer le lien"}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: C.muted }}>
            {mode === "login" && (
              <>
                <button onClick={() => { setMode("signup"); setError(null); }} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
                  Créer un compte
                </button>
                {" · "}
                <button onClick={() => { setMode("forgot"); setError(null); }} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
                  Mot de passe oublié
                </button>
              </>
            )}
            {(mode === "signup" || mode === "forgot") && (
              <button onClick={() => { setMode("login"); setError(null); setMessage(null); }} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
                Retour à la connexion
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#333", marginTop: 24 }}>
          Essai gratuit 7 jours · Puis 20€/mois
        </p>
      </div>
    </div>
  );
}
