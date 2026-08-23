from django.db import models
from companies.models import Company
from django.contrib.auth.models import User

class ChartOfAccount(models.Model):
    """Plan comptable"""
    
    ACCOUNT_TYPES = [
        ('asset', 'Actif'),
        ('liability', 'Passif'),
        ('equity', 'Capitaux propres'),
        ('income', 'Produits'),
        ('expense', 'Charges'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='accounts')
    code = models.CharField(max_length=20, verbose_name="Code compte")
    name = models.CharField(max_length=255, verbose_name="Nom du compte")
    type = models.CharField(max_length=20, choices=ACCOUNT_TYPES, verbose_name="Type")
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                               related_name='children', verbose_name="Compte parent")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Plan comptable"
        verbose_name_plural = "Plans comptables"
        ordering = ['code']
        unique_together = ['company', 'code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class JournalEntry(models.Model):
    """Écriture comptable"""
    
    JOURNAL_TYPES = [
        ('general', 'Journal général'),
        ('sales', 'Journal des ventes'),
        ('purchases', 'Journal des achats'),
        ('cash', 'Journal de caisse'),
        ('bank', 'Journal de banque'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='journal_entries')
    journal_type = models.CharField(max_length=20, choices=JOURNAL_TYPES, default='general')
    entry_number = models.CharField(max_length=50, verbose_name="Numéro d'écriture")
    entry_date = models.DateField(verbose_name="Date d'écriture")
    description = models.TextField(verbose_name="Description")
    reference = models.CharField(max_length=100, blank=True, null=True, verbose_name="Référence")
    is_balanced = models.BooleanField(default=False, verbose_name="Équilibrée")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='journal_entries_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Écriture comptable"
        verbose_name_plural = "Écritures comptables"
        ordering = ['-entry_date', '-entry_number']
        unique_together = ['company', 'entry_number']
    
    def __str__(self):
        return f"{self.entry_number} - {self.description[:50]}"


class JournalLine(models.Model):
    """Ligne d'écriture comptable (débit/crédit)"""
    
    DEBIT_CREDIT = [
        ('debit', 'Débit'),
        ('credit', 'Crédit'),
    ]
    
    entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey(ChartOfAccount, on_delete=models.CASCADE, related_name='journal_lines')
    debit_credit = models.CharField(max_length=10, choices=DEBIT_CREDIT, verbose_name="Débit/Crédit")
    amount = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Montant")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    
    class Meta:
        verbose_name = "Ligne d'écriture"
        verbose_name_plural = "Lignes d'écriture"
    
    def __str__(self):
        return f"{self.entry.entry_number} - {self.account.code} - {self.amount} €"