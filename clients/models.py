from django.db import models
from companies.models import Company
from django.contrib.auth.models import User

class Client(models.Model):
    TYPE_CHOICES = [
        ('individual', 'Particulier'),
        ('company', 'Entreprise'),
        ('non_profit', 'Association/ONG'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('inactive', 'Inactif'),
        ('lead', 'Prospect'),
    ]
    
    # ============================================================
    # CHAMPS OBLIGATOIRES
    # ============================================================
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='clients')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='individual')
    name = models.CharField(max_length=255, verbose_name="Nom/Prenom")
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(max_length=50, verbose_name="Téléphone")
    address = models.TextField(verbose_name="Adresse", blank=True, null=True)
    city = models.CharField(max_length=100, verbose_name="Ville")
    country = models.CharField(max_length=100, verbose_name="Pays", default='Sénégal')
    
    # ============================================================
    # CHAMPS OPTIONNELS
    # ============================================================
    registration_number = models.CharField(max_length=100, blank=True, null=True, verbose_name="N° d'enregistrement")
    tax_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="N° TVA")
    contact_person = models.CharField(max_length=255, blank=True, null=True, verbose_name="Personne de contact")
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='lead')
    
    # ============================================================
    # CHAMPS AUDIT
    # ============================================================
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='clients_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Client"
        verbose_name_plural = "Clients"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name