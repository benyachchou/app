import pytest
import os
import tempfile
from app import app
import json
from io import BytesIO

@pytest.fixture
def client():
    """Fixture pour le client de test Flask"""
    app.config['TESTING'] = True
    app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp()
    app.config['MODEL_FOLDER'] = tempfile.mkdtemp()
    
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Test de l'endpoint de santé"""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'success'

def test_model_status_no_model(client):
    """Test du statut du modèle quand aucun modèle n'est chargé"""
    response = client.get('/api/model-status')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['model_loaded'] == False

def test_upload_model_no_file(client):
    """Test d'upload de modèle sans fichier"""
    response = client.post('/api/upload-model')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['status'] == 'error'

def test_upload_model_wrong_extension(client):
    """Test d'upload de modèle avec mauvaise extension"""
    data = {
        'model': (BytesIO(b'fake model data'), 'model.txt')
    }
    response = client.post('/api/upload-model', data=data)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['status'] == 'error'

def test_predict_no_model(client):
    """Test de prédiction sans modèle chargé"""
    data = {
        'image': (BytesIO(b'fake image data'), 'test.jpg')
    }
    response = client.post('/api/predict', data=data)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['status'] == 'error'

def test_predict_no_image(client):
    """Test de prédiction sans image"""
    response = client.post('/api/predict')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['status'] == 'error'

def test_predictions_history(client):
    """Test de l'historique des prédictions"""
    response = client.get('/api/predictions-history')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'success'
    assert 'files' in data
    assert 'count' in data

def test_404_error(client):
    """Test de l'erreur 404"""
    response = client.get('/api/nonexistent')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['status'] == 'error'