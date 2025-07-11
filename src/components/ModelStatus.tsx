import React from 'react';
import { CheckCircle, XCircle, RefreshCw, FileText, Clock } from 'lucide-react';

interface ModelStatusProps {
  modelLoaded: boolean;
  modelInfo: any;
  onRefresh: () => void;
}

const ModelStatus: React.FC<ModelStatusProps> = ({ modelLoaded, modelInfo, onRefresh }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <span>Statut du Modèle</span>
        </h2>
        <button
          onClick={onRefresh}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          title="Actualiser le statut"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Statut principal */}
        <div className={`
          flex items-center space-x-3 p-3 rounded-lg
          ${modelLoaded 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
          }
        `}>
          {modelLoaded ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          
          <div className="flex-1">
            <p className={`
              text-sm font-medium
              ${modelLoaded ? 'text-green-800' : 'text-red-800'}
            `}>
              {modelLoaded ? 'Modèle chargé' : 'Aucun modèle chargé'}
            </p>
            <p className={`
              text-xs mt-1
              ${modelLoaded ? 'text-green-600' : 'text-red-600'}
            `}>
              {modelLoaded 
                ? 'Prêt pour les prédictions' 
                : 'Veuillez charger un modèle .keras'
              }
            </p>
          </div>
        </div>

        {/* Détails du modèle */}
        {modelLoaded && modelInfo && (
          <div className="space-y-3">
            <div className="border-t border-gray-200 pt-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Informations du modèle
              </h4>
              
              <div className="space-y-2 text-sm">
                {modelInfo.model_filename && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fichier:</span>
                    <span className="font-medium text-gray-900 truncate ml-2">
                      {modelInfo.model_filename}
                    </span>
                  </div>
                )}
                
                {modelInfo.model_type && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-purple-600">
                      {modelInfo.model_type}
                    </span>
                  </div>
                )}
                
                {modelInfo.input_shape && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Input Shape:</span>
                    <span className="font-medium text-gray-900 text-xs">
                      {modelInfo.input_shape}
                    </span>
                  </div>
                )}
                
                {modelInfo.loaded_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Chargé le:</span>
                    <div className="flex items-center space-x-1 text-gray-900">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium text-xs">
                        {new Date(modelInfo.loaded_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Indicateur de performance */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">État du système</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Opérationnel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelStatus;