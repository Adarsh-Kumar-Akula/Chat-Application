# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Message
#from .serializers import MessageSerializer
from django.contrib.auth.models import User
from django.db.models import Q



@api_view(['GET'])
def get_chat_history(request, self_username, other_username):
    """
    Fetch all messages between two users
    Called when user opens a chatbox
    No authentication required - uses usernames from URL
    """
    try:
        self_user = User.objects.get(username=self_username)
    except User.DoesNotExist:
        return Response(
            {"error": f"User '{self_username}' not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        other_user = User.objects.get(username=other_username)
    except User.DoesNotExist:
        return Response(
            {"error": f"User '{other_username}' not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get all messages between these two users
    messages = Message.objects.filter(
        Q(sender=self_user, receiver=other_user) |
        Q(sender=other_user, receiver=self_user)
    ).order_by('timestamp')
    
    data = []
    for msg in messages:
        data.append({
            'id': msg.id,
            'sender': msg.sender.id,
            'sender_username': msg.sender.username,
            'receiver': msg.receiver.id,
            'receiver_username': msg.receiver.username,
            'content': msg.content,
            'timestamp': msg.timestamp.isoformat()
        })
    
    return Response(data)