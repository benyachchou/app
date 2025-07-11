# Application de Détection de Tumeurs Cérébrales

Une application complète Flask + React utilisant l'IA pour détecter les tumeurs cérébrales sur des images IRM avec support des modèles .keras.

## Architecture

- **Backend**: Python Flask avec TensorFlow/Keras
- **Frontend**: React avec TypeScript et Tailwind CSS
- **API**: REST API pour upload de modèles et prédictions

## Structure du Projet

```
brain-tumor-detection/
├── backend/
│   ├── app.py                 # Application Flask principale
│   ├── models/               # Dossier pour stocker les modèles
│   ├── uploads/              # Dossier pour les images uploadées
│   ├── requirements.txt      # Dépendances Python
│   └── config.py            # Configuration
├── frontend/                # Application React (ce dossier)
└── README.md               # Ce fichier
```

## Installation et Lancement Local

### Prérequis
- Python 3.8+
- Node.js 16+
- npm ou yarn

### Backend (Flask)

1. Créer un environnement virtuel Python :
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

2. Installer les dépendances :
```bash
pip install -r requirements.txt
```

3. Lancer le serveur Flask :
```bash
python app.py
```
Le backend sera accessible sur `http://localhost:5000`

### Frontend (React)

1. Installer les dépendances :
```bash
npm install
```

2. Lancer le serveur de développement :
```bash
npm run dev
```
Le frontend sera accessible sur `http://localhost:5173`

## Utilisation

1. **Charger un modèle** : Uploadez un fichier `.h5` contenant votre modèle entraîné
2. **Analyser une image** : Uploadez une image IRM (JPG/PNG) pour obtenir une prédiction
3. **Voir les résultats** : L'application affiche la classe prédite et le niveau de confiance

## API Endpoints

### POST /api/upload-model
Upload et charge un modèle .keras
- **Body**: FormData avec le fichier modèle
- **Response**: `{"message": "Modèle .keras chargé avec succès", "status": "success", "model_type": "VGG16-based"}`

### POST /api/predict
Fait une prédiction sur une image IRM
- **Body**: FormData avec l'image
- **Response**: `{"prediction": "Tumor", "confidence": 0.95, "status": "success"}`

### GET /api/model-status
Vérifie si un modèle est chargé
- **Response**: `{"model_loaded": true, "model_type": "VGG16-based", "input_shape": "(None, 224, 224, 3)", "status": "success"}`

## Déploiement en Production

### Option 1: Docker (Recommandé)

1. **Utiliser Docker Compose** :

```bash
docker-compose up --build
```

### Option 2: Serveurs séparés

#### Backend (Flask)
```bash
# Utiliser Gunicorn pour la production
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Frontend (React)
```bash
# Build pour la production
npm run build

# Servir avec nginx ou serveur statique
npx serve -s dist -l 3000
```

### Option 3: Cloud Deployment

#### Heroku
```bash
# Backend
heroku create your-app-backend
git subtree push --prefix=backend heroku main

# Frontend
heroku create your-app-frontend
heroku buildpacks:set mars/create-react-app
git subtree push --prefix=frontend heroku main
```

#### AWS/Google Cloud
- Utiliser AWS Elastic Beanstalk ou Google App Engine
- Configurer les variables d'environnement
- Utiliser S3/Cloud Storage pour les fichiers statiques

## Bonnes Pratiques de Sécurité

### Backend
- Validation stricte des types de fichiers
- Limitation de la taille des uploads
- Authentification JWT pour les APIs sensibles
- CORS configuré correctement
- Logs de sécurité

### Frontend
- Validation côté client ET serveur
- Gestion d'erreurs robuste
- Interface utilisateur claire pour les erreurs
- Feedback visuel pendant les uploads

## Variables d'Environnement

### Backend (.env)
```
FLASK_ENV=production
SECRET_KEY=your-secret-key
MAX_CONTENT_LENGTH=104857600  # 100MB
UPLOAD_FOLDER=uploads
MODEL_FOLDER=models
KERAS_MODEL_PATH=models/brain_tumor_vgg16.keras
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_MAX_FILE_SIZE=104857600
```

## Modèles Supportés

### Format .keras (TensorFlow 2.x)
- **brain_tumor_vgg16.keras** : Modèle basé sur VGG16 pour classification binaire
- **Input Shape** : (224, 224, 3) - Images RGB 224x224
- **Output** : Classification binaire (Tumor/No Tumor)
- **Preprocessing** : VGG16 standard avec mean subtraction

### Exemple de structure de modèle attendue :
```python
# Création d'un modèle compatible
base_model = VGG16(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(128, activation='relu'),
    Dropout(0.5),
    Dense(1, activation='sigmoid')  # Binaire: 0=No Tumor, 1=Tumor
])
model.save('brain_tumor_vgg16.keras')
```

## Monitoring et Logs

- Utiliser des outils comme Sentry pour le monitoring d'erreurs
- Logs structurés avec des niveaux appropriés
- Métriques de performance des prédictions
- Monitoring de l'utilisation des ressources

## Tests

### Backend
```bash
python -m pytest tests/
```

### Frontend
```bash
npm test
```

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changes (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.