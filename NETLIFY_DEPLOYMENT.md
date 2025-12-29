# Guide de déploiement Netlify - Résolution des erreurs

## Problème identifié
Le build Netlify échoue avec "exit code 1" mais sans stack trace détaillé.

## Cause probable
1. **Variables d'environnement vides** : VITE_SUPABASE_* sont listées mais probablement vides
2. **Version Node.js** : Node 22.21.0 peut causer des problèmes avec des modules natifs

## Solution

### 1. Configuration des variables d'environnement (CRITIQUE)

Dans Netlify Dashboard > Site Settings > Build & Deploy > Environment Variables :

```
VITE_SUPABASE_URL = https://tcvvczdwchowscaaeezd.supabase.co
VITE_SUPABASE_ANON_KEY = your_anon_key_here
```

### 2. Changer la version Node.js

Option A - Fichier .nvmrc (recommandé) :
- Le fichier .nvmrc contient maintenant "18"
- Netlify respectera automatiquement cette configuration

Option B - Configuration manuelle dans Netlify :
- Site Settings > Build & Deploy > Node version > "18.20.4"

### 3. Vérification du build local

Testez avec les mêmes conditions que Netlify :

```bash
# Nettoyer complètement
rm -rf node_modules package-lock.json
npm install

# Build avec variables d'environnement
VITE_SUPABASE_URL=https://tcvvczdwchowscaaeezd.supabase.co \
VITE_SUPABASE_ANON_KEY=your_anon_key_here \
npm run build
```

### 4. Configuration Netlify complète

```
Build command: npm run build:netlify
Publish directory: dist
Node version: 18.20.4 (ou laisser Netlify détecter via .nvmrc)

**Configuration Netlify.toml** :
Le fichier netlify.toml configure automatiquement :
- Build command : npm run build:netlify
- Publish directory : dist  
- Node version : 18
- SPA redirects pour le routing client-side

Environment Variables:
- VITE_SUPABASE_URL: https://tcvvczdwchowscaaeezd.supabase.co
- VITE_SUPABASE_ANON_KEY: your_anon_key_here
```

### 5. Debugging

Si le problème persiste :
1. Activer les logs verbeux dans Netlify
2. Vérifier que les variables d'environnement ont bien des valeurs
3. Tester avec Node 20 si Node 18 ne fonctionne pas

### 6. Fichiers modifiés

- ✅ package.json : Ajout de "engines": {"node": "18.x"}
- ✅ .nvmrc : Créé avec "18"
- ✅ .env.example : Mis à jour avec les bonnes valeurs
- ✅ README.md : Ajout de la section déploiement détaillée
