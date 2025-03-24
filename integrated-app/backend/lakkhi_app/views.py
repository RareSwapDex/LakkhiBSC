from datetime import timedelta
import json
from pprint import pprint
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.core.files.images import ImageFile
import io
import hashlib
import uuid
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from . import venly
from .models import (
    Project,
    Category,
    Contribution,
    PendingContribution,
    TokenPrice,
    User,
    Incentive,
    Subcategory,
    Country,
    ProjectFile,
    Type,
    EligibleCountry,
)
from .web3_helper_functions import deploy_staking_contract
from rest_framework.permissions import IsAuthenticated, AllowAny


@api_view(["GET"])
def projects_list(request):
    if request.method == "GET":
        queryset = Project.objects.filter(approved=True)
        # You would need to create a serializer for this
        # serializer = ProjectSerializer(queryset, many=True)
        # return Response({"projects": serializer.data})
        # For now, let's return a basic list
        projects_data = []
        for project in queryset:
            projects_data.append({
                "id": project.id,
                "title": project.title,
                "head": project.head,
                "owner_username": project.owner_username,
                "category": project.category.name if project.category else None,
                "fund_amount": project.fund_amount,
                "raised_amount": project.raised_amount,
                "live": project.live,
            })
        return Response({"projects": projects_data})


@api_view(["GET", "PUT"])
def projects_details_by_id(request, id):
    try:
        project = Project.objects.get(pk=id)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == "GET":
        # You would need a serializer for this
        # serializer = ProjectSerializer(project)
        # return Response(serializer.data)
        # For now, let's return basic project data
        project_data = {
            "id": project.id,
            "title": project.title,
            "head": project.head,
            "owner_username": project.owner_username,
            "owner_profile_picture": project.owner_profile_picture,
            "category": project.category.name if project.category else None,
            "fund_amount": project.fund_amount,
            "raised_amount": project.raised_amount,
            "live": project.live,
            "description": project.description,
            "wallet_address": project.wallet_address,
            "staking_address": project.staking_address,
            "number_of_donators": project.number_of_donators,
            "number_of_subscribed_users": project.number_of_subscribed_users,
        }
        return Response(project_data)
    
    elif request.method == "PUT":
        # Would need a serializer for this in a full implementation
        # serializer = ProjectSerializer(project, data=request.data)
        # if serializer.is_valid():
        #     serializer.save()
        #     return Response(serializer.data, status=status.HTTP_200_OK)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Update functionality not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(["GET"])
