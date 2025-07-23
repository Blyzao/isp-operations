import jsPDF from 'jspdf';
import { db } from '../firebase';
import { doc as firestoreDoc, getDoc } from 'firebase/firestore';
import logo from '../assets/logo.png';

// Fonction pour justifier le texte manuellement
const justifyText = (pdf, text, x, y, maxWidth) => {
  const words = text.split(' ');
  if (words.length <= 1) {
    pdf.text(text, x, y);
    return;
  }
  
  const fontSize = pdf.internal.getFontSize();
  const textWidth = pdf.getStringUnitWidth(text) * fontSize / pdf.internal.scaleFactor;
  
  // Vérifier que le texte ne dépasse pas la largeur disponible
  if (textWidth > maxWidth) {
    // Si le texte est trop long, le diviser en plusieurs lignes
    const splitText = pdf.splitTextToSize(text, maxWidth);
    splitText.forEach((line, index) => {
      if (index === 0) {
        justifyText(pdf, line, x, y, maxWidth);
      } else {
        pdf.text(line, x, y + (index * 7 * 1.25));
      }
    });
    return;
  }
  
  if (textWidth >= maxWidth * 0.8) { // Justifier seulement si la ligne fait au moins 80% de la largeur
    const totalSpaces = words.length - 1;
    const spaceWidth = pdf.getStringUnitWidth(' ') * fontSize / pdf.internal.scaleFactor;
    const extraSpace = (maxWidth - textWidth + totalSpaces * spaceWidth) / totalSpaces;
    
    let currentX = x;
    words.forEach((word, index) => {
      pdf.text(word, currentX, y);
      if (index < words.length - 1) {
        const wordWidth = pdf.getStringUnitWidth(word) * fontSize / pdf.internal.scaleFactor;
        currentX += wordWidth + extraSpace;
      }
    });
  } else {
    // Si la ligne est trop courte, ne pas justifier
    pdf.text(text, x, y);
  }
};

