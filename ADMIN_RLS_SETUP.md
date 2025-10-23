# 🛡️ Guide d'installation - Politiques RLS AdminDashboard

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer les politiques de sécurité Supabase (RLS) pour permettre à l'AdminDashboard d'accéder aux données.

## 🚀 Installation

### 1️⃣ Accéder à Supabase Dashboard

1. **Allez sur** [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sélectionnez** votre projet LOKI
3. **Allez dans** **SQL Editor** (menu latéral)

### 2️⃣ Exécuter les politiques

1. **Copiez** tout le contenu du fichier `admin_rls_policies.sql`
2. **Collez** dans le SQL Editor
3. **Cliquez sur** **"Run"** pour exécuter

### 3️⃣ Vérifier l'installation

Dans le SQL Editor, exécutez cette requête pour vérifier :

```sql
-- Vérifier les politiques créées
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Résultat attendu :**
- ✅ `profiles` - 6 politiques (2 admin + 2 user + 2 owner/tenant)
- ✅ `bookings` - 4 politiques (admin only)
- ✅ `houses` - 4 politiques (admin + owner)
- ✅ `payments` - 4 politiques (admin + user)
- ✅ `reviews` - 2 politiques (admin only)

## 🔐 Fonctionnement des politiques

### Pour l'administrateur (`role = 'admin'`) :
- ✅ **Accès complet** à toutes les données
- ✅ **Peut lire** tous les profils, réservations, maisons, paiements
- ✅ **Peut modifier** toutes les données
- ✅ **Peut supprimer** n'importe quel contenu

### Pour les utilisateurs normaux :
- ✅ **Profil personnel** : lecture/écriture
- ✅ **Leurs réservations** : lecture
- ✅ **Leurs paiements** : lecture
- ✅ **Leurs maisons** (propriétaires) : gestion complète

### Pour les propriétaires :
- ✅ **Gestion de leurs maisons**
- ✅ **Visualisation des réservations** de leurs propriétés
- ✅ **Visualisation des paiements** liés

## 🧪 Test des permissions

### Test 1 : Connexion admin
1. **Connectez-vous** avec `katchabruno52@gmail.com`
2. **Accédez** au dashboard admin `/admin`
3. **Vérifiez** que toutes les données s'affichent

### Test 2 : Connexion utilisateur normal
1. **Connectez-vous** avec un compte locataire
2. **Essayez** d'accéder à `/admin`
3. **Résultat attendu** : Accès refusé (redirection)

## 🔧 Dépannage

### Problème : "Aucune donnée trouvée"
**Solution :**
```sql
-- Vérifier si RLS est activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'bookings', 'houses', 'payments');
```

**Doit retourner :** `rowsecurity = 't'` pour toutes les tables

### Problème : "Permission denied"
**Solution :**
```sql
-- Vérifier le rôle de l'utilisateur connecté
SELECT id, email, role
FROM public.profiles
WHERE id = auth.uid();
```

### Problème : "Politique non trouvée"
**Solution :**
```sql
-- Recréer les politiques manuellement
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles" ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

## 📊 Tables concernées

| Table | Politiques admin | Politiques user | RLS |
|-------|------------------|-----------------|-----|
| `profiles` | ✅ SELECT/INSERT/UPDATE/DELETE | ✅ SELECT/UPDATE (own) | ✅ |
| `bookings` | ✅ SELECT/INSERT/UPDATE/DELETE | ✅ SELECT (own) | ✅ |
| `houses` | ✅ SELECT/INSERT/UPDATE/DELETE | ✅ ALL (owner) | ✅ |
| `payments` | ✅ SELECT/INSERT/UPDATE/DELETE | ✅ SELECT (own) | ✅ |
| `reviews` | ✅ SELECT/DELETE | ❌ | ✅ |

## 🎯 Résultat final

Après installation :

1. **AdminDashboard** affiche toutes les données
2. **Utilisateurs** ne peuvent accéder qu'à leurs données
3. **Sécurité** renforcée avec RLS
4. **Logs de console** montrent les données récupérées

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de la console du navigateur
2. Exécutez `npm run check-db` pour diagnostiquer
3. Consultez le fichier `ADMIN_DASHBOARD_DIAGNOSTIC.md`

**🚀 Votre AdminDashboard est maintenant sécurisé et fonctionnel !**
