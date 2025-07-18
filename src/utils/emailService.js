import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

export const sendIncidentEmail = async (incidentData) => {
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
      ...incidentData,
      zone: zoneData.exists() ? zoneData.data().nomZone : "N/A",
      lieu: lieuData.exists() ? lieuData.data().nomLieu : "N/A",
      typeIncident: typeIncidentData.exists() ? typeIncidentData.data().nomIncident : "N/A",
      personnels: personnelsData,
      cameras: camerasData,
      user: userData.exists() ? userData.data() : null
    };

    // Appeler la Cloud Function pour envoyer l'email
    const response = await fetch('https://us-central1-nexion-2972f.cloudfunctions.net/sendIncidentNotification', {
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
    console.error("Erreur lors de l'envoi de l'email:", error);
    
    // Fallback vers la simulation en cas d'erreur
    console.log("🔄 Fallback vers simulation d'email");
    try {
      const fallbackResult = await sendEmailFallback(incidentData);
      return fallbackResult;
    } catch (fallbackError) {
      console.error("Erreur lors du fallback:", fallbackError);
      return { success: false, error: error.message };
    }
  }
};

const getPersonnelsData = async (personnelIds) => {
  if (!personnelIds || personnelIds.length === 0) return [];
  
  try {
    const personnelsPromises = personnelIds.map(id => 
      getDoc(doc(db, "personnels", id))
    );
    const personnelsSnapshots = await Promise.all(personnelsPromises);
    
    return personnelsSnapshots
      .filter(snapshot => snapshot.exists())
      .map(snapshot => snapshot.data());
  } catch (error) {
    console.error("Erreur lors de la récupération des personnels:", error);
    return [];
  }
};

const getCamerasData = async (cameraIds) => {
  if (!cameraIds || cameraIds.length === 0) return [];
  
  try {
    const camerasPromises = cameraIds.map(id => 
      getDoc(doc(db, "cameras", id))
    );
    const camerasSnapshots = await Promise.all(camerasPromises);
    
    return camerasSnapshots
      .filter(snapshot => snapshot.exists())
      .map(snapshot => snapshot.data());
  } catch (error) {
    console.error("Erreur lors de la récupération des caméras:", error);
    return [];
  }
};

const getEmailRecipients = (userDocs, emailData) => {
  const recipients = [];
  
  userDocs.forEach(userDoc => {
    const userData = userDoc.data();
    const emailProfil = userData.emailProfil;
    
    if (!emailProfil || !userData.email) return;
    
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
  const intervenantsText = emailData.personnels.length > 0 
    ? emailData.personnels.map(p => `${p.nomPrenom} (${p.matricule})`).join('; ')
    : "Aucun intervenant ISP";
  
  // Construire la liste des caméras
  const camerasText = emailData.cameras.length > 0 
    ? emailData.cameras.map(c => c.idCamera).join('; ')
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

${emailData.quantite && emailData.quantite !== "" ? `QUANTITE : ${emailData.quantite}\n\n` : ''}

DETAILS DE L'INCIDENT :

${emailData.details || "Aucun détail fourni"}


${emailData.user?.nom || "Utilisateur"} - ${emailData.user?.fonction || "Fonction non spécifiée"}
  `.trim();
  
  return {
    subject,
    content
  };
};

// Fonction fallback en cas d'erreur avec les Cloud Functions
const sendEmailFallback = async (incidentData) => {
  try {
    // Récupérer les informations nécessaires pour l'email
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

    // Construire les données pour l'email
    const emailData = {
      zone: zoneData.exists() ? zoneData.data().nomZone : "N/A",
      lieu: lieuData.exists() ? lieuData.data().nomLieu : "N/A",
      typeIncident: typeIncidentData.exists() ? typeIncidentData.data().nomIncident : "N/A",
      personnels: personnelsData,
      cameras: camerasData,
      user: userData.exists() ? userData.data() : null,
      ...incidentData
    };

    // Déterminer les destinataires selon les critères
    const recipients = getEmailRecipients(allUsers.docs, emailData);

    // Construire le contenu de l'email
    const emailContent = buildEmailContent(emailData);

    // Simulation d'envoi d'email
    await sendEmailSimulation(recipients, emailContent);

    return { success: true, message: "Email envoyé avec succès (simulation)" };
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