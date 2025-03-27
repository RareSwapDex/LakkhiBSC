#!/bin/bash

# Lakkhi deployment script for Vercel

echo "========== 🚀 Deploying Lakkhi to Vercel =========="
echo "This script will guide you through deploying the application to Vercel."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if .env file exists, if not create from example
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📄 Created .env file from example. Please edit it with your values before continuing."
    echo "Required Variables:"
    echo "  - DJANGO_SECRET_KEY (generate a random string)"
    echo "  - PRODUCTION_HOST (your Vercel app domain, will be set automatically by Vercel)"
    echo "  - FRONTEND_URL (your frontend URL)"
    echo ""
    echo "For Payment Processing:"
    echo "  - MERCURYO_WIDGET_ID (required for payments)"
    echo "  - MERCURYO_SECRET_KEY (required for payments)"
    echo "  - MERCURYO_CALLBACK_SIGN_KEY (required for payments)"
    echo ""
    echo "For Wallet Creation:"
    echo "  - WALLET_API_KEY (needed for custom wallet functionality)"
    echo "  - WALLET_SECRET (needed for custom wallet functionality)"
    echo ""
    echo "For Project Publishing (optional):"
    echo "  - ADMIN_PRIVATE_KEY (only needed if using smart contracts)"
    echo "  - ADMIN_ADDRESS (only needed if using smart contracts)"
    echo ""
    echo "Press Enter when you're ready to continue..."
    read
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

# Deploy to Vercel without login prompt
echo "🚀 Deploying to Vercel..."
vercel --token "$VERCEL_TOKEN" --prod

echo "========== 🎉 Deployment complete! =========="
echo "Don't forget to set up your environment variables in the Vercel dashboard:"
echo "Visit your project settings in the Vercel dashboard and add the variables from your .env file"

echo "Thank you for using Lakkhi! 🙏" 