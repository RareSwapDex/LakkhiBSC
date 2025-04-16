import os
import json
import secrets
import hashlib
from eth_account import Account
from web3 import Web3
from django.conf import settings
from django.core.cache import cache

# Load token configuration
try:
    with open(os.path.join(settings.STATIC_ROOT, "token.json")) as token_json:
        token_data = json.load(token_json)
        # Replace placeholder with actual value from settings
        if token_data["token_address"] == "${TOKEN_ADDRESS}":
            token_data["token_address"] = settings.TOKEN_ADDRESS
        LAKKHI_TOKEN_ADDRESS = token_data["token_address"]
        LAKKHI_TOKEN_ABI = token_data["token_abi"]
        LAKKHI_TOKEN_DECIMALS = token_data["token_decimals"]
except:
    # Default values if file not found - use settings
    LAKKHI_TOKEN_ADDRESS = settings.TOKEN_ADDRESS
    LAKKHI_TOKEN_ABI = []
    LAKKHI_TOKEN_DECIMALS = 1000000000000000000  # 18 decimals

# DEX Router Addresses for different chains
ROUTER_ADDRESSES = {
    # BSC - PancakeSwap Router (v2)
    'BSC': "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    # Ethereum - Uniswap Router (v2)
    'Ethereum': "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    # Base - Uniswap Router (v3)
    'Base': "0x4752ba5DBc23F44D41617B7d2713924549e8Cc01"
}

# Native Wrapped Token addresses for different chains
WRAPPED_NATIVE_TOKEN = {
    'BSC': "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",  # Wrapped BNB
    'Ethereum': "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",  # Wrapped ETH
    'Base': "0x4200000000000000000000000000000000000006"  # Wrapped ETH on Base
}

# Default Native Token Symbol
NATIVE_TOKEN_SYMBOL = {
    'BSC': "BNB",
    'Ethereum': "ETH",
    'Base': "ETH"
}

# RPC URLs for different chains
RPC_URLS = {
    'BSC': settings.BSC_RPC_URL,
    'Ethereum': getattr(settings, 'ETH_RPC_URL', 'https://eth.llamarpc.com'),
    'Base': getattr(settings, 'BASE_RPC_URL', 'https://mainnet.base.org')
}

# Load PancakeSwap Router ABI
try:
    with open(os.path.join(settings.STATIC_ROOT, "pancake_swap_abi.json")) as f:
        PANCAKESWAP_ROUTER_ABI = json.load(f)
except Exception as e:
    print(f"Error loading PancakeSwap ABI: {e}")
    PANCAKESWAP_ROUTER_ABI = []

# Load Uniswap Router ABI - If not available, use a simplified ABI
UNISWAP_ROUTER_ABI = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"},
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactETHForTokens",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"}
        ],
        "name": "getAmountsOut",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    }
]

# Create web3 instances for different chains (lazily initialized)
w3_instances = {}

def get_web3(blockchain='BSC'):
    """Get Web3 instance for the specified blockchain"""
    if blockchain not in w3_instances:
        rpc_url = RPC_URLS.get(blockchain, RPC_URLS['BSC'])
        w3_instances[blockchain] = Web3(Web3.HTTPProvider(rpc_url))
    return w3_instances[blockchain]

# Default to BSC for backward compatibility
w3 = get_web3('BSC')

