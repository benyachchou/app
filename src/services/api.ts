// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Types pour les réponses API
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

export interface ModelStatusResponse {
  status: 'success' | 'error';
  model_loaded: boolean;
  model_filename?: string;
  loaded_at?: string;
}

export interface PredictionResponse {
  status: 'success' | 'error';
  prediction: 'Tumor' | 'No Tumor';
  confidence: number;
  probabilities: {
    tumor: number;
    no_tumor: number;
  };
  image_saved?: string;
  timestamp?: string;
  message?: string;
}

export interface ModelUploadResponse {
  status: 'success' | 'error';
  message: string;
  filename?: string;
  model_type?: string;
  input_shape?: string;
  layers_count?: number;
}

// Classe de service API
export class ApiService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        },
      });

      if (!response.ok) {
        // Essayer de parser la réponse d'erreur
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
        } catch {
          throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || 'Erreur inconnue');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur de connexion au serveur');
    }
  }

  // Vérifier la santé du serveur
  static async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/api/health');
  }

  // Obtenir le statut du modèle
  static async getModelStatus(): Promise<ModelStatusResponse> {
    return this.makeRequest<ModelStatusResponse>('/api/model-status');
  }

  // Uploader un modèle
  static async uploadModel(file: File): Promise<ModelUploadResponse> {
    const formData = new FormData();
    formData.append('model', file);

    return this.makeRequest<ModelUploadResponse>('/api/upload-model', {
      method: 'POST',
      body: formData,
    });
  }

  // Faire une prédiction
  static async predict(file: File): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return this.makeRequest<PredictionResponse>('/api/predict', {
      method: 'POST',
      body: formData,
    });
  }

  // Obtenir l'historique des prédictions
  static async getPredictionsHistory(): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/api/predictions-history');
  }
}

// Utilitaires pour la gestion des erreurs
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Hook personnalisé pour les appels API (optionnel)
export const useApi = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const execute = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
};

// Import React pour le hook (si utilisé)
import React from 'react';