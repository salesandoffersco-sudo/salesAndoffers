"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FiSearch, FiFilter, FiEye, FiEdit, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { API_BASE_URL } from "../../../lib/api";

interface Deal {
  id: number;
  title: string;
  seller: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  status: "pending" | "approved" | "rejected" | "expired";
  createdAt: string;
  expiresAt: string;
}

export default function DealsManagement() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/deals/admin/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeals(data.map((deal: any) => ({
          id: deal.id,
          title: deal.title,
          seller: deal.seller?.business_name || 'Unknown Seller',
          originalPrice: parseFloat(deal.original_price),
          discountedPrice: parseFloat(deal.discounted_price),
          discount: deal.discount_percentage,
          status: deal.is_published ? 'approved' : 'pending',
          createdAt: deal.created_at,
          expiresAt: deal.expires_at
        })));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setLoading(false);
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || deal.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = async (id: number) => {
    try {
      await fetch(`${API_BASE_URL}/api/deals/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ is_published: true })
      });
      
      setDeals(prev => prev.map(deal => 
        deal.id === id ? { ...deal, status: "approved" as const } : deal
      ));
    } catch (error) {
      console.error('Error approving deal:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await fetch(`${API_BASE_URL}/api/deals/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ is_published: false })
      });
      
      setDeals(prev => prev.map(deal => 
        deal.id === id ? { ...deal, status: "rejected" as const } : deal
      ));
    } catch (error) {
      console.error('Error rejecting deal:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">Deals Management</h1>
            <p className="text-[rgb(var(--color-muted))]">Review and manage seller deals</p>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Export Deals
          </button>
        </div>

        <div className="bg-[rgb(var(--color-card))] rounded-xl p-4 border border-[rgb(var(--color-border))]">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))] w-4 h-4" />
              <input
                type="text"
                placeholder="Search deals..."
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
                <option value="all">All Deals</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--color-ui))]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Deal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Pricing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Dates</th>
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
                ) : filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[rgb(var(--color-muted))]">
                      No deals found
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-[rgb(var(--color-ui))] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-[rgb(var(--color-fg))]">{deal.title}</div>
                          <div className="text-sm text-[rgb(var(--color-muted))]">{deal.seller}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-green-600">KES {deal.discountedPrice.toLocaleString()}</span>
                          <span className="text-sm text-[rgb(var(--color-muted))] line-through">KES {deal.originalPrice.toLocaleString()}</span>
                          <span className="text-xs text-red-600">{deal.discount}% off</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          deal.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          deal.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          deal.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[rgb(var(--color-muted))]">
                        <div>Created: {new Date(deal.createdAt).toLocaleDateString()}</div>
                        <div>Expires: {new Date(deal.expiresAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-1 text-[rgb(var(--color-muted))] hover:text-blue-600 transition-colors">
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-[rgb(var(--color-muted))] hover:text-yellow-600 transition-colors">
                            <FiEdit className="w-4 h-4" />
                          </button>
                          {deal.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApprove(deal.id)}
                                className="p-1 text-[rgb(var(--color-muted))] hover:text-green-600 transition-colors"
                              >
                                <FiCheck className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleReject(deal.id)}
                                className="p-1 text-[rgb(var(--color-muted))] hover:text-red-600 transition-colors"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="p-1 text-[rgb(var(--color-muted))] hover:text-red-600 transition-colors">
                            <FiTrash2 className="w-4 h-4" />
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