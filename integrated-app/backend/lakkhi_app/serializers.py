from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Campaign, Contribution, Milestone, Release, Update, Comment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['username', 'email']

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ['id', 'campaign', 'title', 'description', 'target_amount', 'current_amount', 'due_date', 'completed', 'completion_date']
        read_only_fields = ['current_amount', 'completed', 'completion_date']

class ReleaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Release
        fields = ['id', 'campaign', 'title', 'description', 'amount', 'status', 'request_date', 'release_date', 'transaction_hash']
        read_only_fields = ['request_date', 'release_date', 'transaction_hash']

class ContributionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Contribution
        fields = ['id', 'campaign', 'user', 'amount', 'currency', 'transaction_hash', 'created_at', 'is_anonymous']
        read_only_fields = ['created_at']

class UpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Update
        fields = ['id', 'campaign', 'title', 'content', 'image', 'attachment', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'campaign', 'user', 'content', 'created_at', 'updated_at', 'is_edited', 'reported']
        read_only_fields = ['created_at', 'updated_at', 'is_edited', 'reported']

class CampaignSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)
    releases = ReleaseSerializer(many=True, read_only=True)
    updates = UpdateSerializer(many=True, read_only=True)
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'owner', 'title', 'description', 'story', 'image', 'video_url', 
            'fund_amount', 'currency', 'token_address', 'token_name', 'token_symbol',
            'start_date', 'end_date', 'contract_address', 'status', 'created_at', 
            'updated_at', 'milestones', 'releases', 'updates'
        ]
        read_only_fields = ['owner', 'contract_address', 'created_at', 'updated_at'] 