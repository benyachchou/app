import { ALLOWED_IMAGE_TYPES, ALLOWED_MODEL_TYPES, MAX_IMAGE_SIZE, MAX_MODEL_SIZE } from '../types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Validation des images
export const validateImageFile = (file: File): ValidationResult => {
  // Vérifier le type MIME
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: 'Format de fichier non supporté. Utilisez JPG, JPEG ou PNG.'
    };
  }

  // Vérifier la taille
  if (file.size > MAX_IMAGE_SIZE) {
    const maxSizeMB = MAX_IMAGE_SIZE / (1024 * 1024);
    return {
      isValid: false,
      error: `L'image est trop volumineuse. Taille maximale: ${maxSizeMB}MB`
    };
  }

  // Vérifier l'extension du fichier
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: 'Extension de fichier non supportée. Utilisez .jpg, .jpeg ou .png'
    };
  }

  return { isValid: true };
};

// Validation des modèles
export const validateModelFile = (file: File): ValidationResult => {
  // Vérifier l'extension
  if (!file.name.toLowerCase().endsWith('.h5')) {
    return {
      isValid: false,
      error: 'Format de modèle non supporté. Utilisez un fichier .keras'
    };
  }

  // Vérifier la taille
  if (file.size > MAX_MODEL_SIZE) {
    const maxSizeMB = MAX_MODEL_SIZE / (1024 * 1024);
    return {
      isValid: false,
      error: `Le modèle est trop volumineux. Taille maximale: ${maxSizeMB}MB`
    };
  }

  // Vérifier que le fichier n'est pas vide
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'Le fichier modèle est vide'
    };
  }

  return { isValid: true };
};

// Utilitaire pour formater la taille des fichiers
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Utilitaire pour obtenir le type de fichier à partir de l'extension
export const getFileTypeFromExtension = (filename: string): string => {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  const typeMap: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.h5': 'application/octet-stream'
  };

  return typeMap[extension] || 'application/octet-stream';
};

// Utilitaire pour créer un aperçu d'image
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Impossible de créer l\'aperçu'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Utilitaire pour vérifier si un fichier est une image
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

// Utilitaire pour vérifier si un fichier est un modèle
export const isModelFile = (file: File): boolean => {
  return file.name.toLowerCase().endsWith('.h5');
};