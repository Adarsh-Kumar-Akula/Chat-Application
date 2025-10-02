from django.db import models
from django.db.models import JSONField



# Create your models here.
class Userss(models.Model):
    username = models.CharField(unique=True,max_length=1000)
    password = models.CharField(max_length=1000)
    friends = JSONField(models.CharField(max_length=150))
    

class Message(models.Model):
    msg=models.CharField(max_length=1000)
    sender=models.CharField(max_length=1000)
    receiver=models.CharField(max_length=1000)


