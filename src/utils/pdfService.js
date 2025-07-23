import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Génère un PDF pour un incident avec toutes les informations et images
 */
export const generateIncidentPDF = async (incidentId, incidentData = null) => {
  try {
    let incident = incidentData;
    
    // Si les données ne sont pas fournies, les récupérer de Firestore
    if (!incident) {
      const incidentDoc = await getDoc(doc(db, 'incidents', incidentId));
      if (!incidentDoc.exists()) {
        throw new Error('Incident non trouvé');
      }
      incident = { id: incidentDoc.id, ...incidentDoc.data() };
    }

    // Récupérer les données enrichies (noms des zones, lieux, etc.)
    const enrichedData = await enrichIncidentData(incident);

    // Créer le PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Configuration de la page
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let currentY = margin;

    // Ajouter l'en-tête
    currentY = addPDFHeader(pdf, enrichedData, currentY, contentWidth, margin);
    
    // Ajouter les informations de base
    currentY = addPDFBasicInfo(pdf, enrichedData, currentY, contentWidth, margin);
    
    // Ajouter les détails
    currentY = addPDFDetails(pdf, enrichedData, currentY, contentWidth, margin, pageHeight);
    
    // Ajouter les images
    if (enrichedData.images && enrichedData.images.length > 0) {
      currentY = await addPDFImages(pdf, enrichedData.images, currentY, contentWidth, margin, pageHeight);
    }

    // Ajouter le pied de page
    addPDFFooter(pdf, enrichedData, pageHeight, margin);

    // Générer le nom du fichier
    const fileName = `Incident_${enrichedData.reference}_${enrichedData.date}.pdf`;
    
    return {
      success: true,
      pdf,
      fileName
    };
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Enrichit les données de l'incident avec les noms des zones, lieux, etc.
 */
const enrichIncidentData = async (incident) => {
  try {
    const [zoneDoc, lieuDoc, typeIncidentDoc] = await Promise.all([
      incident.zone ? getDoc(doc(db, 'zones', incident.zone)) : null,
      incident.lieu ? getDoc(doc(db, 'lieux', incident.lieu)) : null,
      incident.typeIncident ? getDoc(doc(db, 'typeIncident', incident.typeIncident)) : null
    ]);

    return {
      ...incident,
      zoneName: zoneDoc?.exists() ? zoneDoc.data().nomZone : incident.zone,
      lieuName: lieuDoc?.exists() ? lieuDoc.data().nomLieu : incident.lieu,
      typeIncidentName: typeIncidentDoc?.exists() ? typeIncidentDoc.data().nomIncident : incident.typeIncident
    };
  } catch (error) {
    console.error('Erreur lors de l\'enrichissement des données:', error);
    return incident;
  }
};

/**
 * Ajoute l'en-tête du PDF
 */
const addPDFHeader = (pdf, data, startY, contentWidth, margin) => {
  // Titre principal
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(0, 123, 255); // Bleu
  pdf.text('RAPPORT D\'INCIDENT', pageWidth / 2, startY, { align: 'center' });
  
  // Ligne de séparation
  pdf.setDrawColor(0, 123, 255);
  pdf.setLineWidth(1);
  pdf.line(margin, startY + 5, pageWidth - margin, startY + 5);
  
  // Référence en évidence
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Référence: ${data.reference}`, pageWidth / 2, startY + 15, { align: 'center' });
  
  return startY + 25;
};

/**
 * Ajoute les informations de base au PDF
 */
const addPDFBasicInfo = (pdf, data, startY, contentWidth, margin) => {
  const lineHeight = 8;
  let currentY = startY;

  // Configuration du texte
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  const leftCol = margin;
  const rightCol = margin + (contentWidth / 2);

  // Informations en deux colonnes
  const leftInfo = [
    ['Date:', data.date],
    ['Heure:', data.heure],
    ['Zone:', data.zoneName || data.zone],
    ['Lieu:', data.lieuName || data.lieu],
    ['Catégorie:', data.categorie]
  ];

  const rightInfo = [
    ['Type d\'incident:', data.typeIncidentName || data.typeIncident],
    ['Niveau d\'impact:', data.niveauImpact],
    ['Primo intervenant:', data.primo],
    ['Quantité:', data.quantite || 'N/A']
  ];

  // Colonne gauche
  leftInfo.forEach(([label, value], index) => {
    const y = currentY + (index * lineHeight);
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, leftCol, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value || 'N/A', leftCol + 25, y);
  });

  // Colonne droite
  rightInfo.forEach(([label, value], index) => {
    const y = currentY + (index * lineHeight);
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, rightCol, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value || 'N/A', rightCol + 35, y);
  });

  return currentY + (Math.max(leftInfo.length, rightInfo.length) * lineHeight) + 10;
};

/**
 * Ajoute les détails de l'incident au PDF
 */
const addPDFDetails = (pdf, data, startY, contentWidth, margin, pageHeight) => {
  let currentY = startY;

  // Titre de la section
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('DÉTAILS DE L\'INCIDENT:', margin, currentY);
  currentY += 8;

  // Contenu des détails
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  
  const details = data.details || 'Aucun détail fourni';
  const splitDetails = pdf.splitTextToSize(details, contentWidth);
  
  splitDetails.forEach(line => {
    if (currentY > pageHeight - 30) {
      pdf.addPage();
      currentY = margin;
    }
    pdf.text(line, margin, currentY);
    currentY += 5;
  });

  return currentY + 10;
};

/**
 * Ajoute les images au PDF
 */
const addPDFImages = async (pdf, images, startY, contentWidth, margin, pageHeight) => {
  let currentY = startY;

  // Titre de la section
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('IMAGES DE L\'INCIDENT:', margin, currentY);
  currentY += 10;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    
    try {
      // Vérifier si on a assez de place (environ 80mm pour une image)
      if (currentY > pageHeight - 100) {
        pdf.addPage();
        currentY = margin;
      }

      // Charger l'image
      const imgData = await loadImageAsBase64(image.url);
      
      if (imgData) {
        // Calculer les dimensions pour maintenir le ratio
        const maxWidth = contentWidth * 0.8; // 80% de la largeur
        const maxHeight = 60; // Maximum 60mm de hauteur
        
        const img = new Image();
        img.src = imgData;
        
        await new Promise((resolve) => {
          img.onload = () => {
            const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
            const width = img.width * ratio;
            const height = img.height * ratio;
            
            // Centrer l'image
            const x = margin + (contentWidth - width) / 2;
            
            pdf.addImage(imgData, 'JPEG', x, currentY, width, height);
            
            // Ajouter la légende
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.text(`Image ${i + 1}`, x + (width / 2), currentY + height + 5, { align: 'center' });
            
            resolve();
          };
          img.onerror = () => resolve(); // Continue même si l'image ne charge pas
        });
        
        currentY += 70; // Espace pour l'image + légende + marge
      }
    } catch (error) {
      console.error(`Erreur lors du chargement de l'image ${i + 1}:`, error);
      
      // Ajouter un placeholder pour l'image manquante
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      pdf.text(`[Image ${i + 1} non disponible]`, margin, currentY);
      currentY += 10;
    }
  }

  return currentY;
};

