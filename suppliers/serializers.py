from rest_framework import serializers
from .models import Supplier

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'company', 'type', 'name', 'email', 'phone', 'address', 
                  'city', 'country', 'registration_number', 'tax_id', 'contact_person', 
                  'contact_phone', 'contact_email', 'notes', 'status', 
                  'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']