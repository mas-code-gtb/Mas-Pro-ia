from django.contrib import admin
from .models import Payment, PaymentMethod

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'code']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['reference', 'client', 'amount', 'payment_type', 'status', 'payment_date']
    list_filter = ['payment_type', 'status', 'payment_date']
    search_fields = ['reference', 'client__name', 'invoice__invoice_number']