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
from .models import Project, TokenPrice, Campaign, Contribution, Milestone, Release, Update, Comment, Blockchain, CreatorVerification, Collaborator, ForumTopic, ForumReply
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
    CommentSerializer,
    BlockchainSerializer,
    CreatorVerificationSerializer,
    CollaboratorSerializer,
    ForumTopicSerializer,
    ForumReplySerializer
)
from .eth.deploy import deploy_contract
from .mercuryo.client import MercuryoClient
from .solana.client import SolanaClient


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
            "contract_owner_address": project.contract_owner_address,
            "token_info": token_info,
        }
        
        return Response({"success": True, "project": project_data})
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def create_project(request):
    """Create a new project"""
    try:
        # Extract form data
        title = request.data.get('title')
        description = request.data.get('description')
        fund_amount = request.data.get('fund_amount')
        token_address = request.data.get('token_address')
        blockchain_chain = request.data.get('blockchain_chain', 'BSC')
        wallet_address = request.data.get('wallet_address')
        
        # Get the optional contract owner address
        contract_owner_address = request.data.get('contract_owner_address')
        
        # If contract owner address is not provided, use the creator's wallet address
        if not contract_owner_address:
            contract_owner_address = wallet_address
        
        # Validate required fields
        if not all([title, description, fund_amount, token_address, wallet_address]):
            return Response(
                {"success": False, "message": "Missing required fields"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the project
        project = Project.objects.create(
            title=title,
            description=description,
            fund_amount=fund_amount,
            token_address=token_address,
            blockchain_chain=blockchain_chain,
            wallet_address=wallet_address,
            contract_owner_address=contract_owner_address,
            status='draft'
        )
        
        return Response({
            "success": True,
            "message": "Project created successfully",
            "project": {
                "id": project.id,
                "title": project.title,
                "description": project.description,
                "fund_amount": project.fund_amount,
                "fund_currency": project.currency,
                "blockchain_chain": project.blockchain_chain,
                "wallet_address": project.wallet_address,
                "contract_owner_address": project.contract_owner_address,
                "token_address": project.token_address,
                "status": project.status
            }
        })
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


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
        
        # Use contract owner address for the contract deployment
        contract_owner = project.contract_owner_address or project.wallet_address
        
        # Get deployment instructions from web3_helper_functions
        from .web3_helper_functions import deploy_staking_contract
        deployment_info = deploy_staking_contract(
            project.title,
            project.fund_amount,
            contract_owner,  # Use the designated contract owner
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
        
        # Find the associated project to check the contract owner
        try:
            project = Project.objects.get(contract_address=campaign.contract_address)
            # Check if user is the contract owner
            if self.request.user.wallet_address.lower() != project.contract_owner_address.lower():
                raise PermissionDenied("Only the designated contract owner can request fund releases")
        except Project.DoesNotExist:
            # Fallback to old behavior if project not found
            if campaign.owner != self.request.user:
                raise PermissionDenied("Only campaign owners can request releases")
            
        serializer.save(campaign=campaign, status='pending')
    
    def perform_update(self, serializer):
        campaign = serializer.instance.campaign
        
        # Find the associated project to check the contract owner
        try:
            project = Project.objects.get(contract_address=campaign.contract_address)
            # Check if user is the contract owner
            if self.request.user.wallet_address.lower() != project.contract_owner_address.lower():
                raise PermissionDenied("Only the designated contract owner can update release requests")
        except Project.DoesNotExist:
            # Fallback to old behavior if project not found
            if campaign.owner != self.request.user:
                raise PermissionDenied("Only campaign owners can update release requests")
                
        serializer.save()
    
    def perform_destroy(self, instance):
        campaign = instance.campaign
        
        # Find the associated project to check the contract owner
        try:
            project = Project.objects.get(contract_address=campaign.contract_address)
            # Check if user is the contract owner
            if self.request.user.wallet_address.lower() != project.contract_owner_address.lower():
                raise PermissionDenied("Only the designated contract owner can delete release requests")
        except Project.DoesNotExist:
            # Fallback to old behavior if project not found
            if campaign.owner != self.request.user:
                raise PermissionDenied("Only campaign owners can delete release requests")
                
        instance.delete()

    @action(detail=True, methods=['post'])
    def execute(self, request, campaign_pk=None, pk=None):
        release = self.get_object()
        campaign = release.campaign
        
        # Check if release is already completed
        if release.status == 'completed':
            return Response({"detail": "This release has already been executed"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the associated project to check the contract owner
        try:
            project = Project.objects.get(contract_address=campaign.contract_address)
            # Check if user is the contract owner
            if self.request.user.wallet_address.lower() != project.contract_owner_address.lower():
                return Response(
                    {"detail": "Only the designated contract owner can execute fund releases"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Execute the on-chain transaction
            from .web3_helper_functions import execute_contract_release
            result = execute_contract_release(
                contract_address=project.contract_address,
                wallet_address=self.request.user.wallet_address,
                amount=release.amount
            )
            
            if result.get('success'):
                # Update release status
                release.status = 'completed'
                release.release_date = timezone.now()
                release.transaction_hash = result.get('transaction_hash')
                release.save()
                
                return Response({
                    "detail": "Fund release executed successfully",
                    "transaction_hash": result.get('transaction_hash')
                })
            else:
                return Response(
                    {"detail": result.get('message', 'Failed to execute release')}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Project.DoesNotExist:
            # Fallback to old behavior if project not found
            return Response(
                {"detail": "Associated project not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
        
        # Verify wallet ownership - either project creator or contract owner can edit
        wallet_address = request.data.get('wallet_address')
        if wallet_address:
            is_project_creator = wallet_address.lower() == project.wallet_address.lower()
            is_contract_owner = project.contract_owner_address and wallet_address.lower() == project.contract_owner_address.lower()
            
            if not (is_project_creator or is_contract_owner):
                return Response(
                    {"success": False, "message": "Only the project creator or contract owner can update this project"},
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
                "contract_owner_address": project.contract_owner_address,
                "status": project.status
            }
        })
            
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 


class BlockchainViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for blockchain information
    """
    queryset = Blockchain.objects.filter(is_enabled=True)
    serializer_class = BlockchainSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=True, methods=['get'])
    def gas_price(self, request, pk=None):
        """
        Get current gas price for the blockchain
        """
        blockchain = self.get_object()
        try:
            # Get gas price from blockchain RPC (all supported chains are EVM-compatible)
            web3 = Web3(Web3.HTTPProvider(blockchain.rpc_url))
            gas_price = web3.eth.gas_price
            return Response({
                'gas_price': str(gas_price),
                'gas_price_gwei': str(web3.from_wei(gas_price, 'gwei')),
                'updated_at': timezone.now(),
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class CreatorVerificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for creator verification requests
    """
    serializer_class = CreatorVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return CreatorVerification.objects.all()
        return CreatorVerification.objects.filter(user=user)
    
    def perform_create(self, serializer):
        # Check if user already has a verification request
        if CreatorVerification.objects.filter(user=self.request.user).exists():
            raise ValidationError("You already have a verification request")
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_verification(self, request):
        """
        Get the current user's verification status
        """
        try:
            verification = CreatorVerification.objects.get(user=request.user)
            serializer = self.get_serializer(verification)
            return Response(serializer.data)
        except CreatorVerification.DoesNotExist:
            return Response({'status': 'not_requested'}, status=404)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def verify(self, request, pk=None):
        """
        Approve a verification request (admin only)
        """
        verification = self.get_object()
        verification.status = 'verified'
        verification.verification_date = timezone.now()
        verification.save()
        
        # Update all user's campaigns to show verified status
        Campaign.objects.filter(owner=verification.user).update(is_verified=True)
        
        return Response({'status': 'verified'})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """
        Reject a verification request (admin only)
        """
        verification = self.get_object()
        verification.status = 'rejected'
        verification.rejection_reason = request.data.get('reason', '')
        verification.save()
        return Response({'status': 'rejected'})


class CollaboratorViewSet(viewsets.ModelViewSet):
    """
    API endpoint for campaign collaborators
    """
    serializer_class = CollaboratorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if 'campaign_pk' in self.kwargs:
            campaign = get_object_or_404(Campaign, pk=self.kwargs['campaign_pk'])
            # Check if user is owner or collaborator
            if campaign.owner == self.request.user or campaign.collaborators.filter(user=self.request.user).exists():
                return Collaborator.objects.filter(campaign=campaign)
            raise PermissionDenied("You don't have permission to view collaborators")
        return Collaborator.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        campaign = get_object_or_404(Campaign, pk=self.kwargs['campaign_pk'])
        if campaign.owner != self.request.user and not campaign.collaborators.filter(
            user=self.request.user, role__in=['owner', 'admin']
        ).exists():
            raise PermissionDenied("You don't have permission to add collaborators")
        serializer.save(
            campaign=campaign,
            invited_by=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def accept(self, request, campaign_pk=None, pk=None):
        """
        Accept a collaboration invitation
        """
        invitation = self.get_object()
        if invitation.user != request.user:
            raise PermissionDenied("This is not your invitation")
        
        invitation.invitation_accepted = True
        invitation.save()
        return Response({'status': 'accepted'})
    
    @action(detail=True, methods=['post'])
    def decline(self, request, campaign_pk=None, pk=None):
        """
        Decline a collaboration invitation
        """
        invitation = self.get_object()
        if invitation.user != request.user:
            raise PermissionDenied("This is not your invitation")
        
        invitation.delete()
        return Response({'status': 'declined'})


class ForumTopicViewSet(viewsets.ModelViewSet):
    """
    API endpoint for campaign forum topics
    """
    serializer_class = ForumTopicSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        campaign = get_object_or_404(Campaign, pk=self.kwargs['campaign_pk'])
        return ForumTopic.objects.filter(campaign=campaign)
    
    def perform_create(self, serializer):
        campaign = get_object_or_404(Campaign, pk=self.kwargs['campaign_pk'])
        if not campaign.enable_forum:
            raise ValidationError("Forum is disabled for this campaign")
        serializer.save(
            campaign=campaign,
            author=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def view(self, request, campaign_pk=None, pk=None):
        """
        Increment view count for a topic
        """
        topic = self.get_object()
        topic.views += 1
        topic.save()
        return Response({'views': topic.views})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def pin(self, request, campaign_pk=None, pk=None):
        """
        Pin/unpin a topic (campaign owner or moderator only)
        """
        topic = self.get_object()
        campaign = topic.campaign
        
        if not (campaign.owner == request.user or campaign.collaborators.filter(
            user=request.user, role__in=['owner', 'admin']
        ).exists()):
            raise PermissionDenied("You don't have permission to pin topics")
        
        topic.is_pinned = not topic.is_pinned
        topic.save()
        return Response({'is_pinned': topic.is_pinned})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def close(self, request, campaign_pk=None, pk=None):
        """
        Close/reopen a topic (campaign owner, moderator or topic author)
        """
        topic = self.get_object()
        campaign = topic.campaign
        
        if not (campaign.owner == request.user or topic.author == request.user or campaign.collaborators.filter(
            user=request.user, role__in=['owner', 'admin']
        ).exists()):
            raise PermissionDenied("You don't have permission to close this topic")
        
        topic.is_closed = not topic.is_closed
        topic.save()
        return Response({'is_closed': topic.is_closed})


class ForumReplyViewSet(viewsets.ModelViewSet):
    """
    API endpoint for campaign forum replies
    """
    serializer_class = ForumReplySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        topic = get_object_or_404(ForumTopic, campaign__id=self.kwargs['campaign_pk'], pk=self.kwargs['topic_pk'])
        return ForumReply.objects.filter(topic=topic)
    
    def perform_create(self, serializer):
        topic = get_object_or_404(ForumTopic, campaign__id=self.kwargs['campaign_pk'], pk=self.kwargs['topic_pk'])
        if topic.is_closed:
            raise ValidationError("This topic is closed for new replies")
        
        # Check for a parent reply (nested comment)
        parent_id = self.request.data.get('parent')
        parent = None
        if parent_id:
            parent = get_object_or_404(ForumReply, pk=parent_id, topic=topic)
        
        serializer.save(
            topic=topic,
            author=self.request.user,
            parent=parent
        )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_solution(self, request, campaign_pk=None, topic_pk=None, pk=None):
        """
        Mark/unmark a reply as the solution (topic author or campaign owner only)
        """
        reply = self.get_object()
        topic = reply.topic
        
        if not (topic.author == request.user or topic.campaign.owner == request.user):
            raise PermissionDenied("You don't have permission to mark solutions")
        
        # Unmark any existing solutions
        ForumReply.objects.filter(topic=topic, is_solution=True).update(is_solution=False)
        
        # Mark this reply as solution if it wasn't already
        reply.is_solution = not reply.is_solution
        reply.save()
        return Response({'is_solution': reply.is_solution}) 