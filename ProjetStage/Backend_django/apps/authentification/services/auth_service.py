# apps/authentification/services/auth_service.py
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.utilisateurs.models import Etudiant

# Récupération du modèle utilisateur personnalisé
User = get_user_model()




User = get_user_model()

class AuthService:

    @staticmethod
    def login(username, password):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return None

        try:
            user_auth = authenticate(username=user.username, password=password)
        except Exception:
            user_auth = None

        if user_auth is None:
            return None

        try:
            refresh = RefreshToken.for_user(user)
        except Exception as exc:
            raise RuntimeError(f"Impossible de générer les tokens: {exc}") from exc

        num_carte = None
        try:
            if hasattr(user, 'etudiant') and user.etudiant:
                num_carte = user.etudiant.num_carte
        except Exception:
            num_carte = None

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "sexe": getattr(user, 'sexe', None),
                "telephone": getattr(user, 'telephone', None),
                "num_carte": num_carte,
            },
            "message": f"Bienvenue {user.first_name} !"
        }
        
        

""" class AuthService:

    @staticmethod
    def login(username, password):
        user = authenticate(username=username, password=password)
        if not user:
            return None  # Mauvais identifiants

        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        } """
