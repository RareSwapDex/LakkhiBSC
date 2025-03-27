# Lakkhi Frontend

This is the frontend application for the Lakkhi decentralized crowdfunding platform.

## Development Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create `.env` file with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_BSC_RPC_URL=https://bsc-dataseed.binance.org/
   ```

3. Start the development server:
   ```
   npm start
   ```

## Production Deployment

For production deployment, make sure to set these environment variables accordingly:

1. Set `REACT_APP_API_URL` to your production API URL
2. Set `REACT_APP_BSC_RPC_URL` to the appropriate BSC RPC URL

### Building for Production

```
REACT_APP_API_URL=https://your-production-api-url.com npm run build
```

This will create a production build in the `build` folder that can be deployed to any static hosting service.

## Environment Variables

| Variable | Development | Production |
|----------|-------------|------------|
| REACT_APP_API_URL | http://localhost:8000 | https://your-production-api-url.com |
| REACT_APP_BSC_RPC_URL | https://bsc-dataseed.binance.org/ | https://bsc-dataseed.binance.org/ |

## Features

- Wallet connection to BSC mainnet
- Campaign creation with token selection
- Campaign browsing and filtering
- Token validation and pricing
- Gas fee estimation 