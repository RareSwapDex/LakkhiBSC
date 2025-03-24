import json
import os
from web3 import Web3
from django.conf import settings

# PancakeSwap Router Address (Mainnet)
ROUTER_PANCAKE_SWAP = "0x10ED43C718714eb63d5aA57B78B54704E256024E"

# Token Addresses (Mainnet)
BNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"  # Wrapped BNB
BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"  # BUSD

# Connect to BSC
w3 = Web3(Web3.HTTPProvider(settings.BSC_RPC_URL))

# Load token configuration
try:
    with open(os.path.join(settings.STATIC_ROOT, "token.json")) as token_json:
        token_data = json.load(token_json)
        FND = token_data["token_address"]
except:
    # Default value if file not found
    FND = "0x264387ad73d19408e34b5d5e13a93174a35cea33"  # FND token address

# Load PancakeSwap ABI
try:
    with open(os.path.join(settings.STATIC_ROOT, "pancake_swap_abi.json")) as f:
        PANCAKE_SWAP_ABI = json.load(f)
except:
    # Default simple ABI if file not found
    print("Error loading PancakeSwap ABI")
    PANCAKE_SWAP_ABI = []

def get_bnb_usd_value():
    """Get the USD value of BNB from PancakeSwap"""
    try:
        routerContract = w3.eth.contract(
            address=ROUTER_PANCAKE_SWAP,
            abi=PANCAKE_SWAP_ABI,
        )
        oneToken = w3.to_wei(1, "ether")
        price = routerContract.functions.getAmountsOut(
            oneToken, [BNB, BUSD]
        ).call()
        normalizedPrice = w3.from_wei(price[1], "ether")
        return normalizedPrice
    except Exception as e:
        print(f"Error getting BNB USD value: {e}")
        return 250  # Default value as fallback

def get_token_price_in_bnb(token_address):
    """Get the price of a token in BNB from PancakeSwap"""
    try:
        routerContract = w3.eth.contract(
            address=ROUTER_PANCAKE_SWAP,
            abi=PANCAKE_SWAP_ABI,
        )
        oneToken = w3.to_wei(1, "ether")
        price = routerContract.functions.getAmountsOut(
            oneToken, [token_address, BNB]
        ).call()
        normalizedPrice = w3.from_wei(price[1], "ether")
        return normalizedPrice
    except Exception as e:
        print(f"Error getting token price in BNB: {e}")
        return 0.0001  # Default value as fallback

def get_token_price_in_usd(token_address):
    """Get the USD value of a token from PancakeSwap"""
    try:
        bnb_price = get_bnb_usd_value()
        token_price_in_bnb = get_token_price_in_bnb(token_address)
        return float(token_price_in_bnb) * float(bnb_price)
    except Exception as e:
        print(f"Error getting token price in USD: {e}")
        return 0.01  # Default value as fallback 