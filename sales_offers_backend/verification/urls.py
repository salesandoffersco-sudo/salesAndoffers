from django.urls import path
from . import views

urlpatterns = [
    # Verification
    path('request/', views.verification_request, name='verification-request'),
    path('admin/requests/', views.admin_verification_requests, name='admin-verification-requests'),
    path('admin/requests/<int:request_id>/', views.update_verification_status, name='update-verification-status'),
    
    # Tickets
    path('tickets/', views.tickets, name='tickets'),
    path('tickets/<int:ticket_id>/messages/', views.add_ticket_message, name='add-ticket-message'),
    path('admin/tickets/', views.admin_tickets, name='admin-tickets'),
    path('admin/tickets/<int:ticket_id>/', views.update_ticket_status, name='update-ticket-status'),
    
    # Notifications
    path('admin/notifications/', views.admin_notifications, name='admin-notifications'),
    path('admin/notifications/<int:notification_id>/', views.manage_notification, name='manage-notification'),
]