export const generateIncidentPDF = async (incident) => {
  try {
    // Récupérer les données enrichies
    const [
      zoneData,
      lieuData,
      typeIncidentData,
      personnelsData,
      camerasData,
      userData
    ] = await Promise.all([
      getDoc(firestoreDoc(db, "zones", incident.zone)),
      getDoc(firestoreDoc(db, "lieux", incident.lieu)),
      getDoc(firestoreDoc(db, "typeIncident", incident.typeIncident)),
      getPersonnelsData(incident.intervenantsISP),
      getCamerasData(incident.cameras),
      getDoc(firestoreDoc(db, "users", incident.user))
    ]);

    // Enrichir les données
    const enrichedData = {
      ...incident,
      zone: zoneData.exists() ? zoneData.data().nomZone : incident.zone,
      lieu: lieuData.exists() ? lieuData.data().nomLieu : incident.lieu,
      typeIncident: typeIncidentData.exists() ? typeIncidentData.data().nomIncident : incident.typeIncident,
      personnels: personnelsData,
      cameras: camerasData,
      user: userData.exists() ? {
        nom: userData.data().nom || "Nom inconnu",
        fonction: userData.data().fonction || "Fonction non spécifiée"
      } : { nom: "Utilisateur inconnu", fonction: "Fonction non spécifiée" }
    };

    // Créer le PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;

    // Ajouter le logo avec proportions fixes
    try {
      pdf.addImage(logo, 'PNG', 10, 10, 30, 20); // Dimensions fixes avec bon ratio
    } catch (error) {
      console.warn('Logo non trouvé:', error);
    }

    // Ajouter un trait bleu sous le logo
    pdf.setDrawColor(30, 58, 138); // Couleur bleue (#1e3a8a)
    pdf.setLineWidth(0.8); // Épaisseur du trait
    pdf.line(10, 35, pageWidth - 10, 35); // Trait de la marge gauche à la marge droite

    // Titre
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    const title = "RAPPORT D'INCIDENT";
    const textWidth = pdf.getStringUnitWidth(title) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
    const textOffset = (pageWidth - textWidth) / 2;
    pdf.text(title, textOffset, 50);

    // Corps du rapport
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    let yPos = 70;

    // Format date
    const dateFormatted = enrichedData.date ? enrichedData.date.split('-').reverse().join('-') : '';

    const reportData = [
      { label: 'RÉFÉRENCE', value: enrichedData.reference || '' },
      { label: 'DATE', value: dateFormatted },
      { label: 'HEURE', value: enrichedData.heure || '' },
      { label: 'ZONE', value: enrichedData.zone || '' },
      { label: 'LIEU', value: enrichedData.lieu || '' },
      { label: 'CATÉGORIE', value: enrichedData.categorie || '' },
      { label: 'TYPE D\'INCIDENT', value: enrichedData.typeIncident || '' },
      { label: 'NIVEAU D\'IMPACT', value: enrichedData.niveauImpact || '' },
      { label: 'PRIMO INTERVENANT', value: enrichedData.primo || '' }
    ];

    // Ajouter intervenants ISP
    const intervenantsText = enrichedData.personnels && enrichedData.personnels.length > 0 
      ? enrichedData.personnels.map(p => `${p.nomPrenom} (${p.matricule})`).join('; ')
      : "Aucun intervenant ISP";
    reportData.push({ label: 'INTERVENANTS ISP', value: intervenantsText });

    // Ajouter caméras
    const camerasText = enrichedData.cameras && enrichedData.cameras.length > 0 
      ? enrichedData.cameras.join(', ')
      : "PAS DE CAMERA";
    reportData.push({ label: 'CAMÉRAS', value: camerasText });

    // Ajouter quantité si présente
    if (enrichedData.quantite && enrichedData.quantite !== "") {
      reportData.push({ label: 'QUANTITÉ', value: enrichedData.quantite });
    }

    // Afficher les données
    reportData.forEach(item => {
      pdf.setFont(undefined, 'bold');
      pdf.text(item.label + '  :  ', 10, yPos);
      pdf.setFont(undefined, 'normal');
      
      const labelWidth = pdf.getStringUnitWidth(item.label + '  :  ') * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
      const maxWidth = pageWidth - 20 - labelWidth;
      const textLines = pdf.splitTextToSize(item.value, maxWidth);
      
      pdf.text(textLines, 10 + labelWidth, yPos);
      yPos += textLines.length * 7;
    });

    // Détails de l'incident
    if (enrichedData.details) {
      yPos += 10;
      
      // Vérifier si on a assez de place pour le titre + quelques lignes
      const pageHeight = pdf.internal.pageSize.height;
      if (yPos > pageHeight - 60) { // Si moins de 60pt disponibles, nouvelle page
        pdf.addPage();
        yPos = 20; // Commencer en haut de la nouvelle page
      }
      
      pdf.setFont(undefined, 'bold');
      pdf.text('DÉTAILS DE L\'INCIDENT  :  ', 10, yPos);
      yPos += 7;
      
      pdf.setFont(undefined, 'normal');
      const detailsLines = pdf.splitTextToSize(enrichedData.details, pageWidth - 20);
      
      // Texte justifié avec interligne 1.25 et gestion des pages
      detailsLines.forEach((line, index) => {
        // Vérifier si on a besoin d'une nouvelle page
        if (yPos > pageHeight - 30) { // Si moins de 30pt disponibles
          pdf.addPage();
          yPos = 20; // Recommencer en haut
        }
        
        if (index < detailsLines.length - 1) {
          // Justification manuelle pour toutes les lignes sauf la dernière
          justifyText(pdf, line, 10, yPos, pageWidth - 20);
        } else {
          // Dernière ligne non justifiée
          pdf.text(line, 10, yPos);
        }
        yPos += 7 * 1.25; // Interligne 1.25
      });
    }

    // Images de l'incident après les détails
    if (enrichedData.images && enrichedData.images.length > 0) {
      console.log("📸 Images trouvées dans les données:", enrichedData.images);
      yPos = await addImagesToPDF(pdf, enrichedData.images, yPos, pageWidth);
    } else {
      console.log("📸 Aucune image trouvée dans les données de l'incident");
    }

    // Signature après les détails et images, à droite
    yPos += 20; // Espacement après les détails/images
    
    // Vérifier si on a assez de place pour la signature
    const pageHeight = pdf.internal.pageSize.height;
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = 20;
    }
    
    pdf.setFont(undefined, 'bold');
    const nomWidth = pdf.getStringUnitWidth(enrichedData.user.nom) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
    pdf.text(enrichedData.user.nom, pageWidth - nomWidth - 10, yPos);
    
    pdf.setFont(undefined, 'normal');
    const fonctionWidth = pdf.getStringUnitWidth(enrichedData.user.fonction) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
    pdf.text(enrichedData.user.fonction, pageWidth - fonctionWidth - 10, yPos + 7);

    // Sauvegarder le PDF
    const fileName = `rapport_incident_${enrichedData.reference || 'sans_ref'}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    alert('Erreur lors de la génération du PDF');
  }
};

// Fonctions utilitaires
const getPersonnelsData = async (personnelIds) => {
  if (!personnelIds || personnelIds.length === 0) return [];
  
  try {
    const personnelsPromises = personnelIds.map(id => 
      getDoc(firestoreDoc(db, "personnels", id))
    );
    const personnelsSnapshots = await Promise.all(personnelsPromises);
    
    return personnelsSnapshots
      .filter(snapshot => snapshot.exists())
      .map(snapshot => snapshot.data());
  } catch (error) {
    console.error('Erreur lors de la récupération des personnels:', error);
    return [];
  }
};

const getCamerasData = async (cameraIds) => {
  if (!cameraIds || cameraIds.length === 0) return [];
  
  try {
    const camerasPromises = cameraIds.map(id => 
      getDoc(firestoreDoc(db, "cameras", id))
    );
    const camerasSnapshots = await Promise.all(camerasPromises);
    
    return camerasSnapshots
      .filter(snapshot => snapshot.exists())
      .map(snapshot => {
        const data = snapshot.data();
        return data.idCamera;
      });
  } catch (error) {
    console.error('Erreur lors de la récupération des caméras:', error);
    return [];
  }
};

// Fonction pour ajouter les images au PDF
const addImagesToPDF = async (pdf, images, startY, pageWidth) => {
  let yPos = startY + 10;
  const pageHeight = pdf.internal.pageSize.height;
  
  // Vérifier si on a assez de place pour le titre
  if (yPos > pageHeight - 60) {
    pdf.addPage();
    yPos = 20;
  }
  
  // Titre de la section images
  pdf.setFont(undefined, 'bold');
  pdf.text('IMAGES DE L\'INCIDENT  :  ', 10, yPos);
  yPos += 10;
  
  // Traiter chaque image
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    
    try {
      // Vérifier si on a assez de place (environ 80mm pour une image)
      if (yPos > pageHeight - 100) {
        pdf.addPage();
        yPos = 20;
      }

      console.log(`📸 Tentative de chargement de l'image ${i + 1}:`, image.url);
      
      // Charger l'image
      const imgData = await loadImageAsBase64(image.url);
      
      if (imgData) {
        try {
          // Si nous avons des données base64, les utiliser
          if (imgData.startsWith('data:')) {
            // Calculer les dimensions pour maintenir le ratio
            const maxWidth = pageWidth - 40; // Marges de 20 de chaque côté
            const maxHeight = 70; // Maximum 70mm de hauteur
            
            const img = new Image();
            img.src = imgData;
            
            await new Promise((resolve) => {
              img.onload = () => {
                // Calculer le ratio pour maintenir les proportions
                const imgWidth = img.width;
                const imgHeight = img.height;
                const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
                
                const finalWidth = imgWidth * ratio;
                const finalHeight = imgHeight * ratio;
                
                // Centrer l'image
                const x = (pageWidth - finalWidth) / 2;
                
                // Ajouter l'image au PDF
                pdf.addImage(imgData, 'JPEG', x, yPos, finalWidth, finalHeight);
                
                // Ajouter la légende sous l'image
                pdf.setFont(undefined, 'normal');
                pdf.setFontSize(10);
                const caption = `Image ${i + 1}`;
                const captionWidth = pdf.getStringUnitWidth(caption) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
                pdf.text(caption, (pageWidth - captionWidth) / 2, yPos + finalHeight + 5);
                
                yPos += finalHeight + 15; // Espace pour l'image + légende + marge
                
                console.log(`✅ Image ${i + 1} ajoutée avec succès au PDF`);
                resolve();
              };
              
              img.onerror = () => {
                console.error(`❌ Erreur lors du rendu de l'image ${i + 1}`);
                addImagePlaceholder(pdf, i + 1, yPos, pageWidth);
                yPos += 25;
                resolve();
              };
            });
          } else {
            // Si nous n'avons pas de données base64, ajouter un placeholder
            console.warn(`⚠️ Pas de données base64 pour l'image ${i + 1}, ajout d'un placeholder`);
            addImagePlaceholder(pdf, i + 1, yPos, pageWidth);
            yPos += 25;
          }
        } catch (error) {
          console.error(`💥 Erreur lors du traitement de l'image ${i + 1}:`, error);
          addImagePlaceholder(pdf, i + 1, yPos, pageWidth);
          yPos += 25;
        }
        
      } else {
        // Ajouter un placeholder pour l'image manquante
        pdf.setFont(undefined, 'italic');
        pdf.setFontSize(10);
        const placeholderText = `[Image ${i + 1} non disponible]`;
        const placeholderWidth = pdf.getStringUnitWidth(placeholderText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
        pdf.text(placeholderText, (pageWidth - placeholderWidth) / 2, yPos);
        yPos += 15;
        
        console.warn(`⚠️ Image ${i + 1} non disponible, placeholder ajouté`);
      }
    } catch (error) {
      console.error(`💥 Erreur lors du traitement de l'image ${i + 1}:`, error);
      
      // Ajouter un placeholder pour l'erreur
      pdf.setFont(undefined, 'italic');
      pdf.setFontSize(10);
      const errorText = `[Erreur chargement image ${i + 1}]`;
      const errorWidth = pdf.getStringUnitWidth(errorText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
      pdf.text(errorText, (pageWidth - errorWidth) / 2, yPos);
      yPos += 15;
    }
  }
  
  return yPos;
};

