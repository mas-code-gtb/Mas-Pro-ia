from django.db import models
from django.contrib.auth.models import User
from companies.models import Company

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('super_admin', 'Super Administrateur'),
        ('admin', 'Administrateur'),
        ('manager', 'Manager'),
        ('employee', 'Employé'),
        ('client', 'Client'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='users', null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Profil utilisateur"
        verbose_name_plural = "Profils utilisateurs"
    
    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"
    
    def has_permission(self, permission):
        """Vérifier si l'utilisateur a une permission"""
        permissions = {
            'super_admin': ['*'],  # Tout
            'admin': ['view_all', 'edit_all', 'delete_all'],
            'manager': ['view_all', 'edit_own', 'view_employees'],
            'employee': ['view_own', 'edit_own'],
            'client': ['view_own'],
        }
        user_perms = permissions.get(self.role, [])
        return '*' in user_perms or permission in user_perms