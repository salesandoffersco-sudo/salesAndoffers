from rest_framework import generics
from rest_framework.response import Response
from .models import Category
from .serializers import CategorySerializer

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True).order_by('level', 'name')
    serializer_class = CategorySerializer

class CategoryTreeView(generics.GenericAPIView):
    def get(self, request):
        # Get root categories (Services and Goods)
        root_categories = Category.objects.filter(parent=None, is_active=True).order_by('name')
        data = []
        
        for root in root_categories:
            category_data = {
                'id': root.id,
                'name': root.name,
                'slug': root.slug,
                'level': root.level,
                'children': self.get_children(root)
            }
            data.append(category_data)
        
        return Response(data)
    
    def get_children(self, category):
        children = category.children.filter(is_active=True).order_by('name')
        result = []
        
        for child in children:
            child_data = {
                'id': child.id,
                'name': child.name,
                'slug': child.slug,
                'level': child.level,
                'children': self.get_children(child)
            }
            result.append(child_data)
        
        return result