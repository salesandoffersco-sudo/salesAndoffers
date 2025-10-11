from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .models import User
from .serializers import UserSerializer
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
import os

# Initialize Firebase Admin SDK
firebase_initialized = False
if not firebase_admin._apps:
    try:
        private_key = os.environ.get('FIREBASE_PRIVATE_KEY', '')
        if private_key and os.environ.get('FIREBASE_CLIENT_EMAIL'):
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": "salesandoffers-s",
                "private_key_id": os.environ.get('FIREBASE_PRIVATE_KEY_ID'),
                "private_key": private_key.replace('\\n', '\n'),
                "client_email": os.environ.get('FIREBASE_CLIENT_EMAIL'),
                "client_id": os.environ.get('FIREBASE_CLIENT_ID'),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            })
            firebase_admin.initialize_app(cred)
            firebase_initialized = True
    except Exception as e:
        print(f"Firebase initialization failed: {e}")

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    
    if User.objects.filter(email=data.get('email')).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create(
        username=data.get('username'),
        email=data.get('email'),
        password=make_password(data.get('password')),
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        is_seller=True,
        is_buyer=True
    )
    
    token, created = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(user)
    
    return Response({
        'token': token.key,
        'user': serializer.data
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    try:
        user = User.objects.get(username=username)
        if user.check_password(password):
            token, created = Token.objects.get_or_create(user=user)
            serializer = UserSerializer(user)
            return Response({
                'token': token.key,
                'user': serializer.data
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    if not firebase_initialized:
        return Response({'error': 'Google authentication not available'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    try:
        id_token = request.data.get('id_token')
        decoded_token = firebase_auth.verify_id_token(id_token)
        
        uid = decoded_token['uid']
        email = decoded_token.get('email')
        name = decoded_token.get('name', '')
        photo_url = request.data.get('photo_url')
        
        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
                'first_name': name.split(' ')[0] if name else '',
                'last_name': ' '.join(name.split(' ')[1:]) if len(name.split(' ')) > 1 else '',
                'firebase_uid': uid,
                'profile_picture': photo_url,
                'is_google_user': True,
                'is_seller': True,
                'is_buyer': True
            }
        )
        
        # Update profile picture if it exists
        if photo_url and not user.profile_picture:
            user.profile_picture = photo_url
            user.save()
        
        token, created = Token.objects.get_or_create(user=user)
        serializer = UserSerializer(user)
        
        return Response({
            'token': token.key,
            'user': serializer.data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout(request):
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'})
    except:
        return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Generate password reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset link
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        
        # Send email
        subject = 'Password Reset - Sales & Offers'
        message = f'''
Hi {user.username},

You requested a password reset for your Sales & Offers account.

Click the link below to reset your password:
{reset_link}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.

Best regards,
Sales & Offers Team
'''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        return Response({'message': 'Password reset email sent successfully'})
        
    except User.DoesNotExist:
        # Don't reveal if email exists or not for security
        return Response({'message': 'Password reset email sent successfully'})
    except Exception as e:
        return Response({'error': 'Failed to send email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not all([uid, token, new_password]):
        return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Decode user ID
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        # Verify token
        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired reset link'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update password
        user.password = make_password(new_password)
        user.save()
        
        return Response({'message': 'Password reset successfully'})
        
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': 'Failed to reset password'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)