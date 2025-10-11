"use client";

import { useState, useEffect } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { FiImage, FiSave, FiX } from "react-icons/fi";
import axios from "axios";
import Button from "../../../components/Button";
import { API_BASE_URL } from "../../../lib/api";

export default function CreateBlogPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [blogCount, setBlogCount] = useState(0);
  const router = useRouter();

  const fetchSubscriptionInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const [statsRes, postsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/sellers/stats/`, {
          headers: { Authorization: `Token ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/blog/posts/`, {
          headers: { Authorization: `Token ${token}` }
        })
      ]);
      
      setSubscription(statsRes.data.subscription);
      const userPosts = postsRes.data.filter((post: any) => post.author.username === localStorage.getItem("username"));
      setBlogCount(userPosts.length);
    } catch (error) {
      console.error("Error fetching subscription info:", error);
    }
  };

  const canCreatePost = () => {
    if (!subscription) return blogCount < 2;
    const features = subscription.plan?.features || {};
    const maxPosts = features.blog_posts || 2;
    return maxPosts === -1 || blogCount < maxPosts;
  };

  const getMaxPosts = () => {
    if (!subscription) return 2;
    const features = subscription.plan?.features || {};
    return features.blog_posts || 2;
  };

  React.useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (!canCreatePost()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/blog/posts/`,
        { title, content, image: image || null },
        { headers: { Authorization: `Token ${token}` } }
      );
      router.push(`/blog/${response.data.slug}`);
    } catch (error: any) {
      console.error("Error creating post:", error);
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <h1 className="text-3xl font-bold">Create New Post</h1>
            <p className="opacity-90 mt-2">Share your thoughts with the community</p>
            {subscription && (
              <div className="mt-3 text-sm opacity-80">
                Posts used: {blogCount}/{getMaxPosts() === -1 ? '∞' : getMaxPosts()}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {!canCreatePost() && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Blog Post Limit Reached:</span>
                    <span className="ml-2">You've used {blogCount}/{getMaxPosts()} posts.</span>
                  </div>
                  <a href="/pricing" className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                    Upgrade Plan
                  </a>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter an engaging title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                Featured Image (Optional)
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="flex-1 px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                <Button type="button" variant="outline" className="px-4">
                  <FiImage className="w-4 h-4" />
                </Button>
              </div>
              {image && (
                <div className="mt-3 relative">
                  <img src={image} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Write your story here..."
                required
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-[rgb(var(--color-border))]">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !title.trim() || !content.trim() || !canCreatePost()}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <FiSave className="w-4 h-4 mr-2" />
                )}
                Publish Post
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}