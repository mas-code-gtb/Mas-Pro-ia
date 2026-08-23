from django.contrib import admin
from .models import Supplier

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'type', 'status', 'company']
    list_filter = ['type', 'status', 'country']
    search_fields = ['name', 'email', 'phone', 'registration_number']
    readonly_fields = ['created_at', 'updated_at']