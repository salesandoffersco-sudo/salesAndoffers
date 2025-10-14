from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import BlogPost, BlogLike, BlogComment
from sellers.models import Seller, SubscriptionPlan, Subscription

User = get_user_model()

class BlogPostAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.seller = Seller.objects.create(
            user=self.user,
            business_name='Test Business',
            business_description='Test business description',
            address='Test Address'
        )
        
        # Create subscription plans
        self.basic_plan = SubscriptionPlan.objects.create(
            name='Basic',
            price_ksh=0,
            duration_days=30,
            max_offers=1,
            features={'blog_posts': 2}
        )
        self.pro_plan = SubscriptionPlan.objects.create(
            name='Pro',
            price_ksh=2999,
            duration_days=30,
            max_offers=50,
            features={'blog_posts': 20}
        )
        
    def test_create_blog_post_success(self):
        """Test successful blog post creation"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'title': 'Test Blog Post',
            'content': 'This is a test blog post content.',
            'image': 'https://example.com/image.jpg'
        }
        
        response = self.client.post('/api/blog/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BlogPost.objects.count(), 1)
        
        blog_post = BlogPost.objects.first()
        self.assertEqual(blog_post.title, 'Test Blog Post')
        self.assertEqual(blog_post.author, self.user)
        self.assertTrue(blog_post.slug)
        
    def test_create_blog_post_without_auth(self):
        """Test blog post creation without authentication"""
        data = {
            'title': 'Test Blog Post',
            'content': 'This is a test blog post content.'
        }
        
        response = self.client.post('/api/blog/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
    def test_create_blog_post_subscription_limit(self):
        """Test blog post creation with subscription limits"""
        self.client.force_authenticate(user=self.user)
        
        # Create subscription with basic plan (2 posts limit)
        Subscription.objects.create(
            user=self.user,
            plan=self.basic_plan,
            status='active'
        )
        
        # Create 2 posts (reaching limit)
        for i in range(2):
            BlogPost.objects.create(
                author=self.user,
                title=f'Post {i+1}',
                content=f'Content {i+1}'
            )
        
        # Try to create 3rd post
        data = {
            'title': 'Third Post',
            'content': 'This should fail due to limit.'
        }
        
        response = self.client.post('/api/blog/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Check if the error message contains subscription information
        error_message = str(response.data)
        self.assertTrue('subscribe' in error_message.lower() or 'limit' in error_message.lower())
        
    def test_create_blog_post_pro_plan(self):
        """Test blog post creation with Pro plan (higher limit)"""
        self.client.force_authenticate(user=self.user)
        
        # Create subscription with pro plan (20 posts limit)
        Subscription.objects.create(
            user=self.user,
            plan=self.pro_plan,
            status='active'
        )
        
        # Create 3 posts (should succeed with Pro plan)
        for i in range(3):
            data = {
                'title': f'Pro Post {i+1}',
                'content': f'Pro content {i+1}'
            }
            response = self.client.post('/api/blog/posts/', data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        self.assertEqual(BlogPost.objects.count(), 3)
        
    def test_blog_post_slug_generation(self):
        """Test automatic slug generation"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'title': 'My Amazing Blog Post!',
            'content': 'Content here'
        }
        
        response = self.client.post('/api/blog/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        blog_post = BlogPost.objects.first()
        self.assertEqual(blog_post.slug, 'my-amazing-blog-post')
        
    def test_blog_post_duplicate_slug_handling(self):
        """Test handling of duplicate slugs"""
        self.client.force_authenticate(user=self.user)
        
        # Create first post
        data1 = {
            'title': 'Same Title',
            'content': 'First content'
        }
        response1 = self.client.post('/api/blog/posts/', data1)
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Create second post with same title
        data2 = {
            'title': 'Same Title',
            'content': 'Second content'
        }
        response2 = self.client.post('/api/blog/posts/', data2)
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)
        
        posts = BlogPost.objects.all()
        self.assertEqual(posts[0].slug, 'same-title')
        self.assertEqual(posts[1].slug, 'same-title-2')
        
    def test_get_blog_posts_list(self):
        """Test retrieving blog posts list"""
        # Create test posts
        BlogPost.objects.create(
            author=self.user,
            title='Public Post',
            content='Public content',
            is_published=True
        )
        BlogPost.objects.create(
            author=self.user,
            title='Draft Post',
            content='Draft content',
            is_published=False
        )
        
        response = self.client.get('/api/blog/posts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Only published posts
        
    def test_get_blog_post_detail(self):
        """Test retrieving single blog post"""
        post = BlogPost.objects.create(
            author=self.user,
            title='Detail Post',
            content='Detail content'
        )
        
        response = self.client.get(f'/api/blog/posts/{post.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Detail Post')
        
    def test_blog_post_like_functionality(self):
        """Test blog post like/unlike"""
        self.client.force_authenticate(user=self.user)
        
        post = BlogPost.objects.create(
            author=self.user,
            title='Likeable Post',
            content='Like this post'
        )
        
        # Like the post
        response = self.client.post(f'/api/blog/posts/{post.id}/like/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['liked'])
        self.assertEqual(response.data['likes_count'], 1)
        
        # Unlike the post
        response = self.client.post(f'/api/blog/posts/{post.id}/like/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['liked'])
        self.assertEqual(response.data['likes_count'], 0)
        
    def test_blog_post_comment_functionality(self):
        """Test blog post commenting"""
        self.client.force_authenticate(user=self.user)
        
        post = BlogPost.objects.create(
            author=self.user,
            title='Commentable Post',
            content='Comment on this post'
        )
        
        # Add comment
        comment_data = {'content': 'Great post!'}
        response = self.client.post(f'/api/blog/posts/{post.id}/comments/', comment_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BlogComment.objects.count(), 1)
        
        # Get comments
        response = self.client.get(f'/api/blog/posts/{post.id}/comments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
    def test_blog_post_validation(self):
        """Test blog post validation"""
        self.client.force_authenticate(user=self.user)
        
        # Test empty title
        data = {
            'title': '',
            'content': 'Some content'
        }
        response = self.client.post('/api/blog/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test empty content
        data = {
            'title': 'Some title',
            'content': ''
        }
        response = self.client.post('/api/blog/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class BlogModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_blog_post_str_method(self):
        """Test BlogPost string representation"""
        post = BlogPost.objects.create(
            author=self.user,
            title='Test Post',
            content='Test content'
        )
        self.assertEqual(str(post), 'Test Post')
        
    def test_blog_post_ordering(self):
        """Test BlogPost ordering by creation date"""
        post1 = BlogPost.objects.create(
            author=self.user,
            title='First Post',
            content='First content'
        )
        post2 = BlogPost.objects.create(
            author=self.user,
            title='Second Post',
            content='Second content'
        )
        
        posts = list(BlogPost.objects.all())
        self.assertEqual(posts[0], post2)  # Most recent first
        self.assertEqual(posts[1], post1)