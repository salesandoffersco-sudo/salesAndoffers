from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .models import User, Favorite, Notification
from .serializers import UserSerializer, FavoriteSerializer, NotificationSerializer
from .notification_service import NotificationService
from deals.models import Deal
import os

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users(request):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=403)
    
    users = User.objects.all().order_by('-date_joined')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)
try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth, credentials
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

# Initialize Firebase Admin SDK
firebase_initialized = False
if FIREBASE_AVAILABLE and not firebase_admin._apps:
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
        is_buyer=True,
        is_active=False  # User inactive until email verified
    )
    
    # Send verification email
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    verification_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"
    
    subject = 'Verify Your Email - Sales & Offers'
    message = f'''
Welcome to Sales & Offers, {user.username}!

Please verify your email address by clicking the link below:
{verification_link}

This link will expire in 24 hours.

Best regards,
Sales & Offers Team
'''
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
    except Exception as e:
        user.delete()  # Remove user if email fails
        return Response({'error': 'Failed to send verification email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Create welcome notification
    NotificationService.create_welcome_notification(user)
    
    return Response({
        'message': 'Registration successful! Please check your email to verify your account.'
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    try:
        user = User.objects.get(username=username)
        if user.check_password(password):
            # Grant Enterprise subscription and admin privileges to admin user
            if username == 'admin':
                user.subscription_plan = 'Enterprise'
                user.is_staff = True
                user.is_superuser = True
                user.save()
            
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
    if not FIREBASE_AVAILABLE or not firebase_initialized:
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
                'is_buyer': True,
                'is_email_verified': True,
                'is_active': True
            }
        )
        
        # Update profile picture if it exists
        if photo_url and not user.profile_picture:
            user.profile_picture = photo_url
            user.save()
        
        # Create welcome notification for new Google users
        if created:
            NotificationService.create_welcome_notification(user)
        
        token, created_token = Token.objects.get_or_create(user=user)
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

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    
    if not all([uid, token]):
        return Response({'error': 'Invalid verification link'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired verification link'}, status=status.HTTP_400_BAD_REQUEST)
        
        if user.is_email_verified:
            return Response({'message': 'Email already verified'})
        
        user.is_email_verified = True
        user.is_active = True
        user.save()
        
        # Create welcome notification for email verified users
        if not Notification.objects.filter(user=user, type='welcome').exists():
            NotificationService.create_welcome_notification(user)
        
        return Response({'message': 'Email verified successfully! You can now login.'})
        
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': 'Invalid verification link'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': 'Failed to verify email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    favorites_count = Favorite.objects.filter(user=user).count()
    notifications_count = Notification.objects.filter(user=user, is_read=False).count()
    
    return Response({
        'favorites_count': favorites_count,
        'viewed_offers': 0,
        'saved_searches': 0,
        'notifications_count': notifications_count
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def favorites(request):
    if request.method == 'GET':
        favorites = Favorite.objects.filter(user=request.user).select_related('offer__seller')
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        offer_id = request.data.get('offer_id')
        try:
            offer = Deal.objects.get(id=offer_id)
            favorite, created = Favorite.objects.get_or_create(user=request.user, offer=offer)
            if created:
                # Create system notification for adding to favorites
                NotificationService.create_system_notification(
                    request.user,
                    "Added to Favorites! ❤️",
                    f"You've added '{offer.title}' to your favorites. We'll notify you of any updates!"
                )
                return Response({'message': 'Added to favorites'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'message': 'Already in favorites'}, status=status.HTTP_200_OK)
        except Deal.DoesNotExist:
            return Response({'error': 'Offer not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_favorite(request, favorite_id):
    try:
        favorite = Favorite.objects.get(id=favorite_id, user=request.user)
        favorite.delete()
        return Response({'message': 'Removed from favorites'})
    except Favorite.DoesNotExist:
        return Response({'error': 'Favorite not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications(request):
    limit = request.GET.get('limit')
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    
    if limit:
        try:
            limit = int(limit)
            notifications = notifications[:limit]
        except ValueError:
            pass
    
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_notification(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        serializer = NotificationSerializer(notification, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.delete()
        return Response({'message': 'Notification deleted'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'All notifications marked as read'})

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def toggle_favorite_deal(request, deal_id):
    try:
        deal = Deal.objects.get(id=deal_id)
        favorite, created = Favorite.objects.get_or_create(user=request.user, offer=deal)
        
        if not created:
            favorite.delete()
            return Response({'favorited': False, 'message': 'Removed from favorites'})
        
        # Create notification for adding to favorites
        NotificationService.create_system_notification(
            request.user,
            "Added to Favorites! ❤️",
            f"You've added '{deal.title}' to your favorites."
        )
        
        return Response({'favorited': True, 'message': 'Added to favorites'})
    except Deal.DoesNotExist:
        return Response({'error': 'Deal not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_favorite_status(request, deal_id):
    try:
        deal = Deal.objects.get(id=deal_id)
        is_favorited = Favorite.objects.filter(user=request.user, offer=deal).exists()
        return Response({'favorited': is_favorited})
    except Deal.DoesNotExist:
        return Response({'error': 'Deal not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_test(request):
    """Debug endpoint to test authentication"""
    return Response({
        'authenticated': True,
        'user_id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'token_exists': hasattr(request.user, 'auth_token'),
        'token_key': request.user.auth_token.key if hasattr(request.user, 'auth_token') else None
    })