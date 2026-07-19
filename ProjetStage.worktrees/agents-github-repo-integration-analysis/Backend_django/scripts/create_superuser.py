
#importation de la fonction 'get_user_model' pour réccupérer le modele personnalisé de l'utilisateur
from django.contrib.auth import get_user_model

# Chargement du fichier .env
import os
from dotenv import load_dotenv
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

# Fonction d'automatisation de la création d'un superutilisateur Django
def run():
    
    """
    Cette fonction crée un superutilisateur Django à partir des variables
    d'environnement DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL,
    et DJANGO_SUPERUSER_PASSWORD si ce superutilisateur n'existe pas déjà.
    """
    
    # Récupération du modèle utilisateur actif (User ou personnalisé)
    User=get_user_model()
    
    # Lecture des informations du superutilisateur depuis le fichier .env
    username=os.getenv('DJANGO_SUPERUSER_USERNAME')
    email=os.getenv('DJANGO_SUPERUSER_EMAIL')
    password=os.getenv('DJANGO_SUPERUSER_PASSWORD')   
    
    # Vérifie si un utilisateur avec ce nom d'utilisateur existe déjà et si ce n'est pas le cas, crée un superutilisateur
    if not User.objects.filter(username=username).exists():
        print(f"Superuser '{username}' non trouvé, création en cours...")
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"Superuser '{username}' créé avec succès.")
    else:
        print(f"Superuser '{username}' existe déjà, aucune action nécessaire.")


