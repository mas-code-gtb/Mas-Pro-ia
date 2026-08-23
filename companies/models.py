from django.db import models
from django.contrib.auth.models import User

class Company(models.Model):
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('inactive', 'Inactif'),
        ('suspended', 'Suspendu'),
    ]
    
    name = models.CharField(max_length=255, verbose_name="Nom de l'entreprise")
    registration_number = models.CharField(max_length=100, unique=True, verbose_name="Numéro d'enregistrement")
    tax_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="N° TVA")
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(max_length=50, verbose_name="Téléphone")
    address = models.TextField(verbose_name="Adresse")
    city = models.CharField(max_length=100, verbose_name="Ville")
    country = models.CharField(max_length=100, verbose_name="Pays")
    website = models.URLField(blank=True, null=True, verbose_name="Site web")
    logo = models.ImageField(upload_to='logos/', blank=True, null=True, verbose_name="Logo")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="Statut")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='companies_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Entreprise"
        verbose_name_plural = "Entreprises"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name