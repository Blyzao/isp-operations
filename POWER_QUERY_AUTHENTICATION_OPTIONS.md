# Options d'authentification pour Power Query

Après avoir redéployé les fonctions, vous aurez **3 options** d'authentification :

## 🔐 Option 1 : Authentication basique (Recommandée pour Power Query)

### Dans Power Query Excel :
1. **Données** > **Obtenir des données** > **À partir du web**
2. URL simple (sans paramètres) :
   ```
   https://us-central1-isp-operations.cloudfunctions.net/getIncidentsData
   ```
3. Quand Power Query demande l'authentification, choisissez **"De base"**
4. Saisissez :
   - **Nom d'utilisateur** : `powerquery-user`
   - **Mot de passe** : `isp-operations-2024-secure`

## 🔐 Option 2 : Paramètres dans l'URL

URL avec les paramètres d'authentification :
```
https://us-central1-isp-operations.cloudfunctions.net/getIncidentsData?username=powerquery-user&password=isp-operations-2024-secure
```

## 🔐 Option 3 : Clé API (si ça fonctionne)

URL avec clé API :
```
https://us-central1-isp-operations.cloudfunctions.net/getIncidentsData?api_key=isp-operations-powerquery-key-2024-secure
```

## 🚀 Étapes après redéploiement

1. **Attendez** que le redéploiement se termine
2. **Testez** l'Option 1 (authentification basique) en premier
3. Si ça ne fonctionne pas, essayez l'Option 2 (paramètres URL)

## 📡 URLs complètes pour les 3 endpoints

### Incidents (Option 2 - Paramètres URL)
```
https://us-central1-isp-operations.cloudfunctions.net/getIncidentsData?username=powerquery-user&password=isp-operations-2024-secure
```

### Cargaisons (Option 2 - Paramètres URL)
```
https://us-central1-isp-operations.cloudfunctions.net/getCargaisonsData?username=powerquery-user&password=isp-operations-2024-secure
```

### Documents (Option 2 - Paramètres URL)
```
https://us-central1-isp-operations.cloudfunctions.net/getDocumentsData?username=powerquery-user&password=isp-operations-2024-secure
```

## 🧪 Test rapide

Testez dans votre navigateur une des URLs avec paramètres. Vous devriez voir les données JSON.

L'**Option 1** (authentification basique) est généralement la plus compatible avec Power Query Excel.