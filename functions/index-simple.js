const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Fonction simple pour tester
exports.sendActivationEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Utilisateur non authentifié');
  }
  
  return { success: true, message: "Test réussi" };
});

exports.helloWorld = functions.https.onRequest((req, res) => {
  res.json({ message: "Hello from Firebase!" });
});