// Fonction pour charger une image depuis une URL et la convertir en base64
const loadImageAsBase64 = (url) => {
  return new Promise((resolve) => {
    // Méthode 1: Essayer avec fetch d'abord (peut contourner certains problèmes CORS)
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = () => {
          console.warn('Erreur FileReader, tentative méthode alternative...');
          fallbackImageLoad(url, resolve);
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.warn('Erreur fetch, tentative méthode alternative...', error);
        fallbackImageLoad(url, resolve);
      });
  });
};

// Méthode de fallback pour charger les images
const fallbackImageLoad = (url, resolve) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      // Convertir en base64 avec compression JPEG
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataURL);
    } catch (error) {
      console.error('Erreur lors de la conversion en base64:', error);
      // Dernière tentative : utiliser l'URL directement pour jsPDF
      tryDirectImageInPdf(url, resolve);
    }
  };
  
  img.onerror = () => {
    console.error('Erreur lors du chargement de l\'image depuis:', url);
    // Dernière tentative : utiliser l'URL directement pour jsPDF
    tryDirectImageInPdf(url, resolve);
  };
  
  // Ajouter un timeout pour éviter d'attendre indéfiniment
  setTimeout(() => {
    console.warn('Timeout lors du chargement de l\'image:', url);
    tryDirectImageInPdf(url, resolve);
  }, 5000); // 5 secondes de timeout
  
  img.src = url;
};

