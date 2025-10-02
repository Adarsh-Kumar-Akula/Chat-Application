from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path("",views.signup,name = "signup"),
    path("login/",views.login,name="login"),
    path("signup/",views.signup,name = "signup"),
    path("login/chatpage",views.chatpagefunct,name = "chatpagefunct"),
    path('send', views.send, name='send'),
    path('add_friend',views.add_friend,name="add_friend"),
    path('getFriends/<str:username>/', views.getFriends, name='getFriends'),
    path('getMesages/<str:username>/<str:receiver>', views.getMesages, name='getMesages')
    


]