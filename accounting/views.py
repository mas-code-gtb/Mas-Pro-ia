from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum
from .models import ChartOfAccount, JournalEntry, JournalLine
from .serializers import ChartOfAccountSerializer, JournalEntrySerializer, JournalLineSerializer

class ChartOfAccountViewSet(viewsets.ModelViewSet):
    queryset = ChartOfAccount.objects.all()
    serializer_class = ChartOfAccountSerializer
    permission_classes = [permissions.IsAuthenticated]


class JournalEntryViewSet(viewsets.ModelViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_line(self, request, pk=None):
        entry = self.get_object()
        serializer = JournalLineSerializer(data=request.data)
        
        if serializer.is_valid():
            with transaction.atomic():
                line = serializer.save(entry=entry)
                self._check_balance(entry)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def balance(self, request, pk=None):
        entry = self.get_object()
        self._check_balance(entry)
        return Response(JournalEntrySerializer(entry).data)
    
    def _check_balance(self, entry):
        lines = entry.lines.all()
        total_debit = lines.filter(debit_credit='debit').aggregate(total=Sum('amount'))['total'] or 0
        total_credit = lines.filter(debit_credit='credit').aggregate(total=Sum('amount'))['total'] or 0
        
        entry.is_balanced = (total_debit == total_credit)
        entry.save()