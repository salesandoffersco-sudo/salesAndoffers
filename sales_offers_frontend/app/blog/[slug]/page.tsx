"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FiHeart, FiMessageCircle, FiUser, FiCalendar, FiSend, FiUserPlus, FiArrowLeft, FiShare2, FiBookmark, FiMoreHorizontal, FiClock, FiEye, FiChevronDown, FiChevronRight, FiCornerDownRight } from "react-icons/fi";
import axios from "axios";
import Button from "../../../components/Button";
import ProfilePicture from "../../../components/ProfilePicture";
import VerificationBadge from "../../../components/VerificationBadge";
import AuthorPostsSidebar from "../../../components/AuthorPostsSidebar";
import CommentsSidebar from "../../../components/CommentsSidebar";
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
  const [recommendedPosts, setRecommendedPosts] = useState<BlogPost[]>([]);
  const [authorPosts, setAuthorPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  useEffect(() => {
    if (post?.id) {
      fetchComments();
      fetchRecommendedPosts();
      fetchAuthorPosts();
    }
  }, [post?.id]);

  const fetchRecommendedPosts = async () => {
    if (!post?.slug) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blog/posts/${post.slug}/recommended/`);
      setRecommendedPosts(response.data);
    } catch (error) {
      console.error("Error fetching recommended posts:", error);
    }
  };

  const fetchAuthorPosts = async () => {
    if (!post?.author.id) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blog/users/${post.author.id}/posts/`);
      const filteredPosts = response.data.filter((p: BlogPost) => p.slug !== post.slug);
      setAuthorPosts(filteredPosts);
    } catch (error) {
      console.error("Error fetching author posts:", error);
    }
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid grid-cols-1 gap-8 ${authorPosts.length > 0 ? 'xl:grid-cols-12' : 'lg:grid-cols-3'}`}>
          {/* Left Sidebar - Author's Posts (Desktop/Tablet) */}
          {authorPosts.length > 0 && (
            <div className="hidden lg:block xl:col-span-3">
              <AuthorPostsSidebar authorId={post.author.id} currentSlug={post.slug} />
            </div>
          )}

          {/* Main Content */}
          <div className={authorPosts.length > 0 ? 'xl:col-span-6' : 'lg:col-span-2'}>
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
          </div>

          {/* Right Sidebar - Comments (Desktop/Tablet) */}
          <div className={`hidden lg:block ${authorPosts.length > 0 ? 'xl:col-span-3' : 'lg:col-span-1'}`}>
            <CommentsSidebar 
              post={post} 
              comments={comments} 
              newComment={newComment}
              setNewComment={setNewComment}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              expandedReplies={expandedReplies}
              toggleReplies={toggleReplies}
              handleComment={handleComment}
              handleReply={handleReply}
              isLoggedIn={isLoggedIn}
              formatDateTime={formatDateTime}
            />
          </div>
        </div>

        {/* Mobile Comments Section */}
        <div className="lg:hidden mt-8 bg-[rgb(var(--color-card))] rounded-3xl shadow-xl border border-[rgb(var(--color-border))] overflow-hidden">
          <CommentsSidebar 
            post={post} 
            comments={comments} 
            newComment={newComment}
            setNewComment={setNewComment}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            expandedReplies={expandedReplies}
            toggleReplies={toggleReplies}
            handleComment={handleComment}
            handleReply={handleReply}
            isLoggedIn={isLoggedIn}
            formatDateTime={formatDateTime}
            isMobile={true}
          />
        </div>
      </div>
    </div>
  );
}