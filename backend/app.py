from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow import keras
import io
import logging
from werkzeug.utils import secure_filename
import json
from datetime import datetime

# Configuration
app = Flask(__name__)
CORS(app)

# Configuration des dossiers
UPLOAD_FOLDER = 'uploads'
MODEL_FOLDER = 'models'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
ALLOWED_MODEL_EXTENSIONS = {'keras'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MODEL_FOLDER'] = MODEL_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

# Créer les dossiers s'ils n'existent pas
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(MODEL_FOLDER, exist_ok=True)

# Configuration des logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Variable globale pour stocker le modèle
current_model = None
model_info = {
    'loaded': False,
    'filename': None,
    'loaded_at': None,
    'model_type': None,
    'input_shape': None
}

def allowed_file(filename, allowed_extensions):
    """Vérifie si le fichier a une extension autorisée"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def preprocess_image_vgg16(image_file, target_size=(224, 224)):
    """
    Préprocesse l'image pour VGG16
    Args:
        image_file: Fichier image
        target_size: Taille cible (largeur, hauteur)
    Returns:
        numpy array preprocessé pour VGG16
    """
    try:
        # Ouvrir l'image
        image = Image.open(image_file)
        
        # Convertir en RGB si nécessaire
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Redimensionner à la taille attendue par VGG16
        image = image.resize(target_size)
        
        # Convertir en array numpy
        img_array = np.array(image)
        
        # Normaliser les pixels (0-255 pour VGG16)
        img_array = img_array.astype('float32')
        
        # Préprocessing spécifique à VGG16 (mean subtraction)
        # VGG16 attend des valeurs centrées autour de 0
        img_array = tf.keras.applications.vgg16.preprocess_input(img_array)
        
        # Ajouter la dimension batch
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    except Exception as e:
        logger.error(f"Erreur lors du préprocessing de l'image: {str(e)}")
        raise

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de vérification de santé"""
    return jsonify({
        'status': 'success',
        'message': 'Backend Flask opérationnel',
        'timestamp': datetime.now().isoformat(),
        'tensorflow_version': tf.__version__,
        'keras_version': keras.__version__
    })

@app.route('/api/model-status', methods=['GET'])
def model_status():
    """Retourne le statut du modèle chargé"""
    return jsonify({
        'status': 'success',
        'model_loaded': model_info['loaded'],
        'model_filename': model_info['filename'],
        'model_type': model_info['model_type'],
        'input_shape': model_info['input_shape'],
        'loaded_at': model_info['loaded_at']
    })

@app.route('/api/upload-model', methods=['POST'])
def upload_model():
    """Upload et charge un modèle .keras"""
    global current_model, model_info
    
    try:
        # Vérifier si un fichier est présent
        if 'model' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'Aucun fichier modèle fourni'
            }), 400
        
        file = request.files['model']
        
        # Vérifier si un fichier est sélectionné
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'Aucun fichier sélectionné'
            }), 400
        
        # Vérifier l'extension
        if not allowed_file(file.filename, ALLOWED_MODEL_EXTENSIONS):
            return jsonify({
                'status': 'error',
                'message': 'Type de fichier non autorisé. Utilisez .keras'
            }), 400
        
        # Sauvegarder le fichier
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['MODEL_FOLDER'], filename)
        file.save(filepath)
        
        # Charger le modèle
        try:
            current_model = keras.models.load_model(filepath)
            
            # Obtenir les informations du modèle
            input_shape = current_model.input_shape if hasattr(current_model, 'input_shape') else None
            model_type = 'VGG16-based' if 'vgg16' in filename.lower() else 'Custom CNN'
            
            model_info = {
                'loaded': True,
                'filename': filename,
                'loaded_at': datetime.now().isoformat(),
                'model_type': model_type,
                'input_shape': str(input_shape) if input_shape else None
            }
            
            logger.info(f"Modèle .keras chargé avec succès: {filename}")
            
            return jsonify({
                'status': 'success',
                'message': 'Modèle .keras chargé avec succès',
                'filename': filename,
                'model_type': model_type,
                'input_shape': str(input_shape) if input_shape else None,
                'layers_count': len(current_model.layers) if hasattr(current_model, 'layers') else None
            })
            
        except Exception as e:
            logger.error(f"Erreur lors du chargement du modèle .keras: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Erreur lors du chargement du modèle .keras: {str(e)}'
            }), 500
    
    except Exception as e:
        logger.error(f"Erreur lors de l'upload du modèle: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Erreur lors de l\'upload: {str(e)}'
        }), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    """Fait une prédiction sur une image IRM"""
    global current_model
    
    try:
        # Vérifier si un modèle est chargé
        if current_model is None:
            return jsonify({
                'status': 'error',
                'message': 'Aucun modèle chargé. Veuillez d\'abord uploader un modèle .keras.'
            }), 400
        
        # Vérifier si une image est fournie
        if 'image' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'Aucune image fournie'
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'Aucun fichier sélectionné'
            }), 400
        
        # Vérifier l'extension
        if not allowed_file(file.filename, ALLOWED_EXTENSIONS):
            return jsonify({
                'status': 'error',
                'message': 'Type de fichier non autorisé. Utilisez PNG, JPG ou JPEG'
            }), 400
        
        # Préprocesser l'image
        try:
            # Utiliser le préprocessing VGG16 si c'est un modèle VGG16
            if 'vgg16' in model_info.get('filename', '').lower():
                processed_image = preprocess_image_vgg16(file)
            else:
                # Préprocessing standard pour autres modèles
                processed_image = preprocess_image_vgg16(file)  # Utiliser VGG16 par défaut
                
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Erreur lors du traitement de l\'image: {str(e)}'
            }), 400
        
        # Faire la prédiction
        try:
            prediction = current_model.predict(processed_image)
            
            # Interpréter la prédiction
            # Pour un modèle binaire de classification de tumeurs cérébrales
            if len(prediction[0]) == 1:
                # Sortie sigmoïde (0-1)
                confidence = float(prediction[0][0])
                if confidence > 0.5:
                    predicted_class = "Tumor"
                    prob_tumor = confidence
                    prob_no_tumor = 1 - confidence
                else:
                    predicted_class = "No Tumor"
                    prob_tumor = confidence
                    prob_no_tumor = 1 - confidence
            elif len(prediction[0]) == 2:
                # Sortie softmax avec 2 classes [no_tumor, tumor]
                prob_no_tumor = float(prediction[0][0])
                prob_tumor = float(prediction[0][1])
                
                if prob_tumor > prob_no_tumor:
                    predicted_class = "Tumor"
                    confidence = prob_tumor
                else:
                    predicted_class = "No Tumor"
                    confidence = prob_no_tumor
            else:
                # Modèle multi-classes (glioma, meningioma, no tumor, pituitary)
                class_names = ["Glioma", "Meningioma", "No Tumor", "Pituitary"]
                predicted_idx = np.argmax(prediction[0])
                predicted_class = class_names[predicted_idx] if predicted_idx < len(class_names) else f"Class_{predicted_idx}"
                confidence = float(prediction[0][predicted_idx])
                
                # Pour compatibilité, mapper vers binaire
                if predicted_class == "No Tumor":
                    prob_tumor = 1 - confidence
                    prob_no_tumor = confidence
                else:
                    prob_tumor = confidence
                    prob_no_tumor = 1 - confidence
                    predicted_class = "Tumor"  # Simplifier pour l'interface
            
            # Sauvegarder l'image pour référence
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            save_filename = f"{timestamp}_{filename}"
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], save_filename)
            
            # Réinitialiser le pointeur du fichier et sauvegarder
            file.seek(0)
            file.save(save_path)
            
            logger.info(f"Prédiction effectuée: {predicted_class} ({confidence:.4f})")
            
            return jsonify({
                'status': 'success',
                'prediction': predicted_class,
                'confidence': round(confidence, 4),
                'probabilities': {
                    'tumor': round(prob_tumor, 4),
                    'no_tumor': round(prob_no_tumor, 4)
                },
                'raw_prediction': prediction.tolist(),
                'image_saved': save_filename,
                'model_used': model_info.get('filename', 'Unknown'),
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Erreur lors de la prédiction: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Erreur lors de la prédiction: {str(e)}'
            }), 500
    
    except Exception as e:
        logger.error(f"Erreur générale dans predict: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Erreur interne: {str(e)}'
        }), 500

