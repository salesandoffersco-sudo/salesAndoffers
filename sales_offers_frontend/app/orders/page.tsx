"use client";

import { useState, useEffect } from "react";
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiEye, FiDownload, FiMapPin, FiCalendar, FiTag } from "react-icons/fi";
import Button from "../../components/Button";
import { api } from "../../lib/api";

interface Voucher {
  id: number;
  code: string;
  deal_title: string;
  deal_image?: string;
  quantity: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'redeemed' | 'expired' | 'cancelled';
  qr_code: string;
  purchased_at: string;
  expires_at: string;
  redemption_instructions: string;
  deal: {
    id: number;
    category: string;
    location: string;
    seller: {
      business_name: string;
      phone: string;
      address: string;
    };
  };
}

export default function OrdersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'redeemed' | 'expired'>('all');

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.get('/api/payments/my-vouchers/', {
        headers: { Authorization: `Token ${token}` }
      });
      setVouchers(response.data);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'redeemed': return <FiPackage className="w-5 h-5 text-blue-500" />;
      case 'expired': return <FiXCircle className="w-5 h-5 text-red-500" />;
      default: return <FiClock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'redeemed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const isService = (category: string) => {
    return category.toLowerCase().includes('service') || 
           ['consulting', 'repair', 'maintenance', 'training', 'design'].some(s => 
             category.toLowerCase().includes(s)
           );
  };

  const downloadVoucher = (voucher: Voucher) => {
    if (!voucher.qr_code) return;
    
    const link = document.createElement('a');
    link.href = voucher.qr_code;
    link.download = `voucher-${voucher.code}.png`;
    link.click();
  };

  const filteredVouchers = vouchers.filter(voucher => 
    filter === 'all' || voucher.status === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--color-text))]">My Orders</h1>
            <p className="text-[rgb(var(--color-muted))] mt-2">Manage your purchased vouchers and orders</p>
          </div>
          
          <div className="flex gap-2">
            {['all', 'paid', 'redeemed', 'expired'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-[rgb(var(--color-card))] text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))]'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredVouchers.length === 0 ? (
          <div className="text-center py-20">
            <FiPackage className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-2">No orders found</h3>
            <p className="text-[rgb(var(--color-muted))] mb-4">
              {filter === 'all' ? 'You haven\'t made any purchases yet' : `No ${filter} orders found`}
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/offers'}>
              Browse Offers
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredVouchers.map((voucher) => (
              <div key={voucher.id} className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))] hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-2">{voucher.deal_title}</h3>
                        <div className="flex items-center gap-4 text-sm text-[rgb(var(--color-muted))]">
                          <span className="font-mono bg-[rgb(var(--color-ui))] px-2 py-1 rounded">#{voucher.code}</span>
                          <span className="flex items-center gap-1">
                            <FiTag className="w-4 h-4" />
                            {voucher.deal?.category || 'General'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(voucher.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(voucher.status)}`}>
                          {voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-[rgb(var(--color-muted))] mb-1">Quantity & Amount</p>
                        <p className="font-semibold">
                          {voucher.quantity} × KES {(voucher.total_amount / voucher.quantity).toFixed(2)} = 
                          <span className="text-purple-600 ml-1">KES {voucher.total_amount}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[rgb(var(--color-muted))] mb-1">Purchased</p>
                        <p className="font-semibold flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          {new Date(voucher.purchased_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[rgb(var(--color-muted))] mb-1">Expires</p>
                        <p className="font-semibold text-orange-600">
                          {new Date(voucher.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[rgb(var(--color-muted))] mb-1">Seller</p>
                        <p className="font-semibold">{voucher.deal?.seller?.business_name || 'Unknown'}</p>
                      </div>
                    </div>

                    {isService(voucher.deal?.category || '') ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Service Instructions</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                          Contact the service provider to schedule your appointment:
                        </p>
                        <div className="text-sm">
                          <p><strong>Phone:</strong> {voucher.deal?.seller?.phone || 'Contact via platform'}</p>
                          <p><strong>Location:</strong> {voucher.deal?.location || voucher.deal?.seller?.address}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Pickup/Delivery Instructions</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                          Present this voucher at the business location:
                        </p>
                        <div className="text-sm flex items-start gap-1">
                          <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{voucher.deal?.location || voucher.deal?.seller?.address}</span>
                        </div>
                      </div>
                    )}

                    <div className="bg-[rgb(var(--color-ui))] rounded-lg p-4">
                      <h4 className="font-semibold text-[rgb(var(--color-text))] mb-2">Redemption Instructions</h4>
                      <p className="text-sm text-[rgb(var(--color-muted))]">{voucher.redemption_instructions}</p>
                    </div>
                  </div>

                  <div className="lg:w-64 flex flex-col items-center">
                    {voucher.qr_code && (
                      <div className="bg-white p-4 rounded-lg mb-4 border">
                        <img src={voucher.qr_code} alt="QR Code" className="w-32 h-32" />
                        <p className="text-xs text-center text-gray-600 mt-2">Show this QR code to redeem</p>
                      </div>
                    )}
                    
                    <div className="space-y-2 w-full">
                      {voucher.qr_code && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => downloadVoucher(voucher)}
                          className="w-full"
                        >
                          <FiDownload className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.location.href = `/offers/${voucher.deal?.id}`}
                        className="w-full"
                      >
                        <FiEye className="w-4 h-4 mr-2" />
                        View Deal
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}