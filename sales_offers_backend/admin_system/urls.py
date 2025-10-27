from django.urls import path
from . import views

urlpatterns = [
    path('logs/', views.admin_logs, name='admin_logs'),
    path('security/', views.admin_security_events, name='admin_security'),
    path('system/', views.admin_system_metrics, name='admin_system'),
    path('settings/', views.admin_settings, name='admin_settings'),
    path('reports/', views.admin_reports, name='admin_reports'),
]