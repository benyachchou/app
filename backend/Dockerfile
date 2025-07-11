FROM python:3.9-slim

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libhdf5-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de requirements
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p uploads models

# Exposer le port
EXPOSE 5000

# Variables d'environnement
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Commande pour démarrer l'application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]