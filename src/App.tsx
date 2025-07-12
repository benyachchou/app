import React, { useState, useEffect } from 'react';
import { Brain, Activity, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import TabNavigation from './components/TabNavigation';
import ModelUpload from './components/ModelUpload';
import ImageUpload from './components/ImageUpload';
import PredictionResult from './components/PredictionResult';
import ModelStatus from './components/ModelStatus';
import { ApiService } from './services/api';
import { PredictionResult as PredictionResultType } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'model' | 'analysis'>('model');
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier le statut du modèle au chargement
  useEffect(() => {
    checkModelStatus();
  }, []);

  const checkModelStatus = async () => {
    try {
      const status = await ApiService.getModelStatus();
      setModelLoaded(status.model_loaded);
      setModelInfo(status);
    } catch (err) {
      console.error('Erreur lors de la vérification du statut du modèle:', err);
    }
  };

  const handleModelUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ApiService.uploadModel(file);
      setModelLoaded(true);
      await checkModelStatus();
      // Passer automatiquement à l'onglet d'analyse après le chargement du modèle
      setActiveTab('analysis');
      return result;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du modèle');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setPredictionResult(null);
    
    try {
      const result = await ApiService.predict(file);
      setPredictionResult(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la prédiction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Brain className="w-8 h-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Détection IA de Tumeurs Cérébrales
              </h1>
              <p className="text-sm text-gray-600">
                Modèles .keras • VGG16 • Analyse d'images IRM
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Indicateur de chargement global */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-700">Traitement en cours...</span>
            </div>
          </div>
        )}

        {/* Message d'erreur global */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Statut du modèle */}
          <div className="lg:col-span-1">
            <ModelStatus 
              modelLoaded={modelLoaded} 
              modelInfo={modelInfo}
              onRefresh={checkModelStatus}
            />
          </div>

          {/* Colonne centrale - Onglets */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <TabNavigation 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                modelLoaded={modelLoaded}
              />
              
              <div className="p-6">
                {activeTab === 'model' && (
                  <div>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        Charger votre modèle .keras
                      </h2>
                      <p className="text-sm text-gray-600">
                        Uploadez un modèle TensorFlow/Keras entraîné pour la détection de tumeurs cérébrales
                      </p>
                    </div>
                    <ModelUpload 
                      onUpload={handleModelUpload}
                      disabled={isLoading}
                    />
                  </div>
                )}
                
                {activeTab === 'analysis' && (
                  <div>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                        <span>Analyser une Image IRM</span>
                        {modelLoaded && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Modèle Prêt
                          </span>
                        )}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Uploadez une image IRM pour obtenir une prédiction de détection de tumeur
                      </p>
                    </div>
                    
                    {!modelLoaded ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="w-8 h-8 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Modèle requis
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Veuillez d'abord charger un modèle .keras dans l'onglet "Charger Modèle"
                        </p>
                        <button
                          onClick={() => setActiveTab('model')}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Aller au chargement de modèle
                        </button>
                      </div>
                    ) : (
                      <ImageUpload 
                        onUpload={handleImageUpload}
                        disabled={isLoading}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section des résultats */}
        {predictionResult && (
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Activity className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Résultats de l'Analyse
                </h2>
              </div>

              <PredictionResult result={predictionResult} />
            </div>
          </div>
        )}

        {/* Section d'informations */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Comment utiliser cette application
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Charger le modèle</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Uploadez votre modèle .keras entraîné pour la détection de tumeurs cérébrales.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Uploader l'image</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Sélectionnez une image IRM au format JPG ou PNG pour l'analyse.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Voir les résultats</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Obtenez la prédiction avec le niveau de confiance et les probabilités détaillées.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Application de détection de tumeurs cérébrales - IA médicale
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Système opérationnel</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;