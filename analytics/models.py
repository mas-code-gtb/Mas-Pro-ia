from django.db import models
from companies.models import Company
from django.contrib.auth.models import User

class SalesReport(models.Model):
    """Rapport de ventes"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='sales_reports')
    period = models.CharField(max_length=20)  # daily, weekly, monthly, yearly
    start_date = models.DateField()
    end_date = models.DateField()
    total_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_orders = models.IntegerField(default=0)
    average_order_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    top_products = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Rapport {self.period} - {self.start_date} à {self.end_date}"