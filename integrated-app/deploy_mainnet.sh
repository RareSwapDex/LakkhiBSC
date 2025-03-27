#!/bin/bash

# Lakkhi deployment script for Vercel - BSC Mainnet version

echo "========== 🚀 Deploying Lakkhi to Vercel (BSC MAINNET) =========="
echo "This script will deploy the application to Vercel for BSC Mainnet testing."
echo "WARNING: This deployment will interact with REAL tokens on BSC Mainnet."
echo "         Campaign creators will need to pay real gas fees for contract deployment."
echo ""
echo "Do you wish to continue? (y/n)"
read -r continue

if [[ ! "$continue" =~ ^[Yy]$ ]]; then
  echo "Deployment canceled."
  exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Create or check the .env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📄 Created .env file from example. Please edit it with your values before continuing."
    echo ""
    echo "REQUIRED VARIABLES:"
    echo "  - DJANGO_SECRET_KEY (generate a random string)"
    echo "  - PRODUCTION_HOST (your Vercel app domain)"
    echo "  - FRONTEND_URL (your frontend URL)"
    echo "  - BSC_RPC_URL (set to https://bsc-dataseed.binance.org/ for mainnet)"
    echo "  - WALLET_API_KEY & WALLET_SECRET (for wallet verification)"
    echo "  - MERCURYO_WIDGET_ID, MERCURYO_SECRET_KEY, MERCURYO_CALLBACK_SIGN_KEY (for payments)"
    echo ""
    echo "Press Enter when you're ready to continue..."
    read
fi

# Ensure BSC mainnet RPC is configured
echo "Ensuring BSC Mainnet configuration..."
sed -i 's|BSC_RPC_URL=.*|BSC_RPC_URL=https://bsc-dataseed.binance.org/|g' .env
sed -i 's|REACT_APP_BSC_RPC_URL=.*|REACT_APP_BSC_RPC_URL=https://bsc-dataseed.binance.org/|g' frontend/.env

# Make sure CLIENT_ID and CLIENT_SECRET are set (needed for Venly import workaround)
if ! grep -q "CLIENT_ID" .env; then
    echo "CLIENT_ID=dummy-client-id" >> .env
    echo "CLIENT_SECRET=dummy-client-secret" >> .env
fi

# Ask for Vercel token if not stored
TOKEN_FILE=".vercel_token"
if [ ! -f "$TOKEN_FILE" ]; then
    echo "No saved Vercel token found."
    echo "Please create a token at https://vercel.com/account/tokens and paste it below:"
    read -s VERCEL_TOKEN
    echo $VERCEL_TOKEN > "$TOKEN_FILE"
    chmod 600 "$TOKEN_FILE"  # Set restrictive permissions
    echo "Token saved for future deployments."
else
    VERCEL_TOKEN=$(cat "$TOKEN_FILE")
    echo "Using saved Vercel token."
fi

# Ensure the frontend build script is ready
echo "Preparing frontend for deployment..."
if [ -f frontend/package.json ]; then
    # Add build script if not present
    if ! grep -q '"build"' frontend/package.json; then
        sed -i 's/"scripts": {/"scripts": {\n    "build": "react-scripts build",/g' frontend/package.json
    fi
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel (BSC MAINNET)..."
vercel --token "$VERCEL_TOKEN" --prod

echo "========== 🎉 Deployment complete! =========="
echo "Your app is now deployed and configured for BSC Mainnet."
echo ""
echo "IMPORTANT NOTES:"
echo "1. Campaign creators will pay their own gas fees for contract deployment"
echo "2. All transactions involve real BSC tokens and real gas fees"
echo "3. Verify all environment variables in the Vercel dashboard"
echo ""
echo "Thank you for using Lakkhi Fund! 🙏" 