from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum
from .models import PurchaseOrder, PurchaseOrderLine, PurchaseReceipt, PurchaseReceiptLine
from .serializers import PurchaseOrderSerializer, PurchaseOrderLineSerializer, PurchaseReceiptSerializer

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_line(self, request, pk=None):
        purchase_order = self.get_object()
        serializer = PurchaseOrderLineSerializer(data=request.data)
        
        if serializer.is_valid():
            with transaction.atomic():
                line = serializer.save(purchase_order=purchase_order)
                self._update_order_totals(purchase_order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        purchase_order = self.get_object()
        receipt_data = request.data
        
        with transaction.atomic():
            receipt = PurchaseReceipt.objects.create(
                purchase_order=purchase_order,
                receipt_number=f"REC-{purchase_order.order_number}-{purchase_order.receipts.count() + 1}",
                notes=receipt_data.get('notes', ''),
                created_by=request.user
            )
            
            for line_data in receipt_data.get('lines', []):
                line = PurchaseOrderLine.objects.get(id=line_data['purchase_line_id'])
                PurchaseReceiptLine.objects.create(
                    receipt=receipt,
                    purchase_line=line,
                    quantity_received=line_data['quantity_received'],
                    notes=line_data.get('notes', '')
                )
                line.quantity_received += line_data['quantity_received']
                line.save()
            
            # Vérifier si tout est reçu
            all_received = all(
                line.quantity_received >= line.quantity 
                for line in purchase_order.lines.all()
            )
            if all_received:
                purchase_order.status = 'received'
                purchase_order.delivery_date = receipt.receipt_date
                purchase_order.save()
            
            return Response(PurchaseReceiptSerializer(receipt).data, status=status.HTTP_201_CREATED)
    
    def _update_order_totals(self, purchase_order):
        lines = purchase_order.lines.all()
        subtotal = lines.aggregate(total=Sum('total'))['total'] or 0
        tax_total = lines.aggregate(total=Sum('tax_amount'))['total'] or 0
        total = subtotal + tax_total
        
        purchase_order.subtotal = subtotal
        purchase_order.tax_total = tax_total
        purchase_order.total = total
        purchase_order.save()


class PurchaseReceiptViewSet(viewsets.ModelViewSet):
    queryset = PurchaseReceipt.objects.all()
    serializer_class = PurchaseReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)