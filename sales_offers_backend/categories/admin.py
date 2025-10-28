from django.contrib import admin
from .models import Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_full_path', 'level', 'parent', 'is_active']
    list_filter = ['level', 'is_active', 'parent']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_active']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('parent')