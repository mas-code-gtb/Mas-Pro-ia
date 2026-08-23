from rest_framework import serializers
from .models import Client

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'company', 'type', 'name', 'email', 'phone', 'address', 
                  'city', 'country', 'registration_number', 'tax_id', 'contact_person', 
                  'notes', 'status', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']