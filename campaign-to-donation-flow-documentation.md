# LakkhiFund Campaign to Donation Flow Documentation
**Date: July 15, 2023**

This document details the complete flow from campaign creation to donation in the LakkhiFund platform.

## 1. Campaign Creation Process

### Step 1: User Accesses the Create Campaign Page
- **URL**: `/admin/CreateCampaignPage`
- **File**: `integrated-app/frontend/src/pages/admin/CreateCampaignPage.js`

The user is presented with a multi-tab form with sections for Basics, Story, Team, Social, Milestones, Updates, Legal, Rewards, and Preview. The page starts by showing predefined templates that help users get started quickly.

### Step 2: Connect Wallet
The user must connect their cryptocurrency wallet before proceeding:

```javascript
// From CreateCampaignPage.js
if (!connectedWallet) {
  setError('Please connect your wallet before creating a campaign');
  return;
}
```

Example: User connects their MetaMask wallet on the Binance Smart Chain (BSC) network.

### Step 3: Fill Out Campaign Details

#### Basics Tab:
- Campaign Title: "DeFi Yield Optimizer"
- Category: "DeFi"
- Tags: ["yield", "farming", "BSC"]
- Contract Owner: User's wallet address (0x71C7656EC7ab88b098defB751B7401B5f6d8976F)
- Token Address: 0x55d398326f99059fF775485246999027B3197955 (BSC USDT)
- Blockchain: BSC
- Funding Goal: 50,000 USD
- Campaign Duration: 30 days
- Min/Max Contribution: 10 / 5,000 USD
- Auto-refund: Enabled

### Step 4: Token Validation
The system validates the token address on the BSC network:

```javascript
const handleTokenValidation = async () => {
  setValidatingToken(true);
  try {
    const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/token/validate/`, { 
      token_address: formData.basics.tokenAddress,
      blockchain: "BSC" 
    });
    
    if (response.data.success) {
      setTokenInfo(response.data.token_info);
      // Update blockchain in form based on detected token
      handleInputChange('basics', 'blockchainChain', response.data.token_info.blockchain);
    }
  } catch (err) {
    setTokenError("Failed to validate token");
  } finally {
    setValidatingToken(false);
  }
};
```

The system retrieves token information: 
- Name: "Tether USD"
- Symbol: "USDT"
- Decimals: 18
- Contract: 0x55d398326f99059fF775485246999027B3197955

### Step 5: Fill Out Remaining Tabs
The user completes remaining tabs including:
- **Story**: Detailed project description, goals, risks
- **Team**: Team member information
- **Social**: Links to website, social media
- **Milestones**:
  - Initial Release (15,000 USDT): Protocol launch
  - Growth Phase (20,000 USDT): Expand to more yield farms
  - Final Release (15,000 USDT): Cross-chain implementation
- **Updates**: Weekly update commitment
- **Legal**: Accept terms, privacy policy
- **Rewards**: Optional reward tiers for supporters

### Step 6: Preview and Submit
The user reviews all details in the Preview tab and clicks "Create Campaign".

```javascript
const handleSubmit = async (e) => {
  if (e) e.preventDefault();
  
  // Validation checks...
  
  if (!validateChainMatch()) {
    setError(`Your wallet must be on the ${tokenInfo.blockchain} network to create this campaign. Please switch networks.`);
    return;
  }
  
  // Validate complete form
  if (!validateForm()) {
    return;
  }
  
  // Show confirmation modal
  setShowConfirmModal(true);
};
```

### Step 7: Contract Deployment
When the user confirms, the smart contract is deployed directly from their wallet:

```javascript
const submitConfirmed = async () => {
  setSubmitting(true);
  setError('Deploying smart contract. Please confirm the transaction in MetaMask when prompted...');
  
  try {
    // Step 1: Deploy the smart contract through MetaMask
    const contractData = await deploySmartContract();
    if (!contractData) {
      setError('Smart contract deployment failed. Please try again.');
      return;
    }
    
    setError('Smart contract deployed successfully! Creating campaign record...');
    
    // More code for creating campaign record...
  } catch (error) {
    console.error('Error in contract deployment:', error);
    setError(`Error creating campaign: ${error.message || 'Unknown error'}`);
    setSubmitting(false);
    setShowConfirmModal(false);
  }
};
```

#### Contract Deployment Details:
1. The system fetches contract configuration from the backend:
```javascript
const contractConfigResponse = await axios.get(
  `${process.env.REACT_APP_BASE_URL}/api/contract-config/`,
  { 
    params: { blockchain: selectedBlockchain },
    headers: { 'Accept': 'application/json' }
  }
);
```

2. The backend provides ABI and bytecode:
```python
# From views.py
@api_view(["GET"])
@permission_classes([AllowAny])
def contract_config(request):
    try:
        blockchain = request.query_params.get('blockchain', 'BSC')
        abi_file_path = os.path.join(settings.BASE_DIR, 'static/staking_abi.json')
        with open(abi_file_path) as abi_file:
            abi = json.load(abi_file)
        
        # Placeholder bytecode
        bytecode = "0x608060..." 
        
        return Response({
            "success": True,
            "abi": abi,
            "bytecode": bytecode,
            "blockchain": blockchain
        })
    except Exception as e:
        return Response({"success": False, "message": str(e)})
