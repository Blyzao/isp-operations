// Script pour nettoyer les doublons dans la collection lieux
// Ce script identifie et supprime les lieux en double basés sur nomLieu

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Configuration Firebase (utilisez vos vraies clés)
const firebaseConfig = {
  // Ajoutez votre configuration Firebase ici
  // Ou utilisez les variables d'environnement
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function findAndRemoveDuplicates() {
  console.log('🔍 Recherche des doublons dans la collection lieux...');
  
  try {
    // Récupérer tous les lieux
    const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
    const lieux = [];
    
    lieuxSnapshot.forEach((doc) => {
      lieux.push({
        id: doc.id,
        ...doc.data(),
        docRef: doc
      });
    });
    
    console.log(`📊 Total des lieux trouvés: ${lieux.length}`);
    
    // Grouper par nomLieu
    const lieuxGroupes = {};
    lieux.forEach(lieu => {
      const nomLieu = lieu.nomLieu || 'SANS_NOM';
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
        console.log(`\n🚨 Doublons trouvés pour "${nomLieu}": ${lieuxGroupes[nomLieu].length} occurrences`);
        lieuxGroupes[nomLieu].forEach((lieu, index) => {
          console.log(`   ${index + 1}. ID: ${lieu.id} | Zone: ${lieu.zone} | Type: ${lieu.typeLieu} | Actif: ${lieu.active}`);
        });
      }
    });
    
    if (totalDoublons === 0) {
      console.log('✅ Aucun doublon trouvé!');
      return;
    }
    
    console.log(`\n📈 Résumé: ${Object.keys(doublons).length} noms de lieux dupliqués, ${totalDoublons} enregistrements à supprimer`);
    
    // Demander confirmation (en mode console, vous devrez modifier cette partie)
    console.log('\n⚠️  ATTENTION: Ce script va supprimer les doublons automatiquement!');
    console.log('📋 Stratégie: Garder le premier enregistrement de chaque groupe, supprimer les autres');
    
    // Supprimer les doublons (garder le premier de chaque groupe)
    let suppressions = 0;
    
    for (const nomLieu of Object.keys(doublons)) {
      const groupe = doublons[nomLieu];
      // Garder le premier (index 0), supprimer les autres
      for (let i = 1; i < groupe.length; i++) {
        const lieuASupprimer = groupe[i];
        try {
          await deleteDoc(doc(db, 'lieux', lieuASupprimer.id));
          console.log(`🗑️  Supprimé: ${lieuASupprimer.nomLieu} (ID: ${lieuASupprimer.id})`);
          suppressions++;
        } catch (error) {
          console.error(`❌ Erreur lors de la suppression de ${lieuASupprimer.id}:`, error);
        }
      }
    }
    
    console.log(`\n✅ Nettoyage terminé! ${suppressions} doublons supprimés.`);
    console.log(`📊 Lieux uniques restants: ${lieux.length - suppressions}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Version alternative: juste analyser sans supprimer
async function analyzeOnly() {
  console.log('🔍 Analyse des doublons dans la collection lieux (sans suppression)...');
  
  try {
    const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
    const lieux = [];
    
    lieuxSnapshot.forEach((doc) => {
      lieux.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📊 Total des lieux: ${lieux.length}`);
    
    // Grouper par nomLieu
    const lieuxGroupes = {};
    lieux.forEach(lieu => {
      const nomLieu = lieu.nomLieu || 'SANS_NOM';
      if (!lieuxGroupes[nomLieu]) {
        lieuxGroupes[nomLieu] = [];
      }
      lieuxGroupes[nomLieu].push(lieu);
    });
    
    // Afficher les doublons
    let totalDoublons = 0;
    Object.keys(lieuxGroupes).forEach(nomLieu => {
      if (lieuxGroupes[nomLieu].length > 1) {
        totalDoublons += lieuxGroupes[nomLieu].length - 1;
        console.log(`\n🚨 "${nomLieu}": ${lieuxGroupes[nomLieu].length} occurrences`);
        lieuxGroupes[nomLieu].forEach((lieu, index) => {
          const zoneInfo = lieu.zone ? `Zone: ${lieu.zone}` : 'Zone: N/A';
          const typeInfo = lieu.typeLieu ? `Type: ${lieu.typeLieu}` : 'Type: N/A';
          const activeInfo = `Actif: ${lieu.active !== false ? 'Oui' : 'Non'}`;
          console.log(`   ${index + 1}. ID: ${lieu.id} | ${zoneInfo} | ${typeInfo} | ${activeInfo}`);
        });
      }
    });
    
    if (totalDoublons === 0) {
      console.log('✅ Aucun doublon trouvé!');
    } else {
      console.log(`\n📊 Résumé: ${totalDoublons} doublons trouvés`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  }
}

// Exporter les fonctions pour utilisation
module.exports = { findAndRemoveDuplicates, analyzeOnly };

// Si exécuté directement
if (require.main === module) {
  console.log('🚀 Démarrage du script de nettoyage des lieux...');
  console.log('⚠️  IMPORTANT: Assurez-vous d\'avoir une sauvegarde avant d\'exécuter ce script!');
  
  // Décommentez la ligne souhaitée:
  // analyzeOnly(); // Pour juste analyser
  // findAndRemoveDuplicates(); // Pour analyser et supprimer
}