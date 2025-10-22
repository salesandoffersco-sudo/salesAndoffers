from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import BlogPost, BlogLike, BlogComment, BlogFollow
from .serializers import BlogPostSerializer, BlogCommentSerializer, BlogFollowSerializer
from accounts.models import User

class BlogPostListView(generics.ListCreateAPIView):
    serializer_class = BlogPostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return BlogPost.objects.filter(is_published=True).select_related('author').prefetch_related('likes', 'comments')
    
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

class UserBlogPostsView(generics.ListAPIView):
    serializer_class = BlogPostSerializer
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return BlogPost.objects.filter(author_id=user_id, is_published=True)

class BlogFeedView(generics.ListAPIView):
    serializer_class = BlogPostSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        following_users = BlogFollow.objects.filter(follower=self.request.user).values_list('following', flat=True)
        return BlogPost.objects.filter(Q(author__in=following_users) | Q(author=self.request.user), is_published=True)

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
            comments = post.comments.all()
            serializer = BlogCommentSerializer(comments, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = BlogCommentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user, post=post)
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