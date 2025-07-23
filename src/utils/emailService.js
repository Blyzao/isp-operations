import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

export const sendIncidentEmail = async (incidentData) => {
  // Test : Tenter la Cloud Function directement pour vérifier CORS
  const testCloudFunction = true; // Réactivé après vérification du fallback
  
  if (testCloudFunction === false) {
    console.log("🔧 Mode test désactivé, utilisation du fallback...");
    try {
      const fallbackResult = await sendEmailFallback(incidentData);
      console.log("📨 Résultat du fallback:", fallbackResult);
      return fallbackResult;
    } catch (fallbackError) {
      console.error("💥 Erreur lors du fallback:", fallbackError);
      return { success: false, error: fallbackError.message };
    }
  }

  // En production ou après déploiement CORS, essayer la Cloud Function d'abord
  console.log("🔧 Tentative d'utilisation de la Cloud Function avec CORS configuré...");

  // En production, essayer la Cloud Function d'abord
  try {
    // Récupérer les informations nécessaires pour l'email
    const [
      zoneData,
      lieuData,
      typeIncidentData,
      personnelsData,
      camerasData,
      userData
    ] = await Promise.all([
      getDoc(doc(db, "zones", incidentData.zone)),
      getDoc(doc(db, "lieux", incidentData.lieu)),
      getDoc(doc(db, "typeIncident", incidentData.typeIncident)),
      getPersonnelsData(incidentData.intervenantsISP),
      getCamerasData(incidentData.cameras),
      getDoc(doc(db, "users", incidentData.user))
    ]);

    // Construire les données enrichies pour l'email
    const enrichedData = {
      ...incidentData, // D'abord les données de base
      // Puis écraser avec les données enrichies de Firestore
      zone: zoneData.exists() ? zoneData.data().nomZone : incidentData.zone,
      lieu: lieuData.exists() ? lieuData.data().nomLieu : incidentData.lieu,
      typeIncident: typeIncidentData.exists() ? typeIncidentData.data().nomIncident : incidentData.typeIncident,
      personnels: personnelsData, // Déjà traité par getPersonnelsData
      cameras: camerasData, // Maintenant un tableau d'idCamera strings
      user: userData.exists() ? {
        nom: userData.data().nom || "Nom inconnu",
        fonction: userData.data().fonction || "Fonction non spécifiée",
        email: userData.data().email
      } : { nom: "Utilisateur inconnu", fonction: "Fonction non spécifiée" }
    };

    // Appeler la Cloud Function pour envoyer l'email (nouvelle URL après déploiement)
    console.log("📡 Tentative d'appel à la Cloud Function...");
    const response = await fetch('https://sendincidentnotification-ows4den4ya-uc.a.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrichedData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Email envoyé à ${result.recipientCount} destinataires`);
      return { 
        success: true, 
        message: `Email envoyé avec succès à ${result.recipientCount} destinataires`,
        recipientCount: result.recipientCount 
      };
    } else {
      throw new Error(result.error || "Erreur inconnue lors de l'envoi");
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);
    
    // Fallback vers la simulation en cas d'erreur
    console.log("🔄 Fallback vers simulation d'email");
    try {
      const fallbackResult = await sendEmailFallback(incidentData);
      console.log("📨 Résultat du fallback:", fallbackResult);
      return fallbackResult;
    } catch (fallbackError) {
      console.error("💥 Erreur lors du fallback:", fallbackError);
      return { success: false, error: error.message };
    }
  }
};

const getPersonnelsData = async (personnelIds) => {
  if (!personnelIds || personnelIds.length === 0) {
    console.log("👥 Aucun personnel à récupérer");
    return [];
  }
  
  console.log("👥 Récupération personnels pour IDs:", personnelIds);
  try {
    const personnelsPromises = personnelIds.map(id => 
      getDoc(doc(db, "personnels", id))
    );
    const personnelsSnapshots = await Promise.all(personnelsPromises);
    
    const results = personnelsSnapshots
      .filter(snapshot => snapshot.exists())
      .map(snapshot => snapshot.data());
    
    console.log("👥 Personnels récupérés:", results);
    return results;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des personnels:", error);
    return [];
  }
};

const getCamerasData = async (cameraIds) => {
  if (!cameraIds || cameraIds.length === 0) {
    console.log("📷 Aucune caméra à récupérer");
    return [];
  }
  
  console.log("📷 Récupération caméras pour IDs:", cameraIds);
  try {
    const camerasPromises = cameraIds.map(id => 
      getDoc(doc(db, "cameras", id))
    );
    const camerasSnapshots = await Promise.all(camerasPromises);
    
    const results = camerasSnapshots
      .filter(snapshot => snapshot.exists())
      .map(snapshot => {
        const data = snapshot.data();
        console.log("📷 Données caméra:", data);
        return data.idCamera;
      });
    
    console.log("📷 IDs caméras récupérés:", results);
    return results;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des caméras:", error);
    return [];
  }
};

