from rest_framework import serializers
from .models import PurchaseOrder, PurchaseOrderLine, PurchaseReceipt, PurchaseReceiptLine

class PurchaseOrderLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = PurchaseOrderLine
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 
                  'tax_rate', 'tax_amount', 'total', 'quantity_received']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    lines = PurchaseOrderLineSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = ['id', 'company', 'supplier', 'supplier_name', 'order_number', 
                  'order_date', 'expected_delivery_date', 'delivery_date', 
                  'status', 'payment_status', 'subtotal', 'tax_total', 'total', 
                  'notes', 'lines', 'created_by', 'created_by_username', 
                  'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'subtotal', 'tax_total', 'total']


class PurchaseReceiptLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='purchase_line.product.name', read_only=True)
    
    class Meta:
        model = PurchaseReceiptLine
        fields = ['id', 'purchase_line', 'product_name', 'quantity_received', 'notes']


class PurchaseReceiptSerializer(serializers.ModelSerializer):
    lines = PurchaseReceiptLineSerializer(many=True, read_only=True)
    order_number = serializers.CharField(source='purchase_order.order_number', read_only=True)
    
    class Meta:
        model = PurchaseReceipt
        fields = ['id', 'purchase_order', 'order_number', 'receipt_number', 
                  'receipt_date', 'lines', 'notes', 'created_by', 'created_at']
        read_only_fields = ['created_by', 'created_at']