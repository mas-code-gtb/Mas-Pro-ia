from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import Invoice, InvoiceLine

def send_invoice_email(invoice_id):
    """Envoie un email avec la facture en pièce jointe"""
    try:
        invoice = Invoice.objects.get(id=invoice_id)
        lines = InvoiceLine.objects.filter(invoice=invoice)
        client = invoice.client
        
        # Vérifier que le client a un email
        if not client.email:
            print(f"❌ Le client {client.name} n'a pas d'email")
            return False
        
        print(f" Envoi à: {client.email}")
        print(f" De: {settings.DEFAULT_FROM_EMAIL}")
        
        # Préparer le sujet
        subject = f'Mas-Pro AI - Facture n° {invoice.invoice_number}'
        
        # Préparer le HTML
        html_message = render_to_string('sales/emails/invoice_created.html', {
            'invoice': invoice,
            'lines': lines,
            'client': client,
        })
        
        # Version texte
        plain_message = strip_tags(html_message)
        
        # Envoyer l'email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[client.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        print(f" Email envoyé à {client.email}")
        return True
    except Exception as e:
        print(f"❌ Erreur détaillée: {e}")
        import traceback
        traceback.print_exc()
        return False