from django.urls import path
from .views import (
    BlogPostListView, BlogPostDetailView, UserBlogPostsView, BlogFeedView,
    toggle_like, post_comments, toggle_follow, user_stats, categories_list, RecommendedPostsView
)

urlpatterns = [
    path('posts/', BlogPostListView.as_view(), name='blog-posts'),
    path('posts/<slug:slug>/', BlogPostDetailView.as_view(), name='blog-post-detail'),
    path('posts/<slug:slug>/recommended/', RecommendedPostsView.as_view(), name='recommended-posts'),
    path('posts/<int:post_id>/like/', toggle_like, name='toggle-like'),
    path('posts/<int:post_id>/comments/', post_comments, name='post-comments'),
    path('users/<int:user_id>/posts/', UserBlogPostsView.as_view(), name='user-posts'),
    path('users/<int:user_id>/follow/', toggle_follow, name='toggle-follow'),
    path('users/<int:user_id>/stats/', user_stats, name='user-stats'),
    path('categories/', categories_list, name='blog-categories'),
    path('feed/', BlogFeedView.as_view(), name='blog-feed'),
]