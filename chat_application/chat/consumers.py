# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message
from django.contrib.auth.models import User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("in connect")

        # Get username from query parameters
        query_string = self.scope.get("query_string", b"").decode()
        username = None

        if query_string:
            for param in query_string.split("&"):
                if "=" in param:
                    key, value = param.split("=", 1)
                    if key == "username":
                        username = value
                        break
                    
        # Get user from database using username
        if username:
            try:
                self.user = await database_sync_to_async(User.objects.get)(username=username)
                print(f"✓ Connected as user: {self.user.username} (ID: {self.user.id})")
            except User.DoesNotExist:
                await self.accept()
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'error': f'User "{username}" not found. Please check username.'
                }))
                await self.close()
                return
        else:
            # No username in URL, try authenticated user
            self.user = self.scope.get("user")

            if not self.user or not self.user.is_authenticated:
                await self.accept()
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'error': 'Add ?username=yourname to the URL. Example: ws://127.0.0.1:8000/ws/chat/?username=testuser1'
                }))
                await self.close()
                return

        # Create personal room using user ID (more efficient than username)
        self.room_name = f"user_{self.user.id}"

        # Join room group
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )

        # Accept the WebSocket connection
        await self.accept()

        # Send confirmation (AFTER accept!)
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'user_id': self.user.id,
            'username': self.user.username,
            'room': self.room_name
        }))

        print(f"✓ User {self.user.username} joined room: {self.room_name}")
        
    async def disconnect(self, close_code):
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_discard(
                self.room_name,
                self.channel_name
            )
            print(f"✗ User {self.user.username} left room: {self.room_name}")
    
    async def receive(self, text_data):
        """
        Receive message from frontend WebSocket
        Expected format: {message, receiver_username}
        """
        try:
            data = json.loads(text_data)
            message_content = data.get('message', '').strip()
            receiver_username = data.get('receiver_username')
            
            if not message_content or not receiver_username:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'error': 'Message and receiver_username are required'
                }))
                return
            
            # Save message to database
            message_data = await self.save_message(
                sender_username=self.user.username,
                receiver_username=receiver_username,
                content=message_content
            )
            
            if not message_data:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'error': f'Failed to save message. User "{receiver_username}" not found.'
                }))
                return
            
            # Prepare message payload
            payload = {
                'type': 'new_message',
                'message_id': message_data['id'],
                'sender_id': message_data['sender_id'],
                'sender_username': message_data['sender_username'],
                'receiver_id': message_data['receiver_id'],
                'receiver_username': message_data['receiver_username'],
                'message': message_data['content'],
                'timestamp': message_data['timestamp']
            }
            
            # Send to receiver's room (using receiver_id for efficiency)
            await self.channel_layer.group_send(
                f"user_{message_data['receiver_id']}",
                {
                    'type': 'chat_message',
                    'payload': payload
                }
            )
            
            # Send confirmation back to sender
            await self.send(text_data=json.dumps({
                **payload,
                'status': 'sent'
            }))
            
            print(f"📤 {self.user.username} → {receiver_username}: {message_content[:30]}...")
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Invalid JSON format'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': f'Server error: {str(e)}'
            }))
            print(f"❌ Error in receive: {e}")
    
    async def chat_message(self, event):
        """
        Receive message from channel layer and send to WebSocket
        This is triggered when another user sends you a message
        """
        await self.send(text_data=json.dumps(event['payload']))
        print(f"📥 {self.user.username} received message from {event['payload']['sender_username']}")
    
    @database_sync_to_async
    def save_message(self, sender_username, receiver_username, content):
        """
        Save message to database using usernames
        Returns message data or None if failed
        """
        try:
            sender = User.objects.get(username=sender_username)
            receiver = User.objects.get(username=receiver_username)
            
            message = Message.objects.create(
                sender=sender,
                receiver=receiver,
                content=content
            )
            
            return {
                'id': message.id,
                'sender_id': sender.id,
                'sender_username': sender.username,
                'receiver_id': receiver.id,
                'receiver_username': receiver.username,
                'content': message.content,
                'timestamp': message.timestamp.isoformat()
            }
        except User.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error saving message: {e}")
            return None