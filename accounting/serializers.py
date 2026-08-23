from rest_framework import serializers
from .models import ChartOfAccount, JournalEntry, JournalLine

class ChartOfAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartOfAccount
        fields = ['id', 'company', 'code', 'name', 'type', 'parent', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class JournalLineSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)
    
    class Meta:
        model = JournalLine
        fields = ['id', 'account', 'account_code', 'account_name', 'debit_credit', 'amount', 'description']


class JournalEntrySerializer(serializers.ModelSerializer):
    lines = JournalLineSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = JournalEntry
        fields = ['id', 'company', 'journal_type', 'entry_number', 'entry_date', 
                  'description', 'reference', 'is_balanced', 'lines', 
                  'created_by', 'created_by_username', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']