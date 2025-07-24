# Guide d'utilisation des API Power Query

Ce guide explique comment connecter Excel Power Query aux données de votre application ISP Operations.

## 📋 Endpoints disponibles

### 1. Données des incidents
- **URL** : `https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com/getIncidentsData`
- **Méthode** : GET
- **Format** : JSON identique à l'export Excel

### 2. Données des cargaisons
- **URL** : `https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com/getCargaisonsData`
- **Méthode** : GET
- **Format** : JSON identique à l'export Excel

### 3. Données des documents saisis
- **URL** : `https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com/getDocumentsData`
- **Méthode** : GET
- **Format** : JSON identique à l'export Excel

## 🔐 Authentification

### Clé API requise
Tous les endpoints nécessitent une clé API pour l'authentification :
- **Clé API** : `isp-operations-powerquery-key-2024-secure`

### Méthodes d'authentification

#### Option 1 : En-tête HTTP (Recommandé)
```
X-API-Key: isp-operations-powerquery-key-2024-secure
```

#### Option 2 : Paramètre URL
```
?api_key=isp-operations-powerquery-key-2024-secure
```

## 📊 Configuration dans Excel Power Query

### Étape 1 : Ouvrir Power Query
1. Dans Excel, allez dans **Données** > **Obtenir des données** > **À partir d'autres sources** > **À partir du web**

### Étape 2 : Configuration de la connexion

#### Pour les incidents :
```
URL : https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com/getIncidentsData?api_key=isp-operations-powerquery-key-2024-secure
```

#### Pour les cargaisons :
```
URL : https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com/getCargaisonsData?api_key=isp-operations-powerquery-key-2024-secure
```

#### Pour les documents :
```
URL : https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com/getDocumentsData?api_key=isp-operations-powerquery-key-2024-secure
```

### Étape 3 : Configuration avancée (Optionnel)

Si vous préférez utiliser l'en-tête d'authentification :

1. Dans Power Query, cliquez sur **Options avancées**
2. Ajoutez un en-tête HTTP :
   - **Nom** : `X-API-Key`
   - **Valeur** : `isp-operations-powerquery-key-2024-secure`

### Étape 4 : Traitement des données

1. Power Query détectera automatiquement le format JSON
2. Cliquez sur **Into Table** pour convertir en tableau
3. Développez la colonne `data` qui contient vos données
4. Les colonnes seront identiques à votre export Excel actuel

## 📋 Structure des réponses

### Format de réponse standard
```json
{
  "success": true,
  "data": [
    {
      "colonne1": "valeur1",
      "colonne2": "valeur2",
      ...
    }
  ],
  "count": 123,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Colonnes des incidents
- Référence
- Date
- Heure
- Zone
- Lieu
- Catégorie
- Type d'incident
- Niveau Impact
- Primo Intervenant
- Intervenants ISP
- Caméras
- Détails de l'incident
- Rédigé par
- Date enregistrement

### Colonnes des cargaisons
- N°
- Date
- Heure
- Vacation
- Zone
- Lieu
- Équipe
- Type Cargaison
- Nombre Cargaison
- Masse Cargaison (kg)
- Entreprise
- Intervenants

### Colonnes des documents
- N°
- Date
- Heure
- Référence
- Vacation
- Zone
- Lieu
- Équipe
- Usager
- Type Document
- Motif Saisie
- Entreprise
- Nom Usager
- Intervenants

## 🔄 Actualisation automatique

### Configuration de l'actualisation
1. Dans Power Query, allez dans **Accueil** > **Actualiser**
2. Configurez l'actualisation automatique :
   - **Données** > **Actualiser tout** > **Propriétés de connexion**
   - Cochez **Actualiser toutes les X minutes**
   - Définissez l'intervalle souhaité

### Actualisation en arrière-plan
- Cochez **Autoriser l'actualisation des données en arrière-plan**
- Vos données seront mises à jour automatiquement

## 🚨 Gestion des erreurs

### Erreurs d'authentification
```json
{
  "error": "Authentification requise",
  "code": "UNAUTHORIZED",
  "message": "Clé API manquante ou invalide"
}
```

### Erreurs de données
```json
{
  "error": "Erreur lors de l'export",
  "code": "EXPORT_ERROR",
  "details": "Description de l'erreur"
}
```

## 🔧 Dépannage

### Problème : Erreur de connexion
- Vérifiez que l'URL est correcte
- Vérifiez que votre projet Firebase est déployé
- Testez l'URL dans un navigateur

### Problème : Authentification échouée
- Vérifiez que la clé API est correcte
- Assurez-vous qu'elle est bien incluse dans l'URL ou l'en-tête

### Problème : Données vides
- Vérifiez que vous avez des données dans votre base Firebase
- Consultez les logs de Firebase Functions pour plus de détails

## 📞 Support

En cas de problème :
1. Vérifiez les logs Firebase Functions
2. Testez les endpoints avec un outil comme Postman
3. Contactez l'administrateur système

## 🔒 Sécurité

**Important** :
- La clé API est sensible, ne la partagez pas
- Utilisez HTTPS uniquement
- Considérez la rotation régulière de la clé API
- En production, stockez la clé dans les variables d'environnement Firebase

## 📈 Performance

- Les données sont mises en cache côté serveur
- L'actualisation recommandée est de 15-30 minutes minimum
- Les gros volumes de données peuvent prendre quelques secondes à charger