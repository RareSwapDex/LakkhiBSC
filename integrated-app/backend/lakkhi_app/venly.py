from datetime import timedelta
import requests
import urllib
from pprint import pprint
import os
import json
import time
from django.utils import timezone
from django.conf import settings
from web3 import Web3

# Venly API credentials
CLIENT_ID = settings.CLIENT_ID  # Use the value from settings
CLIENT_SECRET = settings.CLIENT_SECRET  # Use the value from settings
PIN_CODE = "4911"  # Default PIN for Venly wallets
AUTH_TOKEN = ""
AUTH_HEADERS = {}

# Load token configuration
try:
    with open(os.path.join(settings.STATIC_ROOT, "token.json")) as token_json:
        token_data = json.load(token_json)
        FND = token_data["token_address"]
        FND_ABI = token_data["token_abi"]
        FND_DECIMALS = token_data["token_decimals"]
except:
    # Default values if file not found
    FND = "0x264387ad73d19408e34b5d5e13a93174a35cea33"  # Example token address
    FND_ABI = []
    FND_DECIMALS = 1000000000000000000  # 18 decimals

def get_auth_token():
    """Get authentication token from Venly API"""
    global AUTH_TOKEN
    global AUTH_HEADERS
    details = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }
    try:
        response = requests.post(
            "https://login.arkane.network/auth/realms/Arkane/protocol/openid-connect/token",
            urllib.parse.urlencode(details),
            headers={"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"},
            timeout=10,
        ).json()
        AUTH_TOKEN = response["access_token"]
        AUTH_HEADERS = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        return True
    except Exception as e:
        print(f"Error getting auth token: {e}")
        return False


def get_wallet_by_identifier(identifier):
    """Get wallet by identifier"""
    get_auth_token()
    try:
        response = requests.get(
            f"https://api-wallet.venly.io/api/wallets?identifier={identifier}",
            headers=AUTH_HEADERS,
            timeout=60,
        ).json()
        return response["result"] if response["success"] else "Failed"
    except Exception as e:
        print(f"Error getting wallet by identifier: {e}")
        return "Failed"


def get_wallet_by_address(address):
    """Get wallet by address"""
    get_auth_token()
    try:
        response = requests.get(
            f"https://api-wallet.venly.io/api/wallets?address={address}",
            headers=AUTH_HEADERS,
        ).json()
        return response["result"][0] if response["success"] else "Failed"
    except Exception as e:
        print(f"Error getting wallet by address: {e}")
        return "Failed"


def get_all_wallets():
    """Get all wallets"""
    get_auth_token()
    try:
        response = requests.get(
            "https://api-wallet.venly.io/api/wallets", headers=AUTH_HEADERS
        ).json()
        return response["result"] if response["success"] else "Failed"
    except Exception as e:
        print(f"Error getting all wallets: {e}")
        return "Failed"


def create_wallet(identifier):
    """Create a new wallet for the given identifier"""
    get_auth_token()
    data = {
        "walletType": "WHITE_LABEL",
        "secretType": "BSC",
        "identifier": identifier,
        "pincode": PIN_CODE,
    }
    try:
        response = requests.post(
            "https://api-wallet.venly.io/api/wallets",
            json=data,
            headers=AUTH_HEADERS,
            timeout=10,
        ).json()
        return response["result"] if response["success"] else "Failed"
    except Exception as e:
        print(f"Error creating wallet: {e}")
        return "Failed"


def get_or_create_wallet(identifier):
    """Get an existing wallet or create a new one"""
    venly_wallet = get_wallet_by_identifier(identifier)
    if venly_wallet != "Failed":
        if len(venly_wallet) > 0:
            return venly_wallet[0]
        else:
            return create_wallet(identifier)
    return "Failed"


def get_BNB_balance(wallet):
    """Get BNB balance for a wallet"""
    return wallet["balance"]["balance"]


def get_token_balance(wallet):
    """Get token balance for a wallet"""
    get_auth_token()
    wallet_id = wallet["id"]
    try:
        response = requests.get(
            f"https://api-wallet.venly.io/api/wallets/{wallet_id}/balance/tokens/{FND}",
            headers=AUTH_HEADERS,
        ).json()
        if response["success"]:
            return response["result"]["balance"]
        else:
            return "Failed"
    except Exception as e:
        print(f"Error getting token balance: {e}")
        return "Failed"


def get_swap_rates(bnb_to_swap):
    """Get swap rates for BNB to token"""
    get_auth_token()
    try:
        response = requests.get(
            f"https://api-wallet.venly.io/api/swaps/rates?fromSecretType=BSC&toSecretType=BSC&fromToken=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&toToken={FND}&amount={bnb_to_swap}&orderType=SELL",
            headers=AUTH_HEADERS,
        ).json()
        return response
    except Exception as e:
        print(f"Error getting swap rates: {e}")
        return None


def swap_builder(wallet, pin_code, bnb_to_swap, token_to_receive):
    """Build a swap transaction"""
    get_auth_token()
    wallet_id = wallet["id"]
    data = {
        "pincode": pin_code,
        "walletId": wallet_id,
        "destinationWalletId": wallet_id,
        "fromSecretType": "BSC",
        "toSecretType": "BSC",
        "fromToken": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        "toToken": FND,
        "inputAmount": bnb_to_swap,
        "outputAmount": token_to_receive,
        "orderType": "SELL",
        "exchange": "ONE_INCH",
    }
    try:
        response = requests.post(
            f"https://api-wallet.venly.io/api/wallets/{wallet_id}/swaps",
            json=data,
            headers=AUTH_HEADERS,
        ).json()
        return response
    except Exception as e:
        print(f"Error building swap: {e}")
        return None


