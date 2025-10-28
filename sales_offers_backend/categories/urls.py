from django.urls import path
from .views import CategoryListView, CategoryTreeView

urlpatterns = [
    path('', CategoryListView.as_view(), name='category-list'),
    path('tree/', CategoryTreeView.as_view(), name='category-tree'),
]