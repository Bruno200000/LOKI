# LOKI - Plateforme de Colocation en Côte d'Ivoire

LOKI est une application SaaS moderne pour la gestion de colocations de maisons en Côte d'Ivoire. La plateforme connecte les propriétaires avec les locataires potentiels et collecte automatiquement une commission de 2000 FCFA par réservation.

## ✨ Fonctionnalités

### Pour les Propriétaires
- Créer, modifier et supprimer des annonces de maisons
- Gérer le statut de disponibilité (Disponible / Pris)
- Ajouter des photos et vidéos de propriétés
- Voir les réservations pour leurs propriétés
- Tableau de bord avec statistiques

### Pour les Locataires
- Parcourir toutes les maisons disponibles
- Filtrer par ville, prix et localisation
- Réserver une maison avec paiement de commission
- Gérer leurs réservations (voir, annuler)
- Tableau de bord personnalisé

### Pour les Administrateurs
- Vue d'ensemble de la plateforme
- Statistiques complètes (utilisateurs, maisons, réservations)
- Suivi des commissions collectées
- Historique des transactions

## 🚀 Stack Technique

- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Icônes**: Lucide React

## 📋 Prérequis

- Node.js 18+ installé
- Compte Supabase configuré
- npm ou yarn

## 🛠️ Installation

1. Les dépendances sont déjà installées. Si besoin:
```bash
npm install
```

2. Les variables d'environnement Supabase sont déjà configurées dans `.env`

3. Appliquer la migration de base de données:
   - Connectez-vous à votre dashboard Supabase
   - Allez dans SQL Editor
   - Copiez le contenu de `supabase/migrations/001_create_loki_schema.sql`
   - Exécutez la migration

## 🚀 Déploiement

### Netlify

1. **Connecter le repository** à Netlify
2. **Configuration des variables d'environnement** (obligatoire) :
   - `VITE_SUPABASE_URL`: https://oliizzwqbmlpeqozhofm.supabase.co
   - `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9saWl6endxYm1scGVxb3pob2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTU5MzYsImV4cCI6MjA3NDk3MTkzNn0.G_E-bPzPZXEMbKZvUdhmaF3X1uH6_HVibVXiA42XhDs
3. **Version Node.js** : Changer vers Node 18 ou 20 si des erreurs de build persistent
4. **Build Command** : `npm run build:netlify` (sans vérifications de sécurité)
5. **Publish Directory** : `dist`

**Note** : Le fichier `netlify.toml` configure automatiquement ces paramètres.

### Variables d'environnement requises

Créez un fichier `.env` pour le développement local (copiez depuis `.env.example`) :

```bash
cp .env.example .env
```

### Résolution des problèmes de déploiement

#### Erreur de conflit de dépendances (ERESOLVE)
- Le projet utilise Vite 5.4.21 (compatible avec @vitejs/plugin-react)
- Si vous voyez une erreur ERESOLVE, vérifiez que les versions sont correctes dans package.json

#### Erreur de variables d'environnement vides
- Vérifiez dans Netlify Dashboard > Site Settings > Build & Deploy > Environment Variables
- Assurez-vous que les valeurs ne sont pas vides
- Les variables sont utilisées pendant le build, pas seulement à l'exécution

#### Erreur de version Node.js
- Ajoutez un fichier `.nvmrc` avec `18` ou `20`
- Ou configurez dans Netlify : Site Settings > Build & Deploy > Node version

### Build Local

Pour tester le build local avec les mêmes conditions que Netlify :

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Build avec variables d'environnement
VITE_SUPABASE_URL=https://oliizzwqbmlpeqozhofm.supabase.co \
VITE_SUPABASE_ANON_KEY=your_anon_key_here \
npm run build
```

## 🎯 Utilisation

### Démarrer le serveur de développement
```bash
npm run dev
```

### Construire pour la production
```bash
npm run build
```

### Prévisualiser la build de production
```bash
npm run preview
```

## 📊 Structure de la Base de Données

### Tables Principales

1. **profiles**: Profils utilisateurs avec rôles (owner/tenant/admin)
2. **houses**: Annonces de maisons avec détails complets
3. **bookings**: Réservations avec commission automatique de 2000 FCFA
4. **payments**: Transactions et paiements

### Sécurité
- Row Level Security (RLS) activé sur toutes les tables
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Les propriétaires gèrent uniquement leurs annonces
- Les locataires voient uniquement les maisons disponibles

## 💳 Système de Paiement

La plateforme supporte les méthodes de paiement locales:
- Wave
- Orange Money
- Moov Money
- Cash

**Commission**: 2000 FCFA par réservation (automatiquement ajoutée)

## 👥 Rôles Utilisateurs

### Propriétaire (Owner)
- Peut créer et gérer des annonces de maisons
- Voit les réservations pour ses propriétés
- Tableau de bord avec statistiques personnelles

### Locataire (Tenant)
- Peut parcourir et réserver des maisons
- Gère ses propres réservations
- Peut annuler des réservations actives

### Administrateur (Admin)
- Vue complète de la plateforme
- Accès aux statistiques globales
- Suivi des commissions et transactions

## 🎨 Interface Utilisateur

- Design moderne et épuré
- Interface bilingue (Français)
- Responsive (mobile, tablette, desktop)
- Animations fluides et transitions
- Couleurs thématiques: Emerald (vert) pour la brand

## 🔐 Authentification

- Inscription avec email/password
- Sélection du rôle à l'inscription
- Sessions gérées par Supabase
- Auto-création du profil après inscription

## 📱 Fonctionnalités Clés

### Recherche et Filtres
- Recherche par texte (titre, description, localisation)
- Filtrage par ville
- Filtrage par prix maximum
- Tri par date de création

### Gestion des Réservations
- Sélection de date d'emménagement
- Calcul automatique de la commission
- Notes optionnelles
- Statuts: pending, active, completed, canceled

### Tableau de Bord Propriétaire
- Vue d'ensemble des propriétés
- Statistiques en temps réel
- Gestion complète des annonces
- Formulaire d'ajout/modification intuitif

### Tableau de Bord Locataire
- Navigation entre parcours et réservations
- Liste de maisons disponibles avec aperçu
- Historique des réservations
- Possibilité d'annulation

## 🌍 Villes Supportées

- Abidjan
- Bouaké
- Daloa
- Yamoussoukro
- San-Pédro
- Korhogo
- Man

## 📝 License

Ce projet est destiné à un usage en Côte d'Ivoire pour faciliter la recherche et la location de logements.

## 🤝 Support

Pour toute question ou problème, contactez l'équipe de support LOKI.

---

**LOKI** - Votre partenaire pour la colocation en Côte d'Ivoire 🏠
