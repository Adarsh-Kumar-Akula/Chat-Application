from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout

import json


@csrf_exempt
def api_signup(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        username = str(data.get("username", "")).strip()
        password1 = str(data.get("password1", "")).strip()
        password2 = str(data.get("password2", "")).strip()

        if not username or not password1 or not password2:
            return JsonResponse({"error": "All fields are required"}, status=400)

        if password1 != password2:
            return JsonResponse({"error": "Passwords do not match"}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists"}, status=400)

        user = User.objects.create_user(username=username, password=password1)
        return JsonResponse({"message": "User created successfully", "user_id": user.id}, status=201)

    return JsonResponse({"error": "Invalid request"}, status=400)


@csrf_exempt
def api_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=400)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON payload"}, status=400)

    username = str(data.get("username", "")).strip()
    password = str(data.get("password", "")).strip()

    if not username or not password:
        return JsonResponse({"error": "Username and password are required"}, status=400)

    user = authenticate(username=username, password=password)

    if user is not None:
        login(request, user)  # sets session
        return JsonResponse({"message": "Login successful", "user_id": user.id})
    else:
        return JsonResponse({"error": "Invalid username or password"}, status=401)


@csrf_exempt
def api_logout(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=400)

    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not logged in"}, status=401)

    logout(request)  # clears the session
    return JsonResponse({"message": "Logout successful"})
