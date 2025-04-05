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
    is_contract_owner = serializers.SerializerMethodField()
    
    def get_is_contract_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.wallet_address:
            return request.user.wallet_address.lower() == (obj.contract_owner or '').lower()
        return False
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'owner', 'contract_owner', 'title', 'description', 'story', 'image', 'video_url', 
            'fund_amount', 'currency', 'token_address', 'token_name', 'token_symbol',
            'start_date', 'end_date', 'contract_address', 'status', 'created_at', 
            'updated_at', 'milestones', 'releases', 'updates', 'is_contract_owner'
        ]
        read_only_fields = ['owner', 'contract_address', 'created_at', 'updated_at']
    
    def validate(self, data):
        # For existing campaigns, don't allow changing token address, fund amount, or blockchain
        instance = getattr(self, 'instance', None)
        if instance and instance.status != 'draft':
            request_method = self.context['request'].method
            
            # If this is an update operation (PATCH/PUT)
            if request_method in ['PATCH', 'PUT']:
                # These fields can't be changed after creation
                for field in ['token_address', 'fund_amount', 'token_symbol', 'token_name']:
                    if field in data and getattr(instance, field) != data[field]:
                        raise serializers.ValidationError(
                            f"{field} cannot be changed once the campaign is active")
                        
        return data 