"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FiFileText, FiImage, FiVideo, FiEdit3, FiTrash2, FiPlus, FiEye, FiSearch, FiFilter } from "react-icons/fi";

interface ContentItem {
  id: number;
  title: string;
  type: 'blog' | 'page' | 'media';
  status: 'published' | 'draft' | 'archived';
  author: string;
  created_at: string;
  updated_at: string;
  views?: number;
}

export default function AdminContent() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const mockData = [
        {
          id: 1,
          title: "How to Get the Best Deals",
          type: 'blog' as const,
          status: 'published' as const,
          author: "Admin",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z",
          views: 1250
        },
        {
          id: 2,
          title: "About Us Page",
          type: 'page' as const,
          status: 'published' as const,
          author: "Admin",
          created_at: "2024-01-10T15:45:00Z",
          updated_at: "2024-01-12T09:20:00Z",
          views: 890
        },
        {
          id: 3,
          title: "Product Demo Video",
          type: 'media' as const,
          status: 'draft' as const,
          author: "Content Team",
          created_at: "2024-01-14T12:00:00Z",
          updated_at: "2024-01-14T12:00:00Z"
        }
      ];
      
      setContent(mockData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching content:", error);
      setLoading(false);
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return FiFileText;
      case 'page': return FiFileText;
      case 'media': return FiImage;
      default: return FiFileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const stats = {
    totalContent: content.length,
    published: content.filter(c => c.status === 'published').length,
    drafts: content.filter(c => c.status === 'draft').length,
    totalViews: content.reduce((sum, c) => sum + (c.views || 0), 0)
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">Content Management</h1>
            <p className="text-[rgb(var(--color-muted))]">Manage blog posts, pages, and media content</p>
          </div>
          <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            <FiPlus className="w-4 h-4" />
            Create Content
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Total Content</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">{stats.totalContent}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FiFileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Published</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">{stats.published}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <FiEye className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Drafts</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">{stats.drafts}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <FiEdit3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Total Views</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">{stats.totalViews.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <FiEye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))]" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <FiFilter className="text-[rgb(var(--color-muted))]" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="blog">Blog Posts</option>
                  <option value="page">Pages</option>
                  <option value="media">Media</option>
                </select>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--color-ui))]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border))]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredContent.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[rgb(var(--color-muted))]">
                      No content found
                    </td>
                  </tr>
                ) : (
                  filteredContent.map((item) => {
                    const TypeIcon = getTypeIcon(item.type);
                    return (
                      <tr key={item.id} className="hover:bg-[rgb(var(--color-ui))] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <TypeIcon className="w-5 h-5 text-[rgb(var(--color-muted))]" />
                            <div>
                              <div className="text-sm font-medium text-[rgb(var(--color-fg))]">{item.title}</div>
                              <div className="text-xs text-[rgb(var(--color-muted))]">ID: {item.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[rgb(var(--color-fg))] capitalize">{item.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[rgb(var(--color-fg))]">{item.author}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[rgb(var(--color-fg))]">
                            {item.views ? item.views.toLocaleString() : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[rgb(var(--color-fg))]">
                            {new Date(item.updated_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                              <FiEdit3 className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}