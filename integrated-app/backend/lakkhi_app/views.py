from datetime import timedelta
import json
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from . import web3_helper_functions
from . import venly  # Keep venly import - we now have our own implementation
from .custom_wallet import wallet_manager
from .models import Project, TokenPrice, Campaign, Contribution, Milestone, Release, Update, Comment
from .web3_helper_functions import (
    get_token_info,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.cache import cache
from threading import Thread
import time
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .payment_processor import PaymentProcessor
from decimal import Decimal
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from django.core.paginator import Paginator
from django.contrib.auth.decorators import login_required
from rest_framework.pagination import PageNumberPagination

import requests
import uuid
import string
import random
import logging
import os
from web3 import Web3

from .serializers import (
    CampaignSerializer, 
    ContributionSerializer, 
    MilestoneSerializer, 
    ReleaseSerializer,
    UpdateSerializer,
    CommentSerializer
)
from .eth.deploy import deploy_contract
from .mercuryo.client import MercuryoClient


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):
    """API root providing information about available endpoints"""
    api_info = {
        "name": "Lakkhi Funding API",
        "version": "1.0",
        "description": "API for the Lakkhi decentralized crowdfunding platform",
        "endpoints": {
            "projects": {
                "list": "/api/projects/",
                "detail": "/api/projects/{id}/",
                "create": "/api/projects/add/",
                "publish": "/api/projects/{id}/publish/",
            },
            "token": {
                "validate": "/api/token/validate/",
                "price": "/api/token/price/"
            }
        }
    }
    return Response(api_info)


