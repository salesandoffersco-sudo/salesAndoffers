from django.urls import path
from .views import register, login, google_auth, logout

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('google/', google_auth, name='google_auth'),
]