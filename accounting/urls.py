from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChartOfAccountViewSet, JournalEntryViewSet

router = DefaultRouter()
router.register(r'accounts', ChartOfAccountViewSet, basename='account')
router.register(r'journal-entries', JournalEntryViewSet, basename='journalentry')

urlpatterns = [
    path('', include(router.urls)),
]