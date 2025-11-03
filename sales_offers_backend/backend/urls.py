"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
# Trigger deployment - updated seller image upload functionality

# Main URL patterns
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/sellers/', include('sellers.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/deals/', include('deals.urls')),
    path('api/offers/', include('deals.urls')),  # Keep for backward compatibility
    path('api/payments/', include('payments.urls')),
    path('api/merchants/', include('merchants.urls')),
    path('api/newsletter/', include('newsletter.urls')),
    path('api/blog/', include('blog.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/verification/', include('verification.urls')),
    path('api/admin/', include('admin_system.urls')),
    path('api/categories/', include('categories.urls')),
    path('api/messages/', include('messaging.urls')),
]
