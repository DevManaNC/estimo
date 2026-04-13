# Estimo — Roadmap produit

## Phase 0 : Mise en ligne (1-2 jours)

> Objectif : rendre l'app accessible en ligne, telle quelle.

- [ ] Créer le repo GitHub (privé)
- [ ] Connecter le repo à Vercel et déployer
- [ ] Acheter et configurer un domaine (ex: `estimo-chiffrage.fr`)
- [ ] Ajouter les mentions légales / CGU (obligatoire en France)
- [ ] Ajouter un vrai favicon et logo (remplacer l'emoji 🏗️)
- [ ] Ajouter un outil d'analytics RGPD-friendly (Plausible ou Umami)
- [ ] Ajouter Sentry pour le monitoring d'erreurs

---

## Phase 1 : Solidification (1-2 semaines)

> Objectif : fiabiliser l'outil avant de le mettre entre les mains d'utilisateurs qui prennent des décisions d'investissement.

### Tests
- [ ] Tests unitaires sur `calc.js` (rendement brut, net, cash-flow, amortissement, fiscalité)
- [ ] Tests unitaires sur les calculs de TVA (10%, 20%, et futur 5.5%)
- [ ] Tests d'intégration sur le cycle complet : création projet → saisie → synthèse

### Validation des données
- [ ] Valider les inputs numériques (pas de surface à 0, pas de prix négatif)
- [ ] Gérer les cas limites (0 lots, 0 travaux, prêt à 0%)
- [ ] Afficher des avertissements si les ratios sont incohérents (rendement > 20%, cash-flow irréaliste)

### Qualité
- [ ] Rate limiting sur `/api/geo` (éviter l'abus de l'API gouv)
- [ ] CI/CD : GitHub Actions pour lint + tests avant chaque déploiement
- [ ] Gestion d'erreurs propre (catch sur les appels API, fallback si localStorage plein)

---

## Phase 2 : Multi-utilisateurs (2-4 semaines)

> Objectif : chaque marchand de biens a son compte et retrouve ses projets sur n'importe quel appareil.

### Authentification
- [ ] Intégrer Supabase Auth (email + mot de passe, magic link)
- [ ] Page de login / inscription
- [ ] Protection des routes (redirection si non connecté)
- [ ] Gestion du profil utilisateur (nom, email, entreprise)

### Base de données
- [ ] Créer la table `projects` sur Supabase (PostgreSQL)
  - Colonnes : `id`, `user_id`, `name`, `data` (JSONB), `created_at`, `updated_at`
- [ ] Activer Row Level Security (chaque user ne voit que ses projets)
- [ ] Migrer `storage.js` : remplacer localStorage par appels Supabase
- [ ] Script de migration : importer les projets localStorage existants vers le compte

### Synchronisation
- [ ] Auto-save debounced vers Supabase (comme actuellement vers localStorage)
- [ ] Mode offline : localStorage comme cache, sync au retour de connexion
- [ ] Indicateur de statut de synchronisation (sauvegardé / en cours / hors-ligne)

---

## Phase 3 : Optimisation mobile & terrain (2-3 semaines)

> Objectif : l'outil est utilisable sur le terrain, téléphone en main, pendant la visite d'un immeuble.

### PWA
- [ ] Créer `manifest.json` complet (nom, icônes, couleurs, display: standalone)
- [ ] Service worker pour le cache offline (pages + données)
- [ ] Bouton "Installer l'app" sur la page d'accueil
- [ ] Fonctionne sans réseau (les projets en cache sont consultables et modifiables)

### UX mobile
- [ ] Mode "chiffrage express" : seulement les 20-30 postes les plus courants au lieu de 150+
- [ ] Navigation par swipe entre les onglets (Info → Travaux → Financement → Synthèse)
- [ ] Boutons et zones de tap adaptés au pouce (min 44px)
- [ ] Clavier numérique automatique sur les champs de montants

### Photos terrain
- [ ] Prise de photos depuis l'app (accès caméra via input file)
- [ ] Association d'une photo à un poste de travaux ou à un lot
- [ ] Stockage sur Supabase Storage (ou S3)
- [ ] Galerie photos par projet dans l'onglet Info

---

## Phase 4 : Fonctionnalités métier avancées (1-2 mois)

> Objectif : Estimo devient l'outil de référence du marchand de biens pour ses décisions d'investissement.

### Comparaison & décision
- [ ] Vue comparaison : 2-3 projets côte à côte (prix, rendement, cash-flow)
- [ ] Scoring automatique des projets (note sur critères pondérés)
- [ ] Simulation de scénarios : optimiste / réaliste / pessimiste (variation des loyers et travaux)

### Export & partage
- [ ] Export PDF professionnel (jsPDF ou @react-pdf/renderer) au lieu du print CSS
  - Mise en page pro avec logo, en-tête, tableaux formatés
  - Utilisable pour présenter au banquier, notaire, associé
- [ ] Lien de partage en lecture seule (URL unique par projet)
- [ ] Export Excel des tableaux d'amortissement et cash-flow

### Templates & données
- [ ] Templates de projets pré-remplis par type :
  - "Studio à rénover entièrement"
  - "T3 rafraîchissement"
  - "Immeuble 4 lots rénovation complète"
- [ ] Mise à jour annuelle des tarifs artisans dans `pricing.js`
- [ ] Support multi-TVA : 5.5% (rénovation énergétique), 10% (travaux), 20% (neuf/cuisine)
- [ ] Estimation du DPE avant/après travaux

### Financement
- [ ] Intégration des taux d'intérêt du marché en temps réel (API)
- [ ] Simulation multi-prêts (prêt principal + prêt travaux)
- [ ] Calcul des frais de garantie (hypothèque, caution)

---

## Phase 5 : Monétisation & croissance (2-3 mois)

> Objectif : transformer l'outil en produit viable économiquement.

### Modèle freemium
- [ ] Plan gratuit : 2 projets actifs, export PDF basique
- [ ] Plan Pro (~19€/mois) : projets illimités, PDF pro, partage, photos, templates
- [ ] Plan Agence (~49€/mois) : multi-utilisateurs, projets partagés entre collaborateurs
- [ ] Intégration Stripe pour le paiement

### Landing page & acquisition
- [ ] Page d'accueil marketing (séparée de l'app)
- [ ] SEO : cibler "chiffrage travaux immobilier", "estimation rénovation immeuble"
- [ ] Blog / contenu : guides sur le chiffrage, cas pratiques, retours d'expérience
- [ ] Référencement dans les communautés de marchands de biens

