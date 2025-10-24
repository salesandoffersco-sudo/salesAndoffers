"use client";

import { useState } from "react";
import { FiMessageCircle, FiPlus, FiSearch, FiFilter, FiClock, FiAlertCircle } from "react-icons/fi";

interface Ticket {
  id: number;
  title: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 1,
      title: "Payment not processed",
      category: "billing",
      priority: "high",
      status: "open",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock ticket creation
    const newTicket = {
      id: tickets.length + 1,
      ...formData,
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTickets([newTicket, ...tickets]);
    setFormData({ title: "", description: "", category: "", priority: "medium" });
    setShowCreateForm(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'resolved': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))]">Support Center</h1>
            <p className="text-[rgb(var(--color-muted))] mt-2">Get help with your account and report issues</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Create Ticket
          </button>
        </div>

        {/* Create Ticket Form */}
        {showCreateForm && (
          <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] p-6 mb-8">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-fg))] mb-6">Create Support Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select category</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                    <option value="verification">Verification</option>
                    <option value="general">General Inquiry</option>
                    <option value="bug_report">Bug Report</option>
                    <option value="feature_request">Feature Request</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                  placeholder="Provide detailed information about your issue..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Submit Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tickets List */}
        <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="p-6 border-b border-[rgb(var(--color-border))]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-[rgb(var(--color-fg))]">My Tickets</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))]" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    className="pl-10 pr-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <select className="px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500">
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--color-ui))]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wider">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border))]">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <FiMessageCircle className="mx-auto h-12 w-12 text-[rgb(var(--color-muted))] mb-4" />
                      <p className="text-[rgb(var(--color-muted))]">No tickets found. Create your first support ticket!</p>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-[rgb(var(--color-ui))] transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-[rgb(var(--color-fg))]">#{ticket.id} - {ticket.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[rgb(var(--color-fg))] capitalize">{ticket.category.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[rgb(var(--color-fg))]">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[rgb(var(--color-fg))]">
                          {new Date(ticket.updated_at).toLocaleDateString()}
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
    </div>
  );
}