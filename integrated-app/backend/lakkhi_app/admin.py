from django.contrib import admin
from .models import Campaign, Release, Contribution, Milestone, Update, Comment, PaymentSession
from django.utils.html import format_html
from django.urls import path
from django.shortcuts import redirect
from django.contrib import messages
from web3 import Web3
from django.conf import settings
from .web3_helper_functions import get_staking_contract

@admin.register(Release)
class ReleaseAdmin(admin.ModelAdmin):
    list_display = ('title', 'campaign', 'amount', 'request_date', 'status')
    list_filter = ('status', 'request_date', 'campaign')
    search_fields = ('title', 'campaign__title', 'description')
    readonly_fields = ('request_date', 'transaction_hash')
    
    def get_queryset(self, request):
        """Only show releases for campaigns owned by the user"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(campaign__owner=request.user)
    
    def has_change_permission(self, request, obj=None):
        """Only allow campaign owner or contract owner to edit their releases"""
        if obj is None:
            return True
        if request.user.is_superuser:
            return True
        # Check if user is campaign owner
        if obj.campaign.owner == request.user:
            return True
        # Check if user is contract owner (via wallet address)
        if (request.user.wallet_address and obj.campaign.contract_owner and 
            request.user.wallet_address.lower() == obj.campaign.contract_owner.lower()):
            return True
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Only allow campaign owner or contract owner to delete their releases"""
        if obj is None:
            return True
        if request.user.is_superuser:
            return True
        # Check if user is campaign owner
        if obj.campaign.owner == request.user:
            return True
        # Check if user is contract owner (via wallet address)
        if (request.user.wallet_address and obj.campaign.contract_owner and 
            request.user.wallet_address.lower() == obj.campaign.contract_owner.lower()):
            return True
        return False
    
    actions = ['approve_releases', 'process_releases']
    
    def approve_releases(self, request, queryset):
        """Only allow contract owner to approve releases"""
        for release in queryset:
            # Check if user is contract owner
            is_contract_owner = (request.user.wallet_address and release.campaign.contract_owner and 
                                request.user.wallet_address.lower() == release.campaign.contract_owner.lower())
            
            if not (is_contract_owner or request.user.is_superuser):
                self.message_user(request, f'You do not have permission to approve release {release.title}.', level=messages.ERROR)
                continue
                
            release.status = 'approved'
            release.save()
        self.message_user(request, f'Selected releases have been approved.')
    approve_releases.short_description = "Approve selected releases"
    
    def process_releases(self, request, queryset):
        """Only allow contract owner to process their releases"""
        for release in queryset:
            # Check if user is contract owner
            is_contract_owner = (request.user.wallet_address and release.campaign.contract_owner and 
                                request.user.wallet_address.lower() == release.campaign.contract_owner.lower())
            
            if not (is_contract_owner or request.user.is_superuser):
                self.message_user(request, f'You do not have permission to process release {release.title}.', level=messages.ERROR)
                continue
                
            if release.status != 'approved':
                self.message_user(request, f'Release {release.title} must be approved first.', level=messages.ERROR)
                continue
                
            try:
                # Get the campaign contract
                contract = get_staking_contract(release.campaign.contract_address)
                
                # Get contract owner's wallet address
                contract_owner = release.campaign.contract_owner or release.campaign.owner.wallet_address
                if not contract_owner:
                    self.message_user(request, f'Contract owner not found for campaign {release.campaign.title}.', level=messages.ERROR)
                    continue
                
                # Build and send the transaction
                tx = contract.functions.withdraw(
                    Web3.to_wei(release.amount, 'ether')
                ).build_transaction({
                    'from': Web3.to_checksum_address(contract_owner),
                    'nonce': Web3.eth.get_transaction_count(Web3.to_checksum_address(contract_owner)),
                    'gas': 200000,
                    'gasPrice': Web3.eth.gas_price
                })
                
                # Sign and send transaction
                signed_tx = Web3.eth.account.sign_transaction(tx, settings.ADMIN_WALLET_PRIVATE_KEY)
                tx_hash = Web3.eth.send_raw_transaction(signed_tx.rawTransaction)
                
                # Wait for receipt
                receipt = Web3.eth.wait_for_transaction_receipt(tx_hash)
                
                # Update release status
                release.transaction_hash = receipt['transactionHash'].hex()
                release.status = 'completed'
                release.save()
                
                self.message_user(request, f'Successfully processed release {release.title}')
                
            except Exception as e:
                self.message_user(request, f'Error processing release {release.title}: {str(e)}', level=messages.ERROR)
    
    process_releases.short_description = "Process selected releases"

