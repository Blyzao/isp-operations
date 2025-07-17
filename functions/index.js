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

// Template email cohérent avec le style de l'application
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
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        margin: 0; 
        padding: 40px 20px;
        line-height: 1.6;
      }
      .email-wrapper { 
        max-width: 600px; 
        margin: 0 auto;
      }
      .container { 
        background: white; 
        border-radius: 16px; 
        overflow: hidden; 
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border: 1px solid #e2e8f0;
      }
      .header { 
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1d4ed8 100%); 
        color: white; 
        padding: 40px 30px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      .header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        opacity: 0.3;
      }
      .header-content { position: relative; z-index: 1; }
      .logo { 
        font-size: 32px; 
        font-weight: 800; 
        letter-spacing: -0.5px;
        margin-bottom: 8px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .header h1 { 
        font-size: 24px; 
        font-weight: 600; 
        margin-bottom: 8px;
        opacity: 0.95;
      }
      .header p { 
        font-size: 16px; 
        opacity: 0.9;
        font-weight: 400;
      }
      .content { 
        padding: 40px 30px;
        color: #374151;
        font-size: 16px;
      }
      .content h2 {
        color: #1f2937;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 16px;
        margin-top: 24px;
      }
      .content p {
        margin-bottom: 16px;
        color: #4b5563;
      }
      .content ul {
        margin: 16px 0;
        padding-left: 20px;
      }
      .content li {
        margin-bottom: 8px;
        color: #6b7280;
      }
      .cta-container { 
        text-align: center; 
        margin: 40px 0;
      }
      .cta-button { 
        display: inline-block; 
        padding: 16px 32px; 
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); 
        color: white; 
        text-decoration: none; 
        border-radius: 12px; 
        font-weight: 600;
        font-size: 16px;
        margin: 10px;
        transition: all 0.3s ease;
        box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
        border: 1px solid rgba(255,255,255,0.1);
      }
      .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 20px -3px rgba(59, 130, 246, 0.5);
      }
      .welcome-message { 
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); 
        padding: 20px; 
        border-radius: 12px; 
        margin: 24px 0;
        border-left: 4px solid #10b981;
      }
      .security-notice { 
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
        padding: 20px; 
        border-radius: 12px; 
        margin: 24px 0;
        border-left: 4px solid #f59e0b;
      }
      .info-box {
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        padding: 20px;
        border-radius: 12px;
        margin: 24px 0;
        border-left: 4px solid #3b82f6;
      }
      .footer { 
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
        padding: 30px; 
        text-align: center; 
        color: #6b7280; 
        font-size: 14px;
        border-top: 1px solid #e5e7eb;
      }
      .footer-logo {
        font-weight: 700;
        color: #1e3a8a;
        font-size: 18px;
        margin-bottom: 8px;
      }
      .footer p {
        margin-bottom: 8px;
      }
      .footer a {
        color: #3b82f6;
        text-decoration: none;
      }
      .divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
        margin: 24px 0;
      }
      
      /* Responsive */
      @media (max-width: 600px) {
        body { padding: 20px 10px; }
        .header, .content { padding: 30px 20px; }
        .header h1 { font-size: 20px; }
        .logo { font-size: 28px; }
        .cta-button { 
          padding: 14px 28px; 
          font-size: 15px;
          display: block;
          margin: 20px auto;
          max-width: 280px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="container">
        <div class="header">
          <div class="header-content">
            <div class="logo">Nexion</div>
            <h1>${iconMap[type]} ${title}</h1>
            <p>Plateforme sécurisée de gestion des données</p>
          </div>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <div class="footer-logo">Nexion</div>
          <p>© 2024 Nexion - Plateforme sécurisée de gestion des données des opérations de sûreté</p>
          <p>Si vous avez des questions, contactez-nous à <a href="mailto:${EMAIL_CONFIG.support}">${EMAIL_CONFIG.support}</a></p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};

// EMAIL D'ACTIVATION DE COMPTE (VERSION CALLABLE)
exports.sendActivationEmail = functions.https.onCall(async (data, context) => {
  console.log("🔵 sendActivationEmail appelée");
  console.log("Context:", context);
  
  if (!context.auth) {
    console.error("❌ Utilisateur non authentifié");
    throw new functions.https.HttpsError('unauthenticated', 'Utilisateur non authentifié');
  }
  
  const email = context.auth.token.email;
  const displayName = context.auth.token.name || "Utilisateur";
  
  console.log("📧 Email:", email);
  console.log("👤 DisplayName:", displayName);

  if (!email || !email.includes("@")) {
    console.error("❌ Email invalide:", email);
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
        <p><strong>🎉 Bienvenue sur Nexion, ${displayName} !</strong></p>
        <p>Votre compte a été créé avec succès sur notre plateforme sécurisée.</p>
      </div>
      
      <h2>Activez votre compte pour commencer</h2>
      <p>Merci de rejoindre notre plateforme sécurisée de gestion des données des opérations de sûreté. Pour accéder à toutes les fonctionnalités, vous devez confirmer votre adresse email.</p>
      
      <div class="cta-container">
        <a href="${link}" class="cta-button">✨ Activer mon compte</a>
      </div>
      
      <div class="info-box">
        <h3 style="margin-bottom: 12px; color: #1e3a8a;">📋 Prochaines étapes :</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Confirmez votre email en cliquant sur le bouton ci-dessus</li>
          <li>Complétez votre profil utilisateur</li>
          <li>Explorez les fonctionnalités de la plateforme</li>
        </ul>
      </div>
      
      <div class="divider"></div>
      
      <div class="security-notice">
        <p><strong>🔒 Sécurité :</strong> Si vous n'avez pas créé ce compte, ignorez cet email ou contactez notre support.</p>
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
    console.log(`✅ Email d'activation envoyé à ${email}`);
    return { success: true, message: "Email envoyé avec succès" };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email d'activation:", error);
    throw new functions.https.HttpsError('internal', 'Erreur lors de l\'envoi de l\'email', error.message);
  }
});

// EMAIL D'ACTIVATION DE COMPTE (VERSION HTTP POUR TEST)
exports.sendActivationEmailHttp = functions.https.onRequest(async (req, res) => {
  // Headers CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).send("");
    return;
  }

  console.log("🔵 sendActivationEmailHttp appelée");
  const email = req.body.email || req.query.email;
  
  console.log("📧 Email reçu:", email);

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      error: "Email invalide ou manquant",
      code: "INVALID_EMAIL",
    });
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
        <p><strong>🎉 Bienvenue sur Nexion !</strong></p>
        <p>Votre compte a été créé avec succès sur notre plateforme sécurisée.</p>
      </div>
      
      <h2>Activez votre compte pour commencer</h2>
      <p>Merci de rejoindre notre plateforme sécurisée de gestion des données des opérations de sûreté. Pour accéder à toutes les fonctionnalités, vous devez confirmer votre adresse email.</p>
      
      <div class="cta-container">
        <a href="${link}" class="cta-button">✨ Activer mon compte</a>
      </div>
      
      <div class="divider"></div>
      
      <div class="security-notice">
        <p><strong>🔒 Sécurité :</strong> Si vous n'avez pas créé ce compte, ignorez cet email ou contactez notre support.</p>
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
    console.log(`✅ Email d'activation HTTP envoyé à ${email}`);

    res.status(200).json({
      success: true,
      message: "Email d'activation envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email d'activation HTTP:", error);
    res.status(500).json({
      error: "Erreur lors de l'envoi de l'email d'activation",
      code: "SEND_ERROR",
      details: error.message,
    });
  }
});

