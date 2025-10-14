"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiHeart, FiMessageCircle, FiUser, FiCalendar, FiTrendingUp, FiEdit3 } from "react-icons/fi";
import axios from "axios";
import Button from "../../components/Button";
import { API_BASE_URL } from "../../lib/api";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  image?: string;
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Token ${token}` } : {};
      const response = await axios.get(`${API_BASE_URL}/api/blog/posts/`, { headers });
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white py-20 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating Orbs */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float" />
          <div className="absolute top-20 right-20 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-300/15 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}} />
          <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-blue-300/20 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}} />
          
          {/* Moving Gradient Shapes */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-spin-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-2xl animate-spin-slow" style={{animationDelay: '3s', animationDirection: 'reverse'}} />
          </div>
          
          {/* Particle-like Elements */}
          <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-white/40 rounded-full animate-ping" style={{animationDelay: '0.5s'}} />
          <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-yellow-300/60 rounded-full animate-ping" style={{animationDelay: '1.5s'}} />
          <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-purple-300/50 rounded-full animate-ping" style={{animationDelay: '2.5s'}} />
          <div className="absolute bottom-1/3 left-2/3 w-1.5 h-1.5 bg-blue-300/50 rounded-full animate-ping" style={{animationDelay: '3.5s'}} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Share Your <span className="text-yellow-300">Stories</span>
          </h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Connect with our community through engaging blog posts. Share experiences, tips, and insights about deals and shopping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <Link href="/blog/create">
                <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <FiEdit3 className="w-5 h-5 mr-2" />
                  Write a Post
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  Login to Write
                </Button>
              </Link>
            )}
            <Link href="/blog/feed">
              <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                <FiTrendingUp className="w-5 h-5 mr-2" />
                My Feed
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--color-muted))]">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <FiEdit3 className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">No Posts Yet</h2>
            <p className="text-[rgb(var(--color-muted))] mb-6">Be the first to share your story!</p>
            {isLoggedIn && (
              <Link href="/blog/create">
                <Button variant="primary">Create First Post</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-[rgb(var(--color-border))] group"
              >
                {post.image && (
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                      {post.author.profile_picture ? (
                        <img src={post.author.profile_picture} alt={post.author.username} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[rgb(var(--color-text))] text-sm">
                        {post.author.first_name} {post.author.last_name} || @{post.author.username}
                      </p>
                      <div className="flex items-center text-xs text-[rgb(var(--color-muted))]">
                        <FiCalendar className="w-3 h-3 mr-1" />
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-bold text-[rgb(var(--color-text))] mb-3 hover:text-purple-600 dark:hover:text-purple-400 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-[rgb(var(--color-muted))] mb-4 line-clamp-3">
                    {truncateContent(post.content)}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--color-border))]">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-[rgb(var(--color-muted))]">
                        <FiHeart className={`w-4 h-4 ${post.is_liked ? 'text-red-500 fill-current' : ''}`} />
                        <span className="text-sm">{post.likes_count}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[rgb(var(--color-muted))]">
                        <FiMessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.comments_count}</span>
                      </div>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm">Read More</Button>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}