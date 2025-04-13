#!/bin/bash

# This script is called by Vercel during the Build step

echo "=============================================="
echo "Starting Lakkhi build process..."
echo "=============================================="

# Install backend dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Configure environment for Django
echo "Configuring Django environment..."
export DJANGO_SETTINGS_MODULE="lakkhi.settings_prod"
export DATABASE_URL="sqlite://:memory:"
export ALLOWED_HOSTS=".vercel.app"
export CORS_ALLOW_ALL_ORIGINS="True"

# Build the frontend
echo "Building the frontend..."
cd frontend
npm install --include=dev
npm run build
cd ..

echo "=============================================="
echo "Lakkhi build process completed."
echo "==============================================" 