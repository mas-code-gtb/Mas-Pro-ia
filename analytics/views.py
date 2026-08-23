from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth, TruncDay, TruncWeek
from datetime import datetime, timedelta
from sales.models import SalesOrder, SalesOrderLine
from products.models import Product
from clients.models import Client
from companies.models import Company

class AnalyticsViewSet(viewsets.ViewSet):
    """API pour les analyses et statistiques"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_company(self):
        """Récupère l'entreprise de l'utilisateur"""
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.company:
            return user.profile.company
        return Company.objects.first()
    
    @action(detail=False, methods=['get'])
    def sales_overview(self, request):
        """Vue d'ensemble des ventes"""
        company = self.get_company()
        
        # Période par défaut : 30 derniers jours
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=30)
        
        # Récupérer les commandes
        orders = SalesOrder.objects.filter(
            company=company,
            order_date__gte=start_date,
            order_date__lte=end_date
        )
        
        # Statistiques
        total_sales = orders.aggregate(total=Sum('total'))['total'] or 0
        total_orders = orders.count()
        average_order = total_sales / total_orders if total_orders > 0 else 0
        
        # Ventes par jour
        daily_sales = orders.annotate(
            day=TruncDay('order_date')
        ).values('day').annotate(
            total=Sum('total'),
            count=Count('id')
        ).order_by('day')
        
        # Top produits
        top_products = SalesOrderLine.objects.filter(
            sales_order__in=orders
        ).values('product__name').annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum('total')
        ).order_by('-total_revenue')[:10]
        
        return Response({
            'period': {
                'start': start_date,
                'end': end_date,
            },
            'summary': {
                'total_sales': total_sales,
                'total_orders': total_orders,
                'average_order': average_order,
            },
            'daily_sales': list(daily_sales),
            'top_products': list(top_products),
        })
    
    @action(detail=False, methods=['get'])
    def product_performance(self, request):
        """Performance des produits"""
        company = self.get_company()
        
        # Période : 90 derniers jours
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=90)
        
        orders = SalesOrder.objects.filter(
            company=company,
            order_date__gte=start_date,
            order_date__lte=end_date
        )
        
        # Performance par produit
        product_perf = SalesOrderLine.objects.filter(
            sales_order__in=orders
        ).values(
            'product__id',
            'product__name',
            'product__reference'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('total'),
            total_orders=Count('sales_order', distinct=True)
        ).order_by('-total_revenue')
        
        return Response({
            'period': {
                'start': start_date,
                'end': end_date,
            },
            'products': list(product_perf),
        })
    
    @action(detail=False, methods=['get'])
    def client_analysis(self, request):
        """Analyse des clients"""
        company = self.get_company()
        
        # Période : 90 derniers jours
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=90)
        
        orders = SalesOrder.objects.filter(
            company=company,
            order_date__gte=start_date,
            order_date__lte=end_date
        )
        
        # Top clients
        top_clients = orders.values(
            'client__id',
            'client__name'
        ).annotate(
            total_spent=Sum('total'),
            total_orders=Count('id')
        ).order_by('-total_spent')[:10]
        
        total_clients = Client.objects.filter(company=company).count()
        active_clients = orders.values('client').distinct().count()
        
        return Response({
            'total_clients': total_clients,
            'active_clients': active_clients,
            'top_clients': list(top_clients),
        })
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Statistiques pour le tableau de bord"""
        company = self.get_company()
        
        # Statistiques globales
        total_products = Product.objects.filter(company=company).count()
        total_clients = Client.objects.filter(company=company).count()
        
        # Dernier mois
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=30)
        
        orders = SalesOrder.objects.filter(
            company=company,
            order_date__gte=start_date,
            order_date__lte=end_date
        )
        
        monthly_sales = orders.aggregate(total=Sum('total'))['total'] or 0
        monthly_orders = orders.count()
        
        return Response({
            'total_products': total_products,
            'total_clients': total_clients,
            'monthly_sales': monthly_sales,
            'monthly_orders': monthly_orders,
        })