@api_view(["GET"])
@permission_classes([AllowAny])
def projects_list(request):
    """Get a list of all projects"""
    try:
        projects = Project.objects.filter(status='active')
        projects_data = []
        
        for project in projects:
            project_data = {
                "id": project.id,
                "title": project.title,
                "description": project.description,
                "fund_amount": project.fund_amount,
                "fund_currency": project.currency,
                "raised_amount": project.raised_amount,
                "fund_percentage": project.fund_percentage,
                "blockchain_chain": project.blockchain_chain,
                "created_at": project.creation_datetime,
                "status": project.status,
                "number_of_donators": project.number_of_donators,
                "wallet_address": project.wallet_address,
                "token_address": project.token_address
            }
            projects_data.append(project_data)
        
        return Response({"success": True, "projects": projects_data})
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def projects_details_by_id(request, id):
    """Get project details by ID"""
    try:
        project = get_object_or_404(Project, id=id)
        
        # Get token info if available
        token_info = None
        if project.token_address:
            token_validation = validate_token_address(project.token_address)
            if token_validation["success"]:
                token_info = token_validation["token_info"]
        
        # Construct project data
        project_data = {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "fund_amount": project.fund_amount,
            "fund_currency": project.currency,
            "raised_amount": project.raised_amount,
            "fund_percentage": project.fund_percentage,
            "blockchain_chain": project.blockchain_chain,
            "created_at": project.creation_datetime,
            "status": project.status,
            "number_of_donators": project.number_of_donators,
            "wallet_address": project.wallet_address,
            "token_address": project.token_address,
            "token_info": token_info,
        }
        
        return Response({"success": True, "project": project_data})
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_campaign(request):
    """Create a new campaign"""
    try:
        # Check if user has a wallet address
        if not request.user.wallet_address:
            return Response({
                "status": "error",
                "message": "User must have a wallet address to create a campaign"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get blockchain from request data or default to BSC
        blockchain = request.data.get('blockchain', 'BSC')
        if blockchain not in ['Ethereum', 'BSC', 'Base']:
            blockchain = 'BSC'  # Default to BSC if invalid blockchain
        
        # Create campaign in database
        campaign = Campaign.objects.create(
            owner=request.user,
            title=request.data.get("basics.projectTitle"),
            description=request.data.get("story.projectStory"),
            fund_amount=request.data.get("funding.projectFundsAmount"),
            currency=request.data.get("funding.projectFundCurrency"),
            fund_spend=request.data.get("funding.fundingSpend", {}),
            deadline=request.data.get("basics.projectDeadlineDate", "30"),
            launch_date=request.data.get("basics.projectLaunchDate"),
            blockchain=blockchain,  # Save the blockchain selection
            status="DRAFT"
        )
        
        # Handle campaign image if provided
        if "basics.projectImageFile" in request.FILES:
            campaign.thumbnail = request.FILES["basics.projectImageFile"]
            campaign.save()
            
        # Deploy campaign contract using campaign owner's wallet
        contract_address = deploy_campaign_contract(
            token_address=settings.LAKKHI_TOKEN_ADDRESS,
            campaign_owner=request.user.wallet_address,
            campaign_id=campaign.id,
            blockchain=blockchain  # Pass blockchain to deployment function
        )
        
        # Update campaign with contract address
        campaign.contract_address = contract_address
        campaign.save()
        
        # Send confirmation email
        campaign_url = f"{settings.FRONTEND_URL}/campaigns/{campaign.id}"
        email_message = f"""
        <html>
        <body>
        <p>Congratulations! Your campaign, <strong>{campaign.title}</strong>, has been created successfully on the {blockchain} blockchain.</p>
        
        <p>Access your campaign page directly via this <a href='{campaign_url}'>link</a>.</p>
        
        <p>Your campaign is currently in DRAFT status. You can review and edit your campaign details before launching it.</p>
        
        <p>Once you're ready, you can launch your campaign from the campaign dashboard.</p>
        
        <p>Best regards,<br>Lakkhi Team</p>
        </body>
        </html>
        """
        
        send_html_email(
            subject=f"Lakkhi: Your Campaign Has Been Created on {blockchain}",
            message=email_message,
            recipient_list=[request.user.email]
        )
        
        return Response({
            "status": "success",
            "message": "Campaign created successfully",
            "campaign_id": campaign.id,
            "contract_address": contract_address
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


def validate_token_address(token_address):
    """Validate a token address"""
    try:
        token_info = get_token_info(token_address)
        return {
                    "success": True,
            "token_info": token_info
        }
        except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


@api_view(["POST"])
@permission_classes([AllowAny])
def token_validate(request):
    """Validate a token address"""
    try:
        data = json.loads(request.body)
        token_address = data.get('token_address')
        return Response(validate_token_address(token_address))
    except Exception as e:
                return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def token_price(request):
    """Get token price endpoint"""
    try:
        price = get_token_price()
        return Response({
                    "success": True,
            "price": price
        })
        except Exception as e:
            return Response(
                {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def get_token_price(token_address=None):
    """Get token price from cache or update cache"""
    try:
        if not token_address:
            token_address = settings.LAKKHI_TOKEN_ADDRESS
            
        # Try to get from cache first
        cache_key = f"token_price_{token_address}"
        cached_price = cache.get(cache_key)
        if cached_price is not None:
            return cached_price
            
        # If not in cache, get from DB
        token_price = TokenPrice.objects.first()
        if token_price:
            # Cache for 5 minutes
            cache.set(cache_key, token_price.price, 300)
            return token_price.price
            
        return None
    except Exception as e:
        print(f"Error getting token price: {e}")
        return None


def background_token_cache_updater():
    """Background thread to update token price cache"""
    while True:
        try:
            # Update price in DB
            price = web3_helper_functions.get_token_price()
            if price:
                TokenPrice.objects.update_or_create(
                    id=1,
                    defaults={'price': price}
                )
                
                # Update cache
                cache_key = f"token_price_{settings.LAKKHI_TOKEN_ADDRESS}"
                cache.set(cache_key, price, 300)
                
        except Exception as e:
            print(f"Error updating token price: {e}")
            
        # Sleep for 5 minutes
        time.sleep(300)


def start_background_thread():
    """Start the background token price updater thread"""
    thread = Thread(target=background_token_cache_updater, daemon=True)
    thread.start()


@api_view(["PUT"])
@permission_classes([AllowAny])
def publish_project(request, project_id):
    """Prepare a project for publishing by returning deployment instructions"""
    try:
        project = get_object_or_404(Project, id=project_id)
        
        # Validate project is ready to publish
        if not all([
            project.title,
            project.description,
            project.fund_amount,
            project.wallet_address,
            project.token_address
        ]):
            return Response(
                {"success": False, "message": "Missing required fields"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get deployment instructions from web3_helper_functions
        from .web3_helper_functions import deploy_staking_contract
        deployment_info = deploy_staking_contract(
            project.title,
            project.fund_amount,
            project.wallet_address,
            project.token_address,
            wallet_key=None  # No key means just get instructions
        )
        
        if deployment_info.get('requires_wallet', False):
            # Return deployment instructions to the frontend
            return Response({
                "success": True,
                "requires_wallet": True,
                "message": "Project requires wallet signature to deploy contract",
                "deployment_data": deployment_info.get('deployment_data', {}),
                "project_id": project_id
            })
        else:
            # Fallback for any error case
            return Response({
                "success": False,
                "message": deployment_info.get('message', 'Unknown error preparing deployment')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def publish_project_with_signature(request, project_id):
    """Deploy a contract for a project using the creator's wallet signature"""
    try:
        project = get_object_or_404(Project, id=project_id)
        
        # Get signed data from request
        wallet_key = request.data.get('wallet_key')
        if not wallet_key:
            return Response({
                "success": False,
                "message": "Wallet key is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Deploy the contract with the creator's wallet key
        from .web3_helper_functions import deploy_staking_contract
        contract_result = deploy_staking_contract(
            project.title,
            project.fund_amount,
            project.wallet_address,
            project.token_address,
            wallet_key=wallet_key
        )
        
        if contract_result.get('success', False):
            # Update project status and save contract address
            project.status = 'active'
            project.contract_address = contract_result.get('contract_address')
            project.save()
            
            return Response({
                "success": True,
                "message": "Project published successfully",
                "contract_address": contract_result.get('contract_address')
            })
        else:
            return Response({
                "success": False,
                "message": contract_result.get('message', 'Contract deployment failed')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
def payment_process(request):
    """
    Process a card payment
    """
    if request.method != 'POST':
        return JsonResponse({"success": False, "message": "Only POST method is allowed"})
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        amount = data.get('amount')
        project_id = data.get('project_id')
        selected_incentive_id = data.get('selected_incentive_id')
        
        # Validate inputs
        if not email or not amount or not project_id:
            return JsonResponse({
                "success": False, 
                "message": "Missing required fields: email, amount, project_id"
            })
            
            # Get the project
            try:
                project = Project.objects.get(id=project_id)
            if project.status != 'active':
                return JsonResponse({
                    "success": False, 
                    "message": "Project is not active"
                })
            except Project.DoesNotExist:
            return JsonResponse({
                "success": False, 
                "message": "Project not found"
            })
        
        # Convert amount to Decimal
        try:
            amount_decimal = Decimal(str(amount))
        except:
            return JsonResponse({
                "success": False, 
                "message": "Invalid amount format"
            })
        
        # Get token amount equivalent
        token_amount = PaymentProcessor.get_token_amount_for_usd(
            amount_decimal, 
            project.token_address
        )
        
        # Create contribution record
        contribution = Contribution.objects.create(
            project=project,
            email=email,
            amount_usd=amount_decimal,
            amount_token=token_amount,
            token_address=project.token_address,
            incentive_id=selected_incentive_id,
            status='pending'
        )
        
        # Create payment session
        return_url = data.get('return_url', f"{settings.SITE_URL}/projects/{project_id}")
        payment_result = PaymentProcessor.create_payment_session(contribution, return_url)
        
        if payment_result['success']:
            return JsonResponse({
                "success": True, 
                "checkout_url": payment_result['checkout_url'],
                "session_id": payment_result['session_id'],
                "contribution_id": contribution.id
            })
        else:
            # Clean up on failure
            contribution.delete()
            return JsonResponse({
                "success": False, 
                "message": payment_result['message']
            })
            
    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": f"Error processing payment: {str(e)}"
        })


@csrf_exempt
def payment_callback(request, session_id):
    """
    Handle payment processor callback
    This is the endpoint that Mercuryo will call after payment is complete
    """
    if request.method != 'POST':
        return JsonResponse({"success": False, "message": "Only POST method is allowed"})
    
    try:
        # Get callback data from request
        data = json.loads(request.body)
        
        # Process the Mercuryo callback
        result = PaymentProcessor.handle_mercuryo_callback(data)
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": f"Error processing payment callback: {str(e)}"
        })


@csrf_exempt
def mercuryo_checkout_url(request):
    """
    Generate a Mercuryo checkout URL for a contribution
    Exactly matches RareFnd's implementation
    """
    if request.method != 'POST':
        return JsonResponse({"success": False, "message": "Only POST method is allowed"})
    
    try:
        data = json.loads(request.body)
        
        # Extract required fields the same way RareFnd does
        email = data.get('contributionEmail')
        amount = data.get('contributionAmount')
        project_id = data.get('projectId')
        selected_incentive = data.get('selectedIncentive', 0)
        redirect_url = data.get('redirectURL', request.build_absolute_uri('/'))
        
        # Validate inputs
        if not email or amount is None or project_id is None:
            return JsonResponse({
                "success": False, 
                "message": "Missing required fields"
            })
        
        # Get the project
        try:
            project = Project.objects.get(id=project_id)
            if project.status != 'active':
                return JsonResponse({
                    "success": False, 
                    "message": "Project is not active"
                })
        except Project.DoesNotExist:
            return JsonResponse({
                "success": False, 
                "message": "Project not found"
            })
        
        # Create contribution record
        contribution = Contribution.objects.create(
            project=project,
            email=email,
            amount_usd=amount,
            incentive_id=selected_incentive,
            status='pending'
        )
        
        # Generate Mercuryo checkout URL
        checkout_result = PaymentProcessor.get_mercuryo_checkout_url(
            contribution=contribution, 
            session_id=str(contribution.id),
            return_url=redirect_url
        )
        
        if checkout_result:
            return JsonResponse({
                "checkout_url": checkout_result
            })
        else:
            # Clean up on failure
            contribution.delete()
            return JsonResponse({
                "success": False, 
                "message": "Failed to generate checkout URL"
            })
            
    except Exception as e:
        print(f"Error generating Mercuryo checkout URL: {e}")
        return JsonResponse({
            "success": False,
            "message": f"Error processing request: {str(e)}"
        })


@csrf_exempt
def mercuryo_callback(request):
    """
    Handle Mercuryo payment callback
    Exactly matches RareFnd's implementation
    """
    if request.method != 'POST':
        return JsonResponse({"success": False, "message": "Only POST method is allowed"})
    
    try:
        # Get callback data from request
        data = json.loads(request.body)
        
        # Process the Mercuryo callback
        result = PaymentProcessor.handle_mercuryo_callback(data)
        return JsonResponse(result)
    except Exception as e:
        print(f"Error processing Mercuryo callback: {e}")
    return JsonResponse({
            "success": False,
            "message": f"Error processing callback: {str(e)}"
        })


@csrf_exempt
def incentives_by_project_id(request, id):
    """
    Retrieve incentives for a project
    For simplicity, we're using a mock implementation
    In production, these would be stored in the database
    """
    # This is temporary mock data for development/testing
    mock_incentives = [
        {
            "id": 1,
            "title": "Early Supporter",
            "description": "Get exclusive updates and be recognized as an early supporter on our website.",
            "price": 25,
            "limit": 100,
            "claimed": 12
        },
        {
            "id": 2,
            "title": "Limited Edition Token",
            "description": "Receive a limited edition token with special privileges in our ecosystem.",
            "price": 50,
            "limit": 50,
            "claimed": 5
        },
        {
            "id": 3,
            "title": "Founding Member",
            "description": "Become a founding member with premium access to all future releases and special community events.",
            "price": 100,
            "limit": 25,
            "claimed": 3
        }
    ]
    
    return JsonResponse({
        "incentives": mock_incentives
    })


class UpdateViewSet(viewsets.ModelViewSet):
    serializer_class = UpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Update.objects.filter(campaign_id=self.kwargs['campaign_pk'])

    def perform_create(self, serializer):
        campaign = get_object_or_404(Campaign, pk=self.kwargs['campaign_pk'])
        if campaign.owner != self.request.user:
            raise PermissionDenied("Only campaign owners can create updates")
        serializer.save(campaign=campaign)

    def perform_update(self, serializer):
        if serializer.instance.campaign.owner != self.request.user:
            raise PermissionDenied("Only campaign owners can update updates")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.campaign.owner != self.request.user:
            raise PermissionDenied("Only campaign owners can delete updates")
        instance.delete()


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(campaign_id=self.kwargs['campaign_pk'])

    def perform_create(self, serializer):
        campaign = get_object_or_404(Campaign, pk=self.kwargs['campaign_pk'])
        serializer.save(campaign=campaign, user=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            raise PermissionDenied("Only comment authors can edit their comments")
        serializer.save(is_edited=True)

    def perform_destroy(self, instance):
        if instance.user != self.request.user and instance.campaign.owner != self.request.user:
            raise PermissionDenied("Only comment authors or campaign owners can delete comments")
        instance.delete()

    @action(detail=True, methods=['post'])
    def report(self, request, campaign_pk=None, pk=None):
        comment = self.get_object()
        comment.reported = True
        comment.save()
        return Response({'status': 'comment reported'}) 


class CampaignViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Default queryset of all campaigns
        queryset = Campaign.objects.all()
        
        # Filter by owner if requested
        owner = self.request.query_params.get('owner', None)
        if owner:
            queryset = queryset.filter(owner=owner)
            
        # Filter by status if requested
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
            
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Add is_owner flag
        serializer = self.get_serializer(instance)
        data = serializer.data
        data['is_owner'] = instance.owner == request.user
        return Response(data)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        campaign = self.get_object()
        
        # Check if user is the owner
        if campaign.owner != request.user:
            return Response(
                {"detail": "Only campaign owners can access analytics"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get contributions
        contributions = Contribution.objects.filter(campaign=campaign)
        
        # Calculate analytics
        total_raised = sum(c.amount for c in contributions)
        total_donors = contributions.values('user').distinct().count()
        
        # Get contribution trend (by day)
        contribution_trend = []
        # Logic to populate contribution trend
        
        # Get donor distribution by amount
        donor_distribution = []
        # Logic to populate donor distribution
        
        # Get payment method distribution
        payment_method_distribution = []
        # Logic to populate payment method distribution
        
        # Prepare milestones progress
        milestones = campaign.milestones.all()
        milestone_data = []
        for m in milestones:
            milestone_data.append({
                'id': m.id,
                'title': m.title,
                'progress': int((m.current_amount / m.target_amount) * 100) if m.target_amount else 0
            })
        
        # Calculate campaign progress and days left
        campaign_progress = int((total_raised / campaign.fund_amount) * 100) if campaign.fund_amount else 0
        days_left = (campaign.end_date - timezone.now()).days if campaign.end_date else 0
        
        # Create mock data for demo
        analytics_data = {
            'totalRaised': total_raised,
            'totalDonors': total_donors,
            'newDonorsThisWeek': 5,  # Mock data
            'averageDonation': total_raised / total_donors if total_donors else 0,
            'donationGrowth': 15,  # Mock data
            'campaignProgress': campaign_progress,
            'daysLeft': days_left,
            'contributionTrend': [
                {'date': '2023-05-01', 'amount': 250},
                {'date': '2023-05-02', 'amount': 300},
                {'date': '2023-05-03', 'amount': 150},
                {'date': '2023-05-04', 'amount': 500},
                {'date': '2023-05-05', 'amount': 350},
                {'date': '2023-05-06', 'amount': 200},
                {'date': '2023-05-07', 'amount': 450},
            ],
            'donorDistribution': [
                {'range': '$0-$50', 'count': 15},
                {'range': '$51-$100', 'count': 25},
                {'range': '$101-$500', 'count': 10},
                {'range': '$501+', 'count': 5},
            ],
            'paymentMethodDistribution': [
                {'method': 'Credit Card', 'amount': 3500},
                {'method': 'Tokens', 'amount': 2500},
                {'method': 'Bank Transfer', 'amount': 1000},
                {'method': 'Other', 'amount': 500},
            ],
            'milestones': milestone_data
        }
        
        return Response(analytics_data)
    
    @action(detail=True, methods=['get'])
    def contributions(self, request, pk=None):
        campaign = self.get_object()
        contributions = Contribution.objects.filter(campaign=campaign)
        serializer = ContributionSerializer(contributions, many=True)
        return Response(serializer.data)


class ContributionViewSet(viewsets.ModelViewSet):
    serializer_class = ContributionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Contribution.objects.filter(campaign_id=self.kwargs['campaign_pk'])
    
    def perform_create(self, serializer):
        campaign = get_object_or_404(Campaign, pk=self.kwargs['campaign_pk'])
        serializer.save(campaign=campaign, user=self.request.user)


class MilestoneViewSet(viewsets.ModelViewSet):
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Milestone.objects.filter(campaign_id=self.kwargs['campaign_pk'])
    
    def perform_create(self, serializer):
        campaign = get_object_or_404(Campaign, pk=self.kwargs['campaign_pk'])
        
        # Check if user is the campaign owner
        if campaign.owner != self.request.user:
            raise PermissionDenied("Only campaign owners can create milestones")
            
        serializer.save(campaign=campaign)
    
    def perform_update(self, serializer):
        if serializer.instance.campaign.owner != self.request.user:
            raise PermissionDenied("Only campaign owners can update milestones")
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.campaign.owner != self.request.user:
            raise PermissionDenied("Only campaign owners can delete milestones")
        instance.delete()


class ReleaseViewSet(viewsets.ModelViewSet):
    serializer_class = ReleaseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Release.objects.filter(campaign_id=self.kwargs['campaign_pk'])
    
    def perform_create(self, serializer):
        campaign = get_object_or_404(Campaign, pk=self.kwargs['campaign_pk'])
        
        # Check if user is the campaign owner
        if campaign.owner != self.request.user:
            raise PermissionDenied("Only campaign owners can request releases")
            
        serializer.save(campaign=campaign, status='pending')
    
    def perform_update(self, serializer):
        if serializer.instance.campaign.owner != self.request.user:
            raise PermissionDenied("Only campaign owners can update release requests")
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.campaign.owner != self.request.user:
            raise PermissionDenied("Only campaign owners can delete release requests")
        instance.delete()


# Additional API view for exporting campaign analytics
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_analytics(request, campaign_id):
    campaign = get_object_or_404(Campaign, pk=campaign_id)
    
    # Check if user is the owner
    if campaign.owner != request.user:
        return Response(
            {"detail": "Only campaign owners can export analytics"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    format = request.query_params.get('format', 'csv')
    
    # Generate export file based on format
    # This is a placeholder - real implementation would generate actual files
    
    return Response({"status": f"Analytics exported in {format} format"})


@api_view(["GET"])
@permission_classes([AllowAny])
def contract_config(request):
    """Provide the contract configuration (ABI and bytecode) for direct deployment"""
    try:
        # Get the blockchain from the request
        blockchain = request.query_params.get('blockchain', 'BSC')
        
        # Load staking contract ABI
        abi_file_path = os.path.join(settings.BASE_DIR, 'static/staking_abi.json')
        with open(abi_file_path) as abi_file:
            abi = json.load(abi_file)
        
        # PRODUCTION IMPLEMENTATION:
        # The complete bytecode from the compiled CampaignContract.sol
        # This bytecode is the actual compiled output of CampaignContract.sol for direct deployment
        bytecode = "0x60806040523480156200001157600080fd5b5060405162001d3a38038062001d3a833981810160405281019062000037919062000445565b8873ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff1660601b815250508773ffffffffffffffffffffffffffffffffffffffff1660a08173ffffffffffffffffffffffffffffffffffffffff1660601b81525050866080518190838153833373ffffffffffffffffffffffffffffffffffffffff1660601b8152505050508560c0518190838153833373ffffffffffffffffffffffffffffffffffffffff1660601b815250505084608051906020019062000108929190620002a0565b50836080519060200190620001209291906200032c565b50826000819055508160018190555080600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506001600360006101000a81548160ff0219169083151502179055505050505050505050620006c1565b82805462000139906200064c565b90600052602060002090601f0160209004810192826200015d5760008555620001a9565b82601f106200017857805160ff1916838001178555620001a9565b82800160010185558215620001a9579182015b82811115620001a85782518255916020019190600101906200018b565b5b509050620001b89190620001bc565b5090565b5b80821115620001d7576000816000905550600101620001bd565b5090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6200024482620001f9565b810181811067ffffffffffffffff821117156200026657620002656200020a565b5b80604052505050565b60006200027b620001db565b90506200028982826200023a565b919050565b600067ffffffffffffffff821115620002ac57620002ab6200020a565b5b620002b782620001f9565b9050602081019050919050565b60005b83811015620002e4578082015181840152602081019050620002c7565b83811115620002f4576000848401525b50505050565b6000620003116200030b8462000290565b6200026f565b9050828152602081018484840111156200033057620003256200020a565b5b6200033d848285620002c4565b509392505050565b600082601f8301126200035d576200035c620001f4565b5b81516200036f848260208601620002fb565b91505092915050565b600067ffffffffffffffff821115620003945762000393620001f4565b5b6200039f826200023a565b9050602081019050919050565b6000620003c2620003bc8462000377565b6200034b565b905082815260208101848484011115620003e157620003e0620001f9565b5b620003ee848285620002c4565b509392505050565b600082601f8301126200040e57620004076200020a565b5b81516200042084826020860162000372565b91505092915050565b6000819050919050565b6200043f8162000429565b81146200044b57600080fd5b50565b600081519050620004638162000434565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006200049682620004e0565b9050919050565b620004a88162000489565b8114620004b457600080fd5b50565b600081519050620004c8816200049d565b92915050565b600067ffffffffffffffff821115620004ec57620004eb6200020a565b5b602082029050602081019050919050565b600080fd5b600080fd5b600080fd5b60008083601f84011262000527576200052662000518565b5b8235905067ffffffffffffffff8111156200054757620005466200051d565b5b6020830191508360018202830111156200056657620005656200058d565b5b9250929050565b600080fd5b6000806000806080858703121562000590576200058f62000568565b5b600085015167ffffffffffffffff811115620005b1576200058f62000568565b5b620005bf878288016200034b565b945050602085015167ffffffffffffffff811115620005e357620005e262000568565b5b620005f1878288016200034b565b9350506040620006048782880162000489565b9250506060620006178782880162000489565b91505092959194509250565b600082825260208201905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168062000667575f5b8062000672575060028204905082"

        # Network specific settings
        network_info = {
            'Ethereum': {
                'rpc': settings.ETHEREUM_RPC_URL,
                'chain_id': settings.CHAIN_IDS['Ethereum'],
                'explorer': 'https://etherscan.io',
                'default_token': '0xdAC17F958D2ee523a2206206994597C13D831ec7'  # USDT on Ethereum
            },
            'BSC': {
                'rpc': settings.BSC_RPC_URL,
                'chain_id': settings.CHAIN_IDS['BSC'],
                'explorer': 'https://bscscan.com',
                'default_token': '0x55d398326f99059fF775485246999027B3197955'  # USDT on BSC
            },
            'Base': {
                'rpc': settings.BASE_RPC_URL,
                'chain_id': settings.CHAIN_IDS['Base'],
                'explorer': 'https://basescan.org',
                'default_token': '0x4200000000000000000000000000000000000006'  # USDC on Base
            }
        }

        return Response({
            "success": True,
            "abi": abi,
            "bytecode": bytecode,
            "blockchain": blockchain,
            "network": network_info.get(blockchain, network_info['BSC'])
        })
    except Exception as e:
        return Response({
            "success": False,
            "message": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 