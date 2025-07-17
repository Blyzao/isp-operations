const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Initialiser Firebase Admin une seule fois
if (!admin.apps.length) {
  admin.initializeApp();
}

// Configuration email
const EMAIL_CONFIG = {
  user: "siisps2022@gmail.com",
  pass: "cipk uggq lruq xxqm",
  service: "gmail",
  support: "support@nexion.com",
};

const FRONTEND_URL = "http://localhost:5173";

// Fonction pour créer le transporteur email (uniquement quand nécessaire)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: EMAIL_CONFIG.service,
    auth: {
      user: EMAIL_CONFIG.user,
      pass: EMAIL_CONFIG.pass,
    },
  });
};

// Template email
const getEmailTemplate = (content, title, type = "default") => {
  const iconMap = {
    activation: "✨",
    reset: "🔐",
    confirmation: "✅",
    login: "🔑",
    default: "📧",
  };

  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
      .content { padding: 30px; line-height: 1.6; }
      .cta-container { text-align: center; margin: 30px 0; }
      .cta-button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px; }
      .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      .welcome-message { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; }
      .security-notice { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${iconMap[type]} ${title}</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© 2024 Nexion - Plateforme sécurisée de gestion des données</p>
        <p>Si vous avez des questions, contactez-nous à ${EMAIL_CONFIG.support}</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

// EMAIL D'ACTIVATION DE COMPTE
exports.sendActivationEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Utilisateur non authentifié');
  }
  
  const email = context.auth.token.email;
  const displayName = context.auth.token.name || "Utilisateur";

  if (!email || !email.includes("@")) {
    console.error("Email invalide:", email);
    throw new functions.https.HttpsError('invalid-argument', 'Email invalide');
  }

  try {
    const transporter = createTransporter();

    const actionCodeSettings = {
      url: `${FRONTEND_URL}/login?mode=verifyEmail`,
      handleCodeInApp: true,
    };

    const link = await admin
      .auth()
      .generateEmailVerificationLink(email, actionCodeSettings);

    const content = `
      <div class="welcome-message">
        <p>🎉 Bienvenue sur Nexion, ${displayName} !</p>
      </div>
      
      <h2>Activez votre compte pour commencer</h2>
      <p>Merci de rejoindre notre plateforme sécurisée de gestion des données des opérations de sûreté.</p>
      <p>Votre compte a été créé avec succès, mais vous devez confirmer votre adresse email pour accéder à toutes les fonctionnalités.</p>
      
      <div class="cta-container">
        <a href="${link}" class="cta-button">✨ Activer mon compte</a>
      </div>
      
      <p><strong>Prochaines étapes :</strong></p>
      <ul>
        <li>Confirmez votre email en cliquant sur le bouton ci-dessus</li>
        <li>Complétez votre profil utilisateur</li>
        <li>Explorez les fonctionnalités de la plateforme</li>
      </ul>
      
      <div class="security-notice">
        <p>🔒 <strong>Sécurité :</strong> Si vous n'avez pas créé ce compte, ignorez cet email ou contactez notre support.</p>
      </div>
    `;

    const mailOptions = {
      from: `Nexion <${EMAIL_CONFIG.user}>`,
      to: email,
      subject: "Activer votre compte Nexion",
      html: getEmailTemplate(
        content,
        "Activation de votre compte",
        "activation"
      ),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email d'activation envoyé à ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email d'activation:", error);
    throw new functions.https.HttpsError('internal', 'Erreur lors de l\'envoi de l\'email', error.message);
  }
});