@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'contract_owner_display', 'fund_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'description', 'owner__username')
    readonly_fields = ('created_at', 'updated_at', 'contract_address')
    actions = ['approve_campaigns']
    
    def contract_owner_display(self, obj):
        if obj.contract_owner:
            return f"{obj.contract_owner[:6]}...{obj.contract_owner[-4:]}"
        return "-"
    contract_owner_display.short_description = "Contract Owner"
    
    def get_queryset(self, request):
        """Show campaigns owned by the user or where user is contract owner"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Get campaigns where user is owner
        user_campaigns = qs.filter(owner=request.user)
        # If user has a wallet address, add campaigns where they are contract owner
        if request.user.wallet_address:
            wallet = request.user.wallet_address.lower()
            # Django doesn't have a direct way to do case-insensitive exact match for CharFields
            # So we'll do this in Python
            contract_owner_campaigns_ids = []
            for camp in qs:
                if camp.contract_owner and camp.contract_owner.lower() == wallet:
                    contract_owner_campaigns_ids.append(camp.id)
            return (user_campaigns | qs.filter(id__in=contract_owner_campaigns_ids)).distinct()
        return user_campaigns
    
    def has_change_permission(self, request, obj=None):
        """Allow campaign owner or contract owner to edit their campaign"""
        if obj is None:
            return True
        if request.user.is_superuser:
            return True
        # Check if user is campaign owner
        if obj.owner == request.user:
            return True
        # Check if user is contract owner (via wallet address)
        if (request.user.wallet_address and obj.contract_owner and 
            request.user.wallet_address.lower() == obj.contract_owner.lower()):
            return True
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Only allow campaign owner to delete their campaign"""
        if obj is None:
            return True
        if request.user.is_superuser:
            return True
        # Only campaign owner can delete, not contract owner
        if obj.owner == request.user:
            return True
        return False
    
    def get_readonly_fields(self, request, obj=None):
        """Make certain fields read-only after creation"""
        readonly_fields = list(self.readonly_fields)
        if obj and obj.status != 'draft':
            # Once campaign is active, these fields should be read-only
            readonly_fields.extend(['token_address', 'token_name', 'token_symbol', 'fund_amount'])
        
        # If user is contract owner but not campaign owner, they can't change owner fields
        if obj and request.user != obj.owner and request.user.wallet_address and obj.contract_owner and request.user.wallet_address.lower() == obj.contract_owner.lower():
            readonly_fields.extend(['owner', 'contract_owner', 'token_address', 'token_name', 'token_symbol', 'fund_amount'])
        
        return readonly_fields

@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    list_display = ('user', 'campaign', 'amount', 'currency', 'created_at')
    list_filter = ('created_at', 'campaign', 'currency')
    search_fields = ('user__username', 'campaign__title')
    readonly_fields = ('created_at', 'transaction_hash')

@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'campaign', 'target_amount', 'current_amount', 'completed')
    list_filter = ('completed', 'campaign')
    search_fields = ('title', 'campaign__title', 'description')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Get milestones for campaigns where user is owner or contract owner
        user_campaigns = Campaign.objects.filter(owner=request.user)
        if request.user.wallet_address:
            wallet = request.user.wallet_address.lower()
            # Find campaigns where user is contract owner
            contract_owner_campaigns_ids = []
            for camp in Campaign.objects.all():
                if camp.contract_owner and camp.contract_owner.lower() == wallet:
                    contract_owner_campaigns_ids.append(camp.id)
            user_campaign_ids = list(user_campaigns.values_list('id', flat=True)) + contract_owner_campaigns_ids
            return qs.filter(campaign__id__in=user_campaign_ids)
        return qs.filter(campaign__in=user_campaigns)

@admin.register(Update)
class UpdateAdmin(admin.ModelAdmin):
    list_display = ('title', 'campaign', 'created_at')
    list_filter = ('created_at', 'campaign')
    search_fields = ('title', 'campaign__title', 'content')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(campaign__owner=request.user) 