"use client";

import { useState, useEffect } from "react";
import { FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import axios from "axios";
import { API_BASE_URL } from "../../lib/api";

interface Transaction {
  id: number;
  deal: {
    id: number;
    title: string;
    image?: string;
    seller: {
      business_name: string;
    };
  };
  quantity: number;
  total_amount: string;
  status: string;
  payment_reference: string;
  created_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/transactions/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="text-green-500" />;
      case 'failed':
        return <FiXCircle className="text-red-500" />;
      case 'refunded':
        return <FiXCircle className="text-orange-500" />;
      default:
        return <FiClock className="text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'refunded':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--color-text))] mb-8">Transaction History</h1>
        
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--color-muted))]">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20">
            <FiClock className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
            <p className="text-xl text-[rgb(var(--color-muted))]">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-[rgb(var(--color-card))] rounded-xl shadow-lg border border-[rgb(var(--color-border))] p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">
                        {transaction.deal.title}
                      </h3>
                      <p className="text-sm text-[rgb(var(--color-muted))]">
                        by {transaction.deal.seller.business_name}
                      </p>
                      <p className="text-sm text-[rgb(var(--color-muted))]">
                        Quantity: {transaction.quantity} • Ref: {transaction.payment_reference}
                      </p>
                      <p className="text-xs text-[rgb(var(--color-muted))]">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(transaction.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusText(transaction.status)}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-[rgb(var(--color-text))]">
                      KES {transaction.total_amount}
                    </p>
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