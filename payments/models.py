from django.db import models
from companies.models import Company
from clients.models import Client
from sales.models import Invoice
from django.contrib.auth.models import User

class PaymentMethod(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='payment_methods')
    name = models.CharField(max_length=100, verbose_name="Nom du mode de paiement")
    code = models.CharField(max_length=50, unique=True, verbose_name="Code")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Mode de paiement"
        verbose_name_plural = "Modes de paiement"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('completed', 'Complété'),
        ('failed', 'Échoué'),
        ('cancelled', 'Annulé'),
    ]
    
    TYPE_CHOICES = [
        ('incoming', 'Entrant'),
        ('outgoing', 'Sortant'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='payments')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, related_name='payments')
    payment_type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="Type de paiement")
    reference = models.CharField(max_length=100, unique=True, verbose_name="Référence")
    amount = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Montant")
    payment_date = models.DateField(auto_now_add=True, verbose_name="Date de paiement")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='payments_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"{self.reference} - {self.amount} €"