"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FiSearch, FiFilter, FiStar, FiPackage, FiDollarSign, FiEye, FiMail } from "react-icons/fi";

interface Seller {
  id: number;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  rating: number;
  totalDeals: number;
  activeDeals: number;
  revenue: number;
  joinedAt: string;
  status: "active" | "suspended" | "pending";
  verified: boolean;
}

export default function SellersManagement() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    setTimeout(() => {
      setSellers([
        {
          id: 1,
          businessName: "TechStore Kenya",
          ownerName: "John Kamau",
          email: "john@techstore.co.ke",
          phone: "+254712345678",
          rating: 4.8,
          totalDeals: 45,
          activeDeals: 12,
          revenue: 2500000,
          joinedAt: "2023-08-15",
          status: "active",
          verified: true
        },
        {
          id: 2,
          businessName: "Fashion Hub",
          ownerName: "Mary Wanjiku",
          email: "mary@fashionhub.co.ke",
          phone: "+254723456789",
          rating: 4.5,
          totalDeals: 32,
          activeDeals: 8,
          revenue: 1800000,
          joinedAt: "2023-09-20",
          status: "active",
          verified: true
        },
        {
          id: 3,
          businessName: "Home Essentials",
          ownerName: "Peter Ochieng",
          email: "peter@homeessentials.co.ke",
          phone: "+254734567890",
          rating: 3.9,
          totalDeals: 18,
          activeDeals: 3,
          revenue: 950000,
          joinedAt: "2023-11-10",
          status: "pending",
          verified: false
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || seller.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">Sellers Management</h1>
            <p className="text-[rgb(var(--color-muted))]">Manage seller accounts and performance</p>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Export Sellers
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-4 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--color-muted))]">Total Sellers</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">{sellers.length}</p>
              </div>
              <FiPackage className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-4 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--color-muted))]">Active Sellers</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">{sellers.filter(s => s.status === 'active').length}</p>
              </div>
              <FiStar className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-4 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--color-muted))]">Pending Review</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">{sellers.filter(s => s.status === 'pending').length}</p>
              </div>
              <FiEye className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-4 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--color-muted))]">Total Revenue</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">KES {sellers.reduce((sum, s) => sum + s.revenue, 0).toLocaleString()}</p>
              </div>
              <FiDollarSign className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-[rgb(var(--color-card))] rounded-xl p-4 border border-[rgb(var(--color-border))]">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))] w-4 h-4" />
              <input
                type="text"
                placeholder="Search sellers..."
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
                <option value="all">All Sellers</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--color-ui))]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border))]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredSellers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[rgb(var(--color-muted))]">
                      No sellers found
                    </td>
                  </tr>
                ) : (
                  filteredSellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-[rgb(var(--color-ui))] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-[rgb(var(--color-fg))]">{seller.businessName}</div>
                          <div className="text-sm text-[rgb(var(--color-muted))]">{seller.ownerName}</div>
                          <div className="text-xs text-[rgb(var(--color-muted))]">{seller.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-1">
                            <FiStar className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{seller.rating}</span>
                          </div>
                          <div className="text-xs text-[rgb(var(--color-muted))]">
                            {seller.activeDeals}/{seller.totalDeals} deals
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            seller.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            seller.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                          </span>
                          {seller.verified && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              Verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[rgb(var(--color-fg))]">
                          KES {seller.revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-[rgb(var(--color-muted))]">
                          Since {new Date(seller.joinedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-1 text-[rgb(var(--color-muted))] hover:text-blue-600 transition-colors">
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-[rgb(var(--color-muted))] hover:text-green-600 transition-colors">
                            <FiMail className="w-4 h-4" />
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
      </div>
    </AdminLayout>
  );
}