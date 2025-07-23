import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

/**
 * Analyse les doublons dans la collection lieux
 * @returns {Promise<Object>} Résultat de l'analyse avec les doublons trouvés
 */
export const analyzeLieuxDuplicates = async () => {
  try {
    console.log('🔍 Analyse des doublons dans la collection lieux...');
    
    // Récupérer tous les lieux
    const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
    const lieux = [];
    
    lieuxSnapshot.forEach((docSnap) => {
      lieux.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    
    console.log(`📊 Total des lieux trouvés: ${lieux.length}`);
    
    // Grouper par nomLieu (en ignorant la casse)
    const lieuxGroupes = {};
    lieux.forEach(lieu => {
      const nomLieu = (lieu.nomLieu || 'SANS_NOM').toUpperCase();
      if (!lieuxGroupes[nomLieu]) {
        lieuxGroupes[nomLieu] = [];
      }
      lieuxGroupes[nomLieu].push(lieu);
    });
    
    // Identifier les doublons
    const doublons = {};
    let totalDoublons = 0;
    
    Object.keys(lieuxGroupes).forEach(nomLieu => {
      if (lieuxGroupes[nomLieu].length > 1) {
        doublons[nomLieu] = lieuxGroupes[nomLieu];
        totalDoublons += lieuxGroupes[nomLieu].length - 1; // -1 car on garde le premier
      }
    });
    
    return {
      success: true,
      totalLieux: lieux.length,
      doublonsGroupes: doublons,
      totalDoublons,
      nomsDupliques: Object.keys(doublons).length
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Supprime les doublons en gardant le premier enregistrement de chaque groupe
 * @param {Object} doublonsGroupes - Les groupes de doublons à nettoyer
 * @returns {Promise<Object>} Résultat de la suppression
 */
export const removeLieuxDuplicates = async (doublonsGroupes) => {
  try {
    console.log('🧹 Début du nettoyage des doublons...');
    
    let suppressions = 0;
    const erreurs = [];
    
    for (const nomLieu of Object.keys(doublonsGroupes)) {
      const groupe = doublonsGroupes[nomLieu];
      console.log(`\n🔄 Traitement des doublons pour "${nomLieu}": ${groupe.length} occurrences`);
      
      // Trier par date de création si disponible, sinon garder l'ordre
      groupe.sort((a, b) => {
        // Si on a des timestamps, garder le plus ancien
        if (a.dateCreation && b.dateCreation) {
          return new Date(a.dateCreation) - new Date(b.dateCreation);
        }
        return 0;
      });
      
      // Garder le premier (index 0), supprimer les autres
      for (let i = 1; i < groupe.length; i++) {
        const lieuASupprimer = groupe[i];
        try {
          await deleteDoc(doc(db, 'lieux', lieuASupprimer.id));
          console.log(`🗑️  Supprimé: ${lieuASupprimer.nomLieu} (ID: ${lieuASupprimer.id})`);
          suppressions++;
        } catch (error) {
          console.error(`❌ Erreur lors de la suppression de ${lieuASupprimer.id}:`, error);
          erreurs.push({
            id: lieuASupprimer.id,
            nomLieu: lieuASupprimer.nomLieu,
            erreur: error.message
          });
        }
      }
      
      console.log(`✅ Gardé: ${groupe[0].nomLieu} (ID: ${groupe[0].id})`);
    }
    
    return {
      success: true,
      suppressions,
      erreurs,
      message: `${suppressions} doublons supprimés avec succès${erreurs.length > 0 ? `, ${erreurs.length} erreurs` : ''}`
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fonction complète pour analyser et nettoyer les doublons
 * @returns {Promise<Object>} Résultat complet de l'opération
 */
export const cleanupLieuxDuplicates = async () => {
  try {
    // D'abord analyser
    const analysisResult = await analyzeLieuxDuplicates();
    
    if (!analysisResult.success) {
      return analysisResult;
    }
    
    if (analysisResult.totalDoublons === 0) {
      return {
        success: true,
        message: 'Aucun doublon trouvé!',
        analysis: analysisResult
      };
    }
    
    // Ensuite nettoyer
    const cleanupResult = await removeLieuxDuplicates(analysisResult.doublonsGroupes);
    
    return {
      success: cleanupResult.success,
      message: cleanupResult.message,
      analysis: analysisResult,
      cleanup: cleanupResult
    };
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fonction pour afficher un résumé des doublons trouvés
 * @param {Object} doublonsGroupes - Les groupes de doublons
 * @returns {string} Résumé formaté
 */
export const formatDuplicatesSummary = (doublonsGroupes) => {
  let summary = '';
  
  Object.keys(doublonsGroupes).forEach(nomLieu => {
    const groupe = doublonsGroupes[nomLieu];
    summary += `\n"${nomLieu}": ${groupe.length} occurrences\n`;
    groupe.forEach((lieu, index) => {
      summary += `  ${index + 1}. ID: ${lieu.id} | Zone: ${lieu.zone || 'N/A'} | Type: ${lieu.typeLieu || 'N/A'} | Actif: ${lieu.active !== false ? 'Oui' : 'Non'}\n`;
    });
  });
  
  return summary;
};