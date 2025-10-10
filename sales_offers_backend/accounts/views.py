from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
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
    
    # Set user type flags based on account_type
    account_type = data.get('account_type', 'buyer')
    is_seller = account_type == 'seller'
    is_buyer = account_type == 'buyer'
    
    user = User.objects.create(
        username=data.get('username'),
        email=data.get('email'),
        password=make_password(data.get('password')),
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        is_seller=is_seller,
        is_buyer=is_buyer
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
                'is_google_user': True
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