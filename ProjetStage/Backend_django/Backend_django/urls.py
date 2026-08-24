 # Backend_django/Backend_django/urls.py
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def root_healthcheck(request):
    return HttpResponse("OK", content_type="text/plain")


urlpatterns = [
    path('', root_healthcheck, name='root-healthcheck'),
    path('admin/', admin.site.urls),
    # Auth JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Include app URLs
    path('api/utilisateurs/', include('apps.utilisateurs.urls')),
    path('api/inscription/', include('apps.inscription_pedagogique.urls')),
    path('api/notes/', include('apps.page_professeur.urls')),
    path('api/auth/', include('apps.authentification.urls')),   
    path('api/notifications/', include('apps.notifications.urls')),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

