# 🔐 Configuration Sécurisée

## ⚠️ IMPORTANT - Variables d'environnement

**JAMAIS** committer les fichiers contenant des clés API :
- `.env`
- `.env.production`
- `.env.local`
- `.env.development`

## 📋 Configuration requise

1. **Copiez le fichier template** :
   ```bash
   cp .env.example .env
   ```

2. **Remplacez les valeurs** dans `.env` par vos vraies clés API

3. **Vérifiez que `.env` est ignoré** :
   ```bash
   git status  # .env ne doit PAS apparaître
   ```

## 🔑 Obtenir les clés API

### Firebase
1. Console Firebase : https://console.firebase.google.com/
2. Project Settings > General > Your apps
3. Copiez la configuration

### Google Maps
1. Console Google Cloud : https://console.cloud.google.com/
2. APIs & Services > Credentials
3. Créez une nouvelle clé API avec restrictions

## 🛡️ Sécurité des clés

- ✅ Utilisez des **restrictions IP** pour Google Maps API
- ✅ Limitez les **domaines autorisés** dans Firebase
- ✅ **Régénérez** immédiatement toute clé compromise
- ❌ **JAMAIS** publier de clés dans le code source