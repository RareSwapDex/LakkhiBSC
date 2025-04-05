import hashlib
import requests
import json
from django.conf import settings
import uuid
import logging

logger = logging.getLogger(__name__)

class MercuryoClient:
    """Client for interacting with Mercuryo payment gateway"""
    
    @classmethod
    def generate_signature(cls, wallet_address):
        """Generate a signature for Mercuryo API requests"""
        try:
            # Get API key and secret from settings
            secret_key = settings.MERCURYO_SECRET_KEY
            
            # Generate signature as SHA512 of wallet_address + secret_key
            signature = hashlib.sha512(
                f"{wallet_address}{secret_key}".encode("utf-8")
            ).hexdigest()
            
            return signature
        except Exception as e:
            logger.error(f"Error generating Mercuryo signature: {e}")
            return None
    
    @classmethod
    def create_checkout_url(cls, wallet_address, amount_usd, email, project_id, session_id=None, return_url=None):
        """Create a checkout URL for Mercuryo payments"""
        try:
            # Use test widget in development, production in production
            widget_id = settings.MERCURYO_WIDGET_ID
            
            # Generate signature for the request
            signature = cls.generate_signature(wallet_address)
            if not signature:
                return None
            
            # Create unique session ID if not provided
            if not session_id:
                session_id = str(uuid.uuid4())
            
            # Build the checkout URL
            base_url = "https://exchange.mercuryo.io"
            checkout_url = (
                f"{base_url}/?widget_id={widget_id}"
                f"&type=buy"
                f"&currency=USD"
                f"&amount={amount_usd}"
                f"&signature={signature}"
                f"&address={wallet_address}"
                f"&email={email}"
                f"&ref_id={project_id}"
                f"&session_id={session_id}"
            )
            
            # Add return URL if provided
            if return_url:
                checkout_url += f"&return_url={return_url}"
            
            return checkout_url
        except Exception as e:
            logger.error(f"Error creating Mercuryo checkout URL: {e}")
            return None
    
    @classmethod
    def validate_callback(cls, callback_data):
        """Validate a callback from Mercuryo"""
        try:
            # Placeholder implementation
            return True
        except Exception as e:
            logger.error(f"Error validating Mercuryo callback: {e}")
            return False
    
    @classmethod
    def process_callback(cls, callback_data):
        """Process a payment callback from Mercuryo"""
        try:
            # Extract relevant data from callback
            transaction_id = callback_data.get("tx", {}).get("id")
            status = callback_data.get("tx", {}).get("status")
            amount = callback_data.get("tx", {}).get("amount")
            currency = callback_data.get("tx", {}).get("currency")
            wallet_address = callback_data.get("tx", {}).get("address")
            
            # Return structured data
            return {
                "transaction_id": transaction_id,
                "status": status,
                "amount": amount,
                "currency": currency,
                "wallet_address": wallet_address,
                "raw_data": callback_data
            }
        except Exception as e:
            logger.error(f"Error processing Mercuryo callback: {e}")
            return None 