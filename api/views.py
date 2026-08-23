from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse
from django.contrib.auth.models import User
from django.db.models import Count, Sum
from .models import Project
from .serializers import ProjectSerializer

# ============================================================
# IMPORTS POUR LE DASHBOARD
# ============================================================
from companies.models import Company
from clients.models import Client
from products.models import Product
from sales.models import SalesOrder, Invoice
from purchases.models import PurchaseOrder

# ============================================================
# VUE D'ACCUEIL DE L'API
# ============================================================
@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'projects': reverse('project-list', request=request, format=format),
        'dashboard': reverse('dashboard-stats', request=request, format=format),
        'admin': '/admin/',
        'login': '/api-auth/login/',
        'logout': '/api-auth/logout/',
    })

# ============================================================
# VIEWSET POUR LES PROJETS
# ============================================================
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]
    
    def perform_create(self, serializer):
        user = User.objects.first()
        if not user:
            user = User.objects.create_user(
                username='admin',
                password='admin123',
                email='admin@example.com'
            )
            print(f" Utilisateur par défaut créé : admin / admin123")
        serializer.save(created_by=user)

# ============================================================
# ENDPOINT : STATISTIQUES DU TABLEAU DE BORD
# ============================================================
@api_view(['GET'])
def dashboard_stats(request):
    """
    Endpoint pour les statistiques du tableau de bord
    URL: /api/dashboard/stats/
    """
    try:
        # Compter les éléments
        total_entreprises = Company.objects.count()
        total_clients = Client.objects.count()
        total_produits = Product.objects.count()
        total_utilisateurs = User.objects.count()
        total_commandes = SalesOrder.objects.count()
        
        # Calculer le total des ventes
        total_ventes = SalesOrder.objects.aggregate(Sum('total'))['total__sum'] or 0
        
        # Compter les fournisseurs
        try:
            from suppliers.models import Supplier
            total_fournisseurs = Supplier.objects.count()
        except:
            total_fournisseurs = 0
        
        # Compter les factures impayées
        try:
            total_factures_impayees = Invoice.objects.filter(status='unpaid').count()
        except:
            total_factures_impayees = 0
        
        # Compter les commandes fournisseurs
        try:
            total_commandes_fournisseurs = PurchaseOrder.objects.count()
        except:
            total_commandes_fournisseurs = 0
        
        data = {
            'entreprises': total_entreprises,
            'clients': total_clients,
            'fournisseurs': total_fournisseurs,
            'produits': total_produits,
            'utilisateurs': total_utilisateurs,
            'commandes': total_commandes,
            'commandes_fournisseurs': total_commandes_fournisseurs,
            'ventes_total': float(total_ventes),
            'factures_impayees': total_factures_impayees,
            'success': True,
        }
        
        return Response(data)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la récupération des statistiques'
        }, status=500)

# ============================================================
# ENDPOINT : STATISTIQUES SPÉCIFIQUES
# ============================================================

@api_view(['GET'])
def dashboard_stats_sales(request):
    """Statistiques des ventes"""
    total_ventes = SalesOrder.objects.aggregate(Sum('total'))['total__sum'] or 0
    total_commandes = SalesOrder.objects.count()
    
    return Response({
        'ventes_total': float(total_ventes),
        'commandes_total': total_commandes,
        'panier_moyen': float(total_ventes / total_commandes) if total_commandes > 0 else 0,
        'success': True,
    })

@api_view(['GET'])
def dashboard_stats_products(request):
    """Statistiques des produits"""
    total_produits = Product.objects.count()
    low_stock = Product.objects.filter(quantity__lte=5).count() if hasattr(Product, 'quantity') else 0
    
    return Response({
        'produits_total': total_produits,
        'stock_bas': low_stock,
        'success': True,
    })

@api_view(['GET'])
def dashboard_stats_clients(request):
    """Statistiques des clients"""
    total_clients = Client.objects.count()
    factures_impayees = Invoice.objects.filter(status='unpaid').count()
    
    return Response({
        'clients_total': total_clients,
        'factures_impayees': factures_impayees,
        'success': True,
    })

# ============================================================
# ASSISTANT IA
# ============================================================
@api_view(['POST'])
@permission_classes([AllowAny])
def ai_chat(request):
    """
    Endpoint pour l'assistant IA
    URL: /api/ai/chat/
    Body: {"message": "Bonjour", "language": "french"}
    """
    try:
        message = request.data.get('message', '')
        language = request.data.get('language', 'french')
        company_id = request.data.get('company_id', None)
        is_super_admin = request.data.get('is_super_admin', False)
        
        print(f" Message reçu: {message}")
        print(f" Langue: {language}")
        
        if not message:
            return Response({
                'response': "Veuillez poser une question.",
                'success': False
            }, status=400)
        
        # Importer le service IA
        from ai.services import AIService
        ai_service = AIService()
        
        # Appeler le service IA
        result = ai_service.chat(
            message=message,
            language=language,
            company_id=company_id,
            is_super_admin=is_super_admin
        )
        
        print(f" Réponse IA envoyée")
        
        return Response({
            'response': result.get('response', ''),
            'success': result.get('success', False),
            'language': result.get('language', 'french')
        })
        
    except Exception as e:
        print(f" Erreur AI: {e}")
        import traceback
        traceback.print_exc()
        return Response({
            'response': f"Erreur: {str(e)}",
            'success': False
        }, status=500)