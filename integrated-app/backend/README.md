# Lakkhi Backend

This is the backend application for the Lakkhi decentralized crowdfunding platform.

## Development Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Apply migrations:
   ```
   python manage.py migrate
   ```

3. Run the development server:
   ```
   python manage.py runserver
   ```

## Production Deployment

For production deployment:

1. Set these environment variables:
   ```
   DJANGO_SECRET_KEY=your-secure-secret-key
   DEBUG=False
   ALLOWED_HOSTS=your-domain.com
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
   BSC_RPC_URL=https://bsc-dataseed.binance.org/
   ADMIN_PRIVATE_KEY=your-admin-private-key
   ADMIN_ADDRESS=your-admin-address
   LAKKHI_TOKEN=your-token-address
   ```

2. Set up a production web server like Nginx with Gunicorn or use a platform like Heroku

3. For production settings, use:
   ```
   python manage.py runserver --settings=lakkhi.settings_prod
   ```

## Environment Variables

| Variable | Development | Production |
|----------|-------------|------------|
| DEBUG | True | False |
| DJANGO_SECRET_KEY | (default in settings) | (secure random key) |
| ALLOWED_HOSTS | * | your-domain.com |
| BSC_RPC_URL | https://bsc-dataseed.binance.org/ | https://bsc-dataseed.binance.org/ |
| ADMIN_PRIVATE_KEY | (empty) | (your private key) |
| ADMIN_ADDRESS | (empty) | (your admin address) |
| LAKKHI_TOKEN | 0x264387ad73d19408e34b5d5e13a93174a35cea33 | (your token address) |

## API Endpoints

- `/api/projects/` - List all projects
- `/api/projects/<id>/` - Get project details
- `/api/projects/add/` - Create a new project
- `/api/token/validate/` - Validate token address
- `/api/token/price/` - Get token price 