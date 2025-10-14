"use client";

import { useState, useEffect } from "react";
import { FiDownload, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import axios from "axios";
import { API_BASE_URL } from "../../lib/api";

interface Voucher {
  id: number;
  code: string;
  deal_title: string;
  deal_image: string;
  quantity: number;
  total_amount: number;
  status: string;
  qr_code: string;
  purchased_at: string;
  expires_at: string;
  redemption_instructions: string;
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/payments/my-vouchers/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setVouchers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <FiCheckCircle className="text-green-500" />;
      case 'redeemed':
        return <FiCheckCircle className="text-blue-500" />;
      case 'expired':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiClock className="text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Ready to Use';
      case 'redeemed':
        return 'Redeemed';
      case 'expired':
        return 'Expired';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))] mb-8">My Vouchers</h1>
        
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--color-muted))]">Loading vouchers...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-[rgb(var(--color-muted))]">No vouchers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="bg-[rgb(var(--color-card))] rounded-xl shadow-lg border border-[rgb(var(--color-border))] overflow-hidden">
                {voucher.deal_image && (
                  <img src={voucher.deal_image} alt={voucher.deal_title} className="w-full h-48 object-cover" />
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))]">{voucher.deal_title}</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(voucher.status)}
                      <span className="text-sm font-medium">{getStatusText(voucher.status)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <p className="text-center font-mono text-lg font-bold text-[rgb(var(--color-fg))]">{voucher.code}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm text-[rgb(var(--color-muted))] mb-4">
                    <p>Quantity: {voucher.quantity}</p>
                    <p>Amount: KES {voucher.total_amount}</p>
                    <p>Expires: {new Date(voucher.expires_at).toLocaleDateString()}</p>
                  </div>
                  
                  {voucher.qr_code && (
                    <div className="text-center mb-4">
                      <img src={voucher.qr_code} alt="QR Code" className="w-32 h-32 mx-auto" />
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-[rgb(var(--color-fg))] mb-2">Redemption Instructions:</h4>
                    <p className="text-sm text-[rgb(var(--color-muted))]">{voucher.redemption_instructions}</p>
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