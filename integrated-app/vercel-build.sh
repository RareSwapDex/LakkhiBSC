#!/bin/bash
set -e

# Check if running in backend directory
if [ -f "manage.py" ]; then
    echo "Building Django backend..."
    pip install -r requirements.txt
    python manage.py collectstatic --noinput
    # No need to run migrations as we're using in-memory sqlite
    exit 0
fi

# Check if running in frontend directory
if [ -f "package.json" ]; then
    echo "Building React frontend..."
    npm install
    npm run build
    exit 0
fi

# If not in a specific directory, do nothing
echo "Not in backend or frontend directory, skipping build"
exit 0 