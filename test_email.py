import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maspro_ai_backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print(f" De: {settings.DEFAULT_FROM_EMAIL}")
print(f" Host: {settings.EMAIL_HOST}")
print(f" Port: {settings.EMAIL_PORT}")

try:
    send_mail(
        subject='Test Mas-Pro AI',
        message='Ceci est un test d\'envoi d\'email depuis Mas-Pro AI',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['dioufmassamba440@gmail.com'],
        fail_silently=False,
    )
    print(' Email de test envoyé avec succès !')
except Exception as e:
    print(f'❌ Erreur: {e}')