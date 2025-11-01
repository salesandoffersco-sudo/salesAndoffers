from rest_framework import serializers
from .models import BlogPost, BlogLike, BlogComment, BlogFollow, BlogCategory, BlogSubcategory
from accounts.serializers import UserSerializer

class BlogCategorySerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'color', 'posts_count']
    
    def get_posts_count(self, obj):
        return obj.posts.filter(is_published=True).count()

class BlogSubcategorySerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogSubcategory
        fields = ['id', 'name', 'slug', 'description', 'posts_count']
    
    def get_posts_count(self, obj):
        return obj.posts.filter(is_published=True).count()

class BlogCategoryWithSubsSerializer(serializers.ModelSerializer):
    subcategories = BlogSubcategorySerializer(many=True, read_only=True)
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'color', 'posts_count', 'subcategories']
    
    def get_posts_count(self, obj):
        return obj.posts.filter(is_published=True).count()

class BlogPostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = BlogCategorySerializer(read_only=True)
    subcategory = BlogSubcategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    subcategory_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'content', 'image', 'category', 'subcategory', 'category_id', 'subcategory_id', 
                 'author', 'views_count', 'created_at', 'updated_at', 'likes_count', 'comments_count', 'is_liked', 'reading_time']
        read_only_fields = ['slug', 'author', 'created_at', 'updated_at', 'views_count']
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_reading_time(self, obj):
        # Calculate reading time based on word count (200 words per minute)
        import re
        text_content = re.sub(r'<[^>]*>', '', obj.content)
        word_count = len(text_content.split())
        return max(1, round(word_count / 200))

class BlogCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    parent_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = BlogComment
        fields = ['id', 'user', 'content', 'parent_id', 'replies', 'created_at']
        read_only_fields = ['user', 'created_at']
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return BlogCommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []

class BlogFollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)
    
    class Meta:
        model = BlogFollow
        fields = ['id', 'follower', 'following', 'created_at']