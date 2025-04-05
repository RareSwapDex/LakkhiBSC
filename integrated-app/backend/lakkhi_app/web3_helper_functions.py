import json
import os
from web3 import Web3
from django.conf import settings
import time

# Connect to BSC network (using BSC's public endpoint)
BSC_RPC_URL = settings.BSC_RPC_URL
w3 = Web3(Web3.HTTPProvider(BSC_RPC_URL))

# Admin account variables - DEPRECATED
# These are no longer used as campaign creators now pay for their own gas fees
# Kept for backward compatibility only
ADMIN_ADDRESS = settings.ADMIN_ADDRESS
ADMIN_PRIVATE_KEY = settings.ADMIN_PRIVATE_KEY

# Load token contract and staking contract details
try:
    with open(os.path.join(settings.BASE_DIR, 'static/token.json')) as token_json:
        token_data = json.load(token_json)
        # Replace placeholder with actual value from settings
        if token_data["token_address"] == "${TOKEN_ADDRESS}":
            token_data["token_address"] = settings.TOKEN_ADDRESS
        TOKEN_ADDRESS = token_data["token_address"]
        TOKEN_ABI = token_data["token_abi"]
        TOKEN_DECIMALS = token_data["token_decimals"]
except:
    # Default values if file not found
    TOKEN_ADDRESS = settings.TOKEN_ADDRESS
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

def estimate_gas_costs(operation_type, token_address=None):
    """
    Estimate gas costs for different token operations
    
    Args:
        operation_type: Type of operation (deploy, stake, approve, etc.)
        token_address: Address of token for operations that involve tokens
        
    Returns:
        dict: Estimated gas costs in wei, gwei, and USD (approximate)
    """
    try:
        # Current gas price in wei
        gas_price = w3.eth.gas_price
        gas_price_gwei = w3.from_wei(gas_price, 'gwei')
        
        # Estimated gas amounts for different operations
        gas_estimates = {
            'deploy_contract': 3000000,  # Deploy staking contract
            'approve': 60000,            # Approve token spending
            'stake': 150000,             # Stake tokens
            'transfer': 65000,           # Transfer tokens
            'claim': 100000,             # Claim rewards
        }
        
        # Get gas estimate for the operation
        gas_amount = gas_estimates.get(operation_type, 200000)  # Default if not found
        
        # For token operations, adjust based on token's complexity
        if token_address and operation_type in ['approve', 'stake', 'transfer']:
            # Get token contract to check for complexity
            token_contract = w3.eth.contract(address=token_address, abi=TOKEN_ABI)
            
            # Try to check for token complexity by seeing if it has certain features
            is_complex = False
            try:
                # Check if token has fees, reflections, or other complex mechanisms
                if hasattr(token_contract.functions, 'getReflectionFromToken'):
                    is_complex = True
                    gas_amount *= 1.5  # 50% more gas for reflection tokens
                
                # Check if token has anti-whale or transaction limitations
                if hasattr(token_contract.functions, 'isExcludedFromFee'):
                    is_complex = True
                    gas_amount *= 1.2  # 20% more gas for fee-excluded tokens
            except Exception:
                # If error in checking complexity, assume it's a standard token
                pass
        
        # Calculate total cost in wei
        cost_wei = gas_amount * gas_price
        cost_eth = w3.from_wei(cost_wei, 'ether')
        
        # Approximate USD cost (using a placeholder rate, would be better with price oracle)
        # For demo purposes, assuming 1 BNB = $250 USD
        eth_usd_rate = 250  
        usd_cost = float(cost_eth) * eth_usd_rate
        
        return {
            'success': True,
            'operation': operation_type,
            'gas_amount': gas_amount,
            'gas_price_wei': gas_price,
            'gas_price_gwei': gas_price_gwei,
            'cost_wei': cost_wei,
            'cost_eth': cost_eth,
            'cost_usd': usd_cost,
            'is_complex_token': is_complex if token_address else False,
            'message': f"Estimated cost: {round(usd_cost, 2)} USD"
        }
    except Exception as e:
        print(f"Error estimating gas costs: {e}")
        return {
            'success': False,
            'message': str(e)
        }

