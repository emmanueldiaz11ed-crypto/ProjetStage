# apps/page_professeur/views.py

from django.shortcuts import render
# Create your views here.

from rest_framework import viewsets, status
from apps.utilisateurs.services.journal import enregistrer_action
from apps.notifications.services.notification_service import NotificationService
from apps.page_professeur.services import calculer_validation_ue, obtenir_resultats_etudiant, obtenir_ues_validees, calculer_tous_resultats_ue
from .models import UE, AffectationUe, Evaluation, Note, Projet, Recherche, Article, Encadrement,PeriodeSaisie, Anonymat, ResultatUE
from apps.inscription_pedagogique.models import Departement, Inscription
from apps.authentification.permissions import IsAdminOrRespNotesOnly, IsProfOrSecretaire, IsProfesseur, IsResponsableNotes, IsOwnerOrReadOnlyForProf, IsSuperUserOrGestionnaire
from .serializers import UESerializer,AffectationUeSerializer, EvaluationSerializer, NoteSerializer, ProjetSerializer, RechercheSerializer, ArticleSerializer, EncadrementSerializer, PeriodeSaisieSerializer, AnonymatSerializer, ResultatUESerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions 
from rest_framework.exceptions import PermissionDenied
from apps.utilisateurs.models import Professeur, Etudiant, Secretaire, Gestionnaire, ChefServiceExam
from apps.utilisateurs.serializers import EtudiantSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Max
from django.core.mail import send_mail
from django.conf import settings
from urllib import request
from rest_framework import viewsets
from .models import Note
from .serializers import NoteSerializer
from ..utilisateurs.services.journal import enregistrer_action


