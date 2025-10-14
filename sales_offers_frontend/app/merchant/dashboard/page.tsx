"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiCheck, FiX, FiBarChart, FiDollarSign } from "react-icons/fi";
import axios from "axios";
import Button from "../../../components/Button";
import { API_BASE_URL } from "../../../lib/api";

interface VoucherRedemption {
  id: number;
  voucher_code: string;
  deal_title: string;
  customer_name: string;
  amount: number;
  redeemed_at: string;
}

export default function MerchantDashboard() {
  const [voucherCode, setVoucherCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [redemptions, setRedemptions] = useState<VoucherRedemption[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRedemptions();
    fetchAnalytics();
  }, []);

  const fetchRedemptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/merchants/voucher-history/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setRedemptions(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching redemptions:", error);
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/merchants/analytics/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleVerifyVoucher = async () => {
    if (!voucherCode.trim()) return;

    setVerifying(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/merchants/verify-voucher/`,
        { voucher_code: voucherCode },
        {
          headers: { Authorization: `Token ${token}` }
        }
      );

      if (response.data.valid) {
        alert(`Valid voucher! Deal: ${response.data.deal_title}, Amount: KES ${response.data.amount}`);
      } else {
        alert("Invalid or already redeemed voucher");
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Error verifying voucher");
    } finally {
      setVerifying(false);
      setVoucherCode("");
    }
  };

  const handleRedeemVoucher = async () => {
    if (!voucherCode.trim()) return;

    setVerifying(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/merchants/redeem-voucher/`,
        { voucher_code: voucherCode },
        {
          headers: { Authorization: `Token ${token}` }
        }
      );

      alert(`Voucher redeemed successfully! Amount: KES ${response.data.amount}`);
      fetchRedemptions();
      fetchAnalytics();
    } catch (error: any) {
      alert(error.response?.data?.error || "Error redeeming voucher");
    } finally {
      setVerifying(false);
      setVoucherCode("");
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))] mb-8">Merchant Dashboard</h1>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <div className="flex items-center">
                <FiBarChart className="text-2xl text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-[rgb(var(--color-muted))]">Total Vouchers</p>
                  <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">{analytics.total_vouchers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <div className="flex items-center">
                <FiCheck className="text-2xl text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-[rgb(var(--color-muted))]">Redeemed</p>
                  <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">{analytics.vouchers_redeemed}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <div className="flex items-center">
                <FiDollarSign className="text-2xl text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-[rgb(var(--color-muted))]">Total Revenue</p>
                  <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">KES {analytics.total_revenue}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <div className="flex items-center">
                <FiSearch className="text-2xl text-orange-500 mr-3" />
                <div>
                  <p className="text-sm text-[rgb(var(--color-muted))]">Redemption Rate</p>
                  <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">
                    {analytics.total_vouchers > 0 ? Math.round((analytics.vouchers_redeemed / analytics.total_vouchers) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voucher Scanner */}
        <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))] mb-8">
          <h2 className="text-xl font-semibold text-[rgb(var(--color-fg))] mb-4">Voucher Scanner</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter voucher code or scan QR"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="flex-1 px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleVerifyVoucher}
                disabled={verifying || !voucherCode.trim()}
              >
                {verifying ? "Verifying..." : "Verify"}
              </Button>
              <Button
                variant="primary"
                onClick={handleRedeemVoucher}
                disabled={verifying || !voucherCode.trim()}
              >
                {verifying ? "Processing..." : "Redeem"}
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-[rgb(var(--color-muted))] mt-2">
            Verify checks if voucher is valid. Redeem marks it as used and completes the transaction.
          </p>
        </div>

        {/* Recent Redemptions */}
        <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))]">
          <div className="p-6 border-b border-[rgb(var(--color-border))]">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-fg))]">Recent Redemptions</h2>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-[rgb(var(--color-muted))]">Loading...</p>
              </div>
            ) : redemptions.length === 0 ? (
              <div className="p-8 text-center">
                <FiSearch className="text-4xl text-[rgb(var(--color-muted))] mx-auto mb-2" />
                <p className="text-[rgb(var(--color-muted))]">No redemptions yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">
                      Voucher Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">
                      Deal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--color-border))]">
                  {redemptions.map((redemption) => (
                    <tr key={redemption.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-[rgb(var(--color-fg))]">
                          {redemption.voucher_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-fg))]">
                        {redemption.deal_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-fg))]">
                        {redemption.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[rgb(var(--color-fg))]">
                        KES {redemption.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-muted))]">
                        {new Date(redemption.redeemed_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}