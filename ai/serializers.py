from rest_framework import serializers
from .models import Conversation, Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'language', 'created_at']
        read_only_fields = ['created_at']


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'company', 'user', 'user_username', 'title', 'language', 
                  'context_type', 'context_id', 'messages', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']