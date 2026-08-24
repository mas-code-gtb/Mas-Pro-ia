from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_CENTER
from .models import Quote, SalesOrder, Invoice, InvoiceLine
from .serializers import (
    QuoteSerializer, QuoteLineSerializer, 
    SalesOrderSerializer, SalesOrderLineSerializer,
    InvoiceSerializer, InvoiceLineSerializer
)
from companies.models import Company
from .utils import send_invoice_email  

class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_line(self, request, pk=None):
        quote = self.get_object()
        serializer = QuoteLineSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                line = serializer.save(quote=quote)
                self._update_totals(quote)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _update_totals(self, quote):
        lines = quote.lines.all()
        subtotal = lines.aggregate(total=Sum('total'))['total'] or 0
        tax_total = lines.aggregate(total=Sum('tax_amount'))['total'] or 0
        quote.subtotal = subtotal
        quote.tax_total = tax_total
        quote.total = subtotal + tax_total
        quote.save()


class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_line(self, request, pk=None):
        order = self.get_object()
        serializer = SalesOrderLineSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                line = serializer.save(sales_order=order)
                self._update_totals(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _update_totals(self, order):
        lines = order.lines.all()
        subtotal = lines.aggregate(total=Sum('total'))['total'] or 0
        tax_total = lines.aggregate(total=Sum('tax_amount'))['total'] or 0
        order.subtotal = subtotal
        order.tax_total = tax_total
        order.total = subtotal + tax_total
        order.save()


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        invoice = serializer.save(created_by=self.request.user)
        # Email desactive automatiquement - utiliser le bouton "Envoyer par email" a la place
    
    @action(detail=True, methods=['post'])
    def add_line(self, request, pk=None):
        invoice = self.get_object()
        serializer = InvoiceLineSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                line = serializer.save(invoice=invoice)
                self._update_totals(invoice)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _update_totals(self, invoice):
        lines = invoice.lines.all()
        subtotal = lines.aggregate(total=Sum('total'))['total'] or 0
        tax_total = lines.aggregate(total=Sum('tax_amount'))['total'] or 0
        invoice.subtotal = subtotal
        invoice.tax_total = tax_total
        invoice.total = subtotal + tax_total
        invoice.save()
    
    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        """Envoie la facture par email"""
        invoice = self.get_object()
        success = send_invoice_email(invoice.id)
        if success:
            return Response(
                {'message': 'Email envoyé avec succès'}, 
                status=status.HTTP_200_OK
            )
        return Response(
            {'error': 'Erreur lors de l\'envoi de l\'email'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def generate_invoice_pdf(request, invoice_id):
    """Génère un PDF pour une facture avec ReportLab"""
    invoice = get_object_or_404(Invoice, id=invoice_id)
    lines = InvoiceLine.objects.filter(invoice=invoice)
    company = Company.objects.first()
    client = invoice.client
    
    # Créer le buffer pour le PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle', 
        parent=styles['Heading1'], 
        fontSize=20, 
        textColor=colors.HexColor('#4a90d9'), 
        alignment=TA_CENTER
    )
    heading_style = ParagraphStyle(
        'HeadingStyle', 
        parent=styles['Heading2'], 
        fontSize=14, 
        textColor=colors.HexColor('#4a90d9')
    )
    normal_style = styles['Normal']
    right_style = ParagraphStyle(
        'RightStyle', 
        parent=styles['Normal'], 
        alignment=TA_RIGHT
    )
    
    # Contenu
    elements = []
    
    # En-tête
    elements.append(Paragraph(f"<b>{company.name if company else 'Mas-Pro AI'}</b>", title_style))
    elements.append(Spacer(1, 0.2*cm))
    if company:
        elements.append(Paragraph(f"{company.address or ''}", normal_style))
        elements.append(Paragraph(f"Tél: {company.phone or ''} | Email: {company.email or ''}", normal_style))
    elements.append(Spacer(1, 0.5*cm))
    
    # Titre Facture
    elements.append(Paragraph(f"<b>FACTURE N° {invoice.invoice_number}</b>", heading_style))
    elements.append(Paragraph(f"Date: {invoice.invoice_date.strftime('%d/%m/%Y')}", normal_style))
    elements.append(Paragraph(f"Échéance: {invoice.due_date.strftime('%d/%m/%Y')}", normal_style))
    elements.append(Spacer(1, 0.5*cm))
    
    # Informations client
    elements.append(Paragraph("<b>Client</b>", heading_style))
    elements.append(Paragraph(f"{client.name}", normal_style))
    elements.append(Paragraph(f"{client.email or ''}", normal_style))
    elements.append(Paragraph(f"{client.phone or ''}", normal_style))
    elements.append(Spacer(1, 0.5*cm))
    
    # Tableau des produits
    data = [['Description', 'Qté', 'Prix U.', 'TVA', 'Total']]
    for line in lines:
        data.append([
            line.product.name,
            str(line.quantity),
            f"{line.unit_price:.2f} FCFA",
            f"{line.tax_rate:.0f}%",
            f"{line.total:.2f} FCFA"
        ])
    
    # Ajouter les totaux
    data.append(['', '', '', 'Sous-total', f"{invoice.subtotal:.2f} FCFA"])
    data.append(['', '', '', 'TVA', f"{invoice.tax_total:.2f} FCFA"])
    data.append(['', '', '', 'TOTAL', f"{invoice.total:.2f} FCFA"])
    
    table = Table(data, colWidths=[6*cm, 2*cm, 2.5*cm, 2*cm, 3*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4a90d9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, -3), (-1, -1), colors.HexColor('#e8f0fe')),
        ('FONTNAME', (0, -3), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, -3), (-1, -1), 10),
        ('GRID', (0, 0), (-4, -4), 0.5, colors.grey),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#4a90d9')),
    ]))
    elements.append(table)
    
    # Pied de page
    elements.append(Spacer(1, 1*cm))
    elements.append(Paragraph("Merci de votre confiance !", normal_style))
    elements.append(Paragraph(f"© {invoice.invoice_date.year} Mas-Pro AI - Tous droits réservés", normal_style))
    
    # Générer le PDF
    doc.build(elements)
    
    # Créer la réponse
    pdf = buffer.getvalue()
    buffer.close()
    
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="facture_{invoice.invoice_number}.pdf"'
    return response