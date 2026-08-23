from django.contrib import admin
from .models import ChartOfAccount, JournalEntry, JournalLine

class JournalLineInline(admin.TabularInline):
    model = JournalLine
    extra = 2

@admin.register(ChartOfAccount)
class ChartOfAccountAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'type', 'company', 'is_active']
    list_filter = ['type', 'is_active', 'company']
    search_fields = ['code', 'name']

@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ['entry_number', 'entry_date', 'journal_type', 'description', 'is_balanced']
    list_filter = ['journal_type', 'entry_date', 'is_balanced']
    search_fields = ['entry_number', 'description', 'reference']
    inlines = [JournalLineInline]