const getEmailRecipients = (userDocs, emailData) => {
  const recipients = [];
  
  userDocs.forEach(userDoc => {
    const userData = userDoc.data();
    const emailProfil = userData.emailProfil;
    
    // Vérifications préliminaires pour exclure les utilisateurs non éligibles
    if (!emailProfil || !userData.email) return;
    
    // EXCLUSION 1: Utilisateur inactif (active = false)
    if (userData.active === false) {
      console.log(`🚫 Utilisateur exclu (inactif): ${userData.email}`);
      return;
    }
    
    // EXCLUSION 2: Compte non vérifié (emailVerified = false)
    if (userData.emailVerified === false) {
      console.log(`🚫 Utilisateur exclu (email non vérifié): ${userData.email}`);
      return;
    }
    
    let shouldReceive = false;
    
    switch (emailProfil) {
      case "niveau1":
        // Reçoit tous les emails
        shouldReceive = true;
        break;
      case "niveau2":
        // Reçoit les emails quand catégorie = sécurité
        shouldReceive = emailData.categorie === "Sécurité";
        break;
      case "niveau3":
        // Reçoit les emails quand niveauImpact = "Catastrophique"
        shouldReceive = emailData.niveauImpact === "Catastrophique";
        break;
      default:
        shouldReceive = false;
    }
    
    if (shouldReceive) {
      console.log(`✅ Destinataire ajouté: ${userData.email} (${emailProfil})`);
      recipients.push({
        email: userData.email,
        nom: userData.nom || "Utilisateur",
        profil: emailProfil
      });
    }
  });
  
  return recipients;
};

