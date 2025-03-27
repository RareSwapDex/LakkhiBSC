from .settings import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

# Allow only your domain and any other domains you want to allow
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# CORS settings
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
CORS_ALLOW_CREDENTIALS = True

# Database - Use production database settings
if os.environ.get('DATABASE_URL'):
    import dj_database_url
    DATABASES = {'default': dj_database_url.config(default=os.environ.get('DATABASE_URL'))}

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Custom Wallet settings
WALLET_API_KEY = os.environ.get('WALLET_API_KEY')
WALLET_SECRET = os.environ.get('WALLET_SECRET')

# Blockchain Settings
BSC_RPC_URL = os.environ.get('BSC_RPC_URL', 'https://bsc-dataseed.binance.org/')
ADMIN_PRIVATE_KEY = os.environ.get('ADMIN_PRIVATE_KEY')
ADMIN_ADDRESS = os.environ.get('ADMIN_ADDRESS')

# Token address
LAKKHI_TOKEN = os.environ.get('LAKKHI_TOKEN')
TOKEN_ADDRESS = LAKKHI_TOKEN

# Custom environment settings
MERCURYO_WIDGET_ID = os.environ.get('MERCURYO_WIDGET_ID')
MERCURYO_SECRET_KEY = os.environ.get('MERCURYO_SECRET_KEY')
MERCURYO_CALLBACK_SIGN_KEY = os.environ.get('MERCURYO_CALLBACK_SIGN_KEY')

# Static files - use whitenoise or cloud storage in production
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Add whitenoise middleware
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware') 