/**
 * Ajoute le pied de page au PDF
 */
const addPDFFooter = (pdf, data, pageHeight, margin) => {
  const footerY = pageHeight - 20;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  
  // Informations de génération
  const generatedText = `Généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`;
  pdf.text(generatedText, margin, footerY);
  
  // Informations du rapporteur
  if (data.user) {
    const reporterText = `Rapporté par: ${data.user.nom || 'N/A'} - ${data.user.fonction || 'N/A'}`;
    pdf.text(reporterText, margin, footerY + 5);
  }
};

/**
 * Charge une image depuis une URL et la convertit en base64
 */
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      try {
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataURL);
      } catch (error) {
        console.error('Erreur lors de la conversion en base64:', error);
        resolve(null);
      }
    };
    
    img.onerror = () => {
      console.error('Erreur lors du chargement de l\'image:', url);
      resolve(null);
    };
    
    img.src = url;
  });
};

/**
 * Télécharge le PDF généré
 */
export const downloadPDF = (pdf, fileName) => {
  pdf.save(fileName);
};

/**
 * Fonction principale pour générer et télécharger un PDF d'incident
 */
export const generateAndDownloadIncidentPDF = async (incidentId, incidentData = null) => {
  try {
    const result = await generateIncidentPDF(incidentId, incidentData);
    
    if (result.success) {
      downloadPDF(result.pdf, result.fileName);
      return { success: true, message: 'PDF généré avec succès' };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return { success: false, error: error.message };
  }
};

export default {
  generateIncidentPDF,
  downloadPDF,
  generateAndDownloadIncidentPDF
};