"use client";

import { useState, useEffect, useRef } from "react";
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

interface EmojiParticle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emojis, setEmojis] = useState<EmojiParticle[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  const emojiList = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔',
    '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟',
    '🛒', '🛍️', '💰', '💎', '💳', '💸', '💵', '💴', '💶', '💷', '🎁', '🎉', '🎊', '🎈', '🎂', '🍰', '🧁', '🍭', '🍬', '🍫',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '⭐', '🌟', '✨', '⚡', '💫', '🔥', '💥', '💢', '💨', '💦', '💤', '🌈', '☀️', '⛅', '☁️', '🌙', '🌛', '🌜', '🌚', '🌝'
  ];

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    fetchPosts();
    initEmojis();
    startAnimation();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const initEmojis = () => {
    const newEmojis: EmojiParticle[] = [];
    for (let i = 0; i < 80; i++) {
      newEmojis.push({
        id: i,
        emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
        x: Math.random() * window.innerWidth,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 20 + 15
      });
    }
    setEmojis(newEmojis);
  };

  const startAnimation = () => {
    const animate = () => {
      setEmojis(prevEmojis => 
        prevEmojis.map(emoji => {
          let { x, y, vx, vy } = emoji;
          
          // Mouse repulsion
          const dx = x - mousePos.current.x;
          const dy = y - mousePos.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            vx += (dx / distance) * force * 0.5;
            vy += (dy / distance) * force * 0.5;
          }
          
          // Apply velocity
          x += vx;
          y += vy;
          
          // Friction
          vx *= 0.98;
          vy *= 0.98;
          
          // Boundaries
          if (x < 0 || x > window.innerWidth) vx *= -0.5;
          if (y < 0 || y > 600) vy *= -0.5;
          
          x = Math.max(0, Math.min(window.innerWidth, x));
          y = Math.max(0, Math.min(600, y));
          
          return { ...emoji, x, y, vx, vy };
        })
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (heroRef.current && e.touches[0]) {
      const rect = heroRef.current.getBoundingClientRect();
      mousePos.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
  };

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
      <div 
        ref={heroRef}
        className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white py-20 relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Interactive Emoji Background */}
        <div className="absolute inset-0 pointer-events-none">
          {emojis.map(emoji => (
            <div
              key={emoji.id}
              className="absolute transition-transform duration-100 ease-out select-none"
              style={{
                left: `${emoji.x}px`,
                top: `${emoji.y}px`,
                fontSize: `${emoji.size}px`,
                transform: `translate(-50%, -50%)`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
            >
              {emoji.emoji}
            </div>
          ))}
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