"use client";

import { useState, useEffect } from "react";
import { FiFilter, FiX, FiChevronDown, FiChevronRight } from "react-icons/fi";
import * as Icons from "react-icons/fi";
import Button from "./Button";
import { API_BASE_URL } from "../lib/api";
import axios from "axios";

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  posts_count: number;
  subcategories: BlogSubcategory[];
}

interface BlogSubcategory {
  id: number;
  name: string;
  slug: string;
  posts_count: number;
}

interface BlogFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  selectedSubcategory: string;
  selectedSort: string;
  onFilterChange: (filters: {
    category: string;
    subcategory: string;
    sort: string;
  }) => void;
}

export default function BlogFilterSidebar({
  isOpen,
  onClose,
  selectedCategory,
  selectedSubcategory,
  selectedSort,
  onFilterChange,
}: BlogFilterSidebarProps) {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blog/categories/`);
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleFilterChange = (type: string, value: string) => {
    const newFilters = {
      category: type === 'category' ? value : selectedCategory,
      subcategory: type === 'subcategory' ? value : (type === 'category' ? '' : selectedSubcategory),
      sort: type === 'sort' ? value : selectedSort,
    };
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({ category: '', subcategory: '', sort: 'newest' });
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.FiTag;
    return IconComponent;
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-80 bg-[rgb(var(--color-card))] border-r border-[rgb(var(--color-border))] z-50 lg:z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } rounded-tr-2xl lg:rounded-tr-none lg:rounded-tl-2xl`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <FiFilter className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-[rgb(var(--color-text))]">
                Filters
              </h2>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))]"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Sort Options */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-[rgb(var(--color-text))] mb-3">
              Sort By
            </h3>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('sort', option.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedSort === option.value
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-bg))]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-[rgb(var(--color-text))] mb-3">
              Categories
            </h3>
            
            {loading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-[rgb(var(--color-bg))] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {/* All Categories Option */}
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
                    !selectedCategory
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-bg))]'
                  }`}
                >
                  <Icons.FiGrid className="w-4 h-4 mr-2" />
                  All Categories
                </button>

                {categories.map((category) => {
                  const IconComponent = getIconComponent(category.icon);
                  const isExpanded = expandedCategories.has(category.id);
                  const isSelected = selectedCategory === category.slug;

                  return (
                    <div key={category.id}>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleFilterChange('category', category.slug)}
                          className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
                            isSelected
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                              : 'text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-bg))]'
                          }`}
                        >
                          <IconComponent 
                            className="w-4 h-4 mr-2" 
                            style={{ color: category.color }}
                          />
                          <span className="flex-1">{category.name}</span>
                          <span className="text-xs bg-[rgb(var(--color-bg))] px-2 py-1 rounded-full">
                            {category.posts_count}
                          </span>
                        </button>
                        
                        {category.subcategories.length > 0 && (
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="p-2 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))]"
                          >
                            {isExpanded ? (
                              <FiChevronDown className="w-4 h-4" />
                            ) : (
                              <FiChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Subcategories */}
                      {isExpanded && category.subcategories.length > 0 && (
                        <div className="ml-6 mt-1 space-y-1">
                          {category.subcategories.map((subcategory) => (
                            <button
                              key={subcategory.id}
                              onClick={() => handleFilterChange('subcategory', subcategory.slug)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                selectedSubcategory === subcategory.slug
                                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                  : 'text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-bg))]'
                              }`}
                            >
                              <span>{subcategory.name}</span>
                              <span className="text-xs bg-[rgb(var(--color-bg))] px-2 py-1 rounded-full">
                                {subcategory.posts_count}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {(selectedCategory || selectedSubcategory || selectedSort !== 'newest') && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </div>
    </>
  );
}