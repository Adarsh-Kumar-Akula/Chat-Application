from django.contrib import admin

# Register your models here.
from .models import Userss, Message

admin.site.register(Userss)
admin.site.register(Message)
