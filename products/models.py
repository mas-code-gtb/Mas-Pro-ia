from django.db import models
from companies.models import Company

class Category(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=255, verbose_name="Nom de la catégorie")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                               related_name='subcategories', verbose_name="Catégorie parente")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        ordering = ['name']
        unique_together = ['company', 'name']

    def __str__(self):
        return self.name


class Product(models.Model):
    UNIT_CHOICES = [
        ('piece', 'Pièce'),
        ('kg', 'Kilogramme'),
        ('g', 'Gramme'),
        ('l', 'Litre'),
        ('ml', 'Millilitre'),
        ('m', 'Mètre'),
        ('cm', 'Centimètre'),
        ('carton', 'Carton'),
        ('palette', 'Palette'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, 
                                 related_name='products', verbose_name="Catégorie")
    name = models.CharField(max_length=255, verbose_name="Nom du produit")
    reference = models.CharField(max_length=100, unique=True, verbose_name="Référence")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='piece', verbose_name="Unité")
    unit_price = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Prix unitaire")
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Prix d'achat")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="Taux de TVA (%)")
    current_stock = models.IntegerField(default=0, verbose_name="Stock actuel")
    min_stock = models.IntegerField(default=0, verbose_name="Stock minimum")
    max_stock = models.IntegerField(default=0, verbose_name="Stock maximum")
    location = models.CharField(max_length=255, blank=True, null=True, verbose_name="Emplacement")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Produit"
        verbose_name_plural = "Produits"
        ordering = ['name']
        unique_together = ['company', 'reference']

    def __str__(self):
        return f"{self.reference} - {self.name}"


class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ('in', 'Entrée'),
        ('out', 'Sortie'),
        ('adjustment', 'Ajustement'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES, verbose_name="Type de mouvement")
    quantity = models.IntegerField(verbose_name="Quantité")
    reason = models.TextField(blank=True, null=True, verbose_name="Motif")
    reference = models.CharField(max_length=255, blank=True, null=True, verbose_name="Référence liée")
    created_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, 
                                   related_name='stock_movements_created')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Mouvement de stock"
        verbose_name_plural = "Mouvements de stock"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} - {self.movement_type} - {self.quantity}"