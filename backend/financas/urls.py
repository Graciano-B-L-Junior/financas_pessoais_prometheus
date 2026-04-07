from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, TransacaoViewSet, ImportXlsxView, RegisterView

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'transacoes', TransacaoViewSet, basename='transacao')

urlpatterns = [
    path('', include(router.urls)),
    path('importar/', ImportXlsxView.as_view(), name='importar-xlsx'),
    path('auth/register/', RegisterView.as_view(), name='register'),
]