def deploy_staking_contract(project_name, project_target, project_owner, token_address=None, wallet_key=None):
    """
    Create a new staking contract for a project using the factory contract
    
    Args:
        project_name: Name of the project
        project_target: Target amount to raise
        project_owner: Wallet address of the project owner
        token_address: Optional custom token address to use (defaults to settings.TOKEN_ADDRESS)
        wallet_key: The private key of the wallet that will pay for deployment (should be the creator's wallet)
        
    Returns:
        dict: Result containing success status and contract details or instructions
    """
    try:
        # Convert target to wei (assuming 18 decimals)
        target_wei = w3.to_wei(project_target, 'ether')
        
        # Sanitize the wallet address to ensure it's valid
        owner_address = project_owner
        if not project_owner or not project_owner.startswith('0x'):
            return {
                'success': False,
                'message': 'Invalid wallet address. A valid wallet address is required.'
            }
        else:
            print(f"Using wallet address as beneficiary: {owner_address}")
            
        # Use custom token address if provided, otherwise use default
        if not token_address or not token_address.startswith('0x'):
            token_address = TOKEN_ADDRESS
            print(f"Using default token address: {token_address}")
        else:
            # Validate the token address
            token_info = get_token_info(token_address)
            if not token_info['success']:
                return {
                    'success': False,
                    'message': f"Invalid token address: {token_info.get('message', 'Failed to validate token')}"
                }
            print(f"Using custom token {token_info['symbol']} ({token_address})")
        
        # Create contract factory instance
        factory_contract = w3.eth.contract(
            address=STAKING_FACTORY_ADDRESS,
            abi=STAKING_FACTORY_ABI
        )
        
        # If no wallet key provided, return deployment instructions instead of deploying
        if not wallet_key:
            # Get the current gas price and estimate gas for optimization
            current_gas_price = w3.eth.gas_price
            optimized_gas_price = int(current_gas_price * 0.9)  # 90% of current gas price
            
            # Estimate gas cost
            gas_estimate = estimate_gas_costs('deploy_contract', token_address)
            
            # Generate deployment instructions
            return {
                'success': True,
                'requires_wallet': True,
                'message': 'Deployment requires wallet signature',
                'deployment_data': {
                    'factory_address': STAKING_FACTORY_ADDRESS,
                    'project_name': project_name,
                    'token_address': token_address,
                    'owner_address': owner_address,
                    'target_wei': str(target_wei),
                    'estimated_gas': gas_estimate.get('gas_amount', 3000000),
                    'gas_price': optimized_gas_price,
                    'estimated_cost_usd': gas_estimate.get('cost_usd', 'Unknown')
                }
            }
        
        # Get the current gas price and estimate gas for optimization
        current_gas_price = w3.eth.gas_price
        
        # For deploying contracts, we can use a slightly below-average gas price
        # because deployment is not time-sensitive. This can save 10-20% on gas fees.
        # The tradeoff is that the transaction might take longer to be included in a block.
        optimized_gas_price = int(current_gas_price * 0.9)  # 90% of current gas price
        
        # Get the nonce for the transaction - using the project owner's address since they're paying
        nonce = w3.eth.get_transaction_count(owner_address)
        
        # Estimate gas cost
        gas_estimate = estimate_gas_costs('deploy_contract', token_address)
        print(f"Estimated deployment cost: {gas_estimate.get('cost_usd', 'Unknown')} USD")
        
        # Build transaction to create staking contract
        tx = factory_contract.functions.createStakingContract(
            project_name,
            token_address,  # Use the selected token address
            owner_address,
            target_wei
        ).build_transaction({
            'from': owner_address,  # Project owner deploys the contract
            'gas': gas_estimate.get('gas_amount', 3000000),  # Use estimated gas
            'gasPrice': optimized_gas_price,  # Use optimized gas price for cost savings
            'nonce': nonce,
        })
        
        # Sign the transaction with the provided wallet key
        signed_tx = w3.eth.account.sign_transaction(tx, wallet_key)
        
        # Send the transaction
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        print(f"Transaction sent: {tx_hash.hex()}")
        
        # Wait for transaction receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"Transaction confirmed in block: {receipt['blockNumber']}")
        
        # Get contract address from transaction logs
        logs = factory_contract.events.StakingContractCreated().process_receipt(receipt)
        if logs:
            contract_address = logs[0]['args']['contractAddress']
            print(f"Contract deployed at: {contract_address}")
        else:
            # Fallback: get the contract address from deployed contracts
            # We're getting the latest contract from the factory
            deployed_contracts = factory_contract.functions.getDeployedContracts().call()
            contract_address = deployed_contracts[-1] if deployed_contracts else None
            
            if not contract_address:
                return {
                    'success': False,
                    'message': 'Failed to retrieve contract address from transaction logs'
                }
        
        return {
            'success': True,
            'contract_address': contract_address,
            'contract_abi': STAKING_ABI,
            'owner_address': owner_address,
            'tx_hash': tx_hash.hex(),
            'message': 'Staking contract deployed successfully on-chain'
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
        contract = get_staking_contract(contract_address)
        if not contract:
            return {'success': False, 'message': 'Invalid contract address'}
        
        # Get target and current amounts from the contract
        target_amount = contract.functions.targetAmount().call()
        current_amount = contract.functions.currentAmount().call()
        beneficiary = contract.functions.beneficiary().call()
        is_completed = contract.functions.isCompleted().call()
        
        # Calculate percentage
        percentage = 0
        if target_amount > 0:
            percentage = min(100, (current_amount * 100) // target_amount)
        
        return {
            'success': True,
            'target': w3.from_wei(target_amount, 'ether'),
            'current': w3.from_wei(current_amount, 'ether'),
            'beneficiary': beneficiary,
            'is_completed': is_completed,
            'percentage': percentage
        }
    except Exception as e:
        print(f"Error getting staking contract status: {e}")
        return {'success': False, 'message': str(e)}

def stake_tokens(contract_address, amount, contributor_wallet_info):
    """
    Stake tokens to a contract
    
    Args:
        contract_address: Address of the staking contract
        amount: Amount to stake in ether
        contributor_wallet_info: Dict with email or private_key and address
    
    Returns:
        dict: Result of the staking operation
    """
    try:
        # Get contract instance
        contract = get_staking_contract(contract_address)
        if not contract:
            return {'success': False, 'message': 'Invalid contract address'}
        
        # Convert amount to wei
        amount_wei = w3.to_wei(amount, 'ether')
        
        # Determine contributor's address and private key
        if 'address' not in contributor_wallet_info:
            return {'success': False, 'message': 'Contributor address not provided'}
        
        contributor_address = contributor_wallet_info['address']
        
        # If private key is provided directly, use it
        if 'private_key' in contributor_wallet_info:
            private_key = contributor_wallet_info['private_key']
        # Otherwise try to get it from email identifier
        elif 'email' in contributor_wallet_info:
            # This would need to be implemented in a real system
            # For now, we'll return an error
            return {'success': False, 'message': 'Private key retrieval not implemented'}
        else:
            return {'success': False, 'message': 'No way to access contributor wallet'}
        
        # Create token contract to approve spending
        token_contract = w3.eth.contract(address=TOKEN_ADDRESS, abi=TOKEN_ABI)
        
        # Check token balance
        token_balance = token_contract.functions.balanceOf(contributor_address).call()
        if token_balance < amount_wei:
            return {
                'success': False, 
                'message': f'Insufficient token balance. Have {w3.from_wei(token_balance, "ether")}, need {amount}'
            }
            
        # Get gas price estimates
        current_gas_price = w3.eth.gas_price
        
        # For user transactions, optimize gas price to keep costs low
        # For most ERC20 operations, we can use a slightly lower gas price
        # and still have transactions processed in a reasonable time
        optimized_gas_price = int(current_gas_price * 0.92)  # 92% of current price
        
        # Get gas estimates for approve and stake operations
        approve_gas = estimate_gas_costs('approve', TOKEN_ADDRESS)
        stake_gas = estimate_gas_costs('stake', TOKEN_ADDRESS)
        
        # Calculate total gas cost and provide to user
        total_cost_eth = approve_gas.get('cost_eth', 0) + stake_gas.get('cost_eth', 0)
        total_cost_usd = approve_gas.get('cost_usd', 0) + stake_gas.get('cost_usd', 0)
        
        print(f"Estimated staking costs: Approve {approve_gas.get('cost_usd', 0)} USD + Stake {stake_gas.get('cost_usd', 0)} USD = {total_cost_usd} USD")
        
        # First, approve the staking contract to spend tokens
        nonce = w3.eth.get_transaction_count(contributor_address)
        approve_tx = token_contract.functions.approve(
            contract_address, 
            amount_wei
        ).build_transaction({
            'from': contributor_address,
            'gas': approve_gas.get('gas_amount', 100000),  # Use estimated gas amount
            'gasPrice': optimized_gas_price,  # Use optimized gas price
            'nonce': nonce,
        })
        
        # Sign and send approval transaction
        signed_approve_tx = w3.eth.account.sign_transaction(approve_tx, private_key)
        approve_tx_hash = w3.eth.send_raw_transaction(signed_approve_tx.rawTransaction)
        
        # Wait for approval to be mined
        approve_receipt = w3.eth.wait_for_transaction_receipt(approve_tx_hash)
        if approve_receipt.status != 1:
            return {'success': False, 'message': 'Token approval failed'}
        
        # Now stake tokens
        nonce = w3.eth.get_transaction_count(contributor_address)
        stake_tx = contract.functions.stake(amount_wei).build_transaction({
            'from': contributor_address,
            'gas': stake_gas.get('gas_amount', 200000),  # Use estimated gas amount
            'gasPrice': optimized_gas_price,  # Use optimized gas price
            'nonce': nonce,
        })
        
        # Sign and send stake transaction
        signed_stake_tx = w3.eth.account.sign_transaction(stake_tx, private_key)
        stake_tx_hash = w3.eth.send_raw_transaction(signed_stake_tx.rawTransaction)
        
        # Wait for stake to be mined
        stake_receipt = w3.eth.wait_for_transaction_receipt(stake_tx_hash)
        
        # Calculate actual gas used and costs
        approve_gas_used = approve_receipt.gasUsed
        stake_gas_used = stake_receipt.gasUsed
        total_gas_used = approve_gas_used + stake_gas_used
        
        gas_price_used = w3.eth.get_transaction(approve_tx_hash).gasPrice  # Both txs use same gas price
        total_cost_wei = total_gas_used * gas_price_used
        total_actual_cost_eth = w3.from_wei(total_cost_wei, 'ether')
        total_actual_cost_usd = float(total_actual_cost_eth) * 250  # Placeholder USD conversion
        
        return {
            'success': stake_receipt.status == 1,
            'transaction_hash': stake_tx_hash.hex(),
            'amount': amount,
            'status': 'completed' if stake_receipt.status == 1 else 'failed',
            'gas_used': {
                'approve': approve_gas_used,
                'stake': stake_gas_used,
                'total': total_gas_used
            },
            'actual_cost': {
                'wei': total_cost_wei,
                'eth': total_actual_cost_eth,
                'usd': total_actual_cost_usd
            },
            'estimated_cost': {
                'eth': total_cost_eth,
                'usd': total_cost_usd
            }
        }
    except Exception as e:
        print(f"Error staking tokens: {e}")
        return {'success': False, 'message': str(e)}

def release_funds(contract_address, wallet_info):
    """
    Release funds from a staking contract to the beneficiary
    
    Args:
        contract_address: Address of the staking contract
        wallet_info: Dict with private_key and address of the beneficiary
    
    Returns:
        dict: Result of the release operation
    """
    try:
        # Get contract instance
        contract = get_staking_contract(contract_address)
        if not contract:
            return {'success': False, 'message': 'Invalid contract address'}
        
        # Verify the caller is the beneficiary
        beneficiary = contract.functions.beneficiary().call()
        if 'address' not in wallet_info or wallet_info['address'].lower() != beneficiary.lower():
            return {'success': False, 'message': 'Only the beneficiary can release funds'}
        
        # Check if the target has been reached
        is_completed = contract.functions.isCompleted().call()
        if not is_completed:
            return {'success': False, 'message': 'Funding target not yet reached'}
        
        # Get the amount to be released
        current_amount = contract.functions.currentAmount().call()
        
        # Get the wallet private key
        if 'private_key' not in wallet_info:
            return {'success': False, 'message': 'Private key not provided'}
        
        private_key = wallet_info['private_key']
        address = wallet_info['address']
        
        # Build release transaction
        nonce = w3.eth.get_transaction_count(address)
        release_tx = contract.functions.release().build_transaction({
            'from': address,
            'gas': 200000,
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce,
        })
        
        # Sign and send release transaction
        signed_release_tx = w3.eth.account.sign_transaction(release_tx, private_key)
        release_tx_hash = w3.eth.send_raw_transaction(signed_release_tx.rawTransaction)
        
        # Wait for release to be mined
        release_receipt = w3.eth.wait_for_transaction_receipt(release_tx_hash)
        
        return {
            'success': release_receipt.status == 1,
            'transaction_hash': release_tx_hash.hex(),
            'amount_released': w3.from_wei(current_amount, 'ether'),
            'status': 'completed' if release_receipt.status == 1 else 'failed'
        }
    except Exception as e:
        print(f"Error releasing funds: {e}")
        return {'success': False, 'message': str(e)}

def get_token_info(token_address):
    """
    Get token information for a token address from the blockchain
    
    Args:
        token_address: Address of the ERC20/BEP20 token
        
    Returns:
        dict: Token information including name, symbol, decimals
    """
    try:
        # Basic validation first
        if not token_address:
            return {
                'success': False,
                'message': 'Token address is required'
            }
        
        # Clean up the address
        token_address = token_address.strip()
        
        # Validate the address format
        if not token_address.startswith('0x') or len(token_address) != 42:
            return {
                'success': False,
                'message': 'Invalid token address format. Must be a valid BSC address in 0x format.'
            }
    
        # Validate the address using web3
        try:
            if not w3.is_address(token_address):
                return {
                    'success': False,
                    'message': 'Invalid token address checksum'
                }
        except Exception as e:
            return {
                'success': False,
                'message': f'Address validation error: {str(e)}'
            }
            
        # Standard ERC20 token ABI functions for name, symbol, decimals
        # This is a minimal ABI needed to get token details
        token_abi = [
            {
                "constant": True,
                "inputs": [],
                "name": "name",
                "outputs": [{"name": "", "type": "string"}],
                "payable": False,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": True,
                "inputs": [],
                "name": "symbol",
                "outputs": [{"name": "", "type": "string"}],
                "payable": False,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": True,
                "inputs": [],
                "name": "decimals",
                "outputs": [{"name": "", "type": "uint8"}],
                "payable": False,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": True,
                "inputs": [],
                "name": "totalSupply",
                "outputs": [{"name": "", "type": "uint256"}],
                "payable": False,
                "stateMutability": "view",
                "type": "function"
            }
        ]
        
        # Create a contract instance
        token_contract = w3.eth.contract(address=token_address, abi=token_abi)
        
        # Check if it's a contract first
        code = w3.eth.get_code(token_address)
        if code == b'' or code == '0x' or code == '0x0' or len(code) < 3:
            return {
                'success': False,
                'message': 'Address is not a contract. Check that you entered a token contract address.'
            }
        
        # Fetch token details
        # Use try-except for each call to handle tokens that don't implement all standard functions
        try:
            name = token_contract.functions.name().call()
        except Exception:
            name = "Unknown Token"
            
        try:
            symbol = token_contract.functions.symbol().call()
        except Exception:
            symbol = "???"
            
        try:
            decimals = token_contract.functions.decimals().call()
        except Exception:
            decimals = 18  # Default to 18 if not specified
            
        try:
            total_supply = token_contract.functions.totalSupply().call()
            total_supply_formatted = total_supply / (10 ** decimals)
        except Exception:
            total_supply = 0
            total_supply_formatted = 0
        
        # Return token info
        return {
            'success': True,
            'name': name,
            'symbol': symbol,
            'decimals': decimals,
            'total_supply': total_supply,
            'total_supply_formatted': total_supply_formatted,
            'address': token_address
        }
    except Exception as e:
        print(f"Error getting token information: {e}")
        return {
            'success': False,
            'message': f"Error getting token information: {str(e)}"
        }

def execute_contract_release(contract_address, wallet_address, amount, wallet_key=None):
    """
    Execute a fund release from a staking contract
    
    Args:
        contract_address: Address of the staking contract
        wallet_address: Wallet address of the contract owner
        amount: Amount to release (for record-keeping, actual release is full amount available)
        wallet_key: Optional private key to sign the transaction
        
    Returns:
        dict: Result of the execution
    """
    try:
        # Validate inputs
        if not contract_address or not contract_address.startswith('0x'):
            return {'success': False, 'message': 'Invalid contract address'}
        
        if not wallet_address or not wallet_address.startswith('0x'):
            return {'success': False, 'message': 'Invalid wallet address'}
        
        # Get contract instance
        contract = get_staking_contract(contract_address)
        if not contract:
            return {'success': False, 'message': 'Failed to get contract instance'}
        
        # Check if wallet is the contract owner (beneficiary)
        try:
            beneficiary = contract.functions.beneficiary().call()
            if beneficiary.lower() != wallet_address.lower():
                return {
                    'success': False, 
                    'message': 'Wallet address is not the contract owner (beneficiary)'
                }
        except Exception as e:
            return {'success': False, 'message': f'Error checking contract owner: {str(e)}'}
        
        # If wallet key is not provided, return instructions
        if not wallet_key:
            return {
                'success': False,
                'requires_wallet': True,
                'message': 'Wallet signature required to execute release',
                'data': {
                    'contract_address': contract_address,
                    'wallet_address': wallet_address,
                    'amount': str(amount),
                    'function': 'release()'
                }
            }
        
        # Get nonce for transaction
        nonce = w3.eth.get_transaction_count(wallet_address)
        
        # Prepare transaction
        gas_price = w3.eth.gas_price
        tx = contract.functions.release().build_transaction({
            'from': wallet_address,
            'gas': 200000,  # Estimated gas
            'gasPrice': gas_price,
            'nonce': nonce,
        })
        
        # Sign transaction
        signed_tx = w3.eth.account.sign_transaction(tx, wallet_key)
        
        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        return {
            'success': True,
            'message': 'Release transaction executed successfully',
            'transaction_hash': tx_hash.hex()
        }
    except Exception as e:
        print(f"Error executing contract release: {e}")
        return {'success': False, 'message': str(e)} 