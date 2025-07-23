# 🔥 Configuration des règles Firebase Storage

## ⚠️ PROBLÈME ACTUEL

Erreur `403 Forbidden` avec `storage/unauthorized` lors de l'upload d'images.

## 🛠️ SOLUTION

### 1. Accéder aux règles Firebase Storage

1. Allez sur [console.firebase.google.com](https://console.firebase.google.com/)
2. Sélectionnez votre projet `isp-operations`
3. Dans le menu de gauche : **Storage** → **Rules**

### 2. Remplacer les règles actuelles

Copiez-collez ces règles dans l'éditeur :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Règles pour les images d'incidents
    match /incidents/{incidentRef}/{imageFile} {
      // Permettre lecture pour tous les utilisateurs authentifiés
      allow read: if request.auth != null;
      
      // Permettre écriture seulement pour les utilisateurs authentifiés
      // avec validation du type de fichier
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024  // Max 5MB
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Règle générale pour autres fichiers (optionnel)
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Publier les règles

1. Cliquez sur **"Publier"** dans la console Firebase
2. Les nouvelles règles sont immédiatement actives

### 4. Règles de développement temporaires (DANGER ⚠️)

**SEULEMENT pour les tests en développement**, vous pouvez temporairement utiliser :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;  // ⚠️ TRÈS DANGEREUX - NE PAS UTILISER EN PRODUCTION
    }
  }
}
```

**N'oubliez pas de remettre les règles sécurisées avant la mise en production !**

## ✅ Validation des règles

Une fois configurées, testez l'upload d'images dans l'application.

## 📝 Structure des fichiers

Les images sont stockées selon cette structure :
```
incidents/
  ├── 20250723-SEC-001/
  │   ├── image_01_1753263425112.jpg
  │   ├── image_02_1753263425113.png
  │   └── image_03_1753263425114.webp
  └── 20250723-SUR-019/
      ├── image_01_1753263425115.jpg
      └── image_02_1753263425116.png
```

## 🔐 Sécurité

- ✅ Seuls les utilisateurs authentifiés peuvent uploader
- ✅ Taille limitée à 5MB par image
- ✅ Types de fichiers validés (image/*)
- ✅ Organisation par référence d'incident