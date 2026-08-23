from rest_framework import serializers
from .models import Category, Product, StockMovement

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'company', 'name', 'description', 'parent', 'subcategories', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_subcategories(self, obj):
        return CategorySerializer(obj.subcategories.all(), many=True).data


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'company', 'category', 'category_name', 'name', 'reference', 'description', 
                  'unit', 'unit_price', 'purchase_price', 'tax_rate', 'current_stock', 
                  'min_stock', 'max_stock', 'location', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = ['id', 'product', 'product_name', 'movement_type', 'quantity', 'reason', 
                  'reference', 'created_by', 'created_by_username', 'created_at']
        read_only_fields = ['created_by', 'created_at']