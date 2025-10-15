# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('api/chat/history/<str:self_username>/<str:other_username>/', views.get_chat_history, name='chat_history'),
]