class WalletManager:
    """
    Manages wallet creation and operations for the Lakkhi platform.
    Supports multiple blockchains including BSC, Ethereum, and Base.
    """
    
    @staticmethod
    def get_or_create_wallet(identifier):
        """
        Get an existing wallet or create a new one for an email identifier
        Returns a wallet dictionary with address, private_key, id, etc.
        """
        # Try to find existing wallet
        wallet = WalletManager.get_wallet_by_identifier(identifier)
        if wallet:
            return wallet
        
        # Create new wallet if none exists
        return WalletManager.create_wallet(identifier)
    
    @staticmethod
    def get_wallet_by_identifier(identifier):
        """
        Retrieve wallet by its email identifier
        In a real implementation, this would query a database
        For now, using cache as a temporary solution
        """
        wallet_key = f"wallet_{identifier}"
        wallet = cache.get(wallet_key)
        return wallet
    
    @staticmethod
    def get_wallet_by_address(address):
        """
        Retrieve wallet by its address
        This is a new method to support direct address lookups
        """
        # For security, normalize the address to checksum format
        if not w3.is_address(address):
            return None
            
        checksum_address = w3.to_checksum_address(address)
        
        # This is inefficient in production - would need a database index
        # Iterate through all wallets in cache that match our pattern
        for key in cache._cache.keys():
            if key.startswith('wallet_'):
                wallet = cache.get(key)
                if wallet and wallet.get('address') == checksum_address:
                    return wallet
        return None
    
    @staticmethod
    def create_wallet(identifier):
        """
        Create a new wallet for the given email identifier
        In production, encrypt private keys and store in a secure database
        """
        # Generate entropy for the account
        entropy = secrets.token_bytes(32)
        
        # Create a new account
        account = Account.create(extra_entropy=entropy)
        address = account.address
        private_key = account.key.hex()
        
        # Create a wallet ID based on identifier (non-reversible)
        wallet_id = hashlib.sha256(identifier.encode()).hexdigest()[:16]
        
        # Construct wallet object (similar structure to Venly's wallet response)
        wallet = {
            "id": wallet_id,
            "address": address,
            "private_key": private_key,  # In production, encrypt this before storage
            "identifier": identifier,
            "secretType": "BSC",
            "walletType": "WHITE_LABEL",
            "createdAt": "",
            "archived": False,
            "description": "",
            "primary": True,
            "hasCustomPin": False,
            "balance": {"balance": "0", "gasBalance": "0"}
        }
        
        # Store in cache (in production, store in a secure database)
        wallet_key = f"wallet_{identifier}"
        cache.set(wallet_key, wallet, timeout=None)  # No timeout
        
        # Return wallet (without private key for security)
        public_wallet = wallet.copy()
        public_wallet.pop("private_key", None)
        return public_wallet
    
    @staticmethod
    def verify_wallet_ownership(address, signature, message="Lakkhi Auth"):
        """
        Verify wallet ownership by checking signature
        This is a more secure way to verify wallet ownership than just checking address
        """
        try:
            # Recover the address from the signature and message
            recovered_address = w3.eth.account.recover_message(
                message_text=message,
                signature=signature
            )
            
            # Check if the recovered address matches the claimed address
            return w3.to_checksum_address(recovered_address) == w3.to_checksum_address(address)
        except Exception as e:
            print(f"Error verifying wallet ownership: {e}")
            return False
    
    @staticmethod
    def approve_token_spending(wallet_identifier, spender_address, amount=None, token_address=None, blockchain='BSC'):
        """
        Approve a contract to spend tokens from the wallet
        Replaces the Venly approve_smart_contract function
        Now supports multiple blockchains
        """
        # Handle both email identifiers and wallet addresses
        wallet = None
        if wallet_identifier.startswith('0x'):
            wallet = WalletManager.get_wallet_by_address(wallet_identifier)
        else:
            wallet = WalletManager.get_wallet_by_identifier(wallet_identifier)
            
        if not wallet:
            return {"success": False, "message": "Wallet not found"}
        
        try:
            # Get the correct web3 instance for the blockchain
            web3 = get_web3(blockchain)
            
            # Get the wallet address and private key
            wallet_address = wallet["address"]
            private_key = wallet["private_key"]
            
            # Use provided token address or default to LAKKHI token
            if not token_address:
                token_address = LAKKHI_TOKEN_ADDRESS
                token_abi = LAKKHI_TOKEN_ABI
            else:
                # For non-LAKKHI tokens, we need to use a standard ERC20 ABI
                token_abi = [
                    {
                        "constant": False,
                        "inputs": [
                            {"name": "_spender", "type": "address"},
                            {"name": "_value", "type": "uint256"}
                        ],
                        "name": "approve",
                        "outputs": [{"name": "", "type": "bool"}],
                        "payable": False,
                        "stateMutability": "nonpayable",
                        "type": "function"
                    }
                ]
            
            # Create token contract instance
            token_contract = web3.eth.contract(
                address=token_address, 
                abi=token_abi
            )
            
            # Set approval amount (max uint256 if not specified)
            if amount is None:
                amount = 2**256 - 1
            
            # Build the transaction
            approve_txn = token_contract.functions.approve(
                spender_address, 
                amount
            ).build_transaction({
                'from': wallet_address,
                'nonce': web3.eth.get_transaction_count(wallet_address),
                'gas': 300000,
                'gasPrice': web3.eth.gas_price
            })
            
            # Sign the transaction
            signed_txn = web3.eth.account.sign_transaction(approve_txn, private_key)
            
            # Send the transaction
            tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for transaction receipt
            receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                "success": True,
                "result": {
                    "transactionHash": tx_hash.hex(),
                    "status": "SUCCESS" if receipt["status"] == 1 else "FAILED"
                }
            }
        except Exception as e:
            print(f"Error approving token spending: {e}")
            return {"success": False, "errors": [str(e)]}
    
    @staticmethod
    def get_swap_rates(native_amount, blockchain='BSC', token_address=None):
        """
        Get swap rates for native token to project token
        Supports multiple blockchains and DEXes
        """
        try:
            # Get web3 instance for the specified blockchain
            web3 = get_web3(blockchain)
            
            # Convert native amount to wei
            native_amount_wei = web3.to_wei(native_amount, 'ether')
            
            # Get router address for the blockchain
            router_address = ROUTER_ADDRESSES.get(blockchain, ROUTER_ADDRESSES['BSC'])
            
            # Get wrapped native token address
            wrapped_native = WRAPPED_NATIVE_TOKEN.get(blockchain, WRAPPED_NATIVE_TOKEN['BSC'])
            
            # Determine which router ABI to use
            router_abi = UNISWAP_ROUTER_ABI
            if blockchain == 'BSC':
                router_abi = PANCAKESWAP_ROUTER_ABI
            
            # Default to LAKKHI token if not specified
            if not token_address:
                token_address = LAKKHI_TOKEN_ADDRESS
            
            # Create router contract instance
            router_contract = web3.eth.contract(
                address=router_address,
                abi=router_abi
            )
            
            # Get the amount of tokens you will receive for the native token
            amounts_out = router_contract.functions.getAmountsOut(
                native_amount_wei,
                [wrapped_native, token_address]
            ).call()
            
            token_amount = amounts_out[1]
            
            # Try to get token decimals
            token_decimals = LAKKHI_TOKEN_DECIMALS  # Default
            try:
                token_contract = web3.eth.contract(
                    address=token_address,
                    abi=[{
                        "constant": True,
                        "inputs": [],
                        "name": "decimals",
                        "outputs": [{"name": "", "type": "uint8"}],
                        "payable": False,
                        "stateMutability": "view",
                        "type": "function"
                    }]
                )
                decimals = token_contract.functions.decimals().call()
                token_decimals = 10 ** decimals
            except Exception as e:
                print(f"Error getting token decimals: {e}")
            
            token_amount_decimal = token_amount / token_decimals
            
            return {
                "success": True,
                "result": {
                    "bestRate": {
                        "outputAmount": token_amount_decimal
                    },
                    "fromToken": {
                        "symbol": NATIVE_TOKEN_SYMBOL.get(blockchain, "BNB"),
                        "address": wrapped_native,
                        "decimals": 18
                    },
                    "toToken": {
                        "symbol": "TOKEN",  # Generic token symbol
                        "address": token_address,
                        "decimals": 18
                    },
                    "inputAmount": native_amount,
                    "outputAmount": token_amount_decimal,
                    "exchangeRate": token_amount_decimal / float(native_amount) if float(native_amount) > 0 else 0
                }
            }
        except Exception as e:
            print(f"Error getting swap rates: {e}")
            return {"success": False, "errors": [str(e)]}
    
    @staticmethod
    def swap_bnb_to_token(wallet_identifier, bnb_amount, token_address=None, blockchain='BSC'):
        """
        Swap native token to project token using the appropriate DEX
        Now supports multiple blockchains (BSC, Ethereum, Base)
        The function name is kept as swap_bnb_to_token for backward compatibility
        """
        # Handle both email identifiers and wallet addresses
        wallet = None
        if wallet_identifier.startswith('0x'):
            wallet = WalletManager.get_wallet_by_address(wallet_identifier)
        else:
            wallet = WalletManager.get_wallet_by_identifier(wallet_identifier)
            
        if not wallet:
            return {"success": False, "errors": ["Wallet not found"]}
        
        # Get the correct web3 instance for the blockchain
        web3 = get_web3(blockchain)
        
        # Use provided token address or default to LAKKHI token
        if not token_address:
            token_address = LAKKHI_TOKEN_ADDRESS
        
        try:
            # Get the wallet address and private key
            wallet_address = wallet["address"]
            private_key = wallet["private_key"]
            
            # Convert native amount to wei
            native_amount_wei = web3.to_wei(bnb_amount, 'ether')
            
            # Get router address for the blockchain
            router_address = ROUTER_ADDRESSES.get(blockchain, ROUTER_ADDRESSES['BSC'])
            
            # Get wrapped native token address
            wrapped_native = WRAPPED_NATIVE_TOKEN.get(blockchain, WRAPPED_NATIVE_TOKEN['BSC'])
            
            # Determine which router ABI to use
            router_abi = UNISWAP_ROUTER_ABI
            if blockchain == 'BSC':
                router_abi = PANCAKESWAP_ROUTER_ABI
            
            # Create DEX router contract instance
            router_contract = web3.eth.contract(
                address=router_address,
                abi=router_abi
            )
            
            # Get the expected output amount
            amounts_out = router_contract.functions.getAmountsOut(
                native_amount_wei,
                [wrapped_native, token_address]
            ).call()
            
            # Apply 1% slippage tolerance
            min_tokens = int(amounts_out[1] * 0.99)
            
            # Set deadline to 20 minutes from now
            deadline = web3.eth.get_block('latest')['timestamp'] + 1200
            
            # Build the swap transaction
            swap_txn = router_contract.functions.swapExactETHForTokens(
                min_tokens,
                [wrapped_native, token_address],
                wallet_address,
                deadline
            ).build_transaction({
                'from': wallet_address,
                'value': native_amount_wei,
                'gas': 300000,
                'gasPrice': web3.eth.gas_price,
                'nonce': web3.eth.get_transaction_count(wallet_address),
            })
            
            # Sign and send the transaction
            signed_txn = web3.eth.account.sign_transaction(swap_txn, private_key)
            tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for the transaction receipt
            receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Get the token decimals - for non-LAKKHI tokens we need to query the contract
            if token_address != LAKKHI_TOKEN_ADDRESS:
                # Basic ERC20 ABI for decimals function
                erc20_abi = [
                    {
                        "constant": True,
                        "inputs": [],
                        "name": "decimals",
                        "outputs": [{"name": "", "type": "uint8"}],
                        "payable": False,
                        "stateMutability": "view",
                        "type": "function"
                    }
                ]
                token_contract = web3.eth.contract(address=token_address, abi=erc20_abi)
                try:
                    token_decimals = 10 ** token_contract.functions.decimals().call()
                except Exception as e:
                    print(f"Error getting token decimals: {e}")
                    token_decimals = LAKKHI_TOKEN_DECIMALS  # Fallback to 18 decimals
            else:
                token_decimals = LAKKHI_TOKEN_DECIMALS
            
            # Return information about the swap including native token name
            return {
                "success": True,
                "result": {
                    "transactionHash": tx_hash.hex(),
                    "status": "SUCCESS" if receipt["status"] == 1 else "FAILED",
                    "fromAmount": bnb_amount,
                    "fromToken": NATIVE_TOKEN_SYMBOL.get(blockchain, "BNB"),
                    "toAmount": amounts_out[1] / token_decimals,
                    "blockchain": blockchain
                }
            }
        except Exception as e:
            print(f"Error swapping native token to token on {blockchain}: {e}")
            return {"success": False, "errors": [str(e)]}

    @staticmethod
    def stake_tokens(wallet_identifier, contract_address, token_address, amount, blockchain='BSC'):
        """
        Stake tokens on a project's contract
        Now supports multiple blockchains
        """
        # Load the staking contract ABI
        try:
            with open(os.path.join(settings.STATIC_ROOT, "staking_abi.json")) as f:
                staking_abi = json.load(f)
        except Exception as e:
            print(f"Error loading staking ABI: {e}")
            return {"success": False, "errors": [f"Error loading staking ABI: {e}"]}
        
        # Get web3 instance for the specified blockchain
        web3 = get_web3(blockchain)
        
        # Handle both email identifiers and wallet addresses
        wallet = None
        if wallet_identifier.startswith('0x'):
            wallet = WalletManager.get_wallet_by_address(wallet_identifier)
        else:
            wallet = WalletManager.get_wallet_by_identifier(wallet_identifier)
            
        if not wallet:
            return {"success": False, "message": "Wallet not found"}
        
        try:
            # Get the wallet address and private key
            wallet_address = wallet["address"]
            private_key = wallet["private_key"]
            
            # Create staking contract instance
            staking_contract = web3.eth.contract(
                address=contract_address, 
                abi=staking_abi
            )
            
            # Build the stake transaction
            # The function name needs to match the actual staking function in the contract
            stake_txn = staking_contract.functions.contribute(
                amount
            ).build_transaction({
                'from': wallet_address,
                'nonce': web3.eth.get_transaction_count(wallet_address),
                'gas': 500000,
                'gasPrice': web3.eth.gas_price
            })
            
            # Sign the transaction
            signed_txn = web3.eth.account.sign_transaction(stake_txn, private_key)
            
            # Send the transaction
            tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for transaction receipt
            receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                "success": True,
                "result": {
                    "transactionHash": tx_hash.hex(),
                    "status": "SUCCESS" if receipt["status"] == 1 else "FAILED",
                    "amount": amount,
                    "blockchain": blockchain
                }
            }
        except Exception as e:
            print(f"Error staking tokens on {blockchain}: {e}")
            return {"success": False, "errors": [str(e)]}

# Create a singleton instance
wallet_manager = WalletManager() 