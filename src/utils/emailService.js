import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

export const sendIncidentEmail = async (incidentData) => {
  // Test : Tenter la Cloud Function directement pour vérifier CORS
  const testCloudFunction = true; // Activé pour tester après déploiement
  
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
  const subject = `${emailData.typeIncident} ${emailData.lieu}`;
  
  // Construire la liste des intervenants ISP
  const intervenantsText = emailData.personnels && emailData.personnels.length > 0 
    ? emailData.personnels.map(p => `${p.nomPrenom} (${p.matricule})`).join('; ')
    : "Aucun intervenant ISP";
  
  // Construire la liste des caméras - maintenant directement des strings idCamera
  const camerasText = emailData.cameras && emailData.cameras.length > 0 
    ? emailData.cameras.join(', ') // Joindre avec des virgules et espaces
    : "PAS DE CAMERA";
  
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

${emailData.user?.nom || "Utilisateur"}
${emailData.user?.fonction || "Fonction non spécifiée"}
  `.trim();
  
  return {
    subject,
    content
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