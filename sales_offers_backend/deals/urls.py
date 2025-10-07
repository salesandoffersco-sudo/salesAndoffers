from django.urls import path
from .views import DealListView

urlpatterns = [
    path('', DealListView.as_view(), name='deal-list'),
]