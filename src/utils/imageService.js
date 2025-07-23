import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Génère un nom unique pour l'image basé sur la référence de l'incident
 * Format: incidents/{reference}/image_{index}_{timestamp}.{extension}
 * Exemple: incidents/20250123-SEC-001/image_1_1706025600000.jpg
 */
export const generateImageName = (incidentReference, imageIndex, originalFileName) => {
  const timestamp = Date.now();
  const extension = originalFileName.split('.').pop().toLowerCase();
  const paddedIndex = String(imageIndex).padStart(2, '0');
  
  return `incidents/${incidentReference}/image_${paddedIndex}_${timestamp}.${extension}`;
};

/**
 * Upload une seule image vers Firebase Storage
 */
export const uploadImage = async (file, imageName, onProgress = null) => {
  try {
    const imageRef = ref(storage, imageName);
    
    // Upload avec monitoring du progrès si callback fourni
    const snapshot = await uploadBytes(imageRef, file);
    
    // Obtenir l'URL de téléchargement
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      url: downloadURL,
      path: imageName,
      name: file.name,
      size: file.size
    };
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload multiple images pour un incident
 */
export const uploadIncidentImages = async (images, incidentReference, onProgress = null) => {
  const uploadPromises = images.map(async (imageData, index) => {
    const imageName = generateImageName(incidentReference, index + 1, imageData.name);
    
    const result = await uploadImage(imageData.file, imageName);
    
    if (onProgress) {
      onProgress(index + 1, images.length);
    }
    
    return {
      ...result,
      originalIndex: index,
      originalName: imageData.name
    };
  });

  try {
    const results = await Promise.all(uploadPromises);
    
    // Séparer les succès et les échecs
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    return {
      success: failed.length === 0,
      successful,
      failed,
      totalUploaded: successful.length,
      totalFailed: failed.length
    };
  } catch (error) {
    console.error('Erreur lors de l\'upload des images:', error);
    return {
      success: false,
      error: error.message,
      successful: [],
      failed: images.map((img, index) => ({ originalIndex: index, originalName: img.name, error: error.message }))
    };
  }
};

/**
 * Supprime une image de Firebase Storage
 */
export const deleteImage = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Supprime toutes les images d'un incident
 */
export const deleteIncidentImages = async (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) {
    return { success: true, deleted: 0 };
  }

  const deletePromises = imageUrls.map(async (imageData) => {
    if (imageData.path) {
      return await deleteImage(imageData.path);
    }
    return { success: false, error: 'Chemin d\'image manquant' };
  });

  try {
    const results = await Promise.all(deletePromises);
    const successful = results.filter(r => r.success);
    
    return {
      success: successful.length === imageUrls.length,
      deleted: successful.length,
      failed: imageUrls.length - successful.length
    };
  } catch (error) {
    console.error('Erreur lors de la suppression des images:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Valide les types et tailles des fichiers
 */
export const validateImages = (images, maxImages = 3, maxSizeBytes = 5 * 1024 * 1024) => {
  const errors = [];
  
  if (images.length > maxImages) {
    errors.push(`Maximum ${maxImages} images autorisées`);
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  images.forEach((image, index) => {
    if (!allowedTypes.includes(image.file.type)) {
      errors.push(`Image ${index + 1}: Type non autorisé (${image.file.type})`);
    }
    
    if (image.file.size > maxSizeBytes) {
      const maxSizeMB = maxSizeBytes / (1024 * 1024);
      errors.push(`Image ${index + 1}: Taille trop importante (max ${maxSizeMB}MB)`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Prépare les données d'images pour la base de données
 */
export const prepareImageDataForDatabase = (uploadResults) => {
  return uploadResults.successful.map(result => ({
    url: result.url,
    path: result.path,
    name: result.name,
    size: result.size,
    uploadedAt: new Date().toISOString()
  }));
};

export default {
  generateImageName,
  uploadImage,
  uploadIncidentImages,
  deleteImage,
  deleteIncidentImages,
  validateImages,
  prepareImageDataForDatabase
};