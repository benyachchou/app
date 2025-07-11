import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<any>;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const validateFile = (file: File): string | null => {
    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return 'Format non supporté. Utilisez JPG, JPEG ou PNG.';
    }

    // Vérifier la taille (max 16MB)
    const maxSize = 16 * 1024 * 1024; // 16MB
    if (file.size > maxSize) {
      return 'L\'image est trop volumineuse (max 16MB)';
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    
    // Validation du fichier
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Créer l'aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);

    try {
      await onUpload(file);
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'analyse de l\'image');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${isDragging && !disabled
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center space-y-3">
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
          ) : (
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-green-600" />
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-900">
              {isUploading ? 'Analyse en cours...' : 'Glissez votre image IRM ici'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ou cliquez pour sélectionner un fichier
            </p>
          </div>

          <div className="text-xs text-gray-400">
            Formats acceptés: JPG, PNG • Taille max: 16MB
          </div>
        </div>
      </div>

      {/* Aperçu de l'image */}
      {previewUrl && (
        <div className="relative">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">
                Image sélectionnée
              </h4>
              <button
                onClick={clearPreview}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Aperçu de l'image IRM"
                className="max-w-full max-h-48 rounded-lg shadow-sm border border-gray-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Conseils pour les images IRM */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
        <h4 className="text-sm font-medium text-green-900 mb-2">
          Conseils pour de meilleurs résultats
        </h4>
        <ul className="text-xs text-green-700 space-y-1">
          <li>• Utilisez des images IRM de haute qualité</li>
          <li>• Préférez les coupes axiales du cerveau</li>
          <li>• Assurez-vous que l'image est bien contrastée</li>
          <li>• Évitez les images floues ou avec des artefacts</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;