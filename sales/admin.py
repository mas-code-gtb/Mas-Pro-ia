from django.contrib import admin
from .models import Quote, QuoteLine, SalesOrder, SalesOrderLine, Invoice, InvoiceLine

class QuoteLineInline(admin.TabularInline):
    model = QuoteLine
    extra = 1

@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ['quote_number', 'client', 'quote_date', 'valid_until', 'status', 'total']
    list_filter = ['status', 'quote_date']
    search_fields = ['quote_number', 'client__name']
    inlines = [QuoteLineInline]


class SalesOrderLineInline(admin.TabularInline):
    model = SalesOrderLine
    extra = 1

@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'client', 'order_date', 'status', 'payment_status', 'total']
    list_filter = ['status', 'payment_status', 'order_date']
    search_fields = ['order_number', 'client__name']
    inlines = [SalesOrderLineInline]


class InvoiceLineInline(admin.TabularInline):
    model = InvoiceLine
    extra = 1

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'client', 'invoice_date', 'due_date', 'status', 'total']
    list_filter = ['status', 'invoice_date', 'due_date']
    search_fields = ['invoice_number', 'client__name']
    inlines = [InvoiceLineInline]