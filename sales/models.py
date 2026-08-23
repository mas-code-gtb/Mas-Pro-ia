from django.db import models
from companies.models import Company
from clients.models import Client
from products.models import Product
from django.contrib.auth.models import User

class Quote(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('sent', 'Envoyé'),
        ('accepted', 'Accepté'),
        ('rejected', 'Rejeté'),
        ('expired', 'Expiré'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='quotes')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='quotes')
    quote_number = models.CharField(max_length=100, unique=True, verbose_name="Numéro de devis")
    quote_date = models.DateField(auto_now_add=True, verbose_name="Date du devis")
    valid_until = models.DateField(verbose_name="Valable jusqu'au")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='quotes_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Devis"
        verbose_name_plural = "Devis"
        ordering = ['-quote_date']
    
    def __str__(self):
        return f"{self.quote_number} - {self.client.name}"


class QuoteLine(models.Model):
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='quote_lines')
    quantity = models.IntegerField(verbose_name="Quantité")
    unit_price = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Prix unitaire")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="TVA (%)")
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    class Meta:
        verbose_name = "Ligne de devis"
        verbose_name_plural = "Lignes de devis"
    
    def save(self, *args, **kwargs):
        """Calcule automatiquement le montant de la TVA et le total avant la sauvegarde"""
        self.tax_amount = (self.unit_price * self.quantity) * (self.tax_rate / 100)
        self.total = (self.unit_price * self.quantity) + self.tax_amount
        super().save(*args, **kwargs)


class SalesOrder(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('confirmed', 'Confirmé'),
        ('shipped', 'Expédié'),
        ('delivered', 'Livré'),
        ('cancelled', 'Annulé'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('paid', 'Payé'),
        ('partial', 'Partiel'),
        ('overdue', 'En retard'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='sales_orders')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='sales_orders')
    quote = models.ForeignKey(Quote, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales_orders')
    order_number = models.CharField(max_length=100, unique=True, verbose_name="Numéro de commande")
    order_date = models.DateField(auto_now_add=True, verbose_name="Date de commande")
    delivery_date = models.DateField(null=True, blank=True, verbose_name="Date de livraison")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sales_orders_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Commande client"
        verbose_name_plural = "Commandes clients"
        ordering = ['-order_date']
    
    def __str__(self):
        return f"{self.order_number} - {self.client.name}"


class SalesOrderLine(models.Model):
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sales_lines')
    quantity = models.IntegerField(verbose_name="Quantité")
    unit_price = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Prix unitaire")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="TVA (%)")
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    class Meta:
        verbose_name = "Ligne de commande client"
        verbose_name_plural = "Lignes de commande client"
    
    def save(self, *args, **kwargs):
        """Calcule automatiquement le montant de la TVA et le total avant la sauvegarde"""
        self.tax_amount = (self.unit_price * self.quantity) * (self.tax_rate / 100)
        self.total = (self.unit_price * self.quantity) + self.tax_amount
        super().save(*args, **kwargs)


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('sent', 'Envoyée'),
        ('paid', 'Payée'),
        ('overdue', 'En retard'),
        ('cancelled', 'Annulée'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='invoices')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='invoices')
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    invoice_number = models.CharField(max_length=100, unique=True, verbose_name="Numéro de facture")
    invoice_date = models.DateField(auto_now_add=True, verbose_name="Date de facture")
    due_date = models.DateField(verbose_name="Date d'échéance")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='invoices_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Facture"
        verbose_name_plural = "Factures"
        ordering = ['-invoice_date']
    
    def __str__(self):
        return f"{self.invoice_number} - {self.client.name}"


class InvoiceLine(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='invoice_lines')
    quantity = models.IntegerField(verbose_name="Quantité")
    unit_price = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Prix unitaire")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="TVA (%)")
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    class Meta:
        verbose_name = "Ligne de facture"
        verbose_name_plural = "Lignes de facture"
    
    def save(self, *args, **kwargs):
        """Calcule automatiquement le montant de la TVA et le total avant la sauvegarde"""
        self.tax_amount = (self.unit_price * self.quantity) * (self.tax_rate / 100)
        self.total = (self.unit_price * self.quantity) + self.tax_amount
        super().save(*args, **kwargs)