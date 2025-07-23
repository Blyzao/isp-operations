import React, { useState, useRef, useEffect } from 'react';
import { ImagePlus, X, AlertCircle, Image as ImageIcon } from 'lucide-react';

function ImageUpload({ images = [], onImagesChange, disabled = false, maxImages = 3, maxSizeBytes = 5 * 1024 * 1024 }) {
  const [previewImages, setPreviewImages] = useState(images);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Synchroniser les images props avec l'état local
  useEffect(() => {
    setPreviewImages(images);
  }, [images]);

  const validateFile = (file) => {
    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.';
    }

    // Vérifier la taille du fichier
    if (file.size > maxSizeBytes) {
      const maxSizeMB = maxSizeBytes / (1024 * 1024);
      return `La taille du fichier dépasse ${maxSizeMB}MB.`;
    }

    return null;
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setError('');

    // Vérifier le nombre d'images
    if (previewImages.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images autorisées.`);
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      validFiles.push(file);
      
      // Créer une preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = {
          id: Date.now() + Math.random(),
          file: file,
          url: e.target.result,
          name: file.name,
          size: file.size
        };
        
        newPreviews.push(preview);
        
        // Une fois toutes les previews créées, mettre à jour l'état
        if (newPreviews.length === validFiles.length) {
          const updatedImages = [...previewImages, ...newPreviews];
          setPreviewImages(updatedImages);
          onImagesChange(updatedImages);
        }
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (imageId) => {
    const updatedImages = previewImages.filter(img => img.id !== imageId);
    setPreviewImages(updatedImages);
    onImagesChange(updatedImages);
    setError('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Bouton d'ajout d'images */}
      {!disabled && previewImages.length < maxImages && (
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 font-medium text-sm cursor-pointer"
          >
            <ImagePlus className="w-4 h-4" />
            <span>Ajouter une image</span>
          </button>
          <span className="text-xs text-gray-500">
            ({previewImages.length}/{maxImages} images)
          </span>
        </div>
      )}

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-full">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Aperçu des images */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {previewImages.map((image) => (
            <div
              key={image.id}
              className="relative bg-gray-50 border border-gray-200 rounded-lg overflow-hidden group"
            >
              {/* Image */}
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <img
                  src={image.url}
                  alt={image.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Informations */}
              <div className="p-3">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <ImageIcon className="w-3 h-3" />
                  <span className="truncate flex-1">{image.name}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatFileSize(image.size)}
                </div>
              </div>

              {/* Bouton de suppression */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Informations sur les contraintes */}
      {!disabled && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Contraintes :</p>
          <ul className="space-y-1">
            <li>• Maximum {maxImages} images</li>
            <li>• Formats autorisés : JPG, PNG, WebP</li>
            <li>• Taille maximale : {Math.round(maxSizeBytes / (1024 * 1024))}MB par image</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;