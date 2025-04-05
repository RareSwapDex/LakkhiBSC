from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Campaign, Contribution, Milestone, Release, Update, Comment, TeamMember, Reward, Blockchain, CreatorVerification, Collaborator, ForumTopic, ForumReply
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_picture']

class BlockchainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blockchain
        fields = ['id', 'name', 'network_id', 'rpc_url', 'explorer_url', 'icon', 'is_enabled']

class CreatorVerificationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = CreatorVerification
        fields = [
            'id', 'user', 'status', 'social_proof_url', 'github_username', 
            'website_url', 'bio', 'verification_date', 'rejection_reason', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'status', 'verification_date', 'rejection_reason']

class CollaboratorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True
    )
    invited_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Collaborator
        fields = [
            'id', 'user', 'user_id', 'role', 'can_edit_basics', 'can_edit_story',
            'can_manage_team', 'can_manage_milestones', 'can_manage_rewards',
            'can_post_updates', 'can_manage_funds', 'invited_by', 
            'invitation_accepted', 'created_at', 'updated_at'
        ]
        read_only_fields = ['invited_by', 'created_at', 'updated_at']

class ForumReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumReply
        fields = [
            'id', 'content', 'author', 'is_solution', 'parent',
            'created_at', 'updated_at', 'replies_count'
        ]
        read_only_fields = ['author', 'is_solution', 'created_at', 'updated_at']
    
    def get_replies_count(self, obj):
        return obj.children.count()

class ForumTopicSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumTopic
        fields = [
            'id', 'title', 'content', 'author', 'is_pinned', 
            'is_closed', 'views', 'created_at', 'updated_at', 'replies_count'
        ]
        read_only_fields = ['author', 'is_pinned', 'is_closed', 'views', 'created_at', 'updated_at']
    
    def get_replies_count(self, obj):
        return obj.replies.count()

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = [
            'id', 'name', 'role', 'bio', 'image', 'linkedin', 
            'twitter', 'github', 'created_at', 'updated_at'
        ]

class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = [
            'id', 'title', 'description', 'amount', 'quantity', 'claimed',
            'estimated_delivery', 'shipping_required', 'shipping_locations',
            'created_at', 'updated_at', 'available_quantity', 'is_sold_out'
        ]
        read_only_fields = ['claimed', 'created_at', 'updated_at']

class UpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Update
        fields = ['id', 'title', 'content', 'image', 'attachment', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at', 'updated_at', 'is_edited', 'reported']
        read_only_fields = ['user', 'created_at', 'updated_at', 'is_edited', 'reported']

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = [
            'id', 'title', 'description', 'target_amount', 'current_amount',
            'due_date', 'completed', 'completion_date', 'progress_percentage'
        ]
        read_only_fields = ['current_amount', 'completed', 'completion_date', 'progress_percentage']

class ReleaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Release
        fields = [
            'id', 'title', 'description', 'amount', 'status',
            'request_date', 'release_date', 'transaction_hash'
        ]
        read_only_fields = ['request_date', 'release_date', 'transaction_hash']

class ContributionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Contribution
        fields = [
            'id', 'user', 'amount', 'currency', 'transaction_hash',
            'created_at', 'is_anonymous'
        ]
        read_only_fields = ['user', 'created_at']

class CampaignSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    blockchain = BlockchainSerializer(read_only=True)
    blockchain_id = serializers.PrimaryKeyRelatedField(
        queryset=Blockchain.objects.filter(is_enabled=True),
        source='blockchain',
        write_only=True,
        required=False
    )
    milestones = MilestoneSerializer(many=True, read_only=True)
    releases = ReleaseSerializer(many=True, read_only=True)
    updates = UpdateSerializer(many=True, read_only=True)
    team_members = TeamMemberSerializer(many=True, read_only=True)
    rewards = RewardSerializer(many=True, read_only=True)
    collaborators = CollaboratorSerializer(many=True, read_only=True)
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'owner', 'title', 'description', 'story', 'image', 'video_url', 
            'fund_amount', 'currency', 'token_address', 'token_name', 'token_symbol',
            'blockchain', 'blockchain_id', 'start_date', 'end_date', 'contract_address', 
            'status', 'is_featured', 'is_verified', 'website', 'twitter', 'telegram', 
            'discord', 'github', 'allow_team_applications', 'is_collaborative',
            'enable_forum', 'forum_moderation_required', 'terms_accepted', 
            'created_at', 'updated_at', 'milestones', 'releases', 'updates',
            'team_members', 'rewards', 'collaborators', 'total_raised', 
            'total_contributors', 'is_funded', 'progress_percentage',
            'has_forum_activity', 'team_size', 'days_remaining'
        ]
        read_only_fields = [
            'owner', 'contract_address', 'created_at', 'updated_at',
            'is_featured', 'is_verified', 'status', 'total_raised', 
            'total_contributors', 'is_funded', 'progress_percentage',
            'has_forum_activity', 'team_size', 'days_remaining'
        ] 