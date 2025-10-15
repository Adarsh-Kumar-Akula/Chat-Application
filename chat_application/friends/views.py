#from django.shortcuts import render


from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Friendship
from django.db.models import Q
# Create your views here.



# -------------------------
# 1. Add Friend
# -------------------------
@csrf_exempt
@api_view(['POST'])
def add_friend(request):
    # Expecting both usernames in request body:
    # { "username": "user1", "friend_username": "user2" }
    username = request.data.get('username')
    friend_username = request.data.get('friend_username')

    if not username or not friend_username:
        return Response(
            {"error": "Both 'username' and 'friend_username' are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": f"User '{username}' not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        friend = User.objects.get(username=friend_username)
    except User.DoesNotExist:
        return Response({"error": f"User '{friend_username}' not found"}, status=status.HTTP_404_NOT_FOUND)

    if user == friend:
        return Response({"error": "You cannot add yourself"}, status=status.HTTP_400_BAD_REQUEST)

    # Ensure consistent order for friendship pair
    user1, user2 = sorted([user, friend], key=lambda u: u.id)

    if Friendship.objects.filter(user1=user1, user2=user2).exists():
        return Response({"message": "Already friends"}, status=status.HTTP_200_OK)

    Friendship.objects.create(user1=user1, user2=user2)

    return Response(
        {"message": f"{username} is now friends with {friend_username}"},
        status=status.HTTP_201_CREATED
    )

# -------------------------
# 2. Remove Friend
# -------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_friend(request):
    username = request.data.get('username')
    try:
        friend = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    user1, user2 = sorted([request.user, friend], key=lambda u: u.id)
    deleted, _ = Friendship.objects.filter(user1=user1, user2=user2).delete()

    if deleted:
        return Response({"message": f"Removed {friend.username} from friends"}, status=status.HTTP_200_OK)
    return Response({"error": "Not friends"}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def list_friends(request):
    # Get username from query params like ?username=user1
    username = request.GET.get('username')

    if not username:
        return Response(
            {"error": "Username is required as a query parameter, e.g. ?username=user1"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {"error": f"User '{username}' does not exist"},
            status=status.HTTP_404_NOT_FOUND
        )

    friendships = Friendship.objects.filter(Q(user1=user) | Q(user2=user))
    friends = [
        f.user2.username if f.user1 == user else f.user1.username
        for f in friendships
    ]

    return Response({"friends": friends}, status=status.HTTP_200_OK)
