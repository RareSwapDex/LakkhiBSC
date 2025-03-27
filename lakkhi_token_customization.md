# Lakkhi Token Customization

## Overview
This document outlines the changes made to enable specifying custom tokens during campaign creation in the Lakkhi platform. This enhancement allows project creators to specify which token they want to use for their fundraising campaigns, rather than being limited to a single platform token.

## Changes Made

### Backend

1. **Project Model Update**
   - Added `token_address` field to the `Project` model
   - Set default to use platform's global token address from settings
   - Included help text describing the purpose of the field

2. **Token Validation API**
   - Created new `validate_token` API endpoint that accepts a token address and returns token details
   - Endpoint queries the blockchain to retrieve token name, symbol, decimals, and supply
   - Returns detailed token information for frontend display

3. **Web3 Helper Functions**
   - Added `get_token_info` function to fetch token details from blockchain
   - Updated `deploy_staking_contract` to accept custom token address
   - Implemented validation to ensure token address is valid before deployment

4. **Project Details API**
   - Updated `projects_details_by_id` to include token information
   - Provides token details alongside other project information

5. **Project Creation Flow**
   - Updated `add_project` function to handle token_address parameter
   - Added validation to ensure the specified token exists on-chain

### Frontend

1. **Campaign Creation Form**
   - Added token address input field to campaign creation form
   - Implemented token validation when field loses focus
   - Added token details display with name, symbol, decimals, and supply
   - Disabled form submission until token is validated

2. **Project Detail Page**
   - Added token information card to project details page
   - Displays token name, symbol, decimals, and total supply
   - Shows shortened version of token address with visual styling

## Usage Flow

1. When creating a campaign, user can enter a custom token address
2. The system validates the token on the blockchain
3. Token details are displayed for confirmation
4. Upon submission, the token address is stored with the campaign
5. When publishing the campaign, the system uses this token for the staking contract
6. Project details page displays information about the token being used

## Benefits

1. **Flexibility**: Projects can use any ERC20/BEP20 token for fundraising
2. **Transparency**: Users can see exactly which token will be used before contributing
3. **Custom ecosystems**: Projects can leverage their own token economy
4. **Validation**: The system validates tokens on-chain to prevent errors

## Future Enhancements

1. **Token Whitelisting**: Add admin controls to limit which tokens can be used
2. **Token Price Feed**: Integrate price feeds for supported tokens
3. **Multi-token Support**: Allow campaigns to accept multiple token types
4. **Token Icons**: Add visual token icons from token registries 