def execute_swap_transaction(wallet, pin_code, swap_builder_response, bnb_value_to_swap):
    """Execute a swap transaction"""
    get_auth_token()
    wallet_id = wallet["id"]
    data = {
        "pincode": pin_code,
        "transactionRequest": swap_builder_response["result"]["transactionRequest"],
    }
    try:
        response = requests.post(
            f"https://api-wallet.venly.io/api/transactions/execute",
            json=data,
            headers=AUTH_HEADERS,
        ).json()
        return response
    except Exception as e:
        print(f"Error executing swap transaction: {e}")
        return None


def approve_smart_contract(wallet, pin_code, sc_address):
    """Approve a smart contract to spend tokens"""
    get_auth_token()
    wallet_id = wallet["id"]
    data = {
        "pincode": pin_code,
        "transactionRequest": {
            "type": "CONTRACT_EXECUTION",
            "walletId": wallet_id,
            "to": FND,
            "alias": None,
            "secretType": "BSC",
            "functionName": "approve",
            "value": 0,
            "inputs": [
                {
                    "type": "address",
                    "value": sc_address,
                },
                {"type": "uint256", "value": 2**256 - 1},
            ],
            "chainSpecificFields": {"gasLimit": "300000"},
        },
    }
    try:
        response = requests.post(
            "https://api-wallet.venly.io/api/transactions/execute",
            json=data,
            headers=AUTH_HEADERS,
        ).json()
        return response
    except Exception as e:
        print(f"Error approving smart contract: {e}")
        return {"success": False, "message": str(e)}


def stake(wallet, pin_code, sc_address, amount_to_stake):
    """Stake tokens to a contract"""
    get_auth_token()
    wallet_id = wallet["id"]
    # Convert amount to wei
    amount_wei = Web3.to_wei(amount_to_stake, "ether")
    
    data = {
        "pincode": pin_code,
        "transactionRequest": {
            "type": "CONTRACT_EXECUTION",
            "walletId": wallet_id,
            "to": sc_address,
            "alias": None,
            "secretType": "BSC",
            "functionName": "stake",
            "value": 0,
            "inputs": [
                {"type": "uint256", "value": amount_wei},
            ],
            "chainSpecificFields": {"gasLimit": "300000"},
        },
    }
    try:
        response = requests.post(
            "https://api-wallet.venly.io/api/transactions/execute",
            json=data,
            headers=AUTH_HEADERS,
        ).json()
        return response
    except Exception as e:
        print(f"Error staking tokens: {e}")
        return {"success": False, "message": str(e)}


def get_transaction_status(tx_hash):
    """Get transaction status"""
    get_auth_token()
    try:
        response = requests.get(
            f"https://api-wallet.venly.io/api/transactions/BSC/{tx_hash}/status",
            headers=AUTH_HEADERS,
        ).json()
        return response
    except Exception as e:
        print(f"Error getting transaction status: {e}")
        return None


def execute_swap(wallet_address, bnb_to_swap, recipient_email):
    """Execute the complete swap process"""
    try:
        get_auth_token()
        pin_code = PIN_CODE
        wallet = get_wallet_by_address(wallet_address)
        if wallet == "Failed":
            return {"success": False, "message": "Failed to get wallet"}
        
        # Calculate how much BNB to swap (leaving some for gas)
        bnb_to_swap = str(float(bnb_to_swap) - 0.003)
        
        # Get swap rates
        swap_rates = get_swap_rates(bnb_to_swap)
        if not swap_rates or not swap_rates.get("success", False):
            return {"success": False, "message": "Failed to get swap rates"}
        
        token_to_receive = swap_rates["result"]["bestRate"]["outputAmount"]
        
        # Build swap transaction
        swap_builder_response = swap_builder(wallet, pin_code, bnb_to_swap, token_to_receive)
        if not swap_builder_response or not swap_builder_response.get("success", False):
            return {"success": False, "message": "Failed to build swap"}
        
        # Execute swap transaction
        tx_hash_response = execute_swap_transaction(
            wallet, pin_code, swap_builder_response, bnb_to_swap
        )
        
        # Handle incorrect pincode by trying alternative
        if not tx_hash_response.get("success", False) and tx_hash_response.get("errors", [{}])[0].get("code") == "pincode.incorrect":
            pin_code = "9294"  # Alternative PIN
            tx_hash_response = execute_swap_transaction(
                wallet, pin_code, swap_builder_response, bnb_to_swap
            )
        
        if not tx_hash_response or not tx_hash_response.get("success", False):
            return {"success": False, "message": "Failed to execute swap"}
        
        tx_hash = tx_hash_response["result"]["transactionHash"]
        
        # Wait for transaction to complete
        max_attempts = 15
        attempt = 0
        while attempt < max_attempts:
            tx_status = get_transaction_status(tx_hash)
            if tx_status and tx_status.get("success", False):
                if tx_status["result"]["status"] == "SUCCEEDED":
                    break
            attempt += 1
            time.sleep(2)
            
        # Return success response with transaction details
        return {
            "success": True,
            "transaction_hash": tx_hash,
            "bnb_swapped": bnb_to_swap,
            "tokens_received": token_to_receive,
            "recipient": recipient_email
        }
    except Exception as e:
        return {"success": False, "message": f"Swap failed: {str(e)}"} 