```

3. The contract is deployed directly using MetaMask:
```javascript
const deployTxHash = await window.ethereum.request({
  method: 'eth_sendTransaction',
  params: [{
    from: account,
    gas: web3.utils.toHex(5000000), 
    data: deploymentData
  }]
});
```

4. The user confirms the transaction in their MetaMask wallet, paying approximately 0.01 BNB ($3.50) in gas fees.

5. The system waits for transaction confirmation (BSC confirmation time: ~3-5 seconds):
```javascript
const receipt = await waitForReceipt(deployTxHash);
const contractAddress = receipt.contractAddress;
```

6. Deployed contract address is returned: 0x3aB46A4856A2dfba6bFbD1778C3936B1A8E2feaf

### Step 8: Campaign Data Submission
After contract deployment, campaign data is submitted to the backend:

```javascript
// Create FormData for backend submission
const formDataToSend = new FormData();
// Add all form fields...

// Set status to active - no more admin approval needed
formDataToSend.append('status', 'active');

// Add contract data
formDataToSend.append('contract_data', JSON.stringify(contractData));

// Send data to the backend
const createResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/campaigns/`, formDataToSend, {
    headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

### Step 9: Backend Campaign Creation
The backend creates the campaign record in the database:

```python
# From views.py - CampaignViewSet.perform_create method
def perform_create(self, serializer):
  # Get contract data from request
  contract_data = self.request.data.get('contract_data')
  
  # If contract data provided, parse it
  if contract_data:
      try:
          contract_data = json.loads(contract_data)
          # Create campaign with contract info
          campaign = serializer.save(
              owner=self.request.user,
              status='active',  # Set as active immediately - no admin approval needed
              contract_address=contract_data.get('contract_address'),
              transaction_hash=contract_data.get('transaction_hash'),
              block_number=contract_data.get('block_number')
          )
          print(f"Campaign created with contract address: {contract_data.get('contract_address')}")
          return campaign
      except Exception as e:
          print(f"Error parsing contract data: {e}")
  
  # Fallback: create without contract data (should not happen with new flow)
  return serializer.save(owner=self.request.user)
