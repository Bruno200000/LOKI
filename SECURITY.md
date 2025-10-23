# 🛡️ Guide de Sécurité LOKI Platform

## Vue d'ensemble

Ce document détaille les mesures de sécurité implémentées dans la plateforme LOKI pour protéger contre les attaques courantes et assurer la confidentialité des données utilisateurs.

## 🚨 Vulnérabilités Corrigées

### ✅ Vulnérabilités Critiques
- [x] **Clé API Wave codée en dur** - Migré vers variables d'environnement
- [x] **Mot de passe admin en clair** - Sécurisé dans les variables d'environnement
- [x] **Variables d'environnement exposées** - Ajouté à .gitignore
- [x] **Row Level Security manquant** - Politiques RLS complètes implémentées
- [x] **Validation des entrées absente** - Système de validation complet

### ✅ Vulnérabilités Élevées
- [x] **Rate limiting manquant** - Implémenté pour auth et API
- [x] **Headers de sécurité HTTP** - Configuration complète
- [x] **Politiques CORS insuffisantes** - Configuration sécurisée
- [x] **Logs de sécurité manquants** - Système de logging implémenté

## 🔐 Configuration de Sécurité

### Variables d'environnement (.env)

```bash
# Configuration Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Clé de service Supabase (ADMIN UNIQUEMENT)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Configuration de sécurité des paiements
VITE_WAVE_API_KEY=your_wave_api_key_here
VITE_WAVE_API_SECRET=your_wave_api_secret_here

# Configuration des sessions et sécurité
VITE_SESSION_TIMEOUT=3600000
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_LOCKOUT_DURATION=900000

# Configuration CORS et sécurité
VITE_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Configuration des logs de sécurité
VITE_SECURITY_LOG_LEVEL=warn
VITE_ENABLE_AUDIT_LOG=true
```

### Headers de Sécurité HTTP

Les headers suivants sont configurés automatiquement :

- `X-XSS-Protection: 1; mode=block`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (CSP) complète
- `Strict-Transport-Security` (HSTS)

## 🗄️ Sécurité Base de Données

### Row Level Security (RLS)

RLS est activé sur toutes les tables sensibles avec des politiques granulaires :

#### Profiles
- Les utilisateurs peuvent lire/mettre à jour leur propre profil
- Les admins ont accès complet

#### Houses
- Public peut voir les maisons disponibles
- Propriétaires gèrent leurs propres maisons
- Admins ont accès complet

#### Bookings
- Locataires voient leurs réservations
- Propriétaires voient les réservations de leurs maisons
- Admins ont accès complet

#### Payments
- Utilisateurs voient leurs paiements
- Admins ont accès complet (lecture seule pour les autres)

#### Reviews
- Tout le monde peut lire les avis
- Locataires créent des avis pour leurs réservations
- Admins peuvent modérer

### Contraintes de Sécurité

- **Validation des emails** : Format strict appliqué
- **Validation des téléphones** : Format international supporté
- **Triggers de sécurité** : Empêche suppression des admins
- **Logs de sécurité** : Toutes les actions sensibles sont journalisées

## 🔐 Authentification et Autorisation

### Validation des Entrées

```typescript
// Validation email
SecurityUtils.validateEmail(email: string): ValidationResult

// Validation mot de passe (8+ caractères, majuscules, minuscules, chiffres, spéciaux)
SecurityUtils.validatePassword(password: string): ValidationResult

// Validation nom complet
SecurityUtils.validateFullName(name: string): ValidationResult

// Sanitisation des entrées
SecurityUtils.sanitizeInput(input: string): string
```

### Rate Limiting

- **Inscription** : 3 tentatives par heure par email
- **Connexion** : 5 tentatives par 15 minutes par email
- **API** : Limites configurables par endpoint

### Sessions Sécurisées

- Cookies HTTP-only et secure
- Timeout de session configurable
- Invalidation automatique après déconnexion

## 🚀 Scripts de Sécurité

### Audit de Sécurité

```bash
# Exécuter l'audit de sécurité complet
node security-audit.js

# Vérifier les dépendances
npm audit

# Vérifier les types TypeScript
npm run typecheck
```

### Configuration Production

```bash
# Build de production sécurisé
npm run build

# Vérifier la configuration
npm run lint
```

## 🛡️ Mesures Anti-Attaque

### Protection XSS (Cross-Site Scripting)
- Sanitisation de toutes les entrées utilisateur
- Content Security Policy (CSP) stricte
- Échappement automatique dans les templates

### Protection CSRF (Cross-Site Request Forgery)
- Tokens CSRF sur les formulaires sensibles
- Validation des origines (CORS)
- Cookies SameSite strict

### Protection Injection SQL
- Utilisation de requêtes paramétrées
- Row Level Security (RLS)
- Validation des types de données

### Protection DoS (Denial of Service)
- Rate limiting sur tous les endpoints
- Validation des tailles de payload
- Monitoring des ressources

## 🔍 Monitoring et Logs

### Logs de Sécurité

Tous les événements de sécurité sont journalisés :
- Tentatives de connexion échouées
- Créations de comptes
- Modifications de données sensibles
- Actions administratives

### Alertes de Sécurité

Configuration des alertes pour :
- Tentatives de connexion multiples
- Accès non autorisés
- Modifications de données critiques

## 📋 Checklist de Déploiement

### Avant Production
- [ ] Variables d'environnement configurées
- [ ] Clés API sécurisées
- [ ] HTTPS activé
- [ ] RLS activé en base de données
- [ ] Audit de sécurité exécuté
- [ ] Tests de pénétration effectués

### Monitoring Continu
- [ ] Logs de sécurité surveillés
- [ ] Alertes configurées
- [ ] Mises à jour de sécurité appliquées
- [ ] Audits de sécurité réguliers

## 🆘 Support Sécurité

En cas de problème de sécurité :

1. **Incident Critique** : Contacter immédiatement l'administrateur
2. **Vulnérabilité** : Créer un ticket avec les détails
3. **Question** : Consulter la documentation ou l'équipe technique

## 📚 Ressources Supplémentaires

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/security)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
- [Web Security Academy](https://portswigger.net/web-security)