### Feedback & itération
- [ ] Formulaire de feedback in-app
- [ ] Entretiens utilisateurs avec 5-10 marchands de biens
- [ ] Tableau de bord admin : nombre d'utilisateurs, projets créés, rétention

---

## Stack technique cible

| Composant         | Technologie                      |
|-------------------|----------------------------------|
| Frontend          | Next.js 14 (App Router)          |
| Hébergement       | Vercel                           |
| Auth              | Supabase Auth                    |
| Base de données   | Supabase PostgreSQL              |
| Stockage fichiers | Supabase Storage                 |
| Export PDF        | @react-pdf/renderer              |
| Analytics         | Plausible                        |
| Monitoring        | Sentry                           |
| Paiement          | Stripe                           |
| CI/CD             | GitHub Actions                   |

---

## Priorités

```
Phase 0  ████░░░░░░░░░░░░  Pré-requis — déployer tel quel
Phase 1  ████████░░░░░░░░  Critique — fiabilité des calculs
Phase 2  ████████████░░░░  Clé — débloquer le multi-device
Phase 3  ████████████████  Différenciant — usage terrain
Phase 4  ████████████████  Valeur — devenir indispensable
Phase 5  ████████████████  Business — rentabiliser
```

Chaque phase peut être livrée indépendamment. La Phase 0 rend l'outil accessible. La Phase 1 le rend fiable. À partir de la Phase 2, c'est un vrai produit.