```

The campaign is stored in the database with:
- ID: 42
- Owner: User's account
- Status: active
- Contract Address: 0x3aB46A4856A2dfba6bFbD1778C3936B1A8E2feaf
- Transaction Hash: 0x5f2b9dd5d5d31a9c1b4a6b1e715826489b5ad5a7a4c90418c3670a0d0d88307c
- Block Number: 29482753

### Step 10: Redirect to Campaign Page
The user is redirected to the campaign page:

```javascript
setTimeout(() => {
  // Navigate to the new campaign page
  navigate(`/campaigns/${createResponse.data.campaign_id}`);
}, 2000);
```

## 2. Donation Process

### Step 1: User Visits Project Page
- **URL**: `/campaigns/42`
- **File**: Likely `ProjectDetailsPage.js` or similar

The page displays:
- Campaign title, description, image
- Funding progress (0/50,000 USD, 0%)
- 30 days remaining
- BSC blockchain badge with contract address
- USDT token details
- Milestones section
- Team information
- Updates section (empty initially)
- Comments section

### Step 2: User Clicks "Contribute" Button
User is directed to the donation page:
- **URL**: `/campaigns/42/donate`
- **File**: Likely `DonateProjectPage.js` or similar

### Step 3: Donation Options
The user sees two payment options:
1. **Direct Token Contribution** (via wallet)
2. **Credit Card Payment** (via Mercuryo)

#### Scenario 1: Direct Token Contribution

1. User connects their MetaMask wallet 
2. Selects donation amount: 500 USDT
3. System verifies wallet is on BSC network:

```javascript
// Example code to check network and switch if needed
const validateNetwork = async () => {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (chainId !== '0x38') { // BSC chain ID
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }],
      });
    } catch (error) {
      setError('Please switch to BSC network manually');
    }
  }
};
```

4. User confirms contribution, initiating two transactions:

**Transaction 1: Token Approval**
```javascript
// Frontend code to approve token spending
const approveTokens = async () => {
  const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
  const amountWei = web3.utils.toWei('500', 'ether');
  
  const approvalTx = await tokenContract.methods
    .approve(campaignContractAddress, amountWei)
    .send({ from: userWalletAddress });
    
  return approvalTx;
};
```

**Transaction 2: Token Staking (donation)**
```javascript
// Frontend code to stake tokens
const stakeTokens = async () => {
  const stakingContract = new web3.eth.Contract(stakingABI, campaignContractAddress);
  const amountWei = web3.utils.toWei('500', 'ether');
  
  const stakeTx = await stakingContract.methods
    .stake(amountWei)
    .send({ from: userWalletAddress });
    
  return stakeTx;
};
```

5. Backend records the contribution:
```python
# Example backend code
contribution = Contribution.objects.create(
    campaign_id=42,
    user=request.user,
    amount=500,
    currency='USDT',
    transaction_hash=stake_tx_hash,
    status='completed'
)
```

6. Campaign funding updates:
   - Current amount: 500 USDT
   - Progress: 1%
   - Contributors: 1

#### Scenario 2: Credit Card Payment (Mercuryo)

1. User selects Credit Card option
2. Enters amount: $500
3. Enters email: user@example.com
4. System creates a contribution record and initiates Mercuryo checkout:

```javascript
// Frontend code to initiate Mercuryo checkout
const initiatePayment = async () => {
  try {
    const response = await axios.post('/api/mercuryo_checkout_url', {
      contributionEmail: 'user@example.com',
      contributionAmount: 500,
      projectId: 42,
      selectedIncentive: 0,
      redirectURL: window.location.origin + '/payment-complete',
      blockchain: 'BSC'
    });
    
    if (response.data.checkout_url) {
      window.location.href = response.data.checkout_url;
    } else {
      setError('Failed to generate payment link');
    }
  } catch (error) {
    setError('Error processing payment request');
  }
};
```

4. Backend creates pending contribution and generates Mercuryo checkout URL:

```python
# From views.py
@csrf_exempt
def mercuryo_checkout_url(request):
    try:
        data = json.loads(request.body)
        email = data.get('contributionEmail')
        amount = data.get('contributionAmount')
        project_id = data.get('projectId')
        selected_incentive = data.get('selectedIncentive', 0)
        redirect_url = data.get('redirectURL')
        blockchain = data.get('blockchain', 'BSC')
        
        # Create contribution record
        contribution = Contribution.objects.create(
            project=Project.objects.get(id=project_id),
            email=email,
            amount_usd=amount,
            incentive_id=selected_incentive,
            status='pending'
        )
        
        # Generate Mercuryo checkout URL
        checkout_result = PaymentProcessor.get_mercuryo_checkout_url(
            contribution=contribution, 
            session_id=str(contribution.id),
            return_url=redirect_url,
            blockchain=blockchain
        )
        
        return JsonResponse({
            "success": True,
            "checkout_url": checkout_result
        })
    except Exception as e:
        # Error handling...
```

5. User is redirected to Mercuryo's checkout page
6. User completes credit card payment on Mercuryo
7. Mercuryo sends a webhook to the backend:

```python
@csrf_exempt
def mercuryo_callback(request):
    try:
        data = json.loads(request.body)
        result = PaymentProcessor.handle_mercuryo_callback(data)
        return JsonResponse(result)
    except Exception as e:
        # Error handling...
```

8. `PaymentProcessor.handle_mercuryo_callback` processes the payment:
   - Verifies payment signature
   - Updates contribution status to 'completed'
   - Performs on-chain transaction to add funds to the contract
   - Updates campaign funding progress

9. User is redirected back to the payment completion page
10. Campaign funding updates:
    - Current amount: 500 USD
    - Progress: 1%
    - Contributors: 1

## Smart Contract Details for BSC Example

1. **Contract Type**: Staking Contract
2. **Network**: Binance Smart Chain (ChainID: 0x38)
3. **Token**: USDT (0x55d398326f99059fF775485246999027B3197955)
4. **Contract Functions**:
   - `stake(uint256 amount)` - Used by contributors to stake tokens
   - `release()` - Used by project owner to withdraw funds when milestones are reached
   - `targetAmount()` - Returns the funding goal
   - `currentAmount()` - Returns the current amount raised
   - `beneficiary()` - Returns the wallet address that will receive funds
   - `isCompleted()` - Returns whether the funding goal has been reached

5. **Milestone Management**:
   - Each milestone has a title, description, amount, and release time
   - Project owner can withdraw funds once each milestone's release time is reached
   - The contract includes auto-refund functionality if the goal isn't reached by the deadline

This end-to-end flow represents the complete process from campaign creation to donation, highlighting all steps, pages, and code involved across both frontend and backend components. 