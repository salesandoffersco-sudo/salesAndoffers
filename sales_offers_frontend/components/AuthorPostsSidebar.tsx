"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiUser, FiCalendar, FiHeart, FiMessageCircle } from "react-icons/fi";
import axios from "axios";
import { API_BASE_URL } from "../lib/api";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  image?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

interface AuthorPostsSidebarProps {
  authorId: number;
  currentSlug: string;
}

export default function AuthorPostsSidebar({ authorId, currentSlug }: AuthorPostsSidebarProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthorPosts();
  }, [authorId]);

  const fetchAuthorPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blog/users/${authorId}/posts/`);
      // Filter out current post and limit to 6
      const filteredPosts = response.data
        .filter((post: BlogPost) => post.slug !== currentSlug)
        .slice(0, 6);
      setPosts(filteredPosts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching author posts:", error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const truncateTitle = (title: string, maxLength: number = 60) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="bg-[rgb(var(--color-card))] rounded-2xl p-6 border border-[rgb(var(--color-border))] sticky top-24">
        <div className="h-6 bg-[rgb(var(--color-bg))] rounded animate-pulse mb-4"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <div className="w-16 h-16 bg-[rgb(var(--color-bg))] rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[rgb(var(--color-bg))] rounded animate-pulse"></div>
                <div className="h-3 bg-[rgb(var(--color-bg))] rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="bg-[rgb(var(--color-card))] rounded-2xl p-6 border border-[rgb(var(--color-border))] sticky top-24">
      <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-6">
        More from this author
      </h3>
      
      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
            <div className="flex space-x-3 p-3 rounded-xl hover:bg-[rgb(var(--color-bg))] transition-colors">
              <div className="flex-shrink-0">
                {post.image ? (
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-[rgb(var(--color-muted))]">
                      {post.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[rgb(var(--color-text))] text-sm leading-tight mb-2 group-hover:text-purple-600 transition-colors">
                  {truncateTitle(post.title)}
                </h4>
                
                <div className="flex items-center justify-between text-xs text-[rgb(var(--color-muted))]">
                  <div className="flex items-center space-x-1">
                    <FiCalendar className="w-3 h-3" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <FiHeart className="w-3 h-3" />
                      <span>{post.likes_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiMessageCircle className="w-3 h-3" />
                      <span>{post.comments_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}