@app.route('/api/predictions-history', methods=['GET'])
def predictions_history():
    """Retourne l'historique des prédictions"""
    try:
        files = []
        upload_path = app.config['UPLOAD_FOLDER']
        
        for filename in os.listdir(upload_path):
            if allowed_file(filename, ALLOWED_EXTENSIONS):
                filepath = os.path.join(upload_path, filename)
                stat = os.stat(filepath)
                files.append({
                    'filename': filename,
                    'size': stat.st_size,
                    'created_at': datetime.fromtimestamp(stat.st_ctime).isoformat()
                })
        
        # Trier par date de création (plus récent en premier)
        files.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify({
            'status': 'success',
            'files': files,
            'count': len(files)
        })
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'historique: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Erreur lors de la récupération de l\'historique: {str(e)}'
        }), 500

@app.errorhandler(413)
def too_large(e):
    """Gestionnaire d'erreur pour les fichiers trop volumineux"""
    return jsonify({
        'status': 'error',
        'message': 'Fichier trop volumineux. Taille maximale: 100MB'
    }), 413

@app.errorhandler(404)
def not_found(e):
    """Gestionnaire d'erreur 404"""
    return jsonify({
        'status': 'error',
        'message': 'Endpoint non trouvé'
    }), 404

@app.errorhandler(500)
def internal_error(e):
    """Gestionnaire d'erreur 500"""
    return jsonify({
        'status': 'error',
        'message': 'Erreur interne du serveur'
    }), 500

if __name__ == '__main__':
    print("🧠 Serveur Flask de détection de tumeurs cérébrales (.keras)")
    print("📡 API disponible sur: http://localhost:5000")
    print("📋 Endpoints disponibles:")
    print("   - GET  /api/health")
    print("   - GET  /api/model-status")
    print("   - POST /api/upload-model (fichiers .keras)")
    print("   - POST /api/predict")
    print("   - GET  /api/predictions-history")
    print("🔧 Support des modèles: brain_tumor_vgg16.keras")
    
    app.run(debug=True, host='0.0.0.0', port=5000)