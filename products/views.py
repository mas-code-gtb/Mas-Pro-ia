from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Category, Product, StockMovement
from .serializers import CategorySerializer, ProductSerializer, StockMovementSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save()

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        product = self.get_object()
        quantity = request.data.get('quantity')
        movement_type = request.data.get('movement_type')
        reason = request.data.get('reason', '')
        
        if not quantity or not movement_type:
            return Response(
                {'error': 'quantity and movement_type are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            quantity = int(quantity)
        except ValueError:
            return Response(
                {'error': 'quantity must be an integer'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            if movement_type == 'in':
                product.current_stock += quantity
            elif movement_type == 'out':
                if product.current_stock < quantity:
                    return Response(
                        {'error': 'Stock insuffisant'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                product.current_stock -= quantity
            else:
                return Response(
                    {'error': 'Invalid movement_type. Use "in" or "out"'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            product.save()
            
            StockMovement.objects.create(
                product=product,
                movement_type=movement_type,
                quantity=quantity,
                reason=reason,
                created_by=request.user
            )
            
        return Response(ProductSerializer(product).data)

class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]