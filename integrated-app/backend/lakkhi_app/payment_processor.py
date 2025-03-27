import os
import uuid
import datetime
import requests
from django.utils import timezone
from django.conf import settings
from decimal import Decimal

from .custom_wallet import WalletManager


class PaymentProcessor:
    """
    Custom payment processor to handle card donations
    Integrates with Mercuryo for card payments
    """
    
    @staticmethod
    def create_payment_session(contribution, return_url):
        """
        Create a payment session for a contribution
        Returns a Mercuryo checkout URL
        """
        from .models import PaymentSession
        
        # Generate a unique session ID
        session_id = str(uuid.uuid4())
        
        # Set expiration to 30 minutes from now
        expires_at = timezone.now() + datetime.timedelta(minutes=30)
        
        # Create the payment session
        payment_session = PaymentSession.objects.create(
            contribution=contribution,
            session_id=session_id,
            expires_at=expires_at,
            success_url=f"{return_url}?success=true&session_id={session_id}",
            cancel_url=f"{return_url}?success=false&session_id={session_id}"
        )
        
        # Get the Mercuryo checkout URL
        mercuryo_url = PaymentProcessor.get_mercuryo_checkout_url(
            contribution=contribution,
            session_id=session_id,
            return_url=return_url
        )
        
        if not mercuryo_url:
            return {
                "success": False,
                "message": "Failed to generate Mercuryo checkout URL"
            }
        
        return {
            "success": True,
            "session_id": session_id,
            "checkout_url": mercuryo_url,
            "expires_at": expires_at
        }
    
    @staticmethod
    def get_mercuryo_checkout_url(contribution, session_id, return_url):
        """
        Get Mercuryo checkout URL using their API
        Mercuryo will provide BNB which will be swapped for the project's token
        Exactly matches RareFnd's implementation
        """
        try:
            import random
            import string
            from hashlib import sha512
            
            # In a production environment, use actual Mercuryo credentials from settings
            mercuryo_widget_id = getattr(settings, 'MERCURYO_WIDGET_ID', 'your-mercuryo-widget-id')
            mercuryo_secret_key = getattr(settings, 'MERCURYO_SECRET_KEY', 'your-mercuryo-secret-key')
            
            # Create or get wallet for the contributor exactly as RareFnd does
            wallet = WalletManager.get_or_create_wallet(contribution.email)
            
            # Generate signature exactly as RareFnd does - using SHA512 of address+secret
            signature = sha512(
                f"{wallet.get('address')}{mercuryo_secret_key}".encode("utf-8")
            ).hexdigest()
            
            # Format merchant_transaction_id exactly as RareFnd does
            # Format: {amount}-{projectId}-{incentiveId}-{randomString}
            incentive_id = contribution.incentive_id if contribution.incentive_id else 0
            random_string = "".join(
                random.choices(
                    string.ascii_uppercase + string.digits + string.ascii_lowercase, k=15
                )
            )
            merchant_transaction_id = f"{float(contribution.amount_usd)}-{contribution.project.id}-{incentive_id}-{random_string}"
            
            # Handle redirect URL format as RareFnd does
            # In production, handle any URL modifications needed for callbacks
            
            # Build payload exactly as RareFnd does
            payload = {
                "type": "buy",
                "from": "USD",
                "to": "BNB",
                "amount": float(contribution.amount_usd),
                "widget_id": mercuryo_widget_id,
                "address": wallet.get("address"),
                "signature": signature,
                "email": contribution.email,
                "redirect_url": return_url,
                "merchant_transaction_id": merchant_transaction_id,
            }
            
            # Build checkout URL exactly as RareFnd does
            checkout_url = (
                f"https://exchange.mercuryo.io/?widget_id={payload['widget_id']}"
                f"&address={payload['address']}"
                f"&signature={payload['signature']}"
                f"&fiat_amount={payload['amount']}"
                f"&type={payload['type']}"
                f"&fiat_currency={payload['from']}"
                f"&currency={payload['to']}"
                f"&email={payload['email']}"
                f"&redirect_url={payload['redirect_url']}"
                f"&merchant_transaction_id={payload['merchant_transaction_id']}"
            )
            
            print(f"Generated Mercuryo checkout URL for contribution {contribution.id}")
            return checkout_url
            
        except Exception as e:
            print(f"Error getting Mercuryo checkout URL: {e}")
            return None
    
    @staticmethod
    def handle_mercuryo_callback(request_data):
        """
        Handle Mercuryo payment callback
        Exactly matches RareFnd's implementation
        """
        try:
            # Extract data from request exactly as RareFnd does
            if request_data.get("payload"):
                data = request_data["payload"]["data"]
            else:
                data = request_data["data"]
            
            # Process only completed transactions as RareFnd does
            if data["status"] == "completed":
                # Extract data from merchant_transaction_id exactly as RareFnd does
                merchant_transaction_id = data["merchant_transaction_id"]  # Format: 25-46-33-xLjQwit1fvEzkpo
                
                # Parse the merchant transaction ID to get contribution details
                usd_amount = float(merchant_transaction_id.split("-")[0])
                project_id = int(merchant_transaction_id.split("-")[1])
                incentive_id_str = merchant_transaction_id.split("-")[2]
                incentive_id = int(incentive_id_str) if incentive_id_str != "0" else None
                
                # Extract BNB amount and wallet address exactly as RareFnd does
                bnb_amount = data["amount"]
                wallet_address = data["tx"]["address"]
                contributor_email = data["user"]["email"]
                
                # Execute the staking flow - swap BNB to token, approve, and stake
                return PaymentProcessor.execute_stake_flow(
                    bnb_amount=bnb_amount,
                    wallet_address=wallet_address,
                    project_id=project_id,
                    contributor_email=contributor_email,
                    usd_amount=usd_amount,
                    incentive_id=incentive_id
                )
            
            # Return status for non-completed payments
            return {"success": True, "status": data["status"]}
                
        except Exception as e:
            print(f"Error processing Mercuryo callback: {e}")
            return {"success": False, "message": f"Error processing Mercuryo callback: {str(e)}"}

    @staticmethod
    def execute_stake_flow(bnb_amount, wallet_address, project_id, contributor_email, usd_amount, incentive_id=None):
        """
        Execute the staking flow after receiving BNB from Mercuryo
        This replaces the Venly.execute_stake function from RareFnd
        """
        from django.db import transaction
        from .models import Project, Contribution, Incentive
        
        try:
            with transaction.atomic():
                # Get project by ID
                project = Project.objects.get(id=project_id)
                
                # Get incentive if specified
                selected_incentive = None
                if incentive_id:
                    try:
                        selected_incentive = Incentive.objects.get(id=incentive_id)
                    except Incentive.DoesNotExist:
                        pass  # Continue without incentive
                
                # Create the contribution record
                contribution = Contribution.objects.create(
                    project=project,
                    email=contributor_email,
                    wallet_address=wallet_address,
                    amount_usd=usd_amount,
                    incentive_id=incentive_id,
                    status='processing'
                )
                
                # STEP 1: Swap BNB to the project's token
                print(f"Swapping {bnb_amount} BNB to token {project.token_address}")
                swap_result = WalletManager.swap_bnb_to_token(
                    wallet_identifier=wallet_address,
                    bnb_amount=float(bnb_amount),
                    token_address=project.token_address
                )
                
                if not swap_result['success']:
                    print(f"Swap failed: {swap_result.get('errors')}")
                    contribution.status = 'failed'
                    contribution.save()
                    return {
                        "success": False,
                        "message": f"Could not swap BNB to token: {swap_result.get('errors')}"
                    }
                
                # Update contribution with token amount and transaction hash
                token_amount = swap_result['result']['toAmount']
                contribution.amount_token = token_amount
                contribution.transaction_hash = swap_result['result']['transactionHash']
                contribution.save()
                
                # STEP 2: Approve the project's smart contract to spend tokens
                print(f"Approving contract {project.contract_address} to spend tokens")
                approval_result = WalletManager.approve_token_spending(
                    wallet_identifier=wallet_address,
                    spender_address=project.contract_address,
                    token_address=project.token_address,
                    amount=token_amount
                )
                
                if not approval_result['success']:
                    print(f"Approval failed: {approval_result.get('errors')}")
                    contribution.status = 'failed'
                    contribution.save()
                    return {
                        "success": False,
                        "message": f"Could not approve token spending: {approval_result.get('errors')}"
                    }
                
                # STEP 3: Stake tokens on the project's smart contract
                print(f"Staking tokens on contract {project.contract_address}")
                staking_result = WalletManager.stake_tokens(
                    wallet_identifier=wallet_address,
                    contract_address=project.contract_address,
                    token_address=project.token_address,
                    amount=token_amount
                )
                
                if not staking_result['success']:
                    print(f"Staking failed: {staking_result.get('errors')}")
                    contribution.status = 'failed'
                    contribution.save()
                    return {
                        "success": False,
                        "message": f"Could not stake tokens: {staking_result.get('errors')}"
                    }
                
                # Update contribution with final status
                contribution.status = 'completed'
                contribution.save()
                
                # Update the project's raised amount
                project.raised_amount += contribution.amount_usd
                project.number_of_donators += 1
                project.save()
                
                return {
                    "success": True,
                    "message": f"Address {wallet_address} staked {bnb_amount}BNB to project id {project_id}, tx hash: {staking_result['result']['transactionHash']}"
                }
                
        except Exception as e:
            print(f"Error executing stake flow: {e}")
            return {"success": False, "message": f"Error executing stake flow: {str(e)}"}

    @staticmethod
    def get_token_amount_for_usd(usd_amount, token_address):
        """
        Calculate the token amount for a given USD amount
        """
        # In production, this would query the token's price from an oracle or exchange
        # For now, use a fixed conversion rate (1 USD = 100 tokens)
        conversion_rate = Decimal('100')
        token_amount = Decimal(usd_amount) * conversion_rate
        
        return token_amount 