// Tentative d'utilisation directe de l'URL pour jsPDF (peut fonctionner dans certains cas)
const tryDirectImageInPdf = (url, resolve) => {
  console.log('Tentative d\'utilisation directe de l\'URL pour jsPDF...');
  // Retourner l'URL directement - jsPDF peut parfois la gérer
  resolve(url.startsWith('data:') ? url : null);
};

// Fonction pour ajouter un placeholder d'image dans le PDF
const addImagePlaceholder = (pdf, imageNumber, yPos, pageWidth) => {
  const boxWidth = 100;
  const boxHeight = 60;
  const x = (pageWidth - boxWidth) / 2;
  
  // Dessiner un rectangle avec bordure
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(245, 245, 245);
  pdf.rect(x, yPos, boxWidth, boxHeight, 'FD');
  
  // Texte dans le rectangle
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  
  const text1 = `Image ${imageNumber}`;
  const text2 = 'Non disponible';
  const text3 = '(Problème CORS)';
  
  const text1Width = pdf.getStringUnitWidth(text1) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
  const text2Width = pdf.getStringUnitWidth(text2) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
  const text3Width = pdf.getStringUnitWidth(text3) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
  
  pdf.text(text1, (pageWidth - text1Width) / 2, yPos + 20);
  pdf.text(text2, (pageWidth - text2Width) / 2, yPos + 30);
  pdf.text(text3, (pageWidth - text3Width) / 2, yPos + 40);
  
  // Remettre la couleur du texte à noir
  pdf.setTextColor(0, 0, 0);
};