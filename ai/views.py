from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from .services import AIService

ai_service = AIService()

class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def chat(self, request, pk=None):
        conversation = self.get_object()
        message_text = request.data.get('message')
        context = request.data.get('context', '')
        language = request.data.get('language', None)
        
        if not message_text:
            return Response(
                {'error': 'Le message est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer l'entreprise de l'utilisateur
        company_id = None
        if hasattr(request.user, 'profile') and request.user.profile.company:
            company_id = request.user.profile.company.id
        
        # Sauvegarder le message utilisateur
        user_message = Message.objects.create(
            conversation=conversation,
            role='user',
            content=message_text,
            language=language or 'french'
        )
        
        # Obtenir la réponse IA avec le company_id
        response = ai_service.chat(message_text, context, language, company_id)
        
        if response['success']:
            # Sauvegarder la réponse
            assistant_message = Message.objects.create(
                conversation=conversation,
                role='assistant',
                content=response['response'],
                language=response['language']
            )
            
            return Response({
                'user_message': MessageSerializer(user_message).data,
                'assistant_message': MessageSerializer(assistant_message).data,
                'response': response['response'],
                'language': response['language']
            })
        else:
            return Response(
                {'error': response['response']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChatViewSet(viewsets.ViewSet):
    """Chat simple sans historique"""
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request):
        message = request.data.get('message')
        context = request.data.get('context', '')
        language = request.data.get('language', None)
        
        if not message:
            return Response(
                {'error': 'Le message est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer l'entreprise de l'utilisateur
        company_id = None
        if hasattr(request.user, 'profile') and request.user.profile.company:
            company_id = request.user.profile.company.id
        
        response = ai_service.chat(message, context, language, company_id)
        
        if response['success']:
            return Response({
                'response': response['response'],
                'success': True,
                'language': response.get('language', 'french')
            })
        else:
            return Response(
                {'error': response['response']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnalyzeViewSet(viewsets.ViewSet):
    """Analyse de données"""
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request):
        data = request.data.get('data')
        question = request.data.get('question')
        language = request.data.get('language', 'french')
        
        if not data or not question:
            return Response(
                {'error': 'Les champs data et question sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        response = ai_service.analyze_data(data, question, language)
        
        return Response({
            'analysis': response,
            'success': True
        })


class ReportViewSet(viewsets.ViewSet):
    """Génération de rapports"""
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        report_type = request.data.get('type', 'sales')
        period = request.data.get('period', 'month')
        language = request.data.get('language', 'french')

        # Récupérer l'entreprise de l'utilisateur
        company_id = None
        if hasattr(request.user, 'profile') and request.user.profile.company:
            company_id = request.user.profile.company.id

        # Vérifier si l'utilisateur est Super Admin
        is_super_admin = request.user.is_superuser or (
            hasattr(request.user, 'profile') and
            request.user.profile.role == 'super_admin'
        )

        report = ai_service.generate_report(report_type, period, language)

        return Response({
            'report': report,
            'type': report_type,
            'period': period,
            'success': True
        })