from django.urls import path
from .views import register, login, google_auth, logout, forgot_password, reset_password

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('google/', google_auth, name='google_auth'),
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('reset-password/', reset_password, name='reset_password'),
]