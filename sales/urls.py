from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuoteViewSet, 
    SalesOrderViewSet, 
    InvoiceViewSet, 
    generate_invoice_pdf
)

router = DefaultRouter()
router.register(r'salesorders', SalesOrderViewSet, basename='salesorder')
router.register(r'quotes', QuoteViewSet, basename='quote')
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('', include(router.urls)),
    path('invoice/<int:invoice_id>/pdf/', generate_invoice_pdf, name='invoice_pdf'),
]