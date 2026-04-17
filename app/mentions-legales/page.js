"use client";

import { useTheme } from "../lib/ThemeContext";

export default function MentionsLegales() {
  const { C } = useTheme();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <a href="/" style={{ color: C.gold, fontSize: 13, textDecoration: "none", fontWeight: 700 }}>&larr; Retour</a>
        <h1 style={{ color: C.gold, fontSize: 24, fontWeight: 800, margin: "20px 0 30px" }}>Mentions légales</h1>

        <Section title="Éditeur du site" C={C}>
          <p>Estimo — Outil de pré-chiffrage travaux immobilier.</p>
          <p>Ce site est édité à titre personnel.</p>
          <p>Contact : <em>[Votre email]</em></p>
        </Section>

        <Section title="Hébergement" C={C}>
          <p>Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
        </Section>

        <Section title="Propriété intellectuelle" C={C}>
          <p>L&apos;ensemble du contenu de ce site (textes, calculs, interface) est protégé par le droit d&apos;auteur. Toute reproduction sans autorisation est interdite.</p>
        </Section>

        <Section title="Données personnelles & RGPD" C={C}>
          <p>Ce site ne collecte aucune donnée personnelle. Toutes les données de projets sont stockées localement dans votre navigateur (localStorage) et ne sont jamais transmises à un serveur.</p>
          <p>Aucun cookie de tracking n&apos;est utilisé. L&apos;API de géolocalisation (code postal → ville) utilise le service public geo.api.gouv.fr sans transmettre de données personnelles.</p>
        </Section>

        <Section title="Limitation de responsabilité" C={C}>
          <p>Les estimations fournies par Estimo sont indicatives et ne constituent pas un devis. Elles sont basées sur des prix moyens constatés dans l&apos;Hérault (2024-2025) et peuvent varier significativement selon les artisans, la complexité du chantier et les conditions locales.</p>
          <p>L&apos;éditeur ne saurait être tenu responsable des décisions d&apos;investissement prises sur la base des calculs de cet outil.</p>
        </Section>

        <Section title="Cookies" C={C}>
          <p>Ce site n&apos;utilise aucun cookie.</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children, C }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>{title}</h2>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: C.muted }}>{children}</div>
    </div>
  );
}
