# setup_api.ps1
# Script pour recréer le venv et démarrer l'API avec Uvicorn

Write-Host "=== Nettoyage de l'ancien environnement virtuel ==="
if (Test-Path ".\env") {
    Remove-Item -Recurse -Force .\env
}

Write-Host "=== Création d'un nouvel environnement virtuel ==="
python -m venv env

Write-Host "=== Activation de l'environnement ==="
& .\env\Scripts\activate

Write-Host "=== Mise à jour de pip ==="
python -m pip install --upgrade pip

Write-Host "=== Installation des dépendances ==="
if (Test-Path ".\requirements.txt") {
    pip install -r requirements.txt
} else {
    Write-Host "⚠️ Aucun fichier requirements.txt trouvé, installation manuelle nécessaire."
}

Write-Host "=== Installation de uvicorn (si nécessaire) ==="
pip install uvicorn

Write-Host "=== Démarrage de l'API avec Uvicorn ==="
python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000
