from django.contrib import admin
from .models import VerificationRequest, Ticket, TicketMessage, AdminNotification

@admin.register(VerificationRequest)
class VerificationRequestAdmin(admin.ModelAdmin):
    list_display = ['seller', 'status', 'years_in_business', 'submitted_at', 'reviewed_at']
    list_filter = ['status', 'submitted_at']
    search_fields = ['seller__business_name', 'seller__user__username']
    readonly_fields = ['submitted_at']

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'user', 'category', 'priority', 'status', 'created_at']
    list_filter = ['category', 'priority', 'status', 'created_at']
    search_fields = ['title', 'user__username', 'user__email']

@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ['ticket', 'user', 'is_internal', 'created_at']
    list_filter = ['is_internal', 'created_at']

@admin.register(AdminNotification)
class AdminNotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'notification_type', 'target_audience', 'is_active', 'created_at']
    list_filter = ['notification_type', 'target_audience', 'is_active', 'created_at']
    search_fields = ['title', 'message']