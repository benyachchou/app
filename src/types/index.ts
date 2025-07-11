// Types pour l'application de détection de tumeurs cérébrales

export interface PredictionResult {
  prediction: 'Tumor' | 'No Tumor';
  confidence: number;
  probabilities?: {
    tumor: number;
    no_tumor: number;
  };
  timestamp?: string;
  image_saved?: string;
}

export interface ModelInfo {
  loaded: boolean;
  filename?: string;
  loaded_at?: string;
  model_summary?: string;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileValidation {
  isValid: boolean;
  error?: string;
}

// Types pour les composants
export interface BaseComponentProps {
  className?: string;
  disabled?: boolean;
}

export interface UploadComponentProps extends BaseComponentProps {
  onUpload: (file: File) => Promise<any>;
  accept?: string;
  maxSize?: number;
}

// Types pour les erreurs
export interface AppError {
  message: string;
  code?: string;
  timestamp: Date;
}

// Types pour l'état de l'application
export interface AppState {
  modelLoaded: boolean;
  modelInfo: ModelInfo | null;
  predictionResult: PredictionResult | null;
  isLoading: boolean;
  error: string | null;
}

// Constantes
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'] as const;
export const ALLOWED_MODEL_TYPES = ['application/octet-stream'] as const; // .h5 files
export const MAX_IMAGE_SIZE = 16 * 1024 * 1024; // 16MB
export const MAX_MODEL_SIZE = 100 * 1024 * 1024; // 100MB

export type AllowedImageType = typeof ALLOWED_IMAGE_TYPES[number];
export type AllowedModelType = typeof ALLOWED_MODEL_TYPES[number];