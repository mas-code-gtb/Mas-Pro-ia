from django.db import models
from companies.models import Company
from suppliers.models import Supplier
from products.models import Product
from django.contrib.auth.models import User

class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('sent', 'Envoyé'),
        ('received', 'Reçu'),
        ('cancelled', 'Annulé'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('paid', 'Payé'),
        ('overdue', 'En retard'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='purchase_orders')
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders')
    order_number = models.CharField(max_length=100, unique=True, verbose_name="Numéro de commande")
    order_date = models.DateField(auto_now_add=True, verbose_name="Date de commande")
    expected_delivery_date = models.DateField(verbose_name="Date de livraison prévue")
    delivery_date = models.DateField(null=True, blank=True, verbose_name="Date de livraison réelle")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Sous-total")
    tax_total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Total TVA")
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Total")
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='purchase_orders_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Commande d'achat"
        verbose_name_plural = "Commandes d'achat"
        ordering = ['-order_date']
    
    def __str__(self):
        return f"{self.order_number} - {self.supplier.name}"


class PurchaseOrderLine(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='purchase_lines')
    quantity = models.IntegerField(verbose_name="Quantité commandée")
    unit_price = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Prix unitaire")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="Taux de TVA (%)")
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Montant TVA")
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Total")
    quantity_received = models.IntegerField(default=0, verbose_name="Quantité reçue")
    
    class Meta:
        verbose_name = "Ligne de commande"
        verbose_name_plural = "Lignes de commande"
    
    def save(self, *args, **kwargs):
        """Calcule automatiquement le montant de la TVA et le total avant la sauvegarde"""
        # Calcul du montant de la TVA
        self.tax_amount = (self.unit_price * self.quantity) * (self.tax_rate / 100)
        # Calcul du total (prix HT + TVA)
        self.total = (self.unit_price * self.quantity) + self.tax_amount
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.purchase_order.order_number} - {self.product.name}"


class PurchaseReceipt(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='receipts')
    receipt_number = models.CharField(max_length=100, unique=True, verbose_name="Numéro de réception")
    receipt_date = models.DateField(auto_now_add=True, verbose_name="Date de réception")
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='purchase_receipts_created')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Réception de commande"
        verbose_name_plural = "Réceptions de commande"
        ordering = ['-receipt_date']
    
    def __str__(self):
        return f"Réception {self.receipt_number} - {self.purchase_order.order_number}"


class PurchaseReceiptLine(models.Model):
    receipt = models.ForeignKey(PurchaseReceipt, on_delete=models.CASCADE, related_name='lines')
    purchase_line = models.ForeignKey(PurchaseOrderLine, on_delete=models.CASCADE, related_name='receipt_lines')
    quantity_received = models.IntegerField(verbose_name="Quantité reçue")
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    
    class Meta:
        verbose_name = "Ligne de réception"
        verbose_name_plural = "Lignes de réception"