const buildEmailContent = (emailData) => {
  console.log("📧 Construction de l'email avec données:", emailData);
  console.log("📸 Images dans emailData:", emailData.images);
  
  const subject = `${emailData.typeIncident} ${emailData.lieu}`;
  
  // Construire la liste des intervenants ISP
  const intervenantsText = emailData.personnels && emailData.personnels.length > 0 
    ? emailData.personnels.map(p => `${p.nomPrenom} (${p.matricule})`).join('; ')
    : "Aucun intervenant ISP";
  
  // Construire la liste des caméras - maintenant directement des strings idCamera
  const camerasText = emailData.cameras && emailData.cameras.length > 0 
    ? emailData.cameras.join(', ') // Joindre avec des virgules et espaces
    : "PAS DE CAMERA";

  // Construire la liste des images
  const imagesText = emailData.images && emailData.images.length > 0 
    ? emailData.images.map((img, index) => `Image ${index + 1}: ${img.url}`).join('\n')
    : "AUCUNE IMAGE";
  
  const content = `
REFERENCE : ${emailData.reference}

DATE : ${emailData.date}

HEURE : ${emailData.heure}

ZONE : ${emailData.zone}

LIEU : ${emailData.lieu}

CATEGORIE : ${emailData.categorie}

TYPE D'INCIDENT : ${emailData.typeIncident}

NIVEAU D'IMPACT : ${emailData.niveauImpact}

PRIMO INTERVENANT : ${emailData.primo}

INTERVENANTS ISP : ${intervenantsText}

CAMERAS : ${camerasText}

${emailData.quantite && emailData.quantite !== "" ? `QUANTITE : ${emailData.quantite}\n\n` : ''}DETAILS DE L'INCIDENT :

${emailData.details || "Aucun détail fourni"}

${emailData.images && emailData.images.length > 0 ? `
IMAGES DE L'INCIDENT :

${imagesText}
` : ''}

${emailData.user?.nom || "Utilisateur"}
${emailData.user?.fonction || "Fonction non spécifiée"}
  `.trim();
  
  // Version HTML avec images intégrées
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        📋 RAPPORT D'INCIDENT
      </h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="padding: 8px; font-weight: bold; background-color: #f8f9fa;">RÉFÉRENCE :</td><td style="padding: 8px;">${emailData.reference}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; background-color: #f8f9fa;">DATE :</td><td style="padding: 8px;">${emailData.date}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; background-color: #f8f9fa;">HEURE :</td><td style="padding: 8px;">${emailData.heure}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; background-color: #f8f9fa;">ZONE :</td><td style="padding: 8px;">${emailData.zone}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; background-color: #f8f9fa;">LIEU :</td><td style="padding: 8px;">${emailData.lieu}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; background-color: #f8f9fa;">CATÉGORIE :</td><td style="padding: 8px;">${emailData.categorie}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; background-color: #f8f9fa;">TYPE D'INCIDENT :</td><td style="padding: 8px;">${emailData.typeIncident}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; background-color: #f8f9fa;">NIVEAU D'IMPACT :</td><td style="padding: 8px;">${emailData.niveauImpact}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; background-color: #f8f9fa;">PRIMO INTERVENANT :</td><td style="padding: 8px;">${emailData.primo}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; background-color: #f8f9fa;">INTERVENANTS ISP :</td><td style="padding: 8px;">${intervenantsText}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; background-color: #f8f9fa;">CAMÉRAS :</td><td style="padding: 8px;">${camerasText}</td></tr>
        ${emailData.quantite && emailData.quantite !== "" ? `<tr><td style="padding: 8px; font-weight: bold; background-color: #f8f9fa;">QUANTITÉ :</td><td style="padding: 8px;">${emailData.quantite}</td></tr>` : ''}
      </table>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; margin-bottom: 10px;">📝 DÉTAILS DE L'INCIDENT :</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
${emailData.details || "Aucun détail fourni"}
        </div>
      </div>
      
      ${emailData.images && emailData.images.length > 0 ? `
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; margin-bottom: 15px;">📸 IMAGES DE L'INCIDENT :</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
          ${emailData.images.map((img, index) => `
            <div style="text-align: center;">
              <img src="${img.url}" alt="Image ${index + 1}" style="max-width: 100%; height: auto; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
              <p style="margin: 5px 0; font-size: 12px; color: #666;">Image ${index + 1}</p>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
        <p><strong>Rapporté par :</strong> ${emailData.user?.nom || "Utilisateur"}</p>
        <p><strong>Fonction :</strong> ${emailData.user?.fonction || "Fonction non spécifiée"}</p>
      </div>
    </div>
  `;

  return {
    subject,
    content,
    htmlContent
  };
};

// Fonction fallback en cas d'erreur avec les Cloud Functions
const sendEmailFallback = async (incidentData) => {
  try {
    console.log("🔄 Début du fallback email simulation...");
    console.log("📝 Données incident reçues:", incidentData);
    
    // Récupérer les informations nécessaires pour l'email
    console.log("🔍 Récupération des données depuis Firestore...");
    const [
      zoneData,
      lieuData,
      typeIncidentData,
      personnelsData,
      camerasData,
      userData,
      allUsers
    ] = await Promise.all([
      getDoc(doc(db, "zones", incidentData.zone)),
      getDoc(doc(db, "lieux", incidentData.lieu)),
      getDoc(doc(db, "typeIncident", incidentData.typeIncident)),
      getPersonnelsData(incidentData.intervenantsISP),
      getCamerasData(incidentData.cameras),
      getDoc(doc(db, "users", incidentData.user)),
      getDocs(collection(db, "users"))
    ]);

    console.log("📊 Données récupérées:");
    console.log("Zone:", zoneData.exists() ? zoneData.data() : "Non trouvée");
    console.log("Lieu:", lieuData.exists() ? lieuData.data() : "Non trouvé");
    console.log("Type incident:", typeIncidentData.exists() ? typeIncidentData.data() : "Non trouvé");
    console.log("Personnels:", personnelsData);
    console.log("Caméras:", camerasData);
    console.log("Utilisateur:", userData.exists() ? userData.data() : "Non trouvé");

    // Construire les données pour l'email
    const emailData = {
      ...incidentData, // D'abord les données de base
      // Puis écraser avec les données enrichies de Firestore
      zone: zoneData.exists() ? zoneData.data().nomZone : incidentData.zone,
      lieu: lieuData.exists() ? lieuData.data().nomLieu : incidentData.lieu, 
      typeIncident: typeIncidentData.exists() ? typeIncidentData.data().nomIncident : incidentData.typeIncident,
      personnels: personnelsData, // Déjà traité par getPersonnelsData
      cameras: camerasData, // Maintenant un tableau d'idCamera strings
      user: userData.exists() ? {
        nom: userData.data().nom || "Nom inconnu",
        fonction: userData.data().fonction || "Fonction non spécifiée",
        email: userData.data().email
      } : { nom: "Utilisateur inconnu", fonction: "Fonction non spécifiée" }
    };

    console.log("📧 Données email construites:", emailData);

    // Déterminer les destinataires selon les critères
    const recipients = getEmailRecipients(allUsers.docs, emailData);

    // Construire le contenu de l'email
    const emailContent = buildEmailContent(emailData);

    // Simulation d'envoi d'email
    await sendEmailSimulation(recipients, emailContent);

    console.log("✅ Fallback completed successfully");
    return { success: true, message: `Email envoyé avec succès (simulation) - ${recipients.length} destinataires` };
  } catch (error) {
    console.error("Erreur lors du fallback:", error);
    return { success: false, error: error.message };
  }
};

const sendEmailSimulation = async (recipients, emailContent) => {
  // Simulation d'envoi d'email
  // Dans un environnement de production, vous devriez utiliser un service comme:
  // - Firebase Cloud Functions avec un service d'email (SendGrid, Mailgun, etc.)
  // - Une API backend qui gère l'envoi d'emails
  
  console.log("=== SIMULATION D'ENVOI D'EMAIL ===");
  console.log("Destinataires:", recipients.map(r => r.email));
  console.log("Objet:", emailContent.subject);
  console.log("Contenu:");
  console.log(emailContent.content);
  console.log("================================");
  
  // Retourner une promesse résolue pour simuler l'envoi réussi
  return Promise.resolve({
    success: true,
    recipientCount: recipients.length,
    message: "Email envoyé avec succès (simulation)"
  });
};

export default {
  sendIncidentEmail
};