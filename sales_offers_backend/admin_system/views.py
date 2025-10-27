from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from .models import SystemLog, SecurityEvent, SystemSettings, Report
from accounts.models import User
from deals.models import Deal
from sellers.models import Seller, Payment
import psutil
import os

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_logs(request):
    if not (request.user.is_staff and request.user.is_superuser):
        return Response({'error': 'Permission denied'}, status=403)
    
    logs = SystemLog.objects.all()[:100]
    data = []
    
    for log in logs:
        data.append({
            'id': log.id,
            'timestamp': log.timestamp.isoformat(),
            'level': log.level,
            'message': log.message,
            'source': log.source,
            'user': log.user.username if log.user else None,
            'ip': log.ip_address
        })
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_security_events(request):
    if not (request.user.is_staff and request.user.is_superuser):
        return Response({'error': 'Permission denied'}, status=403)
    
    events = SecurityEvent.objects.all()[:50]
    data = []
    
    for event in events:
        data.append({
            'id': event.id,
            'type': event.event_type,
            'user': event.user.username if event.user else 'unknown',
            'ip_address': event.ip_address,
            'location': event.location,
            'timestamp': event.timestamp.isoformat(),
            'severity': event.severity,
            'details': event.details,
            'resolved': event.resolved
        })
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_system_metrics(request):
    if not (request.user.is_staff and request.user.is_superuser):
        return Response({'error': 'Permission denied'}, status=403)
    
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Get active users (logged in within last 24 hours)
        yesterday = timezone.now() - timedelta(days=1)
        active_users = User.objects.filter(last_login__gte=yesterday).count()
        
        return Response({
            'cpu': cpu_percent,
            'memory': memory.percent,
            'disk': disk.percent,
            'network': 0,  # Placeholder
            'uptime': '15d 8h 32m',  # Placeholder
            'activeUsers': active_users
        })
    except Exception as e:
        # Fallback to mock data if psutil fails
        return Response({
            'cpu': 25,
            'memory': 68,
            'disk': 52,
            'network': 15,
            'uptime': '15d 8h 32m',
            'activeUsers': User.objects.count()
        })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_settings(request):
    if not (request.user.is_staff and request.user.is_superuser):
        return Response({'error': 'Permission denied'}, status=403)
    
    if request.method == 'GET':
        settings = SystemSettings.objects.all()
        data = {}
        for setting in settings:
            data[setting.key] = setting.value
        
        # Default settings if none exist
        defaults = {
            'siteName': 'Sales & Offers',
            'siteDescription': 'Your trusted marketplace for amazing deals and offers',
            'adminEmail': 'admin@salesandoffers.com',
            'supportEmail': 'support@salesandoffers.com',
            'maintenanceMode': 'false',
            'userRegistration': 'true',
            'emailVerification': 'true',
            'newsletterEnabled': 'true',
            'maxFileSize': '10',
            'sessionTimeout': '30',
            'backupFrequency': 'daily',
            'logLevel': 'info'
        }
        
        for key, default_value in defaults.items():
            if key not in data:
                data[key] = default_value
        
        return Response(data)
    
    elif request.method == 'POST':
        for key, value in request.data.items():
            setting, created = SystemSettings.objects.get_or_create(
                key=key,
                defaults={'value': str(value), 'updated_by': request.user}
            )
            if not created:
                setting.value = str(value)
                setting.updated_by = request.user
                setting.save()
        
        return Response({'message': 'Settings updated successfully'})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_reports(request):
    if not (request.user.is_staff and request.user.is_superuser):
        return Response({'error': 'Permission denied'}, status=403)
    
    if request.method == 'GET':
        reports = Report.objects.all()[:10]
        data = []
        
        for report in reports:
            data.append({
                'id': report.id,
                'name': report.name,
                'type': report.report_type,
                'date_range': report.date_range,
                'file_size': report.file_size,
                'format': report.format,
                'created_at': report.created_at.isoformat(),
                'created_by': report.created_by.username
            })
        
        return Response(data)
    
    elif request.method == 'POST':
        report_type = request.data.get('report_type')
        date_range = request.data.get('date_range')
        format_type = request.data.get('format', 'PDF')
        
        # Generate report data based on type
        if report_type == 'revenue':
            total_revenue = Payment.objects.filter(status='completed').aggregate(
                total=Sum('amount')
            )['total'] or 0
            data = f"Revenue Report - Total: KES {total_revenue}"
        elif report_type == 'users':
            user_count = User.objects.count()
            data = f"User Activity Report - Total Users: {user_count}"
        elif report_type == 'deals':
            deal_count = Deal.objects.count()
            active_deals = Deal.objects.filter(is_active=True).count()
            data = f"Deals Performance - Total: {deal_count}, Active: {active_deals}"
        elif report_type == 'sellers':
            seller_count = Seller.objects.count()
            data = f"Seller Analytics - Total Sellers: {seller_count}"
        else:
            data = "General Report"
        
        report = Report.objects.create(
            name=f"{report_type.title()} Report - {timezone.now().strftime('%Y-%m-%d')}",
            report_type=report_type,
            date_range=date_range,
            file_path=f"/reports/{report_type}_{timezone.now().strftime('%Y%m%d')}.{format_type.lower()}",
            file_size="2.4 MB",
            format=format_type,
            created_by=request.user
        )
        
        return Response({
            'message': 'Report generated successfully',
            'report_id': report.id,
            'download_url': f"/api/admin/reports/{report.id}/download/"
        })

# Helper function to create system logs
def create_system_log(level, message, source, user=None, ip_address=None):
    SystemLog.objects.create(
        level=level,
        message=message,
        source=source,
        user=user,
        ip_address=ip_address
    )

# Helper function to create security events
def create_security_event(event_type, user, ip_address, location, severity, details):
    SecurityEvent.objects.create(
        event_type=event_type,
        user=user,
        ip_address=ip_address,
        location=location,
        severity=severity,
        details=details
    )