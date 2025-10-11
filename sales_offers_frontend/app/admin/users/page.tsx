"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FiSearch, FiFilter, FiMoreVertical, FiEdit, FiTrash2, FiMail, FiShield } from "react-icons/fi";

interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isSeller: boolean;
  isBuyer: boolean;
  joinedAt: string;
  lastLogin: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          username: "john_doe",
          email: "john@example.com",
          isActive: true,
          isEmailVerified: true,
          isSeller: true,
          isBuyer: true,
          joinedAt: "2024-01-15",
          lastLogin: "2024-01-20"
        },
        {
          id: 2,
          username: "jane_smith",
          email: "jane@example.com",
          isActive: false,
          isEmailVerified: false,
          isSeller: false,
          isBuyer: true,
          joinedAt: "2024-01-10",
          lastLogin: "2024-01-18"
        },
        {
          id: 3,
          username: "mike_wilson",
          email: "mike@example.com",
          isActive: true,
          isEmailVerified: true,
          isSeller: true,
          isBuyer: true,
          joinedAt: "2024-01-05",
          lastLogin: "2024-01-19"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" ||
                         (filterStatus === "active" && user.isActive) ||
                         (filterStatus === "inactive" && !user.isActive) ||
                         (filterStatus === "verified" && user.isEmailVerified) ||
                         (filterStatus === "unverified" && !user.isEmailVerified);
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">Users Management</h1>
            <p className="text-[rgb(var(--color-muted))]">Manage user accounts and permissions</p>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Export Users
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[rgb(var(--color-card))] rounded-xl p-4 border border-[rgb(var(--color-border))]">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))] w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <FiFilter className="text-[rgb(var(--color-muted))] w-4 h-4" />
              <select
                className="px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--color-ui))]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border))]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[rgb(var(--color-muted))]">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[rgb(var(--color-ui))] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-[rgb(var(--color-fg))]">{user.username}</div>
                          <div className="text-sm text-[rgb(var(--color-muted))]">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isEmailVerified
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {user.isEmailVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-1">
                          {user.isSeller && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                              Seller
                            </span>
                          )}
                          {user.isBuyer && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                              Buyer
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[rgb(var(--color-muted))]">
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-[rgb(var(--color-muted))]">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-1 text-[rgb(var(--color-muted))] hover:text-blue-600 transition-colors">
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-[rgb(var(--color-muted))] hover:text-green-600 transition-colors">
                            <FiMail className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-[rgb(var(--color-muted))] hover:text-red-600 transition-colors">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))] transition-colors">
                            <FiMoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-[rgb(var(--color-muted))]">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm border border-[rgb(var(--color-border))] rounded hover:bg-[rgb(var(--color-ui))] transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-red-600 text-white rounded">
              1
            </button>
            <button className="px-3 py-1 text-sm border border-[rgb(var(--color-border))] rounded hover:bg-[rgb(var(--color-ui))] transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}