class UEViewSet(viewsets.ModelViewSet):
    queryset = UE.objects.all().order_by('code')
    serializer_class = UESerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['parcours', 'filiere', 'annee_etude', 'semestre']
    pagination_class = None

    def get_permissions(self):
    
        user = self.request.user
        
        # Création, modification, suppression, seulement Responsable de notes
        if self.action in ['create', 'update', 'destroy']:
            return [IsSuperUserOrGestionnaire()]

        elif self.action == 'list':
            if hasattr(user, 'professeur') or hasattr(user, 'secretaire'):
                return [IsProfOrSecretaire()]
            elif user.is_superuser or hasattr(user, 'gestionnaire'):
                return [IsSuperUserOrGestionnaire()]
            else:
                return [permissions.IsAuthenticated()]

        elif self.action in ['retrieve', 'filtrer']:
            return [permissions.AllowAny()]

        return [permissions.IsAuthenticated()]


    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrage optionnel pour les professeurs
        if hasattr(self.request.user, 'professeur'):
            return queryset.filter(professeur=self.request.user.professeur)
        
        return queryset

   
    # Récupération des étudiants inscrits à une UE donnée selon l'année académique sélectionnée

    @action(detail=True, methods=['get'])
    def etudiantsInscrits(self, request, pk=None):
        annee = request.query_params.get("annee")
        ue = self.get_object()
        etudiantsInscrits = Etudiant.objects.filter(inscriptions__ues=ue, inscriptions__anneeAcademique=annee).distinct()
        serializer = EtudiantSerializer(etudiantsInscrits, many=True)
        return Response(serializer.data)

    
    # Récupérer toutes les évaluations liées à une UE donnée pendant l'année académique selectionnee
    @action(detail=True, methods=['get'], url_path='evaluations')
    def get_evaluations(self, request, pk=None):
        annee_id = request.query_params.get("annee")

        try:
            ue = self.get_object()
            evaluations = ue.evaluations.filter(annee_academique_id=annee_id)
            serializer = EvaluationSerializer(evaluations, many=True)
            return Response(serializer.data)
        except UE.DoesNotExist:
            return Response({"error": "UE introuvable"}, status=404)

    # Nouvelle action pour récupérer les notes
    @action(detail=True, methods=["get"])
    def notes(self, request, pk=None):
        """
        Récupère toutes les évaluations d’une UE, les étudiants inscrits,
        leurs notes, le semestre, l’année académique et les numéros anonymes.
        Possibilité de filtrer par année académique avec ?annee=ID.
        """
        ue = self.get_object()

        #  Semestre de l’UE
        semestre = ue.semestre.libelle if ue.semestre else None

        #  Récupération du paramètre année académique
        annee_id = request.query_params.get("annee")

        # Si aucune année n’est fournie, on prend la plus récente automatiquement
        if not annee_id:
            last_year = Inscription.objects.filter(ues=ue).aggregate(
                annee_max=Max("anneeAcademique__id")
            )["annee_max"]
            annee_id = last_year

        #  Récupération de l'objet AnneeAcademique correspondant
        inscription_ue = Inscription.objects.filter(
            ues=ue, anneeAcademique_id=annee_id
        ).select_related("anneeAcademique").first()
        annee_academique = inscription_ue.anneeAcademique.libelle if inscription_ue else None

        #  Toutes les évaluations de l’UE selon l'année académique
        evaluations = Evaluation.objects.filter(ue=ue, annee_academique_id=annee_id)

        # 4Tous les étudiants inscrits à cette UE et cette année
        etudiants = Etudiant.objects.filter(
            inscriptions__ues=ue,
            inscriptions__anneeAcademique_id=annee_id
        ).distinct()

        # Construction de la réponse
        data = {
            "ue": ue.libelle,
            "semestre": semestre,
            "annee_academique": annee_academique,
            "evaluations": [
                {"id": ev.id, "type": ev.type, "poids": ev.poids, "anonyme": ev.anonyme}
                for ev in evaluations
            ],
            "etudiants": []
        }

        for etu in etudiants:
            #  Récupération du numéro d’anonymat
            anonymat_obj = Anonymat.objects.filter(etudiant=etu, ue=ue, annee_academique_id=annee_id).first()
            numero_anonymat = anonymat_obj.numero if anonymat_obj else None
            num_anonymat_id = anonymat_obj.id if anonymat_obj else None
            #  Récupération des notes
            notes_dict = {}
            for ev in evaluations:
                note_obj = Note.objects.filter(etudiant=etu, evaluation=ev).first()
                notes_dict[str(ev.id)] = note_obj.note if note_obj else None

            data["etudiants"].append({
                "id": etu.id,
                "nom": etu.utilisateur.last_name,
                "prenom": etu.utilisateur.first_name,
                "num_carte": etu.num_carte,
                "num_anonymat": numero_anonymat,
                "num_anonymat_id": num_anonymat_id,
                "sexe": etu.utilisateur.sexe,
                "notes": notes_dict,
            })

        return Response(data)

    
    # Filtrer les UEs par parcours, filière et année d'étude    
    @action(detail=False, methods=['get'], url_path='filtrer')
    def filtrer(self, request):
        """
        Récupérer les UEs filtrées par parcours, filière et année d'étude.
        Exemple d'URL :
        GET /notes/ues/filtrer/?parcours=1&filiere=2&annee_etude=3
        """
        parcours_id = request.query_params.get('parcours')
        filiere_id = request.query_params.get('filiere')
        annee_id = request.query_params.get('annee_etude')

        queryset = UE.objects.all()

        if parcours_id:
            queryset = queryset.filter(parcours__id=parcours_id)
        if filiere_id:
            queryset = queryset.filter(filiere__id=filiere_id)
        if annee_id:
            queryset = queryset.filter(annee_etude__id=annee_id)

        serializer = UESerializer(queryset.distinct(), many=True)
        return Response(serializer.data)

    
    # Ues par departement 
    @action(detail=False, methods=['get'], url_path='par-departement')
    def par_departement(self, request):
        departement_id = request.query_params.get('departement_id')
        """
        Retourne la liste des UE d'un département donné.
        L'ID du département est passé dans l'URL.
        """
        ues = UE.objects.filter(filiere__departement__id=departement_id).distinct()
        serializer = self.get_serializer(ues, many=True)
        return Response(serializer.data)

    #  Calculer les résultats 
    @action(detail=True, methods=['post'], url_path='calculer-resultats')
    def calculer_resultats(self, request, pk=None):
        """
        Calcule les résultats de tous les étudiants pour cette UE
        URL: POST /notes/ues/{id}/calculer-resultats/
        """
        ue = self.get_object()
        
        try:
            resultats = calculer_tous_resultats_ue(ue)
            return Response({
                'success': True,
                'message': f"Résultats calculés pour l'UE {ue.code}",
                'details': resultats
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': f"Erreur lors du calcul des résultats: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
  
    #Endpoint pour recuperer les ues qui ont des examens anonymes par année academique passé en parametre dans l'url
    @action(detail=False, methods=["get"], url_path="filter-examen")
    def ues_avec_examen(self, request):
        
        """
        Liste toutes les UEs qui ont au moins une évaluation de type 'Examen'.
        """
        annee_id = request.query_params.get('annee_etude')
        # 🔍 Filtrer les UEs dont au moins une évaluation est de type 'Examen'
        ues = UE.objects.filter(evaluations__type="Examen", evaluations__anonyme=True, evaluations__annee_academique_id=annee_id).distinct()
        serializer = self.get_serializer(ues, many=True)
        return Response(serializer.data)


    #Endpoint pour recuperer les ues qui ont des evaluations anonymes et qui n'ont pas encore de notes saisies
    @action(detail=False, methods=["get"], url_path="ues-anonymes-sans-notes")
    def ues_anonymes_sans_notes(self, request):
        """
        Liste toutes les UEs qui ont au moins une évaluation anonyme
        et pour lesquelles aucune note n'a encore été saisie.
        """
        annee_id = request.query_params.get('annee')
        ues = UE.objects.filter(
            evaluations__anonyme=True,
            evaluations__annee_academique_id=annee_id
        ).distinct()

        ues_sans_notes = []
        for ue in ues:
            evaluations_anonymes = ue.evaluations.filter(anonyme=True, annee_academique_id=annee_id)
            notes_existantes = Note.objects.filter(evaluation__in=evaluations_anonymes).exists()
            if not notes_existantes:
                ues_sans_notes.append(ue)

        serializer = self.get_serializer(ues_sans_notes, many=True)
        enregistrer_action(
            utilisateur=request.user,
            action="Liste des UEs avec examen anonyme sans notes",
            objet="UEs avec examen anonyme sans notes",
            ip=request.META.get('REMOTE_ADDR'),
            description="Liste des UEs avec examen anonyme sans notes consultée"
        )
        return Response(serializer.data)
    
    # ✅ Action pour récupérer l'état d'une UE spécifique
    @action(detail=True, methods=["get"], url_path="controle-notes")
    def controle_notes_ue(self, request, pk=None):
        annee_id = request.query_params.get("annee")

        # ✅ Sécurité : seul responsable des notes ou admin
        if not hasattr(request.user, "resp_notes") and not hasattr(request.user, "chef_service_examen") and not request.user.is_superuser:
            return Response(
                {"error": "Accès interdit"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            ue = UE.objects.prefetch_related("evaluations").get(id=pk)
        except UE.DoesNotExist:
            return Response(
                {"error": "UE non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )

        etat_ue = {
            "ue_id": ue.id,
            "ue_libelle": ue.libelle,
            "ue_code": ue.code,
            "etat_global": "complet",   # deviendra "incomplet" si une note manque
            "evaluations": [],
            "professeur": None
        }

        # ✅ Récupération du professeur via AffectationUe
        affectation = AffectationUe.objects.filter(ue=ue).select_related(
            "professeur", "professeur__utilisateur"
        ).first()

        if affectation:
            professeur = affectation.professeur
            etat_ue["professeur"] = {
                "id": professeur.utilisateur.id,
                "nom": professeur.utilisateur.last_name,
                "prenom": professeur.utilisateur.first_name
            }

        # ✅ Vérification des notes par évaluation
        evaluations = Evaluation.objects.filter(ue=ue, annee_academique_id=annee_id)

        for evaluation in evaluations:
            notes_exist = Note.objects.filter(evaluation=evaluation).exists()

            if notes_exist:
                etat_ue["evaluations"].append({
                    "evaluation_id": evaluation.id,
                    "type": evaluation.type,
                    "etat": "saisi"
                })
            else:
                etat_ue["evaluations"].append({
                    "evaluation_id": evaluation.id,
                    "type": evaluation.type,
                    "etat": "manquant"
                })
                etat_ue["etat_global"] = "incomplet"
        enregistrer_action(
            utilisateur=request.user,
            action="State d'une UE pour contrôle des notes",
            objet=f"UE  {ue.code}{ue.libelle}",
            ip=request.META.get('REMOTE_ADDR'),
            description="Liste des UEs avec examen anonyme consultée"
        )

        return Response(etat_ue, status=status.HTTP_200_OK)


    # Pourcentage de complétude des notes par département
    @action(detail=False, methods=["get"], url_path="controle-departements")
    def controle_departements(self, request):

        annee_id = request.query_params.get("annee")

        if not annee_id:    
            return Response({"error": "annee requise"}, status=400)

        departements = Departement.objects.all()

        resultats = []

        for departement in departements:

            ues = UE.objects.filter(
                filiere__departement=departement
            ).distinct()

            ues_data = []
            total_ues = 0
            ues_completes = 0

            for ue in ues:

                etat_ue = {
                    "ue_id": ue.id,
                    "ue_libelle": ue.libelle,
                    "ue_code": ue.code,
                    "etat_global": "complet",
                    "evaluations": [],
                    "professeur": None
                }                
                # évaluations de l'année
                evaluations = Evaluation.objects.filter(
                    ue=ue,
                    annee_academique_id=annee_id
                )

                for evaluation in evaluations:

                    notes_exist = Note.objects.filter(
                        evaluation=evaluation
                    ).exists()

                    if notes_exist:

                        etat_ue["evaluations"].append({
                            "evaluation_id": evaluation.id,
                            "type": evaluation.type,
                            "etat": "saisi"
                        })

                    else:

                        etat_ue["evaluations"].append({
                            "evaluation_id": evaluation.id,
                            "type": evaluation.type,
                            "etat": "manquant"
                        })

                        etat_ue["etat_global"] = "incomplet"

                total_ues += 1

                if etat_ue["etat_global"] == "complet":
                    ues_completes += 1

                ues_data.append(etat_ue)

            pourcentage = 0
            if total_ues > 0:
                pourcentage = round((ues_completes / total_ues) * 100, 2)

            resultats.append({
                "departement_id": departement.id,
                "departement_nom": departement.nom,
                "pourcentage": pourcentage,
                "total_ues": total_ues,
                "ues_completes": ues_completes,
                "ues": ues_data
            })

        return Response(resultats)


   
    # Obtenir les résultats d'une UE
    @action(detail=True, methods=['get'], url_path='resultats')
    def get_resultats(self, request, pk=None):
        """
        Récupère tous les résultats des étudiants pour cette UE
        URL: GET /notes/ues/{id}/resultats/
        """
        ue = self.get_object()
        
        resultats = ResultatUE.objects.filter(ue=ue).select_related('etudiant', 'etudiant__utilisateur')
        serializer = ResultatUESerializer(resultats, many=True)
        
        return Response({
            'ue': {
                'id': ue.id,
                'code': ue.code,
                'libelle': ue.libelle,
                'composite': ue.composite
            },
            'resultats': serializer.data
        })
        
    
    
        

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    pagination_class = None

     # ✅ CREATE
    def perform_create(self, serializer):
        evaluation  = serializer.save()

        enregistrer_action(
            utilisateur=self.request.user,
            action="Création d'une évaluation",
            objet=f"Évaluation ID {evaluation.type} pour UE ID {evaluation.ue}",
            ip=self.request.META.get('REMOTE_ADDR'),
            description="Une évaluation a été créée avec succès"
        )

    # ✅ UPDATE (PUT & PATCH)
    def perform_update(self, serializer):
        evaluation = serializer.save()

        enregistrer_action(
            utilisateur=self.request.user,
            action="Modification d'une évaluation",
            objet=f"Évaluation ID {evaluation.id} pour UE ID {evaluation.ue.id}",
            ip=self.request.META.get('REMOTE_ADDR'),
            description="Une évaluation a été modifiée"
        )

    # ✅ DELETE
    def perform_destroy(self, instance):
        evaluation_id = instance.id

        enregistrer_action(
            utilisateur=self.request.user,
            action="Suppression d'une évaluation",
            objet=f"Évaluation ID {evaluation_id} pour UE ID {instance.ue.id}",
            ip=self.request.META.get('REMOTE_ADDR'),
            description="Une évaluation a été supprimée"
        )

        instance.delete()
    # ✅ RETRIEVE (GET ONE)
    def retrieve(self, request, *args, **kwargs):
        enregistrer_action(
            utilisateur=request.user,
            action="Consultation d'une évaluation",
            objet=f"Note ID {kwargs.get('pk')}",
            ip=request.META.get('REMOTE_ADDR'),
            description="Détail d'une note consultée"
        )

        return super().retrieve(request, *args, **kwargs)
    
    @action (detail=False, methods=['get'], url_path='by-ue/(?P<ue_id>[^/.]+)')
    def by_ue(self, request, ue_id=None):
        annee_id = request.query_params.get("annee")

        if not ue_id:
            return Response({"error": "ue est requis"}, status=400)
        evaluations = Evaluation.objects.filter(ue__id=ue_id, annee_academique_id=annee_id)
        serializer = self.get_serializer(evaluations, many=True)
        enregistrer_action(
            utilisateur=request.user,
            action="Liste des évaluations par UE",
            objet=f"UE {ue_id}",
            ip=request.META.get('REMOTE_ADDR'),
            description="Liste des évaluations consultée"
        )
        return Response(serializer.data)
    pagination_class = None

    

class AnonymatViewSet(viewsets.ModelViewSet):
    queryset = Anonymat.objects.all()
    serializer_class = AnonymatSerializer
    pagination_class = None
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsProfOrSecretaire()]
        elif self.action in ['list']:
            if hasattr(self.request.user, 'professeur'):
                return [IsProfOrSecretaire()]
            return [IsProfesseur()]
        return [permissions.IsAuthenticated()]
     # ✅ CREATE
    def perform_create(self, serializer):
        anonymat = serializer.save()

        enregistrer_action(
            utilisateur=self.request.user,
            action="Création d'une anonymat",
            objet=f"Anonymat ID {anonymat.id} pour Étudiant ID {anonymat.etudiant}",
            ip=self.request.META.get('REMOTE_ADDR'),
            description="Une anonymat a été créée avec succès"
        )

    # ✅ UPDATE (PUT & PATCH)
    def perform_update(self, serializer):
        anonymat = serializer.save()

        enregistrer_action(
            utilisateur=self.request.user,
            action="Modification d'une anonymat",
            objet=f"Anonymat ID {anonymat.id} pour Étudiant ID {anonymat.etudiant}",
            ip=self.request.META.get('REMOTE_ADDR'),
            description="Une anonymat a été modifiée"
        )

    # ✅ DELETE
    def perform_destroy(self, instance):
        anonymat_id = instance.id

        enregistrer_action(
            utilisateur=self.request.user,
            action="Suppression d'une anonymat",
            objet=f"Anonymat ID {anonymat_id} pour Étudiant ID {instance.etudiant}",
            ip=self.request.META.get('REMOTE_ADDR'),
            description="Une anonymat a été supprimée"
        )

        instance.delete()

    # ✅ LIST (GET ALL)
    def list(self, request, *args, **kwargs):
        enregistrer_action(
            utilisateur=request.user,
            action="Consultation des anonymats",
            objet="Liste des anonymats",
            ip=request.META.get('REMOTE_ADDR'),
            description="Liste des anonymats consultée"
        )

        return super().list(request, *args, **kwargs)

    # ✅ RETRIEVE (GET ONE)
    def retrieve(self, request, *args, **kwargs):
        enregistrer_action(
            utilisateur=request.user,
            action="Consultation d'une anonymat",
            objet=f"Anonymat ID {kwargs.get('pk')}",
            ip=request.META.get('REMOTE_ADDR'),
            description="Détail d'une anonymat consultée"
        )

        return super().retrieve(request, *args, **kwargs)
    # Liste des anonymats par UE
    @action(detail=False, methods=['get'])
    def by_ue(self, request):
        ue_id = request.query_params.get("ue")
        annee_id = request.query_params.get("annee")

        if not ue_id:
            return Response({"error": "ue est requis"}, status=400)
        anonymats = Anonymat.objects.filter(ue__id=ue_id, annee_academique_id=annee_id)   
        serializer = self.get_serializer(anonymats, many=True)
        
        enregistrer_action(
            utilisateur=request.user,
            action="Liste des anonymats par UE",
            objet=f"UE {ue_id}",
            ip=request.META.get('REMOTE_ADDR'),
            description="Liste des anonymats consultée"
        )

        return Response(serializer.data)
    pagination_class = None


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    pagination_class = None

    # ✅ CREATE
    def perform_create(self, serializer):
        note = serializer.save()

        enregistrer_action(
            utilisateur=self.request.user,
            action="Création d'une note",
            objet=f"Création de Note {note.note} pour Étudiant ID {note.etudiant}",
            ip=self.request.META.get('REMOTE_ADDR'),
            description="Une note a été créée avec succès"
        )

    # ✅ UPDATE (PUT & PATCH)       
    def perform_update(self, serializer):
        user = self.request.user

        if not user.is_authenticated:
            raise PermissionDenied("Authentification requise")

        if user.role not in ["professeur", "secretaire"] and not user.is_superuser:
            raise PermissionDenied("Accès interdit")

        note = serializer.save()
        enregistrer_action(
            utilisateur=self.request.user,
            action="Modification d'une note",
            objet=f"Note ID {note.id} pour Étudiant ID {note.etudiant}",
            ip=self.request.META.get('REMOTE_ADDR'),
            description="Une note a été modifiée"
        )

    # ✅ DELETE
    def perform_destroy(self, instance):
        note_id = instance.id

        enregistrer_action(
            utilisateur=self.request.user,
            action="Suppression d'une note",
            objet=f"Note ID {note_id} pour Étudiant ID {instance.etudiant}",
            ip=self.request.META.get('REMOTE_ADDR'),
            description="Une note a été supprimée"
        )

        instance.delete()

    # ✅ LIST (GET ALL)
    def list(self, request, *args, **kwargs):
        enregistrer_action(
            utilisateur=request.user,
            action="Consultation des notes",
            objet="Liste des notes",
            ip=request.META.get('REMOTE_ADDR'),
            description="Liste des notes consultée"
        )

        return super().list(request, *args, **kwargs)

    # ✅ RETRIEVE (GET ONE)
    def retrieve(self, request, *args, **kwargs):
        enregistrer_action(
            utilisateur=request.user,
            action="Consultation d'une note",
            objet=f"Note ID {kwargs.get('pk')}",
            ip=request.META.get('REMOTE_ADDR'),
            description="Détail d'une note consultée"
        )

        return super().retrieve(request, *args, **kwargs)

class ProjetViewSet(viewsets.ModelViewSet):
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer
    pagination_class = None

    def get_queryset(self):
        return Projet.objects.filter(professeur=self.request.user.professeur)
    
    def perform_create(self, serializer):
        serializer.save(professeur=self.request.user.professeur)
    
    #Endpoint pour recuperer les projets par professeur
    @action(detail=False, methods=['get'], url_path='par-professeur/(?P<prof_id>[^/.]+)')
    def projets_par_professeur(self, request, prof_id=None):
        projets = Projet.objects.filter(professeur__id=prof_id)
        serializer = self.get_serializer(projets, many=True)
        return Response(serializer.data)
    pagination_class = None


class RechercheViewSet(viewsets.ModelViewSet):
    queryset = Recherche.objects.all()
    serializer_class = RechercheSerializer
    pagination_class = None

    def get_queryset(self):
        return Recherche.objects.filter(professeur=self.request.user.professeur)

    def perform_create(self, serializer):
        serializer.save(professeur=self.request.user.professeur)
    
    #Endpoint pour recuperer les recherches par professeur
    @action(detail=False, methods=['get'], url_path='par-professeur/(?P<prof_id>[^/.]+)')
    def recherches_par_professeur(self, request, prof_id=None):
        recherches = Recherche.objects.filter(professeur__id=prof_id)
        serializer = self.get_serializer(recherches, many=True)
        return Response(serializer.data)
    pagination_class = None



class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    pagination_class = None

    def get_queryset(self):
        return Article.objects.filter(professeur=self.request.user.professeur)
    
    def perform_create(self, serializer):
        serializer.save(professeur=self.request.user.professeur)
    
    #Endpoint pour recuperer les articles du prof connecte
    @action(detail=False, methods=['get'], url_path='mes-articles')
    def mes_articles(self, request):
        articles = Article.objects.filter(professeur=self.request.user.professeur)
        serializer = self.get_serializer(articles, many=True)
        return Response(serializer.data)
    pagination_class = None
    # Endpoint pour recuperer les articles publies par le professeur par l'id 
    @action(detail=False, methods=['get'], url_path='par-professeurId/(?P<prof_id>[^/.]+)')
    def par_professeur(self, request, prof_id=None):
        articles = Article.objects.filter(professeur__id=prof_id)
        serializer = self.get_serializer(articles, many=True)
        return Response(serializer.data)


class EncadrementViewSet(viewsets.ModelViewSet):
    queryset = Encadrement.objects.all()
    serializer_class = EncadrementSerializer
    pagination_class = None
    
    def get_queryset(self):
        return Encadrement.objects.filter(professeur=self.request.user.professeur)
    
    def perform_create(self, serializer):
        serializer.save(professeur=self.request.user.professeur)
    
    #Endpoint pour recuperer les encadrements par professeur
    @action(detail=False, methods=['get'], url_path='par-professeur/(?P<prof_id>[^/.]+)')
    def encadrements_par_professeur(self, request, prof_id=None):
        encadrements = Encadrement.objects.filter(professeur__id=prof_id)
        serializer = self.get_serializer(encadrements, many=True)
        return Response(serializer.data)
    pagination_class = None


class PeriodeSaisieViewSet(viewsets.ModelViewSet):
    queryset = PeriodeSaisie.objects.all()
    serializer_class = PeriodeSaisieSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return PeriodeSaisie.objects.all()
       

    
    def perform_create(self, serializer):
        user = self.request.user
        print("USER:", user)
        print("HAS chef_service_examen:", hasattr(user, 'chef_service_examen'))

        if hasattr(user, 'chef_service_examen'):
            periode = serializer.save(responsable=user.chef_service_examen)
        elif user.is_superuser:                                   
            responsable_id = self.request.data.get('responsable')
            periode = serializer.save(responsable_id=responsable_id)
        else:
            raise PermissionDenied("Tu n'as pas le droit de créer une période.")  # ✅ DRF, pas PermissionError

        # ✅ Notifications — s'exécute seulement si la création a réussi
        professeurs = Professeur.objects.all()
        message = (
            "✅ Une nouvelle période de saisie des notes sera ouverte du "
            + str(periode.date_debut) + " au " + str(periode.date_fin)
            + ". Veuillez procéder à la saisie dans les délais."
        )

        NotificationService.send_to_many(
            users=[prof.utilisateur for prof in professeurs],
            message=message
        )
 
class AffectationUeViewSet(viewsets.ModelViewSet):
    queryset = AffectationUe.objects.all()
    serializer_class = AffectationUeSerializer
    permission_classes = [IsSuperUserOrGestionnaire]
    pagination_class = None

    def get_permissions(self):

        if self.action in ['create', 'update', 'destroy', 'delete']:
            return [IsSuperUserOrGestionnaire()]

        elif self.action == 'list':
            if hasattr(self.request.user, 'professeur'):
                return [IsProfesseur()]
            return [IsSuperUserOrGestionnaire()]

        return super().get_permissions()
    
    # Endpoint pour supprimer une affectation d'UE à partir de l'ID de l'UE et de l'ID du professeur
    @action(detail=False, methods=['post'], url_path='supprimer')
    def supprimer_affectation(self, request):
        ue_id = request.query_params.get('ue_id')
        prof_id = request.query_params.get('prof_id')

        if not ue_id or not prof_id:
            return Response({"error": "ue_id et prof_id sont requis"}, status=400)

        try:
            affectation = AffectationUe.objects.get(ue__id=ue_id, professeur__id=prof_id)
            affectation.delete()
            return Response({"success": "Affectation supprimée"}, status=200)
        except AffectationUe.DoesNotExist:
            return Response({"error": "Affectation non trouvée"}, status=404)
        
 
#  ResultatUE
class ResultatUEViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet en lecture seule pour les résultats d'UEs
    Les résultats sont créés/mis à jour via les services
    """
    queryset = ResultatUE.objects.all().select_related('etudiant', 'ue', 'inscription')
    serializer_class = ResultatUESerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['etudiant', 'ue', 'inscription', 'est_valide']
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'], url_path='par-etudiant/(?P<etudiant_id>[^/.]+)')
    def par_etudiant(self, request, etudiant_id=None):
        """
        Récupère tous les résultats d'un étudiant
        URL: GET /notes/resultats/par-etudiant/{etudiant_id}/
        """
        try:
            etudiant = Etudiant.objects.get(id=etudiant_id)
            resultats = obtenir_resultats_etudiant(etudiant)
            serializer = self.get_serializer(resultats, many=True)
            
            # Calculer les totaux
            total_credits_obtenus = sum(r.credits_obtenus for r in resultats)
            ues_validees = resultats.filter(est_valide=True).count()
            ues_totales = resultats.count()
            
            return Response({
                'etudiant': {
                    'id': etudiant.id,
                    'num_carte': etudiant.num_carte,
                    'nom': etudiant.utilisateur.get_full_name()
                },
                'statistiques': {
                    'ues_validees': ues_validees,
                    'ues_totales': ues_totales,
                    'total_credits_obtenus': total_credits_obtenus
                },
                'resultats': serializer.data
            })
        except Etudiant.DoesNotExist:
            return Response({'error': "Étudiant non trouvé"}, status=404)
       