from rest_framework import serializers
from .models import Quote, QuoteLine, SalesOrder, SalesOrderLine, Invoice, InvoiceLine

class QuoteLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = QuoteLine
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 
                  'tax_rate', 'tax_amount', 'total']


class QuoteSerializer(serializers.ModelSerializer):
    lines = QuoteLineSerializer(many=True, read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    
    class Meta:
        model = Quote
        fields = ['id', 'company', 'client', 'client_name', 'quote_number', 
                  'quote_date', 'valid_until', 'status', 'subtotal', 'tax_total', 
                  'total', 'notes', 'lines', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'subtotal', 'tax_total', 'total']


class SalesOrderLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = SalesOrderLine
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 
                  'tax_rate', 'tax_amount', 'total']


class SalesOrderSerializer(serializers.ModelSerializer):
    lines = SalesOrderLineSerializer(many=True, read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    
    class Meta:
        model = SalesOrder
        fields = ['id', 'company', 'client', 'client_name', 'quote', 'order_number', 
                  'order_date', 'delivery_date', 'status', 'payment_status', 
                  'subtotal', 'tax_total', 'total', 'notes', 'lines', 
                  'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'subtotal', 'tax_total', 'total']


class InvoiceLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = InvoiceLine
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 
                  'tax_rate', 'tax_amount', 'total']


class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True, read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    
    class Meta:
        model = Invoice
        fields = ['id', 'company', 'client', 'client_name', 'sales_order', 
                  'invoice_number', 'invoice_date', 'due_date', 'status', 
                  'subtotal', 'tax_total', 'total', 'notes', 'lines', 
                  'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'subtotal', 'tax_total', 'total']