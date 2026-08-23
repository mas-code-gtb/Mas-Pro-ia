from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .models import UserProfile
from .serializers import UserSerializer, UserProfileSerializer


# Permission personnalisée
class IsSuperAdmin(permissions.BasePermission):
    """Vérifier si l'utilisateur est Super Admin"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if hasattr(request.user, 'profile'):
            return request.user.profile.role == 'super_admin'
        return False


class IsAdminOrManager(permissions.BasePermission):
    """Vérifier si l'utilisateur est Admin ou Manager"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if hasattr(request.user, 'profile'):
            return request.user.profile.role in ['super_admin', 'admin', 'manager']
        return False


class UserViewSet(viewsets.ModelViewSet):
    """API pour gérer les utilisateurs"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            self.permission_classes = [IsAdminOrManager]
        elif self.action == 'destroy':
            self.permission_classes = [IsSuperAdmin]
        return super().get_permissions()
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile'):
            if user.profile.role == 'super_admin':
                return User.objects.all()
            elif user.profile.role in ['admin', 'manager']:
                return User.objects.filter(profile__company=user.profile.company)
        return User.objects.filter(id=user.id)
    
    @action(detail=True, methods=['patch'])
    def change_role(self, request, pk=None):
        """Changer le rôle d'un utilisateur"""
        if not IsSuperAdmin().has_permission(request, self):
            return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        role = request.data.get('role')
        
        if role not in dict(UserProfile.ROLE_CHOICES):
            return Response({'error': 'Rôle invalide'}, status=status.HTTP_400_BAD_REQUEST)
        
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.role = role
        profile.save()
        
        return Response({'message': f'Rôle mis à jour pour {user.username}', 'role': role})


class UserProfileViewSet(viewsets.ModelViewSet):
    """API pour gérer les profils utilisateurs"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile'):
            if user.profile.role == 'super_admin':
                return UserProfile.objects.all()
            elif user.profile.role in ['admin', 'manager']:
                return UserProfile.objects.filter(company=user.profile.company)
        return UserProfile.objects.filter(user=user)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Inscription d'un nouvel utilisateur (rôle par défaut: client)"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    # Vérifications
    if not username:
        return Response({'username': ['Nom d\'utilisateur requis']}, status=status.HTTP_400_BAD_REQUEST)
    if not email:
        return Response({'email': ['Email requis']}, status=status.HTTP_400_BAD_REQUEST)
    if not password:
        return Response({'password': ['Mot de passe requis']}, status=status.HTTP_400_BAD_REQUEST)
    if len(password) < 6:
        return Response({'password': ['Le mot de passe doit contenir au moins 6 caractères']}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        validate_email(email)
    except ValidationError:
        return Response({'email': ['Email invalide']}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({'username': ['Ce nom d\'utilisateur est déjà pris']}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({'email': ['Cet email est déjà utilisé']}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        # Créer le profil avec rôle 'client' par défaut
        profile = UserProfile.objects.create(
            user=user,
            role='client',
            is_active=True
        )
        return Response({
            'success': True,
            'message': 'Compte créé avec succès',
            'user_id': user.id,
            'role': 'client'
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)