def incentives(request, project_id):
    try:
        project = Project.objects.get(pk=project_id)
        incentives_list = Incentive.objects.filter(project=project)
        
        # You would need a serializer for this
        # serializer = IncentiveSerializer(incentives_list, many=True)
        # return Response({"incentives": serializer.data})
        
        # For now, let's return basic incentive data
        incentives_data = []
        for incentive in incentives_list:
            incentives_data.append({
                "id": incentive.id,
                "title": incentive.title,
                "description": incentive.description,
                "price": incentive.price,
                "available_items": incentive.available_items,
                "reserved": incentive.reserved,
                "estimated_delivery": incentive.estimated_delivery,
                "display_order": incentive.display_order,
            })
        return Response({"incentives": incentives_data})
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@login_required
def add_project(request):
    """Create a new project/campaign"""
    if request.method == "POST":
        try:
            # Basic project information
            project = Project(
                owner=request.user,
                owner_type=request.data.get("basics.projectOwnerType"),
                title=request.data.get("basics.projectTitle"),
                head=request.data.get("basics.projectHead"),
                country_id=EligibleCountry.objects.get(
                    nicename=request.data.get("basics.projectCountry")
                ).id,
                address=request.data.get("basics.projectAddress"),
                thumbnail=ImageFile(
                    io.BytesIO(request.data.get("basics.projectImageFile").read()),
                    name="thumbnail.jpg",
                ),
                launch_date=request.data.get("basics.projectLaunchDate"),
                deadline=request.data.get("basics.projectDeadlineDate")
                .lower()
                .replace("days", ""),
                category_id=Category.objects.get(
                    name=request.data.get("basics.projectCategory")
                ).id
                if request.data.get("basics.projectCategory")
                else None,
                subcategory_id=Subcategory.objects.get(
                    name=request.data.get("basics.projectSubcategory")
                ).id
                if request.data.get("basics.projectSubcategory")
                else None,
                type_id=Type.objects.get(name=request.data.get("basics.projectType")).id
                if request.data.get("basics.projectType")
                else None,
                fund_amount=request.data.get("funding.projectFundAmount", 0),
                currency=request.data.get("funding.projectFundCurrency", "USD"),
                description=request.data.get("story.projectStory", ""),
            )
            project.save()

            # Add incentives
            incentives = request.data.get("rewards.projectRewards", [])
            for incentive_data in incentives:
                incentive = Incentive(
                    project=project,
                    title=incentive_data.get("title", ""),
                    description=incentive_data.get("description", ""),
                    price=incentive_data.get("price", 0),
                    available_items=incentive_data.get("availableItems", 0),
                    estimated_delivery=incentive_data.get("estimatedDelivery"),
                    display_order=incentive_data.get("displayOrder", 0),
                )
                incentive.save()
            
            return Response(
                {
                    "success": True,
                    "message": "Project created successfully",
                    "project_id": project.id,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            print(f"Error creating project: {e}")
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


@api_view(["POST"])
def create_wallet(request):
    """Create a wallet for a user using Venly"""
    if request.method == "POST":
        try:
            email = request.data.get("email")
            if not email:
                return Response(
                    {"success": False, "message": "Email is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Create wallet with email as identifier
            wallet = venly.get_or_create_wallet(email)
            if wallet == "Failed":
                return Response(
                    {"success": False, "message": "Failed to create wallet"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            
            # Return wallet details
            return Response(
                {
                    "success": True,
                    "message": "Wallet created successfully",
                    "wallet_address": wallet.get("address"),
                    "wallet_id": wallet.get("id"),
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            print(f"Error creating wallet: {e}")
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


@api_view(["POST"])
def process_payment(request):
    """Process a card payment through Mercuryo"""
    if request.method == "POST":
        try:
            email = request.data.get("email")
            amount = request.data.get("amount")
            project_id = request.data.get("project_id")
            selected_incentive_id = request.data.get("selected_incentive_id")
            
            if not email or not amount or not project_id:
                return Response(
                    {"success": False, "message": "Missing required fields"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Generate a unique hash for this contribution
            hash_str = f"{email}_{project_id}_{amount}_{uuid.uuid4()}"
            hash_value = hashlib.sha256(hash_str.encode()).hexdigest()
            
            # Create a pending contribution
            try:
                project = Project.objects.get(pk=project_id)
                
                # Check if an incentive was selected
                selected_incentive = None
                if selected_incentive_id:
                    selected_incentive = Incentive.objects.get(pk=selected_incentive_id)
                
                # Create the pending contribution
                pending_contribution = PendingContribution(
                    hash=hash_value,
                    project=project,
                    selected_incentive=selected_incentive,
                    contribution_amount=amount,
                    contributor_email=email,
                )
                pending_contribution.save()
                
                # In a real implementation, you would:
                # 1. Create a Mercuryo checkout URL
                # 2. Return the URL to the client for redirect
                
                # For now, we'll return a success response with a mock URL
                return Response(
                    {
                        "success": True,
                        "message": "Payment initialized",
                        "checkout_url": f"https://exchange.mercuryo.io/?widget_id=YOUR_WIDGET_ID&amount={amount}&email={email}&hash={hash_value}",
                        "contribution_hash": hash_value,
                    },
                    status=status.HTTP_200_OK,
                )
            except Project.DoesNotExist:
                return Response(
                    {"success": False, "message": "Project not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            except Incentive.DoesNotExist:
                return Response(
                    {"success": False, "message": "Incentive not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            
        except Exception as e:
            print(f"Error processing payment: {e}")
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


@api_view(["POST"])
def mercuryo_callback(request):
    """Handle callbacks from Mercuryo payment processing"""
    if request.method == "POST":
        try:
            # Verify the callback signature (this would be implementation-specific)
            # Process the payment details
            
            # For demonstration, let's assume we get these fields
            hash_value = request.data.get("hash")
            status_value = request.data.get("status")
            amount = request.data.get("amount")
            currency = request.data.get("currency")
            
            if not hash_value or status_value != "success":
                return Response(
                    {"success": False, "message": "Invalid callback data"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Find the pending contribution
            try:
                pending_contribution = PendingContribution.objects.get(hash=hash_value)
                
                # Get the project and contributor email
                project = pending_contribution.project
                email = pending_contribution.contributor_email
                
                # Create or get wallet for the user
                wallet = venly.get_or_create_wallet(email)
                if wallet == "Failed":
                    return Response(
                        {"success": False, "message": "Failed to create wallet"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
                
                # Execute swap from BNB to project token
                swap_result = venly.execute_swap(
                    wallet.get("address"), amount, email
                )
                
                if not swap_result.get("success", False):
                    return Response(
                        {"success": False, "message": swap_result.get("message", "Swap failed")},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
                
                # Get the amount of tokens received from the swap
                tokens_received = swap_result.get("tokens_received")
                
                # Stake tokens to the project's staking contract if it exists
                if project.staking_address:
                    try:
                        # Use Venly to approve and stake tokens
                        approve_result = venly.approve_smart_contract(
                            wallet, venly.PIN_CODE, project.staking_address
                        )
                        
                        if not approve_result.get("success", False):
                            # Handle approval failure (might need to retry with different PIN)
                            if approve_result.get("errors", [{}])[0].get("code") == "pincode.incorrect":
                                approve_result = venly.approve_smart_contract(
                                    wallet, "9294", project.staking_address
                                )
                                
                        if approve_result.get("success", False):
                            # Execute the stake transaction
                            stake_result = venly.stake(
                                wallet, 
                                venly.PIN_CODE, 
                                project.staking_address, 
                                tokens_received
                            )
                            
                            # Handle stake failure (might need to retry with different PIN)
                            if not stake_result.get("success", False):
                                if stake_result.get("errors", [{}])[0].get("code") == "pincode.incorrect":
                                    stake_result = venly.stake(
                                        wallet, 
                                        "9294", 
                                        project.staking_address, 
                                        tokens_received
                                    )
                    except Exception as stake_err:
                        print(f"Error staking tokens: {stake_err}")
                        # Continue anyway, as we'll still record the contribution
                
                # Create the contribution record
                contribution = Contribution(
                    contributor_wallet_address=wallet.get("address"),
                    contributor_email=email,
                    project=project,
                    amount=tokens_received,
                    contribution_method="Card",
                    hash=hash_value,
                    selected_incentive=pending_contribution.selected_incentive,
                    eligible_for_selected_incentive=True if pending_contribution.selected_incentive else None,
                )
                contribution.save()
                
                # Update project's raised amount
                project.raised_amount = (project.raised_amount or 0) + float(tokens_received)
                project.save()
                
                # Delete the pending contribution
                pending_contribution.delete()
                
                # Send email confirmation
                try:
                    send_mail(
                        "Donation Confirmation",
                        f"Thank you for your donation of {tokens_received} tokens to {project.title}.",
                        settings.DEFAULT_FROM_EMAIL,
                        [email],
                        fail_silently=False,
                    )
                except Exception as email_err:
                    print(f"Error sending confirmation email: {email_err}")
                
                return Response(
                    {"success": True, "message": "Payment processed successfully"},
                    status=status.HTTP_200_OK,
                )
                
            except PendingContribution.DoesNotExist:
                return Response(
                    {"success": False, "message": "Pending contribution not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
                
        except Exception as e:
            print(f"Error processing Mercuryo callback: {e}")
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


@api_view(["PUT"])
@login_required
def publish_project(request, project_id):
    """Publish a project and deploy its staking smart contract"""
    if request.method == "PUT":
        try:
            project = Project.objects.get(pk=project_id, owner=request.user)
            
            # Deploy staking contract
            try:
                contract_result = deploy_staking_contract(
                    project_name=project.title,
                    project_target=project.fund_amount,
                    project_owner=project.owner.wallet_address
                )
                
                if contract_result.get("success"):
                    # Store contract details in project
                    project.staking_address = contract_result.get("contract_address")
                    project.staking_abi = json.dumps(contract_result.get("contract_abi"))
                    project.live = True
                    project.project_live_datetime = timezone.now()
                    project.save()
                    
                    return Response(
                        {
                            "success": True, 
                            "message": "Project published and staking contract deployed",
                            "staking_address": project.staking_address
                        },
                        status=status.HTTP_200_OK,
                    )
                else:
                    return Response(
                        {
                            "success": False, 
                            "message": contract_result.get("message", "Failed to deploy staking contract")
                        },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            except Exception as contract_err:
                print(f"Error deploying staking contract: {contract_err}")
                return Response(
                    {"success": False, "message": f"Error deploying staking contract: {str(contract_err)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
                
        except Project.DoesNotExist:
            return Response(
                {"success": False, "message": "Project not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            print(f"Error publishing project: {e}")
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    Root endpoint for the API
    """
    return JsonResponse({
        'status': 'online',
        'message': 'Lakkhi API is running',
        'version': '1.0.0',
        'endpoints': {
            'projects': '/api/projects/',
            'wallet': '/api/wallet/create/',
            'payment': '/api/payment/process/',
            'admin': '/admin/'
        }
    }) 