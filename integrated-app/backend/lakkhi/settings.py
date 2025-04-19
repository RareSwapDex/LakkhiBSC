import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-yoursecrethereemembertochangethisbeforedeployment'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']  # Adjust this for production

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'ckeditor',
    'phonenumber_field',
    'lakkhi_app',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'lakkhi.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'lakkhi.wsgi.application'

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'lakkhi_app.User'

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # For development only
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # For development
DEFAULT_FROM_EMAIL = 'no-reply@lakkhi.com'

# Blockchain Settings
BSC_RPC_URL = os.environ.get('BSC_RPC_URL', 'https://bsc-dataseed.binance.org/')
ETHEREUM_RPC_URL = os.environ.get('ETHEREUM_RPC_URL', 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161')
BASE_RPC_URL = os.environ.get('BASE_RPC_URL', 'https://mainnet.base.org')

# Chain IDs for mainnet
CHAIN_IDS = {
    'Ethereum': 1,
    'BSC': 56,
    'Base': 8453
}

# Admin account variables - DEPRECATED
# These are no longer used as campaign creators now pay for their own gas fees
# Kept for backward compatibility only
ADMIN_PRIVATE_KEY = os.environ.get('ADMIN_PRIVATE_KEY', '')
ADMIN_ADDRESS = os.environ.get('ADMIN_ADDRESS', '')

# Token addresses
# RAREFND_TOKEN = '0x264387ad73d19408e34b5d5e13a93174a35cea33'  # RareFnd token address
LAKKHI_TOKEN = os.environ.get('LAKKHI_TOKEN', '0x264387ad73d19408e34b5d5e13a93174a35cea33')  # Default to RareFnd for testing
TOKEN_ADDRESS = LAKKHI_TOKEN  # Set to LAKKHI_TOKEN for production

# PancakeSwap Factory Settings
STAKING_FACTORY_ADDRESS = os.environ.get('STAKING_FACTORY_ADDRESS', '0x10ED43C718714eb63d5aA57B78B54704E256024E')  # PancakeSwap Router

# Client settings for compatibility
CLIENT_ID = "TheRareAntiquities-capsule"
CLIENT_SECRET = "0d6aa5fe-97ea-40f9-b839-276240448758"

# AWS S3 Settings (if needed)
AWS_ACCESS_KEY_ID = 'your-access-key'
AWS_SECRET_ACCESS_KEY = 'your-secret-key'
AWS_STORAGE_BUCKET_NAME = 'your-bucket-name'

# Custom Wallet settings - Replace these before testing
WALLET_API_KEY = os.environ.get('WALLET_API_KEY', 'your-wallet-api-key')
WALLET_SECRET = os.environ.get('WALLET_SECRET', 'your-wallet-secret')

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Change to AllowAny for development
    ],
}

# JWT settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# Mercuryo settings
MERCURYO_WIDGET_ID = 'your-mercuryo-widget-id'
MERCURYO_SECRET_KEY = 'your-mercuryo-secret-key'
MERCURYO_CALLBACK_SIGN_KEY = 'your-mercuryo-callback-sign-key' 