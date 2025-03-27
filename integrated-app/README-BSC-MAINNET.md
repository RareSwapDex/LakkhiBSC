# Lakkhi Fund - BSC Mainnet Deployment

This document explains the key changes made to prepare the Lakkhi Fund platform for BSC mainnet deployment.

## Important Changes

### 1. Campaign Creators Pay for Contract Deployment

The most significant change is that campaign creators now pay for their own contract deployment gas fees, rather than the platform paying these fees. This is appropriate because:

- Creators who use their own tokens already have blockchain knowledge
- It creates proper incentives and prevents spam campaigns
- It aligns with Web3 decentralization principles

### 2. Updated Contract Deployment Function

The `deploy_staking_contract` function in `web3_helper_functions.py` has been updated to:

- Accept a wallet key parameter for signing transactions
- Return deployment instructions when no wallet key is provided
- Use the project owner's address for the transaction

### 3. Required Implementation in Frontend

To complete this integration in the frontend, you'll need to:

1. When a user clicks "Publish Project":
   - Request wallet signature for the transaction
   - Send signed transaction data to backend 
   - Display estimated gas fees before confirmation

2. Create a new endpoint to handle project publication with signed transaction:
   ```python
   @api_view(['POST'])
   def publish_project_with_signature(request, project_id):
       # Get project details
       project = get_object_or_404(Project, id=project_id)
       
       # Get wallet key from signature process
       wallet_key = request.data.get('wallet_key')
       
       # Deploy contract with creator's wallet key
       contract_result = deploy_staking_contract(
           project.title, 
           project.funding_goal,
           project.wallet_address,
           project.token_address,
           wallet_key
       )
       
       if contract_result['success']:
           # Update project status and save contract address
           project.status = "published"
           project.contract_address = contract_result['contract_address']
           project.save()
           
           return Response({
               'success': True,
               'message': 'Project published successfully',
               'contract_address': contract_result['contract_address']
           })
       else:
           return Response({
               'success': False,
               'message': contract_result['message']
           }, status=400)
   ```

## Environment Variables

The updated deployment process requires these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| DJANGO_SECRET_KEY | Yes | Django secret key |
| PRODUCTION_HOST | Yes | Vercel app domain |
| FRONTEND_URL | Yes | Frontend URL |
| BSC_RPC_URL | Yes | BSC mainnet RPC URL (https://bsc-dataseed.binance.org/) |
| WALLET_API_KEY | Yes | For wallet verification |
| WALLET_SECRET | Yes | For wallet operations |
| MERCURYO_* | Yes | For payment processing |
| CLIENT_ID | Yes | For Venly workaround (dummy value works) |
| CLIENT_SECRET | Yes | For Venly workaround (dummy value works) |

## Deployment Steps

1. Make sure you understand these changes and have implemented them correctly.

2. Run the deployment script:
   ```
   ./deploy_mainnet.sh
   ```

3. The script will:
   - Check all required configuration
   - Ensure BSC mainnet RPC URLs are correctly set
   - Deploy the application to Vercel

## Security Considerations

1. **User Experience**: Clearly explain to users that they will need to pay gas fees to deploy their campaign contracts.

2. **Wallet Security**: The platform should never store private keys. Use wallet signatures for transactions.

3. **Cost Transparency**: Always display estimated gas costs before asking users to confirm transactions.

## Additional Resources

- [BSC Mainnet Documentation](https://docs.binance.org/smart-chain/developer/rpc.html)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [EIP-712 for Typed Signatures](https://eips.ethereum.org/EIPS/eip-712) 