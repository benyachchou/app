import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ModelUploadProps {
  onUpload: (file: File) => Promise<any>;
  disabled?: boolean;
}

const ModelUpload: React.FC<ModelUploadProps> = ({ onUpload, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
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

  const handleFileUpload = async (file: File) => {
    // Vérifier l'extension
    if (!file.name.toLowerCase().endsWith('.keras')) {
      setUploadStatus('error');
      setStatusMessage('Veuillez sélectionner un fichier .keras');
      return;
    }

    // Vérifier la taille (max 100MB pour les modèles)
    const maxSize = 512 * 1024 * 1024; // 512MB
    if (file.size > maxSize) {
      setUploadStatus('error');
      setStatusMessage('Le fichier est trop volumineux (max 512MB)');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setStatusMessage('');

    try {
      await onUpload(file);
      setUploadStatus('success');
      setStatusMessage('Modèle chargé avec succès');
      
      // Réinitialiser le statut après 3 secondes
      setTimeout(() => {
        setUploadStatus('idle');
        setStatusMessage('');
      }, 3000);
    } catch (error: any) {
      setUploadStatus('error');
      setStatusMessage(error.message || 'Erreur lors du chargement du modèle');
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

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${isDragging && !disabled
            ? 'border-blue-400 bg-blue-50' 
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
          accept=".keras"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center space-y-3">
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          ) : (
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-900">
              {isUploading ? 'Chargement du modèle...' : 'Glissez votre modèle .keras ici'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ou cliquez pour sélectionner un fichier
            </p>
          </div>

          <div className="text-xs text-gray-400">
            Formats acceptés: .keras • Taille max: 512MB
          </div>
        </div>
      </div>

      {/* Messages de statut */}
      {statusMessage && (
        <div className={`
          flex items-center space-x-2 p-3 rounded-lg text-sm
          ${uploadStatus === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
          }
        `}>
          {uploadStatus === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Informations sur le modèle */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Modèles .keras supportés
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Modèles au format Keras (.keras) - TensorFlow 2.x</li>
          <li>• Exemple: brain_tumor_vgg16.keras</li>
          <li>• Entraîné pour la classification binaire (Tumor/No Tumor)</li>
          <li>• Images d'entrée: 224x224 pixels (VGG16 standard)</li>
          <li>• Le modèle remplacera le modèle actuellement chargé</li>
        </ul>
      </div>
    </div>
  );
};

export default ModelUpload;