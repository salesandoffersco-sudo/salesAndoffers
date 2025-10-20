'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Balance {
  total_earnings: number;
  total_withdrawn: number;
  pending_withdrawals: number;
  available_balance: number;
  currency: string;
}

interface Bank {
  name: string;
  code: string;
}

interface Withdrawal {
  id: number;
  amount: number;
  withdrawal_fee: number;
  net_amount: number;
  status: string;
  created_at: string;
  processed_at?: string;
}

export default function WithdrawalsPage() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bank_code: '',
    account_number: '',
    account_name: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBalance();
    fetchBanks();
    fetchWithdrawals();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await api.get('/sellers/balance/');
      setBalance(response.data);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await api.get('/sellers/banks/');
      setBanks(response.data);
    } catch (error) {
      console.error('Failed to fetch banks:', error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const response = await api.get('/sellers/withdrawals/');
      setWithdrawals(response.data);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/sellers/withdraw/', withdrawForm);
      setShowWithdrawForm(false);
      setWithdrawForm({ amount: '', bank_code: '', account_number: '', account_name: '' });
      fetchBalance();
      fetchWithdrawals();
      alert('Withdrawal request submitted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Withdrawals</h1>

      {/* Balance Card */}
      {balance && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Balance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">
                {balance.currency} {balance.total_earnings.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                {balance.currency} {balance.available_balance.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Withdrawn</p>
              <p className="text-2xl font-bold text-gray-600">
                {balance.currency} {balance.total_withdrawn.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {balance.currency} {balance.pending_withdrawals.toLocaleString()}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowWithdrawForm(true)}
            disabled={balance.available_balance <= 0}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Withdrawal
          </button>
        </div>
      )}

      {/* Withdrawal Form Modal */}
      {showWithdrawForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Request Withdrawal</h3>
            <form onSubmit={handleWithdraw}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Amount ({balance?.currency})</label>
                <input
                  type="number"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                  max={balance?.available_balance}
                  min="100"
                  step="0.01"
                  required
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  2% withdrawal fee applies. Minimum: {balance?.currency} 100
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Bank</label>
                <select
                  value={withdrawForm.bank_code}
                  onChange={(e) => setWithdrawForm({...withdrawForm, bank_code: e.target.value})}
                  required
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Select Bank</option>
                  {banks.map(bank => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Account Number</label>
                <input
                  type="text"
                  value={withdrawForm.account_number}
                  onChange={(e) => setWithdrawForm({...withdrawForm, account_number: e.target.value})}
                  required
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Account Name</label>
                <input
                  type="text"
                  value={withdrawForm.account_name}
                  onChange={(e) => setWithdrawForm({...withdrawForm, account_name: e.target.value})}
                  required
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowWithdrawForm(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Withdrawal History</h2>
        {withdrawals.length === 0 ? (
          <p className="text-gray-500">No withdrawals yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Fee</th>
                  <th className="text-left py-2">Net Amount</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(withdrawal => (
                  <tr key={withdrawal.id} className="border-b">
                    <td className="py-2">
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2">{balance?.currency} {withdrawal.amount.toLocaleString()}</td>
                    <td className="py-2">{balance?.currency} {withdrawal.withdrawal_fee.toLocaleString()}</td>
                    <td className="py-2">{balance?.currency} {withdrawal.net_amount.toLocaleString()}</td>
                    <td className={`py-2 capitalize ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}