import json
import os
from web3 import Web3
from django.conf import settings
import time

# Connect to BSC network (using BSC's public endpoint)
BSC_RPC_URL = settings.BSC_RPC_URL
w3 = Web3(Web3.HTTPProvider(BSC_RPC_URL))

# Load token contract and staking contract details
try:
    with open(os.path.join(settings.BASE_DIR, 'static/token.json')) as token_json:
        token_data = json.load(token_json)
        TOKEN_ADDRESS = token_data["token_address"]
        TOKEN_ABI = token_data["token_abi"]
        TOKEN_DECIMALS = token_data["token_decimals"]
except:
    # Default values if file not found
    TOKEN_ADDRESS = "0x264387ad73d19408e34b5d5e13a93174a35cea33"  # Example token address
    TOKEN_ABI = []
    TOKEN_DECIMALS = 1000000000000000000  # 18 decimals

# Staking factory contract - creates new staking contracts
STAKING_FACTORY_ADDRESS = os.environ.get('STAKING_FACTORY_ADDRESS', '0x0000000000000000000000000000000000000000')
try:
    with open(os.path.join(settings.BASE_DIR, 'static/staking_factory_abi.json')) as factory_json:
        STAKING_FACTORY_ABI = json.load(factory_json)
except:
    # Default simple ABI if file not found
    STAKING_FACTORY_ABI = [
        {
            "inputs": [
                {"internalType": "string", "name": "name", "type": "string"},
                {"internalType": "address", "name": "tokenAddress", "type": "address"},
                {"internalType": "address", "name": "beneficiary", "type": "address"},
                {"internalType": "uint256", "name": "targetAmount", "type": "uint256"}
            ],
            "name": "createStakingContract",
            "outputs": [{"internalType": "address", "name": "", "type": "address"}],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]

# Staking contract ABI - for interacting with deployed staking contracts
try:
    with open(os.path.join(settings.BASE_DIR, 'static/staking_abi.json')) as staking_json:
        STAKING_ABI = json.load(staking_json)
except:
    # Default simple ABI if file not found
    STAKING_ABI = [
        {
            "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
            "name": "stake",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "release",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "targetAmount",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "currentAmount",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "beneficiary",
            "outputs": [{"internalType": "address", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "isCompleted",
            "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
            "stateMutability": "view",
            "type": "function"
        }
    ]

# Admin wallet for contract interactions (should be set by environment variable in production)
ADMIN_PRIVATE_KEY = os.environ.get('ADMIN_PRIVATE_KEY', '')
ADMIN_ADDRESS = os.environ.get('ADMIN_ADDRESS', '')

def deploy_staking_contract(project_name, project_target, project_owner):
    """
    Create a new staking contract for a project using the factory contract
    
    Args:
        project_name: Name of the project
        project_target: Target amount to raise
        project_owner: Wallet address of the project owner
        
    Returns:
        dict: Result containing success status and contract details
    """
    try:
        # Convert target to wei (assuming 18 decimals)
        target_wei = w3.to_wei(project_target, 'ether')
        
        # For demo purposes, we'll just return a sample contract address
        # In production, you would call the factory contract to deploy a new staking contract
        
        # This simulates what would happen when we deploy a real contract
        contract_address = "0x" + project_name.replace(" ", "")[:8].lower() + "1234567890123456789012345678901234"
        
        return {
            'success': True,
            'contract_address': contract_address,
            'contract_abi': STAKING_ABI,
            'message': 'Staking contract created (simulated for demo)'
        }
    except Exception as e:
        print(f"Error deploying staking contract: {e}")
        return {'success': False, 'message': str(e)}

def get_staking_contract(contract_address):
    """Get a staking contract instance"""
    try:
        # Create contract instance
        contract = w3.eth.contract(address=contract_address, abi=STAKING_ABI)
        return contract
    except Exception as e:
        print(f"Error getting staking contract: {e}")
        return None

def get_staking_contract_status(contract_address):
    """Get status of a staking contract"""
    try:
        # In a real implementation, this would interact with the blockchain
        # For now, we'll return simulated data
        return {
            'success': True,
            'target': 100,
            'current': 25,
            'beneficiary': '0x1234567890123456789012345678901234567890',
            'is_completed': False,
            'percentage': 25
        }
    except Exception as e:
        print(f"Error getting staking contract status: {e}")
        return {'success': False, 'message': str(e)}

def stake_tokens(contract_address, amount, contributor_address):
    """Stake tokens to a contract"""
    try:
        # In a real implementation, this would interact with the blockchain
        # For now, we'll return simulated data
        return {
            'success': True,
            'transaction_hash': '0x' + ''.join(['0123456789abcdef'[i % 16] for i in range(64)]),
            'amount': amount
        }
    except Exception as e:
        print(f"Error staking tokens: {e}")
        return {'success': False, 'message': str(e)}

def release_funds(contract_address):
    """Release funds from a staking contract to the beneficiary"""
    try:
        # In a real implementation, this would interact with the blockchain
        # For now, we'll return simulated data
        return {
            'success': True,
            'transaction_hash': '0x' + ''.join(['0123456789abcdef'[i % 16] for i in range(64)]),
            'amount_released': 100
        }
    except Exception as e:
        print(f"Error releasing funds: {e}")
        return {'success': False, 'message': str(e)} 