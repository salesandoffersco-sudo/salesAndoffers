"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FiHeart, FiMessageCircle, FiUser, FiCalendar, FiSend, FiUserPlus } from "react-icons/fi";
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

interface Comment {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
  content: string;
  created_at: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    if (params.slug) {
      fetchPost();
      fetchComments();
    }
  }, [params.slug]);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Token ${token}` } : {};
      const response = await axios.get(`${API_BASE_URL}/api/blog/posts/${params.slug}/`, { headers });
      setPost(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching post:", error);
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blog/posts/${post?.id || 0}/comments/`);
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn || !post) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/blog/posts/${post.id}/like/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      setPost({ ...post, is_liked: response.data.liked, likes_count: response.data.likes_count });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isLoggedIn || !post) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/blog/posts/${post.id}/comments/`,
        { content: newComment },
        { headers: { Authorization: `Token ${token}` } }
      );
      setComments([response.data, ...comments]);
      setNewComment("");
      setPost({ ...post, comments_count: post.comments_count + 1 });
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Post Not Found</h1>
          <Link href="/blog">
            <Button variant="primary">Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg border border-[rgb(var(--color-border))] overflow-hidden">
          {post.image && (
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                  {post.author.profile_picture ? (
                    <img src={post.author.profile_picture} alt={post.author.username} className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
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
              <Link href={`/blog/profile/${post.author.id}`}>
                <Button variant="outline" size="sm">
                  <FiUserPlus className="w-4 h-4 mr-2" />
                  Follow
                </Button>
              </Link>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[rgb(var(--color-text))] mb-6">
              {post.title}
            </h1>

            <div className="prose prose-lg max-w-none text-[rgb(var(--color-text))] mb-8">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="flex items-center justify-between py-6 border-t border-[rgb(var(--color-border))]">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  disabled={!isLoggedIn}
                  className={`flex items-center space-x-2 transition-colors ${
                    post.is_liked ? 'text-red-500' : 'text-[rgb(var(--color-muted))] hover:text-red-500'
                  } ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiHeart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                  <span>{post.likes_count}</span>
                </button>
                <div className="flex items-center space-x-2 text-[rgb(var(--color-muted))]">
                  <FiMessageCircle className="w-5 h-5" />
                  <span>{post.comments_count}</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8 bg-[rgb(var(--color-card))] rounded-2xl shadow-lg border border-[rgb(var(--color-border))] p-8">
          <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-6">
            Comments ({comments.length})
          </h2>

          {isLoggedIn && (
            <form onSubmit={handleComment} className="mb-8">
              <div className="flex space-x-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  className="flex-1 px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <Button type="submit" variant="primary" disabled={!newComment.trim()}>
                  <FiSend className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {comment.user.profile_picture ? (
                    <img src={comment.user.profile_picture} alt={comment.user.username} className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-[rgb(var(--color-bg))] rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-[rgb(var(--color-text))]">
                        {comment.user.first_name} {comment.user.last_name}
                      </span>
                      <span className="text-sm text-[rgb(var(--color-muted))]">
                        @{comment.user.username}
                      </span>
                      <span className="text-xs text-[rgb(var(--color-muted))]">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-[rgb(var(--color-text))]">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {comments.length === 0 && (
            <div className="text-center py-8 text-[rgb(var(--color-muted))]">
              <FiMessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}