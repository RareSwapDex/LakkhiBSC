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

# PancakeSwap Router Address (Mainnet)
PANCAKESWAP_ROUTER_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024E"

# Wrapped BNB token address
WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"

# Load PancakeSwap Router ABI
try:
    with open(os.path.join(settings.STATIC_ROOT, "pancake_swap_abi.json")) as f:
        PANCAKESWAP_ROUTER_ABI = json.load(f)
except Exception as e:
    print(f"Error loading PancakeSwap ABI: {e}")
    PANCAKESWAP_ROUTER_ABI = []

# Connect to BSC using the configured RPC URL
w3 = Web3(Web3.HTTPProvider(settings.BSC_RPC_URL))

class WalletManager:
    """
    Manages wallet creation and operations for the Lakkhi platform.
    Replaces the Venly service with a custom implementation.
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
    def approve_token_spending(wallet_identifier, spender_address, amount=None, token_address=None):
        """
        Approve a contract to spend tokens from the wallet
        Replaces the Venly approve_smart_contract function
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
            token_contract = w3.eth.contract(
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
                'nonce': w3.eth.get_transaction_count(wallet_address),
                'gas': 300000,
                'gasPrice': w3.eth.gas_price
            })
            
            # Sign the transaction
            signed_txn = w3.eth.account.sign_transaction(approve_txn, private_key)
            
            # Send the transaction
            tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for transaction receipt
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            
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
    def get_swap_rates(bnb_amount):
        """
        Get swap rates for BNB to LAKKHI token from PancakeSwap
        Replaces the Venly get_swap_rates function
        """
        try:
            # Convert BNB amount to wei
            bnb_amount_wei = w3.to_wei(bnb_amount, 'ether')
            
            # Create PancakeSwap router contract instance
            router_contract = w3.eth.contract(
                address=PANCAKESWAP_ROUTER_ADDRESS,
                abi=PANCAKESWAP_ROUTER_ABI
            )
            
            # Get the amount of LAKKHI tokens you will receive for the BNB
            amounts_out = router_contract.functions.getAmountsOut(
                bnb_amount_wei,
                [WBNB_ADDRESS, LAKKHI_TOKEN_ADDRESS]
            ).call()
            
            lakkhi_amount = amounts_out[1]
            lakkhi_amount_decimal = lakkhi_amount / LAKKHI_TOKEN_DECIMALS
            
            return {
                "success": True,
                "result": {
                    "bestRate": {
                        "outputAmount": lakkhi_amount_decimal
                    },
                    "fromToken": {
                        "symbol": "BNB",
                        "address": WBNB_ADDRESS,
                        "decimals": 18
                    },
                    "toToken": {
                        "symbol": "LAKKHI",
                        "address": LAKKHI_TOKEN_ADDRESS,
                        "decimals": 18
                    },
                "inputAmount": bnb_amount,
                "outputAmount": lakkhi_amount_decimal,
                    "exchangeRate": lakkhi_amount_decimal / float(bnb_amount) if float(bnb_amount) > 0 else 0
                }
            }
        except Exception as e:
            print(f"Error getting swap rates: {e}")
            return {"success": False, "errors": [str(e)]}
    
    @staticmethod
    def swap_bnb_to_token(wallet_identifier, bnb_amount, token_address=None):
        """
        Swap BNB to LAKKHI token
        Replaces the Venly swap tokens function
        """
        # Handle both email identifiers and wallet addresses
        wallet = None
        if wallet_identifier.startswith('0x'):
            wallet = WalletManager.get_wallet_by_address(wallet_identifier)
        else:
            wallet = WalletManager.get_wallet_by_identifier(wallet_identifier)
            
        if not wallet:
            return {"success": False, "errors": ["Wallet not found"]}
        
        # Use provided token address or default to LAKKHI token
        if not token_address:
            token_address = LAKKHI_TOKEN_ADDRESS
        
        try:
            # Get the wallet address and private key
            wallet_address = wallet["address"]
            private_key = wallet["private_key"]
            
            # Convert BNB amount to wei
            bnb_amount_wei = w3.to_wei(bnb_amount, 'ether')
            
            # Create PancakeSwap router contract instance
            router_contract = w3.eth.contract(
                address=PANCAKESWAP_ROUTER_ADDRESS,
                abi=PANCAKESWAP_ROUTER_ABI
            )
            
            # Get the expected output amount
            amounts_out = router_contract.functions.getAmountsOut(
                bnb_amount_wei,
                [WBNB_ADDRESS, token_address]
            ).call()
            
            # Apply 1% slippage tolerance
            min_tokens = int(amounts_out[1] * 0.99)
            
            # Set deadline to 20 minutes from now
            deadline = w3.eth.get_block('latest')['timestamp'] + 1200
            
            # Build the swap transaction
            swap_txn = router_contract.functions.swapExactETHForTokens(
                min_tokens,
                [WBNB_ADDRESS, token_address],
                wallet_address,
                deadline
            ).build_transaction({
                'from': wallet_address,
                'value': bnb_amount_wei,
                'gas': 300000,
                'gasPrice': w3.eth.gas_price,
                'nonce': w3.eth.get_transaction_count(wallet_address),
            })
            
            # Sign and send the transaction
            signed_txn = w3.eth.account.sign_transaction(swap_txn, private_key)
            tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for the transaction receipt
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            
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
                token_contract = w3.eth.contract(address=token_address, abi=erc20_abi)
                try:
                    token_decimals = 10 ** token_contract.functions.decimals().call()
                except Exception as e:
                    print(f"Error getting token decimals: {e}")
                    token_decimals = LAKKHI_TOKEN_DECIMALS  # Fallback to 18 decimals
            else:
                token_decimals = LAKKHI_TOKEN_DECIMALS
            
            return {
                "success": True,
                "result": {
                    "transactionHash": tx_hash.hex(),
                    "status": "SUCCESS" if receipt["status"] == 1 else "FAILED",
                    "fromAmount": bnb_amount,
                    "toAmount": amounts_out[1] / token_decimals
                }
            }
        except Exception as e:
            print(f"Error swapping BNB to token: {e}")
            return {"success": False, "errors": [str(e)]}

    @staticmethod
    def stake_tokens(wallet_identifier, contract_address, token_address, amount):
        """
        Stake tokens on a project's contract
        Emulates the Venly staking functionality
        """
        # Load the staking contract ABI
        try:
            with open(os.path.join(settings.STATIC_ROOT, "staking_abi.json")) as f:
                staking_abi = json.load(f)
        except Exception as e:
            print(f"Error loading staking ABI: {e}")
            return {"success": False, "errors": [f"Error loading staking ABI: {e}"]}
        
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
            staking_contract = w3.eth.contract(
                address=contract_address, 
                abi=staking_abi
            )
            
            # Build the stake transaction
            # The function name needs to match the actual staking function in the contract
            stake_txn = staking_contract.functions.contribute(
                amount
            ).build_transaction({
                'from': wallet_address,
                'nonce': w3.eth.get_transaction_count(wallet_address),
                'gas': 500000,
                'gasPrice': w3.eth.gas_price
            })
            
            # Sign the transaction
            signed_txn = w3.eth.account.sign_transaction(stake_txn, private_key)
            
            # Send the transaction
            tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for transaction receipt
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                "success": True,
                "result": {
                    "transactionHash": tx_hash.hex(),
                    "status": "SUCCESS" if receipt["status"] == 1 else "FAILED",
                    "amount": amount
                }
            }
        except Exception as e:
            print(f"Error staking tokens: {e}")
            return {"success": False, "errors": [str(e)]}

# Create a singleton instance
wallet_manager = WalletManager() 