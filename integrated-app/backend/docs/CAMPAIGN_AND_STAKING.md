# Campaign and Staking Documentation

## Campaign Management

### Campaign Creation Process
```ascii
Admin -> Backend -> Blockchain
  1. Create campaign parameters
  2. Deploy staking contract
  3. Initialize campaign
  4. Set up token distribution
  5. Activate campaign
```

### Campaign Parameters
```python
class Campaign:
    id: UUID
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    target_amount: Decimal
    current_amount: Decimal
    status: str  # DRAFT, ACTIVE, COMPLETED, CANCELLED
    staking_contract_address: str
    token_distribution_rate: Decimal
    created_at: datetime
    updated_at: datetime
```

### Campaign States
1. DRAFT
   - Initial creation
   - Parameter configuration
   - Contract deployment preparation

2. ACTIVE
   - Accepting contributions
   - Processing payments
   - Distributing tokens

3. COMPLETED
   - Target reached
   - No new contributions
   - Final token distribution

4. CANCELLED
   - Campaign terminated
   - Refund processing
   - Contract cleanup

### Campaign API Endpoints
```python
# POST /api/campaigns
{
    "name": str,
    "description": str,
    "start_date": datetime,
    "end_date": datetime,
    "target_amount": Decimal,
    "token_distribution_rate": Decimal
}
Response: {
    "id": str,
    "status": str,
    "staking_contract_address": str
}

# GET /api/campaigns/{campaign_id}
Response: {
    "id": str,
    "name": str,
    "description": str,
    "start_date": datetime,
    "end_date": datetime,
    "target_amount": Decimal,
    "current_amount": Decimal,
    "status": str,
    "staking_contract_address": str,
    "token_distribution_rate": Decimal
}

# PUT /api/campaigns/{campaign_id}/activate
Response: {
    "status": str,
    "message": str
}

# PUT /api/campaigns/{campaign_id}/cancel
Response: {
    "status": str,
    "message": str
}
```

### Campaign Database Schema
```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    target_amount DECIMAL(18,8) NOT NULL,
    current_amount DECIMAL(18,8) DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    staking_contract_address VARCHAR(42) NOT NULL,
    token_distribution_rate DECIMAL(18,8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Staking Smart Contract

### Contract Architecture
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LakkhiStaking {
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 rewards;
        bool active;
    }

    struct Campaign {
        uint256 totalStaked;
        uint256 totalRewards;
        uint256 startTime;
        uint256 endTime;
        uint256 rewardRate;
        bool active;
    }

    mapping(address => Stake) public stakes;
    Campaign public campaign;
    IERC20 public stakingToken;
    IERC20 public rewardToken;
}
```

### Key Functions
1. Stake Management
```solidity
function stake(uint256 amount) external {
    require(campaign.active, "Campaign not active");
    require(amount > 0, "Amount must be greater than 0");
    
    stakingToken.transferFrom(msg.sender, address(this), amount);
    
    stakes[msg.sender] = Stake({
        amount: amount,
        startTime: block.timestamp,
        endTime: campaign.endTime,
        rewards: 0,
        active: true
    });
    
    campaign.totalStaked += amount;
}
```

2. Reward Calculation
```solidity
function calculateRewards(address staker) public view returns (uint256) {
    Stake memory userStake = stakes[staker];
    if (!userStake.active) return 0;
    
    uint256 timeStaked = block.timestamp - userStake.startTime;
    uint256 rewardRate = campaign.rewardRate;
    
    return (userStake.amount * timeStaked * rewardRate) / (365 days * 100);
}
```

3. Reward Distribution
```solidity
function claimRewards() external {
    Stake storage userStake = stakes[msg.sender];
    require(userStake.active, "No active stake");
    
    uint256 rewards = calculateRewards(msg.sender);
    require(rewards > 0, "No rewards available");
    
    userStake.rewards = 0;
    rewardToken.transfer(msg.sender, rewards);
}
```

### Security Features
1. Access Control
   - Owner-only functions
   - Pausable functionality
   - Emergency withdrawal

2. Rate Limiting
   - Minimum stake period
   - Maximum stake amount
   - Cooldown periods

3. Reward Protection
   - Reward rate limits
   - Total reward caps
   - Vesting schedules

### Integration Points
1. Backend Integration
   - Contract deployment
   - Event monitoring
   - State synchronization

2. Frontend Integration
   - Stake creation
   - Reward tracking
   - Balance display

3. Token Integration
   - ERC20 compatibility
   - Transfer handling
   - Approval management

### Monitoring and Events
```solidity
event Staked(address indexed user, uint256 amount);
event RewardsClaimed(address indexed user, uint256 amount);
event CampaignStarted(uint256 startTime, uint256 endTime);
event CampaignEnded(uint256 totalStaked, uint256 totalRewards);
```

### Error Handling
```solidity
error CampaignNotActive();
error InsufficientBalance();
error InvalidAmount();
error StakeNotActive();
error NoRewardsAvailable();
```

### Gas Optimization
1. Storage Optimization
   - Packed structs
   - Efficient mappings
   - Minimal state changes

2. Computation Optimization
   - Batch processing
   - Cached calculations
   - Optimized loops

3. Transaction Optimization
   - Minimal external calls
   - Efficient event emission
   - Optimized storage access

### Contract Deployment
```python
class StakingContractDeployer:
    @staticmethod
    def deploy_campaign(
        staking_token: str,
        reward_token: str,
        start_time: int,
        end_time: int,
        reward_rate: int
    ) -> str:
        # Deploy contract
        contract = web3.eth.contract(
            abi=STAKING_CONTRACT_ABI,
            bytecode=STAKING_CONTRACT_BYTECODE
        )
        
        # Build transaction
        tx = contract.constructor(
            staking_token,
            reward_token,
            start_time,
            end_time,
            reward_rate
        ).build_transaction({
            'from': web3.eth.accounts[0],
            'nonce': web3.eth.get_transaction_count(web3.eth.accounts[0]),
            'gas': 2000000,
            'gasPrice': web3.eth.gas_price
        })
        
        # Sign and send transaction
        signed_tx = web3.eth.account.sign_transaction(tx, private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        # Wait for receipt
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        return receipt.contractAddress
```

### Contract Verification
```python
class ContractVerifier:
    @staticmethod
    def verify_contract(address: str) -> bool:
        # Verify contract on BSCScan
        verification_data = {
            'address': address,
            'sourceCode': STAKING_CONTRACT_SOURCE,
            'compilerVersion': 'v0.8.0+commit.c7dfd78e',
            'optimizationUsed': 1,
            'runs': 200
        }
        
        response = requests.post(
            f'{BSCSCAN_API_URL}/api',
            params={'apikey': BSCSCAN_API_KEY},
            json=verification_data
        )
        
        return response.status_code == 200
``` 