"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FiHeart, FiMessageCircle, FiUser, FiCalendar, FiSend, FiUserPlus, FiArrowLeft, FiShare2, FiBookmark, FiMoreHorizontal, FiClock, FiEye, FiChevronDown, FiChevronRight, FiCornerDownRight } from "react-icons/fi";
import axios from "axios";
import Button from "../../../components/Button";
import ProfilePicture from "../../../components/ProfilePicture";
import VerificationBadge from "../../../components/VerificationBadge";
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
    is_verified?: boolean;
  };
  created_at: string;
  updated_at?: string;
  likes_count: number;
  comments_count: number;
  views_count?: number;
  is_liked: boolean;
  reading_time?: number;
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
  replies?: Comment[];
  parent_id?: number;
}

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  useEffect(() => {
    if (post?.id) {
      fetchComments();
    }
  }, [post?.id]);

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
    if (!post?.id) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blog/posts/${post.id}/comments/`);
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

  const handleReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyContent.trim() || !isLoggedIn || !post) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/blog/posts/${post.id}/comments/`,
        { content: replyContent, parent_id: parentId },
        { headers: { Authorization: `Token ${token}` } }
      );
      
      // Add reply to the parent comment
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [response.data, ...(comment.replies || [])]
          };
        }
        return comment;
      }));
      
      setReplyContent("");
      setReplyingTo(null);
      setPost({ ...post, comments_count: post.comments_count + 1 });
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const toggleReplies = (commentId: number) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const renderContent = (content: string) => {
    return {
      __html: content
        .replace(/\n/g, '<br>')
        .replace(/<p><br><\/p>/g, '<p>&nbsp;</p>')
    };
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
      {/* Navigation Bar */}
      <div className="sticky top-0 z-40 bg-[rgb(var(--color-card))]/80 backdrop-blur-md border-b border-[rgb(var(--color-border))]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="flex items-center space-x-2 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] transition-colors">
              <FiArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Blog</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <FiShare2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <FiBookmark className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <FiMoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image */}
        {post.image && (
          <div className="aspect-[21/9] bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-3xl overflow-hidden mb-8 shadow-2xl">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <article className="bg-[rgb(var(--color-card))] rounded-3xl shadow-xl border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="p-8 lg:p-12">
            {/* Article Header */}
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-[rgb(var(--color-text))] mb-6 leading-tight">
                {post.title}
              </h1>
              
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-[rgb(var(--color-muted))] mb-8">
                <div className="flex items-center space-x-2">
                  <FiCalendar className="w-4 h-4" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiClock className="w-4 h-4" />
                  <span>{calculateReadingTime(post.content)} min read</span>
                </div>
                {post.views_count && (
                  <div className="flex items-center space-x-2">
                    <FiEye className="w-4 h-4" />
                    <span>{post.views_count} views</span>
                  </div>
                )}
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-between p-6 bg-[rgb(var(--color-bg))] rounded-2xl border border-[rgb(var(--color-border))]">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden ring-4 ring-white/10">
                      {post.author.profile_picture ? (
                        <img src={post.author.profile_picture} alt={post.author.username} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <VerificationBadge 
                      isVerified={post.author.is_verified || false} 
                      type="user" 
                      size="md" 
                      className="absolute -bottom-1 -right-1"
                    />
                  </div>
                  <div>
                    <Link href={`/blog/profile/${post.author.id}`} className="text-lg font-semibold text-[rgb(var(--color-text))] hover:text-purple-600 transition-colors">
                      {post.author.first_name} {post.author.last_name}
                    </Link>
                    <p className="text-[rgb(var(--color-muted))]">@{post.author.username}</p>
                    <p className="text-sm text-[rgb(var(--color-muted))] mt-1">Published {formatDate(post.created_at)}</p>
                  </div>
                </div>
                <Link href={`/blog/profile/${post.author.id}`}>
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <FiUserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                </Link>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg prose-purple max-w-none text-[rgb(var(--color-text))] mb-12">
              <div 
                className="leading-relaxed text-lg"
                dangerouslySetInnerHTML={renderContent(post.content)}
                style={{
                  lineHeight: '1.8',
                  fontSize: '1.125rem'
                }}
              />
            </div>

            {/* Article Actions */}
            <div className="flex items-center justify-between py-8 border-t border-[rgb(var(--color-border))]">
              <div className="flex items-center space-x-8">
                <button
                  onClick={handleLike}
                  disabled={!isLoggedIn}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-200 ${
                    post.is_liked 
                      ? 'text-red-500 bg-red-50 dark:bg-red-900/20 scale-105' 
                      : 'text-[rgb(var(--color-muted))] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-105'
                  } ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <FiHeart className={`w-6 h-6 ${post.is_liked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{post.likes_count}</span>
                </button>
                <div className="flex items-center space-x-3 px-4 py-2 rounded-full text-[rgb(var(--color-muted))]">
                  <FiMessageCircle className="w-6 h-6" />
                  <span className="font-medium">{post.comments_count}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm">
                  <FiShare2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="ghost" size="sm">
                  <FiBookmark className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8 bg-[rgb(var(--color-card))] rounded-3xl shadow-xl border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="p-8 lg:p-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-[rgb(var(--color-text))]">
                Discussion
              </h2>
              <div className="text-[rgb(var(--color-muted))] text-sm">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </div>
            </div>

            {isLoggedIn ? (
              <form onSubmit={handleComment} className="mb-12">
                <div className="bg-[rgb(var(--color-bg))] rounded-2xl p-6 border border-[rgb(var(--color-border))]">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Join the discussion... Share your thoughts, ask questions, or provide insights."
                    rows={4}
                    className="w-full px-0 py-0 border-0 bg-transparent text-[rgb(var(--color-text))] placeholder-[rgb(var(--color-muted))] focus:ring-0 focus:outline-none resize-none text-lg"
                  />
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgb(var(--color-border))]">
                    <div className="text-sm text-[rgb(var(--color-muted))]">
                      Be respectful and constructive in your comments
                    </div>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={!newComment.trim()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <FiSend className="w-4 h-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-12 p-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-2xl border border-[rgb(var(--color-border))] text-center">
                <FiMessageCircle className="w-12 h-12 mx-auto mb-4 text-[rgb(var(--color-muted))]" />
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-2">Join the Discussion</h3>
                <p className="text-[rgb(var(--color-muted))] mb-4">Sign in to share your thoughts and engage with the community</p>
                <Link href="/login">
                  <Button variant="primary">Sign In to Comment</Button>
                </Link>
              </div>
            )}

            <div className="space-y-8">
              {comments.filter(comment => !comment.parent_id).map((comment) => (
                <div key={comment.id} className="group">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                        {comment.user.profile_picture ? (
                          <img src={comment.user.profile_picture} alt={comment.user.username} className="w-full h-full object-cover" />
                        ) : (
                          <FiUser className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-[rgb(var(--color-bg))] rounded-2xl p-6 border border-[rgb(var(--color-border))] group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="font-semibold text-[rgb(var(--color-text))]">
                            {comment.user.first_name} {comment.user.last_name}
                          </span>
                          <span className="text-sm text-[rgb(var(--color-muted))]">
                            @{comment.user.username}
                          </span>
                          <span className="text-xs text-[rgb(var(--color-muted))]">
                            {formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-[rgb(var(--color-text))] leading-relaxed mb-4">{comment.content}</p>
                        
                        {/* Comment Actions */}
                        <div className="flex items-center space-x-4 text-sm">
                          {isLoggedIn && (
                            <button
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              className="text-[rgb(var(--color-muted))] hover:text-purple-600 transition-colors"
                            >
                              Reply
                            </button>
                          )}
                          {comment.replies && comment.replies.length > 0 && (
                            <button
                              onClick={() => toggleReplies(comment.id)}
                              className="flex items-center space-x-1 text-[rgb(var(--color-muted))] hover:text-purple-600 transition-colors"
                            >
                              {expandedReplies.has(comment.id) ? (
                                <FiChevronDown className="w-4 h-4" />
                              ) : (
                                <FiChevronRight className="w-4 h-4" />
                              )}
                              <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Reply Form */}
                      {replyingTo === comment.id && (
                        <form onSubmit={(e) => handleReply(e, comment.id)} className="mt-4 ml-4">
                          <div className="bg-[rgb(var(--color-card))] rounded-2xl p-4 border border-[rgb(var(--color-border))]">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder={`Reply to ${comment.user.first_name}...`}
                              rows={3}
                              className="w-full px-0 py-0 border-0 bg-transparent text-[rgb(var(--color-text))] placeholder-[rgb(var(--color-muted))] focus:ring-0 focus:outline-none resize-none"
                            />
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgb(var(--color-border))]">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyContent("");
                                }}
                                className="text-sm text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] transition-colors"
                              >
                                Cancel
                              </button>
                              <Button 
                                type="submit" 
                                variant="primary" 
                                size="sm"
                                disabled={!replyContent.trim()}
                              >
                                <FiSend className="w-3 h-3 mr-2" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        </form>
                      )}
                      
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && expandedReplies.has(comment.id) && (
                        <div className="mt-6 ml-8 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex space-x-3">
                              <FiCornerDownRight className="w-4 h-4 text-[rgb(var(--color-muted))] mt-3 flex-shrink-0" />
                              <div className="flex space-x-3 flex-1">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                                    {reply.user.profile_picture ? (
                                      <img src={reply.user.profile_picture} alt={reply.user.username} className="w-full h-full object-cover" />
                                    ) : (
                                      <FiUser className="w-5 h-5 text-white" />
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="bg-[rgb(var(--color-card))] rounded-xl p-4 border border-[rgb(var(--color-border))]">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="font-semibold text-[rgb(var(--color-text))] text-sm">
                                        {reply.user.first_name} {reply.user.last_name}
                                      </span>
                                      <span className="text-xs text-[rgb(var(--color-muted))]">
                                        @{reply.user.username}
                                      </span>
                                      <span className="text-xs text-[rgb(var(--color-muted))]">
                                        {formatDateTime(reply.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-[rgb(var(--color-text))] text-sm leading-relaxed">{reply.content}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {comments.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiMessageCircle className="w-12 h-12 text-[rgb(var(--color-muted))]" />
                </div>
                <h3 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-2">Start the Conversation</h3>
                <p className="text-[rgb(var(--color-muted))] max-w-md mx-auto">
                  Be the first to share your thoughts on this post. Your insights could spark an interesting discussion!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}