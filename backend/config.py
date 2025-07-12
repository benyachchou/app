import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

class Config:
    """Configuration de base"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 512 * 1024 * 1024))  # 512MB
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
    MODEL_FOLDER = os.environ.get('MODEL_FOLDER', 'models')
    
    # Configuration CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://192.168.15.9:5173,http://localhost:5173').split(',')
    
    # Configuration des logs
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    
    # Configuration spécifique aux modèles .keras
    ALLOWED_MODEL_EXTENSIONS = {'keras'}
    ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    
    # Configuration VGG16
    VGG16_INPUT_SIZE = (224, 224)
    VGG16_CHANNELS = 3

class DevelopmentConfig(Config):
    """Configuration pour le développement"""
    DEBUG = True
    FLASK_ENV = 'development'

class ProductionConfig(Config):
    """Configuration pour la production"""
    DEBUG = False
    FLASK_ENV = 'production'
    
    # Sécurité renforcée en production
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY must be set in production")

class TestingConfig(Config):
    """Configuration pour les tests"""
    TESTING = True
    DEBUG = True
    UPLOAD_FOLDER = 'test_uploads'
    MODEL_FOLDER = 'test_models'

# Dictionnaire des configurations
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}