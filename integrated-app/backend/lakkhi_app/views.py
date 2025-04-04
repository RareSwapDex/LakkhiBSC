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
    try:
        # Check if user has a wallet address
        if not request.user.wallet_address:
            return Response({
                "status": "error",
                "message": "User must have a wallet address to create a campaign"
            }, status=status.HTTP_400_BAD_REQUEST)
        
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
            campaign_id=campaign.id
        )
        
        # Update campaign with contract address
        campaign.contract_address = contract_address
        campaign.save()
        
        # Send confirmation email
        campaign_url = f"{settings.FRONTEND_URL}/campaigns/{campaign.id}"
        email_message = f"""
        <html>
        <body>
        <p>Congratulations! Your campaign, <strong>{campaign.title}</strong>, has been created successfully.</p>
        
        <p>Access your campaign page directly via this <a href='{campaign_url}'>link</a>.</p>
        
        <p>Your campaign is currently in DRAFT status. You can review and edit your campaign details before launching it.</p>
        
        <p>Once you're ready, you can launch your campaign from the campaign dashboard.</p>
        
        <p>Best regards,<br>Lakkhi Team</p>
        </body>
        </html>
        """
        
        send_html_email(
            subject="Lakkhi: Your Campaign Has Been Created",
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


@api_view(["PUT"])
@permission_classes([AllowAny])
def update_project(request, project_id):
    """Update an existing project's details"""
    try:
        project = get_object_or_404(Project, id=project_id)
        
        # Verify wallet ownership (simple check - a more secure implementation would use signatures)
        wallet_address = request.data.get('wallet_address')
        if wallet_address and wallet_address.lower() != project.wallet_address.lower():
            return Response(
                {"success": False, "message": "Only the project owner can update this project"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only update fields that are provided and allowed to be updated
        # Core token fields (fund_amount, token_address, blockchain_chain) cannot be updated
        if 'title' in request.data:
            project.title = request.data['title']
        
        if 'description' in request.data:
            project.description = request.data['description']
            
        # Save the updated project
        project.save()
        
        return Response({
            "success": True,
            "message": "Project updated successfully",
            "project": {
                "id": project.id,
                "title": project.title,
                "description": project.description,
                "fund_amount": project.fund_amount,
                "token_address": project.token_address,
                "blockchain_chain": project.blockchain_chain,
                "wallet_address": project.wallet_address,
                "status": project.status
            }
        })
            
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 