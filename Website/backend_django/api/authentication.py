import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework import authentication
from rest_framework import exceptions
from .models import User

def generate_token(user_id):
    payload = {
        'userId': str(user_id),
        'exp': datetime.utcnow() + timedelta(days=30),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]

        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Not authorized, token has expired')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Not authorized, token validation failed')

        user_id = payload.get('userId')
        if not user_id:
            raise exceptions.AuthenticationFailed('Not authorized, invalid token payload')

        try:
            user = User.objects.get(id=int(user_id))
        except (User.DoesNotExist, ValueError):
            raise exceptions.AuthenticationFailed('Not authorized, user not found')

        if user.is_blocked:
            raise exceptions.PermissionDenied('Access denied: This account has been suspended')

        return (user, token)
