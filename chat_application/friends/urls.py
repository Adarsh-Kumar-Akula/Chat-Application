from django.urls import path
from . import views

urlpatterns = [
    path('add/', views.add_friend, name='add-friend'),
    path('remove/', views.remove_friend, name='remove-friend'),
    path('list/', views.list_friends, name='list-friends'),
]
