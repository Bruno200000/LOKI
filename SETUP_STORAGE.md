# 📦 Configuration du Stockage Supabase

Ce guide vous explique comment configurer le stockage (Storage) dans Supabase pour permettre l'upload d'images et de vidéos.

## 🚀 Étapes d'Installation

### **Étape 1 : Accéder à votre Projet Supabase**

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **LOKI**

### **Étape 2 : Créer le Bucket Storage**

1. Dans le menu latéral, cliquez sur **Storage**
2. Cliquez sur **"New bucket"** ou **"Créer un bucket"**
3. Remplissez les informations :
   - **Name** : `house-media`
   - **Public bucket** : ✅ **Coché** (important !)
   - **File size limit** : `10MB` (optionnel)
4. Cliquez sur **"Create bucket"**

### **Étape 3 : Configurer les Politiques de Sécurité**

1. Cliquez sur le bucket **house-media** que vous venez de créer
2. Cliquez sur l'onglet **"Policies"** ou **"Politiques"**
3. Cliquez sur **"New Policy"**

#### **Politique 1 : Lecture Publique**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'house-media' );
```

#### **Politique 2 : Upload pour utilisateurs authentifiés**
```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'house-media' 
  AND auth.role() = 'authenticated'
);
```

#### **Politique 3 : Suppression pour utilisateurs authentifiés**
```sql
CREATE POLICY "Allow authenticated users to delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'house-media'
  AND auth.role() = 'authenticated'
);
```

### **Étape 4 (Alternative) : Utiliser le SQL Editor**

Vous pouvez aussi exécuter le fichier SQL directement :

1. Dans le menu latéral, cliquez sur **SQL Editor**
2. Cliquez sur **"New query"**
3. Copiez et collez le contenu du fichier `supabase/setup-storage.sql`
4. Cliquez sur **"Run"**

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. Allez dans votre application LOKI
2. Connectez-vous en tant que propriétaire
3. Cliquez sur **"Ajouter une propriété"**
4. Essayez de télécharger une image (onglet image)
5. Essayez de télécharger une vidéo (onglet vidéo)
6. Si l'image et/ou la vidéo s'affichent dans l'aperçu, c'est bon ! ✅

## 🔧 Dépannage

### Erreur "Bucket not found"
- Vérifiez que le bucket s'appelle exactement `house-media`
- Vérifiez que le bucket est **public**

### Erreur "Permission denied"
- Vérifiez que les politiques de sécurité sont bien configurées
- Vérifiez que vous êtes bien connecté

### L'image ne s'affiche pas
- Vérifiez que le bucket est **public**
- Vérifiez l'URL de l'image dans la console du navigateur

## 📝 Notes

- **Dossiers de stockage** :
  - Images dans `house-media/images/`
  - Vidéos dans `house-media/videos/`
- **Taille maximale** :
  - Images: 5MB (configurable dans le code)
  - Vidéos: 50MB (configurable dans le code)
- **Formats supportés** :
  - Images: JPG, PNG, GIF, WEBP
  - Vidéos: MP4, WebM, Ogg
- **Stockage** : Les fichiers sont stockés dans Supabase Storage de façon permanente
- **URLs** : Les URLs générées sont publiques et permanentes

## 🎯 Prochaines Étapes

Une fois le stockage configuré, vous pourrez :
- ✅ Uploader des images directement depuis le formulaire
- ✅ Voir un aperçu avant de sauvegarder
- ✅ Les images seront automatiquement hébergées par Supabase
- ✅ Pas besoin de services tiers comme Imgur

---

**Besoin d'aide ?** Consultez la [documentation Supabase Storage](https://supabase.com/docs/guides/storage)
