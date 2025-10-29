from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg
from .models import Review, Deal, Voucher
from sellers.models import Seller

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request):
    """Create a review for a deal"""
    try:
        voucher_id = request.data.get('voucher_id')
        deal_id = request.data.get('deal_id')
        rating = int(request.data.get('rating'))
        title = request.data.get('title')
        comment = request.data.get('comment')
        
        # Validate inputs
        if not all([voucher_id, deal_id, rating, title, comment]):
            return Response({'error': 'All fields are required'}, status=400)
        
        if rating < 1 or rating > 5:
            return Response({'error': 'Rating must be between 1 and 5'}, status=400)
        
        # Get voucher and verify ownership
        voucher = Voucher.objects.get(id=voucher_id, customer=request.user)
        deal = Deal.objects.get(id=deal_id)
        
        # Check if voucher is redeemed
        if voucher.status != 'redeemed':
            return Response({'error': 'Can only review redeemed vouchers'}, status=400)
        
        # Check if review already exists
        if Review.objects.filter(voucher=voucher, customer=request.user).exists():
            return Response({'error': 'Review already exists for this voucher'}, status=400)
        
        # Create review
        review = Review.objects.create(
            deal=deal,
            voucher=voucher,
            customer=request.user,
            rating=rating,
            title=title,
            comment=comment
        )
        
        # Update deal rating
        update_deal_rating(deal)
        
        return Response({
            'id': review.id,
            'rating': review.rating,
            'title': review.title,
            'comment': review.comment,
            'created_at': review.created_at
        })
        
    except Voucher.DoesNotExist:
        return Response({'error': 'Voucher not found'}, status=404)
    except Deal.DoesNotExist:
        return Response({'error': 'Deal not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def get_deal_reviews(request, deal_id):
    """Get all reviews for a deal"""
    try:
        deal = Deal.objects.get(id=deal_id)
        reviews = Review.objects.filter(deal=deal).select_related('customer').order_by('-created_at')
        
        review_data = []
        for review in reviews:
            review_data.append({
                'id': review.id,
                'rating': review.rating,
                'title': review.title,
                'comment': review.comment,
                'customer_name': review.customer.first_name or review.customer.username,
                'created_at': review.created_at
            })
        
        return Response(review_data)
        
    except Deal.DoesNotExist:
        return Response({'error': 'Deal not found'}, status=404)

def update_deal_rating(deal):
    """Update deal's average rating"""
    reviews = Review.objects.filter(deal=deal)
    if reviews.exists():
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
        deal.rating = round(avg_rating, 2)
        deal.save()
        
        # Also update seller rating
        seller = deal.seller
        seller_reviews = Review.objects.filter(deal__seller=seller)
        if seller_reviews.exists():
            seller_avg = seller_reviews.aggregate(Avg('rating'))['rating__avg']
            seller.rating = round(seller_avg, 2)
            seller.total_reviews = seller_reviews.count()
            seller.save()