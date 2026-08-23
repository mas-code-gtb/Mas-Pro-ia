from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConversationViewSet, ChatViewSet, AnalyzeViewSet, ReportViewSet

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', ChatViewSet.as_view({'post': 'create'}), name='chat'),
    path('analyze/', AnalyzeViewSet.as_view({'post': 'create'}), name='analyze'),
    path('report/', ReportViewSet.as_view({'post': 'create'}), name='report'),  # 👈 NOUVEAU
]