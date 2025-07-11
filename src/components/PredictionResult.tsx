import React from 'react';
import { AlertTriangle, CheckCircle, Brain, TrendingUp, Clock } from 'lucide-react';
import { PredictionResult as PredictionResultType } from '../types';

interface PredictionResultProps {
  result: PredictionResultType;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ result }) => {
  const isTumor = result.prediction === 'Tumor';
  const confidencePercentage = Math.round(result.confidence * 100);
  
  // Déterminer le niveau de confiance
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return { level: 'Très élevée', color: 'text-green-600' };
    if (confidence >= 0.7) return { level: 'Élevée', color: 'text-blue-600' };
    if (confidence >= 0.5) return { level: 'Modérée', color: 'text-yellow-600' };
    return { level: 'Faible', color: 'text-red-600' };
  };

  const confidenceInfo = getConfidenceLevel(result.confidence);

  return (
    <div className="space-y-6">
      {/* Résultat principal */}
      <div className={`
        rounded-xl p-6 border-2
        ${isTumor 
          ? 'bg-red-50 border-red-200' 
          : 'bg-green-50 border-green-200'
        }
      `}>
        <div className="flex items-center space-x-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isTumor ? 'bg-red-100' : 'bg-green-100'}
          `}>
            {isTumor ? (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-600" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className={`
              text-2xl font-bold
              ${isTumor ? 'text-red-800' : 'text-green-800'}
            `}>
              {result.prediction === 'Tumor' ? 'Tumeur Détectée' : 'Aucune Tumeur Détectée'}
            </h3>
            <p className={`
              text-sm mt-1
              ${isTumor ? 'text-red-600' : 'text-green-600'}
            `}>
              Confiance: {confidencePercentage}% ({confidenceInfo.level})
            </p>
          </div>
        </div>

        {/* Message d'avertissement médical */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ <strong>Avertissement médical:</strong> Ce résultat est généré par IA et ne remplace pas un diagnostic médical professionnel. 
            Consultez toujours un médecin pour une évaluation complète.
          </p>
        </div>
      </div>

      {/* Détails de la prédiction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Probabilités détaillées */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Probabilités</h4>
          </div>
          
          <div className="space-y-3">
            {/* Probabilité de tumeur */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Tumeur</span>
                <span className="text-sm font-medium text-red-600">
                  {Math.round((result.probabilities?.tumor || 0) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(result.probabilities?.tumor || 0) * 100}%` }}
                />
              </div>
            </div>

            {/* Probabilité sans tumeur */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Sans tumeur</span>
                <span className="text-sm font-medium text-green-600">
                  {Math.round((result.probabilities?.no_tumor || 0) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(result.probabilities?.no_tumor || 0) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informations techniques */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Brain className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Détails Techniques</h4>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Classe prédite:</span>
              <span className="font-medium">{result.prediction}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Score de confiance:</span>
              <span className="font-medium">{result.confidence.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Niveau de confiance:</span>
              <span className={`font-medium ${confidenceInfo.color}`}>
                {confidenceInfo.level}
              </span>
            </div>
            {result.timestamp && (
              <div className="flex justify-between">
                <span className="text-gray-600">Analysé le:</span>
                <span className="font-medium">
                  {new Date(result.timestamp).toLocaleString('fr-FR')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Recommandations</span>
        </h4>
        
        {isTumor ? (
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Consultez immédiatement un neurologue ou un oncologue</p>
            <p>• Demandez une IRM avec contraste pour confirmation</p>
            <p>• Préparez vos antécédents médicaux et symptômes</p>
            <p>• Ne paniquez pas - un diagnostic précoce améliore les options de traitement</p>
          </div>
        ) : (
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Résultat rassurant, mais restez vigilant aux symptômes</p>
            <p>• Continuez vos examens de routine selon les recommandations médicales</p>
            <p>• Consultez si vous développez des symptômes neurologiques</p>
            <p>• Maintenez un mode de vie sain pour la santé cérébrale</p>
          </div>
        )}
      </div>

      {/* Bouton pour nouvelle analyse */}
      <div className="text-center">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
        >
          Analyser une nouvelle image
        </button>
      </div>
    </div>
  );
};

export default PredictionResult;