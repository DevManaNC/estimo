# Estimo — Chiffrage Travaux

Outil de pré-chiffrage travaux pour investissement locatif (Hérault / Montpellier).

## Stack

- **Next.js 14** (App Router)
- **React 18**
- **localStorage** pour la persistance (Phase 1)

## Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer en dev
npm run dev
# → http://localhost:3000

# Build production
npm run build
npm start
```

## Déploiement GitHub + Vercel

```bash
# 1. Init git et push sur GitHub
cd Estimo
git init
git add .
git commit -m "init: Estimo - chiffrage travaux Next.js"
gh repo create Estimo --private --source=. --push

# 2. Déployer sur Vercel
#    → vercel.com → "Add New Project" → sélectionne le repo Estimo → Deploy
#    Ou via CLI :
npx vercel
```

## Structure

```
Estimo/
├── app/
│   ├── layout.js      # Layout racine (metadata, viewport)
│   ├── globals.css     # Reset CSS global
│   ├── page.js         # Page d'entrée (client component wrapper)
│   └── App.js          # Composant principal (toute la logique)
├── next.config.js
├── package.json
└── README.md
```

## Phase 2 — Supabase

Pour passer en base de données, remplacer `loadProjects()` et `saveProjects()` dans `App.js`.
