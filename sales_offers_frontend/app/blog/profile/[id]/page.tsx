"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FiUser, FiUsers, FiEdit3, FiUserPlus, FiUserMinus, FiHeart, FiMessageCircle, FiCalendar } from "react-icons/fi";
import axios from "axios";
import Button from "../../../../components/Button";
import { API_BASE_URL } from "../../../../lib/api";

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
}

interface UserStats {
  posts_count: number;
  followers_count: number;
  following_count: number;
  is_following: boolean;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  image?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export default function BlogProfilePage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats>({ posts_count: 0, followers_count: 0, following_count: 0, is_following: false });
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    
    if (token) {
      // Get current user info from token or make API call
      const userData = localStorage.getItem("userProfile");
      if (userData) {
        const parsed = JSON.parse(userData);
        setCurrentUserId(parsed.id);
      }
    }

    if (params.id) {
      fetchUserData();
    }
  }, [params.id]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Token ${token}` } : {};
      
      const [userRes, statsRes, postsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/accounts/profile/`, { headers }), // This would need to be updated to get specific user
        axios.get(`${API_BASE_URL}/api/blog/users/${params.id}/stats/`, { headers }),
        axios.get(`${API_BASE_URL}/api/blog/users/${params.id}/posts/`)
      ]);

      setUser(userRes.data);
      setStats(statsRes.data);
      setPosts(postsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isLoggedIn) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/blog/users/${params.id}/follow/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      
      setStats({
        ...stats,
        is_following: response.data.following,
        followers_count: stats.followers_count + (response.data.following ? 1 : -1)
      });
    } catch (error) {
      console.error("Error toggling follow:", error);
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

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const isOwnProfile = currentUserId === parseInt(params.id as string);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-bounce" style={{animationDuration: '3s'}}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center overflow-hidden backdrop-blur-sm">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <FiUser className="w-16 h-16" />
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">
                {user?.first_name} {user?.last_name}
              </h1>
              <p className="text-xl opacity-90 mb-4">@{user?.username}</p>
              
              <div className="flex justify-center md:justify-start space-x-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.posts_count}</div>
                  <div className="text-sm opacity-80">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.followers_count}</div>
                  <div className="text-sm opacity-80">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.following_count}</div>
                  <div className="text-sm opacity-80">Following</div>
                </div>
              </div>
              
              <div className="flex justify-center md:justify-start space-x-4">
                {isOwnProfile ? (
                  <Link href="/blog/create">
                    <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                      <FiEdit3 className="w-4 h-4 mr-2" />
                      Write Post
                    </Button>
                  </Link>
                ) : isLoggedIn ? (
                  <Button
                    onClick={handleFollow}
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  >
                    {stats.is_following ? (
                      <>
                        <FiUserMinus className="w-4 h-4 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                      Login to Follow
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[rgb(var(--color-text))]">
            {isOwnProfile ? 'Your Posts' : 'Posts'} ({stats.posts_count})
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <FiEdit3 className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-2">
              {isOwnProfile ? "You haven't written any posts yet" : "No posts yet"}
            </h3>
            <p className="text-[rgb(var(--color-muted))] mb-6">
              {isOwnProfile ? "Share your thoughts with the community!" : "Check back later for new content."}
            </p>
            {isOwnProfile && (
              <Link href="/blog/create">
                <Button variant="primary">Write Your First Post</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-[rgb(var(--color-card))] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-[rgb(var(--color-border))] group"
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
                  <div className="flex items-center text-xs text-[rgb(var(--color-muted))] mb-3">
                    <FiCalendar className="w-3 h-3 mr-1" />
                    {formatDate(post.created_at)}
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-lg font-bold text-[rgb(var(--color-text))] mb-2 hover:text-purple-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-[rgb(var(--color-muted))] mb-4 line-clamp-3 text-sm">
                    {truncateContent(post.content)}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--color-border))]">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-[rgb(var(--color-muted))]">
                        <FiHeart className="w-4 h-4" />
                        <span className="text-sm">{post.likes_count}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[rgb(var(--color-muted))]">
                        <FiMessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.comments_count}</span>
                      </div>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm">Read</Button>
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