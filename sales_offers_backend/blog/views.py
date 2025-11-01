from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.db.models import Count, Q, F
from django.utils import timezone
from datetime import timedelta
from .models import BlogPost, BlogLike, BlogComment, BlogFollow, BlogCategory, BlogSubcategory
from .serializers import BlogPostSerializer, BlogCommentSerializer, BlogFollowSerializer, BlogCategoryWithSubsSerializer
from accounts.models import User

class BlogPostListView(generics.ListCreateAPIView):
    serializer_class = BlogPostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = BlogPost.objects.filter(is_published=True).select_related('author', 'category', 'subcategory').prefetch_related('likes', 'comments')
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Filter by subcategory
        subcategory = self.request.query_params.get('subcategory')
        if subcategory:
            queryset = queryset.filter(subcategory__slug=subcategory)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(content__icontains=search) |
                Q(author__first_name__icontains=search) |
                Q(author__last_name__icontains=search)
            )
        
        # Sort options
        sort = self.request.query_params.get('sort', 'newest')
        if sort == 'popular':
            queryset = queryset.annotate(likes_count=Count('likes')).order_by('-likes_count', '-created_at')
        elif sort == 'trending':
            # Posts with most engagement in last 7 days
            week_ago = timezone.now() - timedelta(days=7)
            queryset = queryset.filter(created_at__gte=week_ago).annotate(
                engagement=Count('likes') + Count('comments')
            ).order_by('-engagement', '-created_at')
        else:  # newest
            queryset = queryset.order_by('-created_at')
        
        return queryset
    
    def perform_create(self, serializer):
        # Check subscription limits for blog posts
        if self.request.user.is_authenticated:
            subscription = getattr(self.request.user, 'current_subscription', None)
            if subscription:
                features = subscription.plan.features
                max_posts = features.get('blog_posts', 2) if isinstance(features, dict) else 2
                
                if max_posts != -1:
                    current_posts = BlogPost.objects.filter(author=self.request.user).count()
                    if current_posts >= max_posts:
                        from rest_framework.exceptions import ValidationError
                        raise ValidationError(f'You have reached your plan limit of {max_posts} blog posts. Upgrade your plan to create more.')
            else:
                # No subscription - limit to 2 posts
                current_posts = BlogPost.objects.filter(author=self.request.user).count()
                if current_posts >= 2:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError('Subscribe to a plan to create more blog posts.')
        
        serializer.save(author=self.request.user)

class BlogPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BlogPost.objects.filter(is_published=True)
    serializer_class = BlogPostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        BlogPost.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class UserBlogPostsView(generics.ListAPIView):
    serializer_class = BlogPostSerializer
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return BlogPost.objects.filter(
            author_id=user_id, 
            is_published=True
        ).select_related('author', 'category', 'subcategory').prefetch_related('likes', 'comments').order_by('-created_at')

class BlogFeedView(generics.ListAPIView):
    serializer_class = BlogPostSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Get users the current user follows
        following_users = BlogFollow.objects.filter(follower=user).values_list('following', flat=True)
        
        # Get posts from followed users
        followed_posts = BlogPost.objects.filter(author__in=following_users, is_published=True)
        
        # Get posts user has liked (for recommendation)
        liked_posts = BlogPost.objects.filter(likes__user=user, is_published=True)
        
        # Get categories from liked posts for recommendations
        liked_categories = liked_posts.values_list('category', flat=True).distinct()
        
        # Recommendation algorithm: posts from same categories as liked posts
        recommended_posts = BlogPost.objects.filter(
            category__in=liked_categories, 
            is_published=True
        ).exclude(author=user).exclude(likes__user=user)
        
        # Combine and prioritize: followed > recommended > trending
        if followed_posts.exists():
            # Prioritize followed users' posts
            queryset = followed_posts.annotate(
                priority=Count('likes') + Count('comments')
            ).order_by('-priority', '-created_at')
        else:
            # If not following anyone, show recommended + trending
            week_ago = timezone.now() - timedelta(days=7)
            trending_posts = BlogPost.objects.filter(
                created_at__gte=week_ago, 
                is_published=True
            ).annotate(
                engagement=Count('likes') + Count('comments')
            ).order_by('-engagement', '-created_at')[:20]
            
            # Combine recommended and trending
            queryset = (recommended_posts[:10].union(trending_posts[:10])).order_by('-created_at')
        
        return queryset.select_related('author', 'category', 'subcategory').prefetch_related('likes', 'comments')

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def toggle_like(request, post_id):
    try:
        post = BlogPost.objects.get(id=post_id)
        like, created = BlogLike.objects.get_or_create(user=request.user, post=post)
        
        if not created:
            like.delete()
            return Response({'liked': False, 'likes_count': post.likes.count()})
        
        return Response({'liked': True, 'likes_count': post.likes.count()})
    except BlogPost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def post_comments(request, post_id):
    if post_id <= 0:
        return Response({'error': 'Invalid post ID'}, status=400)
    
    try:
        post = BlogPost.objects.get(id=post_id)
        
        if request.method == 'GET':
            # Get only top-level comments (no parent)
            comments = post.comments.filter(parent__isnull=True)
            serializer = BlogCommentSerializer(comments, many=True, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = BlogCommentSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                parent_id = serializer.validated_data.get('parent_id')
                parent = None
                if parent_id:
                    try:
                        parent = BlogComment.objects.get(id=parent_id, post=post)
                    except BlogComment.DoesNotExist:
                        return Response({'error': 'Parent comment not found'}, status=400)
                
                serializer.save(user=request.user, post=post, parent=parent)
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)
    except BlogPost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def toggle_follow(request, user_id):
    try:
        user_to_follow = User.objects.get(id=user_id)
        if user_to_follow == request.user:
            return Response({'error': 'Cannot follow yourself'}, status=400)
        
        follow, created = BlogFollow.objects.get_or_create(follower=request.user, following=user_to_follow)
        
        if not created:
            follow.delete()
            return Response({'following': False})
        
        return Response({'following': True})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['GET'])
def user_stats(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        posts_count = BlogPost.objects.filter(author=user, is_published=True).count()
        followers_count = user.followers.count()
        following_count = user.following.count()
        
        is_following = False
        if request.user.is_authenticated:
            is_following = BlogFollow.objects.filter(follower=request.user, following=user).exists()
        
        return Response({
            'posts_count': posts_count,
            'followers_count': followers_count,
            'following_count': following_count,
            'is_following': is_following
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['GET'])
def categories_list(request):
    categories = BlogCategory.objects.prefetch_related('subcategories')
    serializer = BlogCategoryWithSubsSerializer(categories, many=True)
    return Response(serializer.data)

class RecommendedPostsView(generics.ListAPIView):
    serializer_class = BlogPostSerializer
    
    def get_queryset(self):
        # Get current post to exclude it and find similar posts
        current_slug = self.kwargs.get('slug')
        try:
            current_post = BlogPost.objects.get(slug=current_slug)
        except BlogPost.DoesNotExist:
            return BlogPost.objects.none()
        
        # Get posts from same category/subcategory or same author
        queryset = BlogPost.objects.filter(
            Q(category=current_post.category) | 
            Q(subcategory=current_post.subcategory) |
            Q(author=current_post.author),
            is_published=True
        ).exclude(id=current_post.id).annotate(
            engagement=Count('likes') + Count('comments')
        ).order_by('-engagement', '-created_at')[:6]
        
        return queryset.select_related('author', 'category', 'subcategory').prefetch_related('likes', 'comments')