from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.utils import timezone
from .models import VerificationRequest, Ticket, TicketMessage, AdminNotification
from .serializers import VerificationRequestSerializer, TicketSerializer, TicketMessageSerializer, AdminNotificationSerializer
from sellers.models import Seller
from accounts.models import User

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def verification_request(request):
    if request.method == 'GET':
        try:
            seller = Seller.objects.get(user=request.user)
            verification = VerificationRequest.objects.get(seller=seller)
            serializer = VerificationRequestSerializer(verification)
            return Response(serializer.data)
        except (Seller.DoesNotExist, VerificationRequest.DoesNotExist):
            return Response({'error': 'No verification request found'}, status=404)
    
    elif request.method == 'POST':
        try:
            seller = Seller.objects.get(user=request.user)
            if hasattr(seller, 'verification_request'):
                return Response({'error': 'Verification request already exists'}, status=400)
            
            verification = VerificationRequest.objects.create(
                seller=seller,
                business_description=request.data.get('business_description'),
                years_in_business=request.data.get('years_in_business'),
                number_of_employees=request.data.get('number_of_employees', 1),
                annual_revenue=request.data.get('annual_revenue', ''),
                business_license=request.FILES.get('business_license'),
                id_document=request.FILES.get('id_document'),
                tax_certificate=request.FILES.get('tax_certificate'),
                business_registration=request.FILES.get('business_registration'),
            )
            
            serializer = VerificationRequestSerializer(verification)
            return Response(serializer.data, status=201)
        except Seller.DoesNotExist:
            return Response({'error': 'Seller profile not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_verification_requests(request):
    requests = VerificationRequest.objects.all().order_by('-submitted_at')
    status_filter = request.GET.get('status')
    if status_filter and status_filter != 'all':
        requests = requests.filter(status=status_filter)
    
    serializer = VerificationRequestSerializer(requests, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_verification_status(request, request_id):
    try:
        verification = VerificationRequest.objects.get(id=request_id)
        verification.status = request.data.get('status')
        verification.admin_notes = request.data.get('admin_notes', '')
        verification.rejection_reason = request.data.get('rejection_reason', '')
        verification.reviewed_by = request.user
        verification.reviewed_at = timezone.now()
        
        if verification.status == 'approved':
            verification.seller.is_verified = True
            verification.seller.verification_date = timezone.now()
            verification.seller.save()
        
        verification.save()
        serializer = VerificationRequestSerializer(verification)
        return Response(serializer.data)
    except VerificationRequest.DoesNotExist:
        return Response({'error': 'Verification request not found'}, status=404)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def tickets(request):
    if request.method == 'GET':
        user_tickets = Ticket.objects.filter(user=request.user).order_by('-created_at')
        serializer = TicketSerializer(user_tickets, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        ticket = Ticket.objects.create(
            user=request.user,
            title=request.data.get('title'),
            description=request.data.get('description'),
            category=request.data.get('category'),
            priority=request.data.get('priority', 'medium')
        )
        
        # Create initial message
        TicketMessage.objects.create(
            ticket=ticket,
            user=request.user,
            message=request.data.get('description')
        )
        
        serializer = TicketSerializer(ticket)
        return Response(serializer.data, status=201)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_tickets(request):
    all_tickets = Ticket.objects.all().order_by('-created_at')
    status_filter = request.GET.get('status')
    priority_filter = request.GET.get('priority')
    
    if status_filter and status_filter != 'all':
        all_tickets = all_tickets.filter(status=status_filter)
    if priority_filter and priority_filter != 'all':
        all_tickets = all_tickets.filter(priority=priority_filter)
    
    serializer = TicketSerializer(all_tickets, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_ticket_status(request, ticket_id):
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        ticket.status = request.data.get('status')
        if ticket.status == 'resolved':
            ticket.resolved_at = timezone.now()
        ticket.save()
        
        serializer = TicketSerializer(ticket)
        return Response(serializer.data)
    except Ticket.DoesNotExist:
        return Response({'error': 'Ticket not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_ticket_message(request, ticket_id):
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        
        # Check if user can access this ticket
        if not (request.user == ticket.user or request.user.is_staff):
            return Response({'error': 'Permission denied'}, status=403)
        
        message = TicketMessage.objects.create(
            ticket=ticket,
            user=request.user,
            message=request.data.get('message'),
            is_internal=request.data.get('is_internal', False)
        )
        
        ticket.updated_at = timezone.now()
        ticket.save()
        
        serializer = TicketMessageSerializer(message)
        return Response(serializer.data, status=201)
    except Ticket.DoesNotExist:
        return Response({'error': 'Ticket not found'}, status=404)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_notifications(request):
    if request.method == 'GET':
        notifications = AdminNotification.objects.all().order_by('-created_at')
        serializer = AdminNotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        notification = AdminNotification.objects.create(
            title=request.data.get('title'),
            message=request.data.get('message'),
            notification_type=request.data.get('notification_type', 'notification'),
            target_audience=request.data.get('target_audience'),
            expires_at=request.data.get('expires_at'),
            created_by=request.user
        )
        
        # Handle specific users
        if request.data.get('specific_users'):
            user_emails = request.data.get('specific_users', '').split(',')
            users = User.objects.filter(email__in=[email.strip() for email in user_emails])
            notification.specific_users.set(users)
        
        # Deliver notifications to users
        target_users = []
        audience = notification.target_audience
        
        if audience == 'all':
            target_users = User.objects.filter(is_active=True)
        elif audience == 'sellers':
            from sellers.models import Seller
            seller_user_ids = Seller.objects.values_list('user_id', flat=True)
            target_users = User.objects.filter(id__in=seller_user_ids, is_active=True)
        elif audience == 'buyers':
            target_users = User.objects.filter(is_buyer=True, is_active=True)
        elif audience == 'verified_sellers':
            from sellers.models import Seller
            verified_seller_ids = Seller.objects.filter(is_verified=True).values_list('user_id', flat=True)
            target_users = User.objects.filter(id__in=verified_seller_ids, is_active=True)
        elif audience == 'unverified_sellers':
            from sellers.models import Seller
            unverified_seller_ids = Seller.objects.filter(is_verified=False).values_list('user_id', flat=True)
            target_users = User.objects.filter(id__in=unverified_seller_ids, is_active=True)
        elif audience == 'premium_users':
            from sellers.models import Subscription
            premium_user_ids = Subscription.objects.filter(status='active').values_list('user_id', flat=True)
            target_users = User.objects.filter(id__in=premium_user_ids, is_active=True)
        elif audience == 'specific_users':
            target_users = notification.specific_users.all()
        
        # Create individual notifications for each target user
        from accounts.models import Notification
        for user in target_users:
            Notification.objects.create(
                user=user,
                title=notification.title,
                message=notification.message,
                type='admin_notification'
            )
        
        serializer = AdminNotificationSerializer(notification)
        return Response(serializer.data, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_admin_notifications(request):
    """Get active admin notifications for current user (for popups)"""
    from accounts.models import Notification
    
    # Get user's regular notifications
    notifications = Notification.objects.filter(
        user=request.user,
        type='admin_notification',
        is_read=False
    ).order_by('-created_at')[:5]
    
    # Get active admin notifications that should show as popups
    active_popups = AdminNotification.objects.filter(
        notification_type='popup',
        is_active=True
    )
    
    # Filter popups based on target audience
    popup_data = []
    for popup in active_popups:
        should_show = False
        audience = popup.target_audience
        
        if audience == 'all':
            should_show = True
        elif audience == 'sellers':
            from sellers.models import Seller
            should_show = Seller.objects.filter(user=request.user).exists()
        elif audience == 'buyers':
            should_show = request.user.is_buyer
        elif audience == 'verified_sellers':
            from sellers.models import Seller
            should_show = Seller.objects.filter(user=request.user, is_verified=True).exists()
        elif audience == 'unverified_sellers':
            from sellers.models import Seller
            should_show = Seller.objects.filter(user=request.user, is_verified=False).exists()
        elif audience == 'premium_users':
            from sellers.models import Subscription
            should_show = Subscription.objects.filter(user=request.user, status='active').exists()
        elif audience == 'specific_users':
            should_show = popup.specific_users.filter(id=request.user.id).exists()
        
        if should_show:
            popup_data.append({
                'id': popup.id,
                'title': popup.title,
                'message': popup.message,
                'type': 'popup'
            })
    
    # Regular notifications
    notification_data = []
    for notif in notifications:
        notification_data.append({
            'id': notif.id,
            'title': notif.title,
            'message': notif.message,
            'type': 'notification',
            'created_at': notif.created_at
        })
    
    return Response({
        'notifications': notification_data,
        'popups': popup_data
    })

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def manage_notification(request, notification_id):
    try:
        notification = AdminNotification.objects.get(id=notification_id)
        
        if request.method == 'PATCH':
            notification.is_active = request.data.get('is_active', notification.is_active)
            notification.save()
            serializer = AdminNotificationSerializer(notification)
            return Response(serializer.data)
        
        elif request.method == 'DELETE':
            notification.delete()
            return Response({'message': 'Notification deleted'})
            
    except AdminNotification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=404)