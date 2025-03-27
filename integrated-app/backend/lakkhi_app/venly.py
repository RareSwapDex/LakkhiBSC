"""
Venly replacement module that maintains the same API surface
but implements functionality using our custom wallet system.
"""
from django.conf import settings
from .custom_wallet import wallet_manager

# Define CLIENT_ID directly rather than trying to get it from settings
CLIENT_ID = "TheRareAntiquities-capsule"
CLIENT_SECRET = "0d6aa5fe-97ea-40f9-b839-276240448758"

def create_wallet(identifier, **kwargs):
    """
    Create a wallet for the given identifier
    Maps to Venly wallet creation API
    """
    # Use our custom wallet implementation
    wallet = wallet_manager.create_wallet(identifier)
    return {
        "success": True,
        "result": wallet
    }

def get_wallet(identifier, **kwargs):
    """
    Get a wallet by its identifier
    Maps to Venly get wallet API
    """
    # Use our custom wallet implementation 
    wallet = wallet_manager.get_wallet_by_identifier(identifier)
    if not wallet:
        return {"success": False, "errors": ["Wallet not found"]}
    return {
        "success": True,
        "result": wallet
    }

def get_wallets(identifier, **kwargs):
    """
    Get wallets for an app user
    Maps to Venly get wallets API
    """
    # Use our custom wallet implementation
    wallet = wallet_manager.get_wallet_by_identifier(identifier)
    if not wallet:
        return {"success": True, "result": []}
    return {
        "success": True,
        "result": [wallet]
    }

def get_wallet_by_address(address, **kwargs):
    """
    Get a wallet by its address
    Maps to Venly get wallet by address API
    """
    wallet = wallet_manager.get_wallet_by_address(address)
    if not wallet:
        return {"success": False, "errors": ["Wallet not found"]}
    return {
        "success": True,
        "result": wallet
    }

def verify_wallet_ownership(address, signature, message="Lakkhi Auth", **kwargs):
    """
    Verify wallet ownership by validating signature
    New function not in original Venly API
    """
    is_valid = wallet_manager.verify_wallet_ownership(address, signature, message)
    return {
        "success": is_valid,
        "result": {"verified": is_valid}
    }

def get_or_create_wallet(identifier, **kwargs):
    """
    Get or create a wallet with the given identifier
    Maps to Venly get_or_create_wallet function
    """
    wallet = wallet_manager.get_or_create_wallet(identifier)
    return {
        "success": bool(wallet),
        "result": wallet if wallet else None
    }

def approve_smart_contract(wallet_id, contract_address, token_address, **kwargs):
    """
    Approve a smart contract to spend tokens
    Maps to Venly approval API
    """
    # Use our custom wallet implementation
    try:
        email = kwargs.get("email", wallet_id)
        result = wallet_manager.approve_token_spending(email, contract_address)
        return {
            "success": result["success"],
            "result": result
        }
    except Exception as e:
        return {"success": False, "errors": [str(e)]}

def get_swap_rates(from_token, to_token, amount, **kwargs):
    """
    Get token swap rates
    Maps to Venly swap rates API
    """
    # Use our custom wallet implementation
    result = wallet_manager.get_swap_rates(amount)
    return result  # Already formatted correctly with success field

def swap_tokens(wallet_id, from_token, to_token, amount, **kwargs):
    """
    Swap tokens
    Maps to Venly swap API
    """
    # Use our custom wallet implementation
    try:
        email = kwargs.get("email", wallet_id)
        result = wallet_manager.swap_bnb_to_token(email, amount)
        return {
            "success": result["success"],
            "result": result["result"] if "result" in result else result
        }
    except Exception as e:
        return {"success": False, "errors": [str(e)]}

def execute_stake(wallet_address, bnb_to_stake, project_id, **kwargs):
    """
    Execute a stake operation
    Maps to Venly execute_stake function
    """
    try:
        # Get the project's staking contract address
        from .models import Project
        project = Project.objects.get(pk=project_id)
        sc_address = project.staking_address
        
        # First swap BNB to tokens
        swap_result = wallet_manager.swap_bnb_to_token(wallet_address, bnb_to_stake)
        if not swap_result["success"]:
            return swap_result
        
        # Approve contract to spend tokens
        approve_result = wallet_manager.approve_token_spending(wallet_address, sc_address)
        if not approve_result["success"]:
            return approve_result
        
        # Finally stake the tokens
        from .web3_helper_functions import stake_tokens
        
        # Get wallet info for staking
        wallet = wallet_manager.get_wallet_by_address(wallet_address)
        if not wallet:
            return {"success": False, "errors": ["Wallet not found"]}
            
        stake_result = stake_tokens(sc_address, swap_result["result"]["toAmount"], {
            "address": wallet["address"], 
            "private_key": wallet["private_key"]
        })
        
        return {
            "success": stake_result["success"],
            "result": stake_result
        }
        
    except Exception as e:
        return {"success": False, "errors": [str(e)]} 