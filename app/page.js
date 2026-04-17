"use client";

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import App from "./App";
import Paywall from "./components/Paywall";
import LoginPage from "./auth/login/page";
import WelcomeScreen from "./components/WelcomeScreen";
import { C } from "./styles";

function AuthGate() {
  const { user, profile, loading, hasAccess } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;
    const key = `welcome_seen_${user.id}`;
    if (!localStorage.getItem(key) && profile.subscription_status === "trialing") {
      setShowWelcome(true);
    }
  }, [user, profile]);

  function handleWelcomeContinue() {
    localStorage.setItem(`welcome_seen_${user.id}`, "1");
    setShowWelcome(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}>Investissement locatif</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 800, background: "linear-gradient(90deg,#c9a96e,#e8d5a8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ESTIMO</h1>
          <p style={{ color: C.dim, fontSize: 13, marginTop: 12 }}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!hasAccess()) {
    return <Paywall />;
  }

  if (showWelcome) {
    return <WelcomeScreen onContinue={handleWelcomeContinue} />;
  }

  return <App />;
}

export default function Page() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
