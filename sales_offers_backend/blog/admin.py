from django.contrib import admin
from .models import BlogPost, BlogLike, BlogComment, BlogFollow

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'created_at', 'is_published']
    list_filter = ['is_published', 'created_at']
    search_fields = ['title', 'content', 'author__username']
    prepopulated_fields = {'slug': ('title',)}

@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'created_at']
    list_filter = ['created_at']

@admin.register(BlogFollow)
class BlogFollowAdmin(admin.ModelAdmin):
    list_display = ['follower', 'following', 'created_at']