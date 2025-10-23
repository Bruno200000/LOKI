# 🔍 Guide de diagnostic - AdminDashboard LOKI

Si vous ne voyez pas les utilisateurs et réservations dans le tableau de bord admin, suivez ce guide :

## 1️⃣ Vérifier les données dans la base de données

Exécutez cette commande pour vérifier si des données existent :

```bash
npm run check-db
```

Cette commande va afficher :
- Nombre d'utilisateurs dans `profiles`
- Nombre de réservations dans `bookings`
- Nombre de maisons dans `houses`
- Nombre de paiements dans `payments`

## 2️⃣ Si aucune donnée n'est trouvée

### Créer des utilisateurs de test :

1. **Allez sur votre site LOKI**
2. **Inscrivez-vous** avec quelques comptes (propriétaires et locataires)
3. **Connectez-vous** avec ces comptes pour qu'ils apparaissent dans `profiles`

### Créer des réservations de test :

1. **Connectez-vous** en tant que locataire
2. **Parcourez les maisons** disponibles
3. **Effectuez une réservation** pour créer des données

## 3️⃣ Vérifier les permissions Supabase

Assurez-vous que les politiques RLS (Row Level Security) permettent la lecture :

```sql
-- Vérifier les politiques sur profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Vérifier les politiques sur bookings
SELECT * FROM pg_policies WHERE tablename = 'bookings';
```

## 4️⃣ Vérifier la console du navigateur

1. **Ouvrez** le tableau de bord admin
2. **Ouvrez** la console développeur (F12)
3. **Regardez** les logs 🔍 pour voir les erreurs

Les logs afficheront :
- ✅ Données récupérées avec succès
- ❌ Erreurs de requête

## 5️⃣ Créer l'administrateur

Si vous n'avez pas encore créé l'administrateur :

```bash
# 1. Ajouter la clé de service dans .env
echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key" >> .env

# 2. Créer l'administrateur
npm run create-admin
```

## 6️⃣ Données attendues

Pour tester complètement, vous devriez avoir :

### Utilisateurs :
- ✅ Au moins 1 administrateur
- ✅ Quelques propriétaires
- ✅ Quelques locataires

### Réservations :
- ✅ Des réservations avec différents statuts
- ✅ Des paiements associés

### Maisons :
- ✅ Des propriétés disponibles
- ✅ Des propriétés occupées

## 7️⃣ Scripts de test

Pour créer des données de test rapidement :

```bash
# Vérifier la base de données
npm run check-db

# Créer l'administrateur
npm run create-admin

# Lancer le serveur de développement
npm run dev
```

## 8️⃣ Dépannage

### Problème : "Aucun utilisateur trouvé"
- ✅ Créez des comptes via l'interface utilisateur
- ✅ Vérifiez que les utilisateurs se sont connectés au moins une fois

### Problème : "Aucune réservation trouvée"
- ✅ Effectuez des réservations via l'interface locataire
- ✅ Vérifiez que les réservations ont été confirmées

### Problème : Erreurs de permission
- ✅ Vérifiez les politiques RLS dans Supabase
- ✅ Assurez-vous que l'admin a les bonnes permissions

## 🎯 Résultat attendu

Après avoir suivi ces étapes, vous devriez voir :
- 📊 **Statistiques** mises à jour dynamiquement
- 👥 **Liste des utilisateurs** avec leurs rôles
- 🏠 **Liste des réservations** avec statuts
- 📈 **Graphiques** avec données réelles
- 💰 **Transactions** récentes

**🚀 Le dashboard sera maintenant fonctionnel avec vos données !**
