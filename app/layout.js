import "./globals.css";

export const metadata = {
  title: "Estimo — Chiffrage Travaux Immobilier",
  description: "Outil de pré-chiffrage travaux pour investissement locatif — simulation crédit, cash-flow, fiscalité LMNP",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏗️</text></svg>",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: "#080810",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
