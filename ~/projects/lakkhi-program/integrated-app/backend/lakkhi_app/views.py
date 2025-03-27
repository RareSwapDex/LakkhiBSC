@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):
    """API root providing information about available endpoints"""
    api_info = {
        "name": "Lakkhi Funding API",
        "version": "1.0",
        "description": "API for the Lakkhi decentralized crowdfunding platform",
        "endpoints": {
            "projects": {
                "list": "/api/projects/",
                "detail": "/api/projects/{id}/",
                "create": "/api/projects/add/",
                "publish": "/api/projects/{id}/publish/",
            },
            "token": {
                "validate": "/api/token/validate/",
                "price": "/api/token/price/"
            },
            "staking": {
                "abi": "/api/staking-abi/",
                "bytecode": "/api/staking-bytecode/"
            }
        }
    }
    return Response(api_info)


@api_view(["GET"])
@permission_classes([AllowAny])
def staking_abi(request):
    """Serve the staking contract ABI"""
    try:
        with open(f"{settings.BASE_DIR}/static/staking_abi.json", "r") as file:
            abi = json.load(file)
        return Response(abi)
    except Exception as e:
        return Response(
            {"error": f"Failed to load staking ABI: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def staking_bytecode(request):
    """
    Serve the staking contract bytecode
    This is a compiled version of the StakingRewards contract
    """
    # This is a placeholder for compiled bytecode - in production, you'd generate this
    # by compiling your Solidity contract
    bytecode = "0x608060405234801561001057600080fd5b5060405161083638038061083683398101604081905261002f916100e8565b600080546001600160a01b0319163317905581516100529060019060208401906100b6565b50600280546001600160a01b039384166001600160a01b031991821617909155600380549290931691161790556000805460ff1916600117905560058190556004805460ff191690556101aa565b828054610100906100e2565b90600052602060002090601f0160209004810192826103005760008555610346565b82601f1061031957805160ff1916838001178555610346565b82800160010185558215610346579182015b8281111561034657825182559160200191906001019061032b565b50610352929150610356565b5090565b5b808211156103525760008155600101610357565b80516001600160a01b038116811461038357600080fd5b919050565b80516001821681146103835750505050565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126103c257600080fd5b815167ffffffffffffffff808211156103dd576103dd61039b565b604051601f8301601f19908116603f0116810190828211818310171561040557610405161039b565b8160405283815286602085880101111561041e57600080fd5b836020870160208301376000602085830101528094505050505092915050565b60006020828403121561045057600080fd5b815167ffffffffffffffff8082111561046857600080fd5b818401915084601f83011261047c57600080fd5b81516104848261039b565b60405160808282028285010111156104a957600080fd5b610498826020830160208601855261049f565b825250509250506104b08261036c565b80925050509250929050565b6000602082840312156104cf57600080fd5b5035919050565b6000602082840312156104e857600080fd5b6104f18261036c565b9392505050565b60005b835181101561051757818101518382015260200161051f565b835181838582010111156104f15750505050565b60008151808452610544816020860160208601610524565b601f01601f19169290920160200192915050565b6000602080835283518082850152825b818110156105835785810183015185820160400152602001610567565b818111156105945783604083870101525b50601f01601f1916929092016040019392505050565b600067ffffffffffffffff808411156105c4576105c461039b565b604051601f8501601f19908116603f011681019082821181831017156105ec576105ec61039b565b8160405280935085815286868601111561060557600080fd5b858560208301376000602087830101525050509392505050565b600082601f83011261063057600080fd5b6104f1838335602085016105aa565b6000806000806080858703121561065557600080fd5b843567ffffffffffffffff8082111561066d57600080fd5b6106798883890161061f565b955060208701359450604087013591508082111561069657600080fd5b50610692878288016103b1565b925050606085013590509250925092565b6000602082840312156106c757600080fd5b813567ffffffffffffffff8111156106de57600080fd5b820161072e8482850161061f565b949350505050565b6000808335601e1984360301811261074e57600080fd5b83018035915067ffffffffffffffff82111561076957600080fd5b6020019150368190038213156107815761078161039b565b9250929050565b60208152600061075f602083018461052c565b61079f81610789565b825250610794602082018461052c565b6020820152610794604082018361052c565b60608101610794828461079f565b608081016104f1828461079f565b61067c806101b96000396000f3fe608060405267ffffffffffffffff60005416600052600360605236156109c057600e5b600080fd5b600236600a5b600080fd5b602081019081106001600160401b038211176104985761016d565b604052602236600a5b600080fd5b600435906001600160a01b038216820361024a57565b602435906001600160a01b038216820361024a57565b803590610266826101d4565b91905290565b803590610266826101e3565b80356102668161021c565b60005b8381101561029b578181015183820152602001610283565b8381111561031e575050600091825260209182902001906102bc9050565b805461030c90610368565b906000526020600052604060002090601f016020900481019282610330576000855561037a565b82601f1061034457805160ff191683800117855561037a565b8280016001018555821561037a579182015b8281111561034657825182559160200191906001019061032b565b5061039a92915061039e565b5090565b5b8082111561039a57600081556001016103a0565b6001600160a01b03811681146103ca57600080fd5b50565b80356102668161021c565b8035610266826104a5565b80356001600160a01b038116811461026657600080fd5b600060a08236031215610410576103e8565b50919050565b60006020828403121561042a576103e8565b6104ef82610266565b6104ef82610290565b60006020828403121561044b576103e8565b61044582610266565b8152919050565b60006020828403121561046157600080fd5b813567ffffffffffffffff811115610479576103e8565b610479828485016103fd565b919050565b60006020828403121561049457600080fd5b5051919050565b634e487b7160e01b600052604160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b60006020808385031215610514576103e8565b83516001600160401b0381111561052b576103e8565b80840185601f82011261053e576103e8565b8051915061054f8361039a565b604051601f8301601f19908116603f0116810190838211818310171561057857610578610398565b8160405282815288858a0101111561059057600080fd5b600093505b828410156105b357985186116105ac5761059e565b835184529286019290860190600101610595565b509097610265975050505050505056fea2646970667358221220e5b5c08ec1f77a8aa4bc41c3d2fd5d7f0c4b4f74dfd66e24cb09db1f39da9ac664736f6c634300080c0033"
    
    return Response({"bytecode": bytecode})


@api_view(["POST"])
@permission_classes([AllowAny])
def add_project(request):
    """Add a new project"""
    serializer = ProjectSerializer(data=request.data)
    if serializer.is_valid():
        project = serializer.save()
        # Use real contract data if available, or generate mock data
        if contract_data:
            # Use the contract data from the frontend MetaMask transaction
            contract_info = contract_data
            
            # Save contract data to the project
            project.staking_address = contract_info.get('contract_address')
            project.staking_abi = contract_info.get('contract_abi')
            project.transaction_hash = contract_info.get('transaction_hash')
            
            # Use token address from contract data if available (it comes from the deployed contract)
            if contract_info.get('token_address'):
                project.token_address = contract_info.get('token_address')
                
            if contract_info.get('block_number'):
                project.block_number = contract_info.get('block_number')
            project.save()
            
        elif create_contract:
            # If contract_data is not available but create_contract is true,
            # return mock data for development/testing
            contract_info = {
                "contract_address": f"0x{project.id}000000000000000000000000000000000000",
                "transaction_hash": f"0x{project.id}111111111111111111111111111111111111",
                "chain": data.get('blockchain_chain', 'BSC'),
                "block_number": 12345678,
                "contract_url": f"https://bscscan.com/address/0x{project.id}000000000000000000000000000000000000",
            }
            
            # Save mock contract data to the project (for development)
            project.staking_address = contract_info.get('contract_address')
            project.transaction_hash = contract_info.get('transaction_hash')
            project.block_number = contract_info.get('block_number')
            project.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def token_price(request):
    """Get token price endpoint"""
    try:
        # Get token address from query params, or use default
        token_address = request.query_params.get('token_address')
        
        price = get_token_price(token_address)
        return Response({
            "success": True,
            "price": price,
            "token_address": token_address
        })
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def get_token_price(token_address=None):
    """Get token price from cache or update cache"""
    try:
        if not token_address:
            # If no token address is provided, use the default Lakkhi token
            token_address = settings.LAKKHI_TOKEN_ADDRESS
            
        # Try to get from cache first
        cache_key = f"token_price_{token_address.lower()}"
        cached_price = cache.get(cache_key)
        if cached_price is not None:
            return cached_price
            
        # If not in cache, get from an external price source or DB
        if token_address.lower() == settings.LAKKHI_TOKEN_ADDRESS.lower():
            # For Lakkhi token, use the DB price
            token_price = TokenPrice.objects.first()
            if token_price:
                # Cache for 5 minutes
                cache.set(cache_key, token_price.price, 300)
                return token_price.price
        else:
            # For other tokens, fetch price from web3 or external API
            price = web3_helper_functions.get_token_price(token_address)
            if price:
                # Cache for 5 minutes
                cache.set(cache_key, price, 300)
                return price
            
        return None
    except Exception as e:
        print(f"Error getting token price: {e}")
        return None

@api_view(["POST"])
@permission_classes([AllowAny])
def donate_to_project(request, project_id):
    """Record a donation to a project"""
    try:
        project = get_object_or_404(Project, id=project_id)
        
        # Get data from request
        email = request.data.get('email')
        usd_amount = request.data.get('usd_amount')
        token_amount = request.data.get('token_amount')
        token_address = request.data.get('token_address')
        transaction_hash = request.data.get('transaction_hash')
        wallet_address = request.data.get('wallet_address')
        selected_incentive_id = request.data.get('selected_incentive_id')
        
        # Validate required fields
        if not usd_amount:
            return Response(
                {"success": False, "message": "USD amount is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Create contribution record
        contribution = Contribution(
            project=project,
            contributor_email=email,
            contributor_wallet_address=wallet_address,
            amount=usd_amount,
            token_amount=token_amount,
            token_address=token_address,
            transaction_hash=transaction_hash
        )
        
        # Add incentive if selected
        if selected_incentive_id:
            try:
                incentive = Incentive.objects.get(id=selected_incentive_id, project=project)
                contribution.incentive = incentive
            except Incentive.DoesNotExist:
                pass
                
        contribution.save()
        
        # Update project stats
        project.raised_amount = (project.raised_amount or 0) + float(usd_amount)
        project.fund_percentage = min(100, int((project.raised_amount / project.fund_amount) * 100))
        project.number_of_donators = Contribution.objects.filter(project=project).values('contributor_wallet_address').distinct().count()
        project.save()
        
        return Response({
            "success": True,
            "message": "Thank you for your contribution!",
            "contribution_id": contribution.id
        })
    except Exception as e:
        print(f"Error recording donation: {e}")
        return Response(
            {"success": False, "message": f"Failed to record donation: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def project_contributions(request, project_id):
    """Get contributions for a project"""
    try:
        project = get_object_or_404(Project, id=project_id)
        
        # Get query parameters
        wallet_address = request.query_params.get('wallet_address')
        
        # Base queryset
        contributions_queryset = Contribution.objects.filter(project=project)
        
        # Filter by wallet address if provided
        if wallet_address:
            contributions_queryset = contributions_queryset.filter(
                contributor_wallet_address__iexact=wallet_address
            )
            
        # Convert to list of dictionaries
        contributions = []
        for contrib in contributions_queryset:
            contributions.append({
                'id': contrib.id,
                'contributor_email': contrib.contributor_email,
                'contributor_wallet_address': contrib.contributor_wallet_address,
                'amount': str(contrib.amount),  # USD amount
                'token_amount': str(contrib.token_amount),
                'token_address': contrib.token_address,
                'transaction_hash': contrib.transaction_hash,
                'transaction_datetime': contrib.transaction_datetime.isoformat(),
                'incentive_id': contrib.incentive_id
            })
            
        return Response({
            "success": True,
            "project_id": project_id,
            "contributions": contributions,
            "total_count": len(contributions)
        })
    except Exception as e:
        print(f"Error getting project contributions: {e}")
        return Response(
            {"success": False, "message": f"Failed to get contributions: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 