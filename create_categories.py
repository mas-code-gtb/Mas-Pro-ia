import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maspro_ai_backend.settings')
django.setup()

from companies.models import Company
from products.models import Category
from django.contrib.auth.models import User

# Récupérer la première entreprise
company = Company.objects.first()
if not company:
    print(" Aucune entreprise trouvée. Créez une entreprise d'abord.")
    exit()

user = User.objects.first()
if not user:
    print(" Aucun utilisateur trouvé.")
    exit()

# Liste des catégories
categories = [
    "Électronique",
    "Informatique",
    "Télécommunications",
    "Alimentaire",
    "Boissons",
    "Vêtements",
    "Chaussures",
    "Accessoires",
    "Mobilier",
    "Décoration",
    "Matériaux de construction",
    "Fournitures de bureau",
    "Équipement médical",
    "Pharmacie",
    "Produits ménagers",
    "Jardinage",
    "Auto / Moto",
    "Services",
    "Autres"
]

# Créer les catégories
created = 0
for cat_name in categories:
    category, created_bool = Category.objects.get_or_create(
        company=company,
        name=cat_name,
        defaults={'description': f'Catégorie {cat_name}'}
    )
    if created_bool:
        created += 1
        print(f" Catégorie créée : {cat_name}")
    else:
        print(f" Catégorie existe déjà : {cat_name}")

print(f"\n🎉 {created} catégories créées avec succès !")