from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet,
    api_root,
    dashboard_stats,
    dashboard_stats_sales,
    dashboard_stats_products,
    dashboard_stats_clients,
)

router = DefaultRouter()
router.register('projects', ProjectViewSet)

urlpatterns = [
    path('', api_root, name='api-root'),
    path('', include(router.urls)),
    
    # Endpoints pour le dashboard
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('dashboard/sales/', dashboard_stats_sales, name='dashboard-sales'),
    path('dashboard/products/', dashboard_stats_products, name='dashboard-products'),
    path('dashboard/clients/', dashboard_stats_clients, name='dashboard-clients'),
    
    # Auth
    path('auth/', include('rest_framework.urls')),
]