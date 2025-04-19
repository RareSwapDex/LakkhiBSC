from django.contrib import admin
from .models import Campaign, Release, Contribution, Payment
from django.utils.html import format_html
from django.urls import path
from django.shortcuts import redirect
from django.contrib import messages
from web3 import Web3
from .web3_helper_functions import get_staking_contract, deploy_staking_contract

@admin.register(Release)
class ReleaseAdmin(admin.ModelAdmin):
    list_display = ('title', 'campaign', 'release_amount', 'release_datetime', 'status')
    list_filter = ('status', 'release_datetime', 'campaign')
    search_fields = ('title', 'campaign__title', 'description')
    readonly_fields = ('release_datetime', 'transaction_hash')
    
    def get_queryset(self, request):
        """Only show releases for campaigns owned by the user"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(campaign__owner=request.user)
    
    def has_change_permission(self, request, obj=None):
        """Only allow campaign owner to edit their releases"""
        if obj is None:
            return True
        return obj.campaign.can_manage(request.user)
    
    def has_delete_permission(self, request, obj=None):
        """Only allow campaign owner to delete their releases"""
        if obj is None:
            return True
        return obj.campaign.can_manage(request.user)
    
    actions = ['approve_releases', 'process_releases']
    
    def approve_releases(self, request, queryset):
        """Only allow campaign owner to approve their releases"""
        for release in queryset:
            if not release.campaign.can_manage(request.user):
                self.message_user(request, f'You do not have permission to approve release {release.title}.', level=messages.ERROR)
                continue
            release.status = 'APPROVED'
            release.save()
        self.message_user(request, f'Selected releases have been approved.')
    approve_releases.short_description = "Approve selected releases"
    
    def process_releases(self, request, queryset):
        """Only allow campaign owner to process their releases"""
        for release in queryset:
            if not release.campaign.can_manage(request.user):
                self.message_user(request, f'You do not have permission to process release {release.title}.', level=messages.ERROR)
                continue
                
            if release.status != 'APPROVED':
                self.message_user(request, f'Release {release.title} must be approved first.', level=messages.ERROR)
                continue
                
            try:
                # Get the campaign contract
                contract = get_staking_contract(release.campaign.contract_address)
                
                # Get campaign owner's wallet address
                campaign_owner = release.campaign.owner.wallet_address
                if not campaign_owner:
                    self.message_user(request, f'Campaign owner {release.campaign.owner.username} has no wallet address.', level=messages.ERROR)
                    continue
                
                # Build and send the transaction
                tx = contract.functions.withdraw(
                    Web3.to_wei(release.release_amount, 'ether')
                ).build_transaction({
                    'from': Web3.to_checksum_address(campaign_owner),
                    'nonce': Web3.eth.get_transaction_count(Web3.to_checksum_address(campaign_owner)),
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
                release.status = 'RELEASED'
                release.save()
                
                self.message_user(request, f'Successfully processed release {release.title}')
                
            except Exception as e:
                self.message_user(request, f'Error processing release {release.title}: {str(e)}', level=messages.ERROR)
    
    process_releases.short_description = "Process selected releases"

@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'fund_amount', 'current_amount', 'status', 'launch_date')
    list_filter = ('status', 'launch_date', 'creation_datetime')
    search_fields = ('title', 'description', 'owner__username')
    readonly_fields = ('creation_datetime', 'updated_at', 'contract_address')
    
    def get_queryset(self, request):
        """Only show campaigns owned by the user"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(owner=request.user)
    
    def has_change_permission(self, request, obj=None):
        """Only allow campaign owner to edit their campaign"""
        if obj is None:
            return True
        return obj.can_manage(request.user)
    
    def has_delete_permission(self, request, obj=None):
        """Only allow campaign owner to delete their campaign"""
        if obj is None:
            return True
        return obj.can_manage(request.user)
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:campaign_id>/create-release/',
                self.admin_site.admin_view(self.create_release),
                name='campaign-create-release',
            ),
        ]
        return custom_urls + urls
    
    def create_release(self, request, campaign_id):
        campaign = self.get_object(request, campaign_id)
        if not campaign.can_manage(request.user):
            self.message_user(request, 'You do not have permission to manage this campaign.', level=messages.ERROR)
            return redirect('admin:lakkhi_app_campaign_changelist')
            
        if request.method == 'POST':
            try:
                release = Release.objects.create(
                    title=request.POST.get('title'),
                    description=request.POST.get('description'),
                    campaign=campaign,
                    release_amount=request.POST.get('release_amount'),
                    status='PENDING'
                )
                self.message_user(request, f'Release created successfully: {release.title}')
                return redirect('admin:lakkhi_app_release_changelist')
            except Exception as e:
                self.message_user(request, f'Error creating release: {str(e)}', level=messages.ERROR)
                return redirect('admin:lakkhi_app_campaign_changelist')
        
        return redirect('admin:lakkhi_app_campaign_changelist')
    
    actions = ['approve_campaigns']
    
    def contract_owner_display(self, obj):
        if obj.contract_owner:
            return f"{obj.contract_owner[:6]}...{obj.contract_owner[-4:]}"
        return "-"
    contract_owner_display.short_description = "Contract Owner"
    
    def approve_campaigns(self, request, queryset):
        """
        Approves selected campaigns and deploys their staking contracts.
        Only admin users can approve campaigns.
        """
        from .web3_helper_functions import deploy_staking_contract
        
        for campaign in queryset:
            # Skip campaigns that are not in draft status
            if campaign.status != 'draft':
                self.message_user(
                    request, 
                    f'Campaign "{campaign.title}" is already {campaign.status}, skipping.', 
                    level=messages.WARNING
                )
                continue
                
            # Deploy the staking contract
            try:
                # Assuming contract_owner contains the wallet address that will deploy the contract
                # and that the wallet key would be accessible in a production system
                # For this implementation, we're simulating the deployment response
                deployment_result = deploy_staking_contract(
                    project_name=campaign.title,
                    project_target=float(campaign.fund_amount),
                    project_owner=campaign.contract_owner,
                    token_address=campaign.token_address,
                    wallet_key="WALLET_KEY_WOULD_BE_SECURED_IN_PRODUCTION"  # This is a placeholder
                )
                
                if deployment_result['success']:
                    # Update campaign with contract address and change status to active
                    campaign.contract_address = deployment_result['contract_address']
                    campaign.status = 'active'
                    campaign.save()
                    
                    self.message_user(
                        request,
                        f'Campaign "{campaign.title}" approved and contract deployed at {campaign.contract_address}',
                        level=messages.SUCCESS
                    )
                else:
                    self.message_user(
                        request,
                        f'Error deploying contract for "{campaign.title}": {deployment_result["message"]}',
                        level=messages.ERROR
                    )
            except Exception as e:
                self.message_user(
                    request,
                    f'Error processing campaign "{campaign.title}": {str(e)}',
                    level=messages.ERROR
                )
    approve_campaigns.short_description = "Approve and deploy contracts for selected campaigns" 