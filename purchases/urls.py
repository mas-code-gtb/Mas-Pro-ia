from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PurchaseOrderViewSet, PurchaseReceiptViewSet

router = DefaultRouter()
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchaseorder')
router.register(r'receipts', PurchaseReceiptViewSet, basename='purchasereceipt')

urlpatterns = [
    path('', include(router.urls)),
]