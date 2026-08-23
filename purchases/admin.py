from django.contrib import admin
from .models import PurchaseOrder, PurchaseOrderLine, PurchaseReceipt, PurchaseReceiptLine

class PurchaseOrderLineInline(admin.TabularInline):
    model = PurchaseOrderLine
    extra = 1

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'supplier', 'order_date', 'total', 'status', 'payment_status']
    list_filter = ['status', 'payment_status', 'order_date']
    search_fields = ['order_number', 'supplier__name']
    readonly_fields = ['subtotal', 'tax_total', 'total', 'created_at', 'updated_at']
    inlines = [PurchaseOrderLineInline]

class PurchaseReceiptLineInline(admin.TabularInline):
    model = PurchaseReceiptLine
    extra = 1

@admin.register(PurchaseReceipt)
class PurchaseReceiptAdmin(admin.ModelAdmin):
    list_display = ['receipt_number', 'purchase_order', 'receipt_date']
    list_filter = ['receipt_date']
    search_fields = ['receipt_number', 'purchase_order__order_number']
    inlines = [PurchaseReceiptLineInline]