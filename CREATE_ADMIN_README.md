# Création d'un Administrateur LOKI

Ce guide explique comment ajouter un administrateur dans la base de données LOKI.

## Structure de la base de données

La table `public.profiles` a la structure suivante :
- `id` (uuid) - clé étrangère vers `auth.users(id)`
- `full_name` (text) - nom complet de l'utilisateur
- `role` (text) - rôle de l'utilisateur ('admin', 'owner', 'tenant')
- `created_at` (timestamptz) - date de création
- `phone` (text) - téléphone
- `city` (text) - ville
- `address` (text) - adresse

**Note importante** : La table `profiles` n'a **pas** de champ `email` ni `updated_at`. L'email est stocké dans `auth.users`.

## Prérequis

1. **Clé de service Supabase** : Vous devez obtenir la `service_role_key` de votre projet Supabase
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet
   - Allez dans Settings > API
   - Copiez la `service_role key`

2. **Configuration du fichier .env** :
   ```bash
   cp .env.example .env
   ```
   - Ajoutez votre `SUPABASE_SERVICE_ROLE_KEY` dans le fichier `.env`

## Méthode 1: Script Automatisé (Recommandée)

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Créer l'administrateur** :
   ```bash
   npm run create-admin
   ```

3. **Identifiants créés** :
   - **Email** : `katchabruno52@gmail.com`
   - **Mot de passe** : `44390812`
   - **Rôle** : `admin`

## Méthode 2: Manuel via Supabase Dashboard

1. **Créer l'utilisateur** :
   - Allez sur https://supabase.com/dashboard
   - Authentication > Users > Add user
   - Email : `katchabruno52@gmail.com`
   - Mot de passe : `44390812`
   - Cochez "Email confirm"

2. **Définir le rôle admin** :
   - Allez dans SQL Editor
   - Exécutez cette requête :
   ```sql
   UPDATE public.profiles
   SET role = 'admin', full_name = 'Administrateur LOKI'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'katchabruno52@gmail.com');
   ```

## Vérification

Pour vérifier que l'administrateur a été créé :

```sql
SELECT p.id, u.email, p.full_name, p.role, p.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'katchabruno52@gmail.com';
```

## Utilisation

1. **Accès via le footer** : Un lien "Admin Dashboard" est disponible dans le footer
2. **Route directe** : `/admin` (avec protection par rôle)
3. **Authentification requise** : L'administrateur doit se connecter avec ses identifiants

## Sécurité

- ✅ Le script utilise la clé de service Supabase (admin)
- ✅ Le mot de passe est hashé automatiquement
- ✅ L'email est confirmé automatiquement
- ✅ Le rôle admin est défini dans le profil
- ⚠️ Supprimez le fichier `.env` après usage (contient des clés sensibles)

## Nettoyage

Après avoir créé l'administrateur :

1. Supprimez le fichier `.env` (s'il contient des clés sensibles)
2. Le script `create-admin.js` peut être conservé pour créer d'autres admins si nécessaire