// =====================================================
// EMAIL DE VÉRIFICATION (VERSION HTTP)
// =====================================================
exports.sendEmailVerification = functions.https.onRequest(async (req, res) => {
  // Headers CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).send("");
    return;
  }

  console.log("🔵 sendEmailVerification HTTP appelée");
  const email = req.body.email || req.query.email;
  console.log("📧 Email reçu:", email);

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      error: "Email invalide ou manquant",
      code: "INVALID_EMAIL",
    });
  }

  try {
    // Vérifier si l'utilisateur existe
    const user = await admin.auth().getUserByEmail(email);
    console.log("👤 Utilisateur trouvé:", user.uid);

    const transporter = createTransporter();

    const actionCodeSettings = {
      url: `${FRONTEND_URL}/login?mode=verifyEmail`,
      handleCodeInApp: true,
    };

    const link = await admin
      .auth()
      .generateEmailVerificationLink(email, actionCodeSettings);

    const content = `
      <h2>Vérifiez votre adresse email</h2>
      <p>Pour finaliser l'activation de votre compte, nous devons vérifier votre adresse email. Cliquez sur le bouton ci-dessous pour confirmer votre email.</p>
      
      <div class="cta-container">
        <a href="${link}" class="cta-button">✨ Vérifier mon email</a>
      </div>
      
      <div class="info-box">
        <p><strong>💡 Astuce :</strong> Vérifiez aussi votre dossier spam si vous ne voyez pas l'email.</p>
      </div>
      
      <div class="divider"></div>
      
      <div class="security-notice">
        <p><strong>🔒 Sécurité :</strong> Ce lien expire dans 1 heure pour votre sécurité.</p>
      </div>
    `;

    const mailOptions = {
      from: `Nexion <${EMAIL_CONFIG.user}>`,
      to: email,
      subject: "Vérification d'email - Nexion",
      html: getEmailTemplate(content, "Vérification d'email", "activation"),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de vérification envoyé à ${email}`);

    res.status(200).json({
      message: "Email de vérification envoyé avec succès",
      success: true,
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email de vérification:", error);

    if (error.code === "auth/user-not-found") {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
        code: "USER_NOT_FOUND",
      });
    }

    res.status(500).json({
      error: "Erreur lors de l'envoi de l'email de vérification",
      code: "SEND_ERROR",
      details: error.message,
    });
  }
});

// =====================================================
// EMAIL DE RÉINITIALISATION DE MOT DE PASSE (VERSION HTTP)
// =====================================================
exports.sendPasswordResetEmail = functions.https.onRequest(async (req, res) => {
  // Headers CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).send("");
    return;
  }

  console.log("🔵 sendPasswordResetEmail HTTP appelée");
  const email = req.body.email || req.query.email;
  console.log("📧 Email reçu:", email);

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      error: "Email invalide ou manquant",
      code: "INVALID_EMAIL",
    });
  }

  try {
    // Vérifier si l'utilisateur existe
    const user = await admin.auth().getUserByEmail(email);
    console.log("👤 Utilisateur trouvé:", user.uid);

    const transporter = createTransporter();

    const actionCodeSettings = {
      url: `${FRONTEND_URL}/reset-password`,
      handleCodeInApp: true,
    };

    const link = await admin
      .auth()
      .generatePasswordResetLink(email, actionCodeSettings);

    const content = `
      <h2>Réinitialisation de votre mot de passe</h2>
      <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Nexion. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.</p>
      
      <div class="cta-container">
        <a href="${link}" class="cta-button">🔐 Réinitialiser mon mot de passe</a>
      </div>
      
      <div class="info-box">
        <p><strong>⏰ Important :</strong> Ce lien expire dans 1 heure pour votre sécurité.</p>
      </div>
      
      <div class="divider"></div>
      
      <div class="security-notice">
        <p><strong>⚠️ Attention :</strong> Si vous n'avez pas fait cette demande, ignorez cet email et votre mot de passe restera inchangé.</p>
      </div>
    `;

    const mailOptions = {
      from: `Nexion <${EMAIL_CONFIG.user}>`,
      to: email,
      subject: "Réinitialisation de mot de passe Nexion",
      html: getEmailTemplate(
        content,
        "Réinitialisation de mot de passe",
        "reset"
      ),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de réinitialisation envoyé à ${email}`);

    res.status(200).json({
      message: "Email de réinitialisation envoyé avec succès",
      success: true,
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email de réinitialisation:", error);

    if (error.code === "auth/user-not-found") {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
        code: "USER_NOT_FOUND",
      });
    }

    res.status(500).json({
      error: "Erreur lors de l'envoi de l'email de réinitialisation",
      code: "SEND_ERROR",
      details: error.message,
    });
  }
});

