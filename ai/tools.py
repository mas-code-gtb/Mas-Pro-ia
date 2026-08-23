from sales.models import SalesOrder, SalesOrderLine, Invoice
from products.models import Product
from clients.models import Client
from suppliers.models import Supplier
from purchases.models import PurchaseOrder
from companies.models import Company
from django.db.models import Sum, Count, Q, F
from datetime import datetime, timedelta
from django.contrib.auth.models import User

class AITools:
    """Outils pour l'IA afin d'accéder aux données de l'entreprise"""
    
    def __init__(self, company_id=None, is_super_admin=False):
        self.company_id = company_id
        self.is_super_admin = is_super_admin
    
    def get_company(self):
        """Récupérer l'entreprise"""
        if self.company_id:
            try:
                return Company.objects.get(id=self.company_id)
            except Company.DoesNotExist:
                return Company.objects.first()
        return Company.objects.first()
    
    def get_total_clients(self):
        """Nombre total de clients"""
        if self.is_super_admin:
            return Client.objects.count()
        company = self.get_company()
        if company:
            return Client.objects.filter(company=company).count()
        return Client.objects.count()
    
    def get_total_products(self):
        """Nombre total de produits"""
        if self.is_super_admin:
            return Product.objects.count()
        company = self.get_company()
        if company:
            return Product.objects.filter(company=company).count()
        return Product.objects.count()
    
    def get_total_sales(self, days=30):
        """Total des ventes sur une période"""
        if self.is_super_admin:
            start_date = datetime.now().date() - timedelta(days=days)
            sales = SalesOrder.objects.filter(order_date__gte=start_date)
            total = sales.aggregate(total=Sum('total'))['total'] or 0
            return float(total)
        
        company = self.get_company()
        if company:
            start_date = datetime.now().date() - timedelta(days=days)
            sales = SalesOrder.objects.filter(
                company=company,
                order_date__gte=start_date
            )
            total = sales.aggregate(total=Sum('total'))['total'] or 0
            return float(total)
        return 0
    
    def get_total_orders(self, days=30):
        """Nombre total de commandes"""
        if self.is_super_admin:
            start_date = datetime.now().date() - timedelta(days=days)
            return SalesOrder.objects.filter(order_date__gte=start_date).count()
        
        company = self.get_company()
        if company:
            start_date = datetime.now().date() - timedelta(days=days)
            return SalesOrder.objects.filter(
                company=company,
                order_date__gte=start_date
            ).count()
        return 0
    
    def get_top_products(self, limit=5):
        """Produits les plus vendus"""
        if self.is_super_admin:
            top = SalesOrderLine.objects.all().values(
                'product__name'
            ).annotate(
                total_quantity=Sum('quantity'),
                total_revenue=Sum('total')
            ).order_by('-total_revenue')[:limit]
            return list(top)
        
        company = self.get_company()
        if company:
            top = SalesOrderLine.objects.filter(
                sales_order__company=company
            ).values('product__name').annotate(
                total_quantity=Sum('quantity'),
                total_revenue=Sum('total')
            ).order_by('-total_revenue')[:limit]
            return list(top)
        return []
    
    def get_recent_clients(self, limit=5):
        """Derniers clients ajoutés"""
        if self.is_super_admin:
            return Client.objects.all().order_by('-created_at')[:limit]
        
        company = self.get_company()
        if company:
            return Client.objects.filter(company=company).order_by('-created_at')[:limit]
        return []
    
    def get_sales_trend(self):
        """Tendance des ventes (mois précédent vs mois actuel)"""
        now = datetime.now()
        first_day_current = datetime(now.year, now.month, 1).date()
        
        if self.is_super_admin:
            current_sales = SalesOrder.objects.filter(
                order_date__gte=first_day_current
            ).aggregate(total=Sum('total'))['total'] or 0
        else:
            company = self.get_company()
            if company:
                current_sales = SalesOrder.objects.filter(
                    company=company,
                    order_date__gte=first_day_current
                ).aggregate(total=Sum('total'))['total'] or 0
            else:
                current_sales = 0
        
        # Mois précédent
        if now.month == 1:
            first_day_prev = datetime(now.year - 1, 12, 1).date()
        else:
            first_day_prev = datetime(now.year, now.month - 1, 1).date()
        
        if self.is_super_admin:
            prev_sales = SalesOrder.objects.filter(
                order_date__gte=first_day_prev,
                order_date__lt=first_day_current
            ).aggregate(total=Sum('total'))['total'] or 0
        else:
            company = self.get_company()
            if company:
                prev_sales = SalesOrder.objects.filter(
                    company=company,
                    order_date__gte=first_day_prev,
                    order_date__lt=first_day_current
                ).aggregate(total=Sum('total'))['total'] or 0
            else:
                prev_sales = 0
        
        current = float(current_sales)
        prev = float(prev_sales)
        
        return {
            'current': current,
            'previous': prev,
            'percentage_change': ((current - prev) / prev * 100) if prev > 0 else 0
        }
    
    def get_unpaid_invoices(self):
        """Factures impayées"""
        if self.is_super_admin:
            return Invoice.objects.filter(
                status__in=['draft', 'sent', 'overdue']
            ).count()
        
        company = self.get_company()
        if company:
            return Invoice.objects.filter(
                company=company,
                status__in=['draft', 'sent', 'overdue']
            ).count()
        return 0
    
    def get_low_stock_products(self):
        """Produits en stock bas"""
        if self.is_super_admin:
            return Product.objects.filter(
                current_stock__lte=F('min_stock'),
                min_stock__gt=0
            ).count()
        
        company = self.get_company()
        if company:
            return Product.objects.filter(
                company=company,
                current_stock__lte=F('min_stock'),
                min_stock__gt=0
            ).count()
        return 0