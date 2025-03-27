def get_token_price(token_address):
    """Get token price from PancakeSwap or other price sources"""
    try:
        # Initialize web3 with BSC or ETH provider
        provider_url = settings.WEB3_PROVIDER_URL
        web3 = Web3(Web3.HTTPProvider(provider_url))
        
        # For BSC tokens, use PancakeSwap
        if settings.BLOCKCHAIN_NETWORK == 'BSC':
            # PancakeSwap router address
            router_address = settings.PANCAKESWAP_ROUTER_ADDRESS
            # BUSD address (stable coin reference)
            busd_address = settings.BUSD_ADDRESS
            
            # Load PancakeSwap router ABI
            with open(f"{settings.BASE_DIR}/static/pancake_swap_abi.json", "r") as f:
                router_abi = json.load(f)
            
            # Create router contract instance
            router = web3.eth.contract(address=router_address, abi=router_abi)
            
            # Define path for getAmountsOut
            # Path: Token -> BUSD
            path = [token_address, busd_address]
            
            # Get price for 1 token in BUSD
            amount_in = web3.to_wei(1, 'ether')
            
            try:
                amounts_out = router.functions.getAmountsOut(amount_in, path).call()
                # Convert BUSD amount to USD value
                token_price_usd = web3.from_wei(amounts_out[1], 'ether')
                return float(token_price_usd)
            except Exception as e:
                print(f"Error calling PancakeSwap: {e}")
                # Fallback to a default price or external API
                return get_token_price_from_api(token_address)
        else:
            # For ETH or other networks
            return get_token_price_from_api(token_address)
    except Exception as e:
        print(f"Error in get_token_price: {e}")
        return None

def get_token_price_from_api(token_address):
    """Fallback method to get token price from an external API"""
    try:
        # Use CoinGecko, Moralis, or other API to get token price
        # For example with CoinGecko:
        api_url = f"https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?contract_addresses={token_address}&vs_currencies=usd"
        
        response = requests.get(api_url)
        data = response.json()
        
        # Extract price
        if token_address.lower() in data and 'usd' in data[token_address.lower()]:
            return float(data[token_address.lower()]['usd'])
        
        # If price not found, return a default price for development
        return 1.0  # Default price of $1 for testing
    except Exception as e:
        print(f"Error getting price from API: {e}")
        return 1.0  # Default fallback price 