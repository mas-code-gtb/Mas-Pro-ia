from django.core.management.base import BaseCommand
from companies.models import Company
from products.models import Category
class Command(BaseCommand):
    help = 'Cree les categories de produits par defaut si elles n\'existent pas'
    def handle(self, *args, **options):
        company = Company.objects.first()
        if not company:
            self.stdout.write('Aucune entreprise trouvee. On ignore.')
            return
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
            "Autres",
        ]
        created = 0
        for cat_name in categories:
            category, created_bool = Category.objects.get_or_create(
                company=company,
                name=cat_name,
                defaults={'description': f'Categorie {cat_name}'}
            )
            if created_bool:
                created += 1
        self.stdout.write(f'{created} categories creees avec succes.')
