# apps/inscription_pedagogique/views/apiviews/parcours_relations_view.py - NOUVEAU FICHIER

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.inscription_pedagogique.models import Parcours

@api_view(['GET'])
#permission_classes([IsAuthenticated])
def parcours_avec_relations(request):
    """
    Endpoint qui retourne les parcours avec leurs filières et années d'étude
    URL: /api/inscription/parcours-relations/
    """
    parcours_data = []
    
    for parcours in Parcours.objects.prefetch_related('filieres', 'annees_etude'):
        parcours_info = {
            'id': parcours.id,
            'libelle': parcours.libelle,
            'abbreviation': parcours.abbreviation,
            # Filières liées à ce parcours
            'filieres': [
                {
                    'id': f.id, 
                    'nom': f.nom, 
                    'abbreviation': f.abbreviation
                } 
                for f in parcours.filieres.all()
            ],
            # Années d'étude liées à ce parcours  
            'annees_etude': [
                {
                    'id': a.id,
                    'libelle': a.libelle
                }
                for a in parcours.annees_etude.all()
            ]
        }
        parcours_data.append(parcours_info)
    
    return Response({
        'parcours': parcours_data,
        'success': True
    })