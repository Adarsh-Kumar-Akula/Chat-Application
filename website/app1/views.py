from http.client import HTTPResponse
from django.shortcuts import render, redirect
from django.http import HttpResponse,JsonResponse
from app1.models import Userss,Message
from django.contrib import messages
from django.contrib.auth.models import User, auth
from django.contrib.auth import logout,authenticate

import json
import os


un=""

# Create your views here.
def signup(request):
    
    if request.method=="POST":
        username=request.POST['username']
        password=request.POST['password']
        password2=request.POST['password2']
        if Userss.objects.filter(username=username).exists():
            messages.info(request,"Username is already taken")
            return redirect("signup")

           
            

        if (password==password2):
            
            newuser=Userss.objects.create(username=username,password=password,friends=[])
            newuser.save()
            print("now login")
            messages.info(request,"signup successful ! Now login")
            return redirect("login")
            
            
            
        else:
            print("passwords didnt match")
            messages.info(request,"passwords didnt match")
            return redirect("signup")
            

    return render(request,'signup.html')




def login(request):
    
    if request.method=="POST":
        username=request.POST['username']
        password=request.POST['password']
        print(username,password)
        if Userss.objects.filter(username=username,password=password).exists():
            print("user exists")
            global un 
            un=username 
            return redirect (chatpagefunct)
        else :
            messages.info(request,"Invalid credentials")
            return redirect("login")
                         
    return render(request,'login.html')


def chatpagefunct(request):
    global un
    print("hi")
    return render (request,"chatpage.html",{"username":un})


def send(request):
    message = request.POST['message']
    sender = request.POST['sender']
    receiver = request.POST['receiver']
    
    print(message)
    print(sender)
    print(receiver)
    new_msg=Message.objects.create(msg=message,sender=sender,receiver=receiver)
    new_msg.save()
    return HttpResponse('Message sent successfully')

def add_friend(request):
    username=request.POST['username']
    new_friend=request.POST['new_friend']
    print(username,"new friend is ",new_friend)
    temp=Userss.objects.filter(username=username)
    if (new_friend in temp[0].friends):
        return HttpResponse('User already exists in your contact list')
    elif(not Userss.objects.filter(username=new_friend).exists()):
        
        return HttpResponse('No such user available')
    else:
        temp=Userss.objects.filter(username=username)
        new=temp[0].friends
        new.append(new_friend)
        temp.update(friends=new)
        
        temp=Userss.objects.filter(username=new_friend)
        new=temp[0].friends
        new.append(username)
        temp.update(friends=new)
        return HttpResponse('friend added successfully')
    

def getFriends(request,username):
    
    temp=Userss.objects.filter(username=username)
    return JsonResponse({"friends":temp[0].friends})
def getMesages(request,username,receiver):

    sin=Message.objects.filter(sender=username,receiver=receiver)|Message.objects.filter(sender=receiver,receiver=username)
    return JsonResponse({"messages":list(sin.values())})
    