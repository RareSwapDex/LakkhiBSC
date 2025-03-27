from django.http import HttpResponseForbidden
from django.core.cache import cache
from django.conf import settings
import time
import re

class IPBlocklistMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.blocklist = set()
    
    def __call__(self, request):
        ip = request.META.get('REMOTE_ADDR')
        if ip in self.blocklist:
            return HttpResponseForbidden('IP address blocked')
        return self.get_response(request)

class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limit = 100  # requests per minute
        self.rate_limit_window = 60  # seconds
    
    def __call__(self, request):
        # Get client IP
        ip = request.META.get('REMOTE_ADDR')
        
        # Skip rate limiting for admin URLs
        if request.path.startswith('/admin/'):
            return self.get_response(request)
        
        # Create cache key
        cache_key = f'rate_limit_{ip}'
        
        # Get current request count
        request_count = cache.get(cache_key, 0)
        
        # Check if rate limit exceeded
        if request_count >= self.rate_limit:
            return HttpResponseForbidden('Rate limit exceeded')
        
        # Increment request count
        cache.set(cache_key, request_count + 1, self.rate_limit_window)
        
        return self.get_response(request)

class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response['Content-Security-Policy'] = "default-src 'self'"
        
        return response

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Log request details
        start_time = time.time()
        
        # Process request
        response = self.get_response(request)
        
        # Calculate processing time
        duration = time.time() - start_time
        
        # Log request details
        print(f"""
        Request: {request.method} {request.path}
        IP: {request.META.get('REMOTE_ADDR')}
        User: {request.user}
        Duration: {duration:.2f}s
        Status: {response.status_code}
        """)
        
        return response 