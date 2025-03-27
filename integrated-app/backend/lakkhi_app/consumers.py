import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Campaign, Update, Comment, Contribution, Release, Milestone
from .serializers import (
    CampaignSerializer, 
    UpdateSerializer, 
    CommentSerializer, 
    ContributionSerializer,
    ReleaseSerializer,
    MilestoneSerializer
)

class CampaignConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.campaign_id = self.scope['url_route']['kwargs']['campaign_id']
        self.room_group_name = f'campaign_{self.campaign_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        
        # Send initial campaign data
        campaign = await self.get_campaign(self.campaign_id)
        if campaign:
            await self.send(text_data=json.dumps({
                'type': 'campaign_data',
                'data': campaign
            }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            data = text_data_json.get('data', {})

            if message_type == 'contribution':
                await self.handle_contribution(data)
            elif message_type == 'update':
                await self.handle_update(data)
            elif message_type == 'comment':
                await self.handle_comment(data)
            elif message_type == 'release':
                await self.handle_release(data)
            elif message_type == 'milestone':
                await self.handle_milestone(data)
        except json.JSONDecodeError:
            print("Invalid JSON received")
        except Exception as e:
            print(f"Error handling message: {str(e)}")

    async def handle_contribution(self, data):
        contribution = await self.get_contribution(data.get('id'))
        if contribution:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'contribution_message',
                    'data': contribution
                }
            )

    async def handle_update(self, data):
        update = await self.get_update(data.get('id'))
        if update:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_message',
                    'data': update
                }
            )

    async def handle_comment(self, data):
        comment = await self.get_comment(data.get('id'))
        if comment:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'comment_message',
                    'data': comment
                }
            )
            
    async def handle_release(self, data):
        release = await self.get_release(data.get('id'))
        if release:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'release_message',
                    'data': release
                }
            )
            
    async def handle_milestone(self, data):
        milestone = await self.get_milestone(data.get('id'))
        if milestone:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'milestone_message',
                    'data': milestone
                }
            )

    async def contribution_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'contribution',
            'data': event['data']
        }))

    async def update_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'update',
            'data': event['data']
        }))

    async def comment_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'comment',
            'data': event['data']
        }))
        
    async def release_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'release',
            'data': event['data']
        }))
        
    async def milestone_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'milestone',
            'data': event['data']
        }))
        
    async def campaign_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'campaign_update',
            'data': event['data']
        }))

    @database_sync_to_async
    def get_campaign(self, campaign_id):
        try:
            campaign = Campaign.objects.get(id=campaign_id)
            return CampaignSerializer(campaign).data
        except Campaign.DoesNotExist:
            return None

    @database_sync_to_async
    def get_contribution(self, contribution_id):
        try:
            contribution = Contribution.objects.get(id=contribution_id)
            return ContributionSerializer(contribution).data
        except Contribution.DoesNotExist:
            return None

    @database_sync_to_async
    def get_update(self, update_id):
        try:
            update = Update.objects.get(id=update_id)
            return UpdateSerializer(update).data
        except Update.DoesNotExist:
            return None

    @database_sync_to_async
    def get_comment(self, comment_id):
        try:
            comment = Comment.objects.get(id=comment_id)
            return CommentSerializer(comment).data
        except Comment.DoesNotExist:
            return None
            
    @database_sync_to_async
    def get_release(self, release_id):
        try:
            release = Release.objects.get(id=release_id)
            return ReleaseSerializer(release).data
        except Release.DoesNotExist:
            return None
            
    @database_sync_to_async
    def get_milestone(self, milestone_id):
        try:
            milestone = Milestone.objects.get(id=milestone_id)
            return MilestoneSerializer(milestone).data
        except Milestone.DoesNotExist:
            return None 