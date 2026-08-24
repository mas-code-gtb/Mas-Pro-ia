from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import os
class Command(BaseCommand):
    help = 'Cree un superutilisateur si les variables sont definies'
    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        if not username or not password:
            self.stdout.write('Variables non definies, on ignore.')
            return
        if User.objects.filter(username=username).exists():
            self.stdout.write(f'Superutilisateur "{username}" existe deja.')
            return
        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(f'Superutilisateur "{username}" cree avec succes.')
