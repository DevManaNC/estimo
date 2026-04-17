import "./globals.css";
import { ThemeProvider } from "./lib/ThemeContext";

export const metadata = {
  title: "Estimo — Chiffrage Travaux Immobilier",
  description:
    "Outil de pré-chiffrage travaux pour investissement locatif — simulation crédit, cash-flow, fiscalité LMNP. Estimez vos travaux de rénovation en quelques minutes.",
  keywords: [
    "chiffrage travaux",
    "estimation rénovation",
    "investissement locatif",
    "marchand de biens",
    "LMNP",
    "cash-flow immobilier",
    "simulation crédit immobilier",
    "rendement locatif",
  ],
  authors: [{ name: "Estimo" }],
  creator: "Estimo",
  metadataBase: new URL("https://estimo-five.vercel.app"),
  openGraph: {
    title: "Estimo — Chiffrage Travaux Immobilier",
    description:
      "Pré-chiffrez vos travaux de rénovation, simulez votre crédit et calculez votre rendement locatif.",
    url: "https://estimo-five.vercel.app",
    siteName: "Estimo",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Estimo — Chiffrage Travaux Immobilier",
    description:
      "Pré-chiffrez vos travaux de rénovation, simulez votre crédit et calculez votre rendement locatif.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Estimo",
  },
};

export const viewport = {
  themeColor: "#080810",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
