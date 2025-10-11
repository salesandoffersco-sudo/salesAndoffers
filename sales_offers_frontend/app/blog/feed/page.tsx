"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiHeart, FiMessageCircle, FiUser, FiCalendar, FiTrendingUp, FiUsers } from "react-icons/fi";
import axios from "axios";
import Button from "../../../components/Button";
import { API_BASE_URL } from "../../../lib/api";

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

export default function BlogFeedPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/blog/feed/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching feed:", error);
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/blog/posts/${postId}/like/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, is_liked: response.data.liked, likes_count: response.data.likes_count }
          : post
      ));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <FiTrendingUp className="text-3xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Your Feed</h1>
              <p className="text-xl opacity-90">Posts from people you follow</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--color-muted))]">Loading your feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <FiUsers className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Your Feed is Empty</h2>
            <p className="text-[rgb(var(--color-muted))] mb-6">Follow other users to see their posts in your feed</p>
            <Link href="/blog">
              <Button variant="primary">Discover Posts</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg border border-[rgb(var(--color-border))] overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                      {post.author.profile_picture ? (
                        <img src={post.author.profile_picture} alt={post.author.username} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Link href={`/blog/profile/${post.author.id}`} className="font-semibold text-[rgb(var(--color-text))] hover:text-purple-600">
                        {post.author.first_name} {post.author.last_name}
                      </Link>
                      <p className="text-sm text-[rgb(var(--color-muted))]">@{post.author.username}</p>
                      <div className="flex items-center text-xs text-[rgb(var(--color-muted))] mt-1">
                        <FiCalendar className="w-3 h-3 mr-1" />
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-3 hover:text-purple-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  {post.image && (
                    <div className="mb-4 rounded-xl overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-64 object-cover" />
                    </div>
                  )}

                  <p className="text-[rgb(var(--color-muted))] mb-4 leading-relaxed">
                    {truncateContent(post.content)}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--color-border))]">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-2 transition-colors ${
                          post.is_liked ? 'text-red-500' : 'text-[rgb(var(--color-muted))] hover:text-red-500'
                        }`}
                      >
                        <FiHeart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                        <span>{post.likes_count}</span>
                      </button>
                      <Link href={`/blog/${post.slug}#comments`} className="flex items-center space-x-2 text-[rgb(var(--color-muted))] hover:text-blue-500 transition-colors">
                        <FiMessageCircle className="w-5 h-5" />
                        <span>{post.comments_count}</span>
                      </Link>
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