// =====================================================
// EMAIL DE CONFIRMATION DE CHANGEMENT DE MOT DE PASSE (VERSION HTTP)
// =====================================================
exports.sendPasswordChangeConfirmation = functions.https.onRequest(async (req, res) => {
  // Headers CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).send("");
    return;
  }

  console.log("🔵 sendPasswordChangeConfirmation HTTP appelée");
  const email = req.body.email || req.query.email;
  const userId = req.body.userId || req.query.userId;
  console.log("📧 Email reçu:", email);
  console.log("👤 UserId reçu:", userId);

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      error: "Email invalide ou manquant",
      code: "INVALID_EMAIL",
    });
  }

  try {
    const transporter = createTransporter();

    const content = `
      <div class="welcome-message">
        <p><strong>✅ Mot de passe modifié avec succès !</strong></p>
        <p>Votre mot de passe a été modifié le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}.</p>
      </div>
      
      <h2>Votre compte est maintenant sécurisé</h2>
      <p>Votre nouveau mot de passe est maintenant actif. Vous pouvez vous connecter à votre compte Nexion en utilisant vos nouvelles informations d'identification.</p>
      
      <div class="cta-container">
        <a href="${FRONTEND_URL}/login" class="cta-button">🔑 Se connecter</a>
      </div>
      
      <div class="info-box">
        <h3 style="margin-bottom: 12px; color: #1e3a8a;">🔒 Rappels de sécurité :</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Ne partagez jamais votre mot de passe</li>
          <li>Déconnectez-vous après chaque session</li>
          <li>Signalez toute activité suspecte</li>
        </ul>
      </div>
      
      <div class="divider"></div>
      
      <div class="security-notice">
        <p><strong>🚨 Activité non autorisée ?</strong> Si vous n'avez pas effectué ce changement, contactez immédiatement notre support à ${EMAIL_CONFIG.support}</p>
      </div>
    `;

    const mailOptions = {
      from: `Nexion <${EMAIL_CONFIG.user}>`,
      to: email,
      subject: "Confirmation de changement de mot de passe Nexion",
      html: getEmailTemplate(
        content,
        "Changement de mot de passe",
        "confirmation"
      ),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmation envoyé à ${email}`);

    // Optionnel : Enregistrer l'événement dans Firestore
    if (userId) {
      try {
        const userRef = admin.firestore().collection("users").doc(userId);
        await userRef.update({
          lastPasswordChange: admin.firestore.FieldValue.serverTimestamp(),
          passwordChangeNotificationSent: true,
        });
        console.log("📝 Événement enregistré dans Firestore");
      } catch (firestoreError) {
        console.error("⚠️ Erreur Firestore (non critique):", firestoreError);
      }
    }

    res.status(200).json({
      message: "Email de confirmation envoyé avec succès",
      success: true,
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email de confirmation:", error);
    res.status(500).json({
      error: "Erreur lors de l'envoi de l'email de confirmation",
      code: "SEND_ERROR",
      details: error.message,
    });
  }
});

// =====================================================
// CRÉATION D'UTILISATEUR PAR ADMIN (VERSION HTTP)
// =====================================================
exports.createUserByAdmin = functions.https.onRequest(async (req, res) => {
  // Headers CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).send("");
    return;
  }

  console.log("🔵 createUserByAdmin HTTP appelée");
  const { email, password, displayName, profil, emailProfil, fonction, active } = req.body;
  
  console.log("📧 Email:", email);
  console.log("👤 DisplayName:", displayName);
  console.log("🔧 Profil:", profil);
  console.log("📧 EmailProfil:", emailProfil);
  console.log("💼 Fonction:", fonction);
  console.log("✅ Active:", active);

  if (!email || !password || !displayName || !profil) {
    return res.status(400).json({
      error: "Données manquantes (email, password, displayName, profil requis)",
      code: "MISSING_DATA",
    });
  }

  if (!email.includes("@")) {
    return res.status(400).json({
      error: "Email invalide",
      code: "INVALID_EMAIL",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Le mot de passe doit contenir au moins 6 caractères",
      code: "WEAK_PASSWORD",
    });
  }

  try {
    // Créer l'utilisateur avec l'Admin SDK (ne connecte pas l'utilisateur)
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: false,
    });

    console.log("✅ Utilisateur créé avec UID:", userRecord.uid);

    // Ajouter les données utilisateur à Firestore
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      nom: displayName,
      email: email,
      profil: profil,
      emailProfil: emailProfil || "niveau1",
      fonction: fonction || "",
      active: active !== undefined ? active : true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ Données utilisateur ajoutées à Firestore");

    // Envoyer l'email d'activation
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
          <p><strong>🎉 Bienvenue sur Nexion, ${displayName} !</strong></p>
          <p>Votre compte a été créé avec succès sur notre plateforme sécurisée.</p>
        </div>
        
        <h2>Activez votre compte pour commencer</h2>
        <p>Merci de rejoindre notre plateforme sécurisée de gestion des données des opérations de sûreté. Pour accéder à toutes les fonctionnalités, vous devez confirmer votre adresse email.</p>
        
        <div class="cta-container">
          <a href="${link}" class="cta-button">✨ Activer mon compte</a>
        </div>
        
        <div class="info-box">
          <h3 style="margin-bottom: 12px; color: #1e3a8a;">📋 Prochaines étapes :</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Confirmez votre email en cliquant sur le bouton ci-dessus</li>
            <li>Complétez votre profil utilisateur</li>
            <li>Explorez les fonctionnalités de la plateforme</li>
          </ul>
        </div>
        
        <div class="divider"></div>
        
        <div class="security-notice">
          <p><strong>🔒 Sécurité :</strong> Si vous n'avez pas créé ce compte, ignorez cet email ou contactez notre support.</p>
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
      console.log(`✅ Email d'activation envoyé à ${email}`);
    } catch (emailError) {
      console.error("⚠️ Erreur lors de l'envoi de l'email (non critique):", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Utilisateur créé avec succès",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        profil: profil,
      },
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'utilisateur:", error);
    
    let errorMessage = "Erreur lors de la création de l'utilisateur";
    let errorCode = "CREATE_ERROR";
    
    if (error.code === "auth/email-already-exists") {
      errorMessage = "Un compte avec cet email existe déjà";
      errorCode = "EMAIL_EXISTS";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Format d'email invalide";
      errorCode = "INVALID_EMAIL";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Le mot de passe est trop faible";
      errorCode = "WEAK_PASSWORD";
    }

    res.status(500).json({
      error: errorMessage,
      code: errorCode,
      details: error.message,
    });
  }
});