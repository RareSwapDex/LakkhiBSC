# Lakkhi Token Functionality Test Script

## Overview

This test script outlines steps to verify the token functionality in the Lakkhi platform. It focuses on happy path testing for both project creators and contributors.

## Prerequisites

- Lakkhi backend running on http://localhost:8000
- Lakkhi frontend running on http://localhost:3000
- MetaMask or similar wallet extension installed
- Test BSC wallet with some BNB for gas
- Access to test tokens on BSC (USDT, DAI, etc.)

## Test Cases

### 1. API Validation Tests

#### 1.1. Token Validation API

1. Open Postman or similar API testing tool
2. Send a POST request to `http://localhost:8000/api/token/validate/`
   - Body: `{ "token_address": "0x55d398326f99059fF775485246999027B3197955" }` (USDT on BSC)
3. **Expected result**: Success response with token details (name, symbol, decimals)
4. Send a second identical request
5. **Expected result**: Response includes `"cached": true` and responds faster

#### 1.2. Popular Tokens API

1. Send a GET request to `http://localhost:8000/api/token/popular/`
2. **Expected result**: List of tokens including USDT, DAI, WBNB, etc.
3. Send a second request
4. **Expected result**: Response includes `"cached": true` and responds faster

#### 1.3. Gas Estimation API

1. Send a POST request to `http://localhost:8000/api/gas/estimate/`
   - Body: `{ "operation_type": "stake", "token_address": "0x55d398326f99059fF775485246999027B3197955" }`
2. **Expected result**: Response with gas estimates, USD cost, and time estimate

### 2. Project Creator Flow

#### 2.1. Token Selection during Campaign Creation

1. Navigate to `http://localhost:3000/admin/create`
2. Connect wallet when prompted
3. Fill in basic campaign details:
   - Title: "Token Test Campaign"
   - Description: "Testing custom token functionality"
   - Funding Goal: 1000
4. In the token selection field:
   - Click the "Popular Tokens" dropdown
   - Select "USDT" from the list
5. **Expected result**: Token details appear in a success box below the field
6. Click "Change" button in the token details box
7. **Expected result**: Token field is cleared
8. Manually enter `0x55d398326f99059fF775485246999027B3197955` (USDT)
9. **Expected result**: Token is validated and details appear again
10. Complete form and submit
11. **Expected result**: Success message and redirect to new campaign page

#### 2.2. Verifying Contract Deployment

1. Navigate to the newly created campaign
2. Scroll to the Smart Contract section
3. **Expected result**: Contract address is displayed with token configuration

### 3. Contributor Flow

#### 3.1. Viewing Token Information

1. Navigate to the campaign list page
2. Find and click on "Token Test Campaign"
3. **Expected result**: Token information is clearly displayed (Token: USDT)
4. Check the details section
5. **Expected result**: Token name, symbol, and address are displayed

#### 3.2. Contributing to Campaign

1. Click "Support This Project" button
2. Enter contribution amount: 10
3. **Expected result**: Gas Fee Estimator shows estimated costs
4. Check that the token required is clearly displayed as USDT
5. Click "Confirm Contribution" button
6. **Expected result**: MetaMask opens with appropriate gas settings
7. Confirm transaction in MetaMask
8. **Expected result**: Success message and updated campaign funding amount

### 4. Multi-Token Testing

Repeat test cases 2.1 through 3.2 with different tokens:

#### 4.1. Using DAI Token

- Token Address: `0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3`
- Campaign Name: "DAI Test Campaign"

#### 4.2. Using WBNB Token

- Token Address: `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c`
- Campaign Name: "WBNB Test Campaign"

### 5. Performance Testing

#### 5.1. Caching Performance

1. Time how long the first request to `/api/token/popular/` takes
2. Time how long a subsequent request takes
3. **Expected result**: Second request is significantly faster (>50% improvement)

#### 5.2. Gas Optimization Verification

1. Create a campaign without our optimizations (if possible, using a different account)
2. Create a campaign with our optimizations
3. Compare the gas costs in MetaMask for both transactions
4. **Expected result**: The optimized transaction should show ~10% lower gas fees

## Validation Matrix

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1 Token Validation API | | |
| 1.2 Popular Tokens API | | |
| 1.3 Gas Estimation API | | |
| 2.1 Token Selection | | |
| 2.2 Contract Deployment | | |
| 3.1 Viewing Token Info | | |
| 3.2 Contributing | | |
| 4.1 DAI Token Test | | |
| 4.2 WBNB Token Test | | |
| 5.1 Caching Performance | | |
| 5.2 Gas Optimization | | |

## Troubleshooting Common Issues

### API Connection Issues
- Verify backend is running on the expected port
- Check for CORS issues in browser console
- Ensure web3 provider (BSC) is accessible

### Token Validation Issues
- Verify token contract addresses are correct for the BSC network
- Check if the token contract implements standard ERC20 interfaces
- Look for any validation errors in the backend logs

### Transaction Failures
- Ensure wallet has sufficient BNB for gas
- Check if token approval was successful before staking
- Verify token balance is sufficient for contribution

## Test Completion Checklist

- [ ] All API endpoints return expected responses
- [ ] Project creators can select different tokens
- [ ] Token information is properly displayed on project pages
- [ ] Contributors can see token requirements clearly
- [ ] Gas fee optimizations are working as expected
- [ ] Caching is improving performance 