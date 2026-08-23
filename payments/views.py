from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Payment, PaymentMethod
from .serializers import PaymentSerializer, PaymentMethodSerializer
from sales.models import Invoice

class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        payment = self.get_object()
        
        if payment.status != 'pending':
            return Response(
                {'error': 'Ce paiement a déjà été traité'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            payment.status = 'completed'
            payment.save()
            
            # Mettre à jour le statut de la facture si elle existe
            if payment.invoice:
                invoice = payment.invoice
                total_paid = invoice.payments.filter(status='completed').aggregate(
                    total=models.Sum('amount')
                )['total'] or 0
                
                if total_paid >= invoice.total:
                    invoice.status = 'paid'
                else:
                    invoice.status = 'sent'
                invoice.save()
        
        return Response(PaymentSerializer(payment).data)