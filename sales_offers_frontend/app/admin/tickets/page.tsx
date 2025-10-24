"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FiMessageCircle, FiUser, FiClock, FiCheck, FiX, FiSearch, FiFilter, FiSend } from "react-icons/fi";

interface Ticket {
  id: number;
  user: {
    username: string;
    email: string;
  };
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: number;
  user: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const mockData = [
        {
          id: 1,
          user: { username: "john_doe", email: "john@example.com" },
          title: "Payment not processed",
          description: "My payment was deducted but subscription not activated",
          category: "billing",
          priority: "high",
          status: "open",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z",
          messages: [
            {
              id: 1,
              user: "john_doe",
              message: "My payment was deducted but subscription not activated",
              is_internal: false,
              created_at: "2024-01-15T10:30:00Z"
            }
          ]
        }
      ];
      
      setTickets(mockData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = (ticketId: number, status: string) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status, updated_at: new Date().toISOString() }
        : ticket
    ));
  };

  const handleSendMessage = () => {
    if (!selectedTicket || !newMessage.trim()) return;

    const message = {
      id: Date.now(),
      user: "admin",
      message: newMessage,
      is_internal: false,
      created_at: new Date().toISOString()
    };

    setTickets(tickets.map(ticket => 
      ticket.id === selectedTicket.id 
        ? { ...ticket, messages: [...ticket.messages, message] }
        : ticket
    ));

    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, message]
    });

    setNewMessage("");
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

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">Support Tickets</h1>
            <p className="text-[rgb(var(--color-muted))]">Manage customer support requests</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Total Tickets</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FiMessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Open</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">{stats.open}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <FiClock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">In Progress</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">{stats.inProgress}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <FiUser className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Resolved</p>
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))] mt-2">{stats.resolved}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <FiCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-2">
            <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden">
              <div className="p-6 border-b border-[rgb(var(--color-border))]">
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-[rgb(var(--color-border))] max-h-96 overflow-y-auto">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 cursor-pointer hover:bg-[rgb(var(--color-ui))] transition-colors ${
                      selectedTicket?.id === ticket.id ? 'bg-[rgb(var(--color-ui))]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-[rgb(var(--color-fg))]">
                            #{ticket.id} - {ticket.title}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-[rgb(var(--color-muted))] mb-2">{ticket.user.email}</p>
                        <p className="text-xs text-[rgb(var(--color-muted))]">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-1">
            {selectedTicket ? (
              <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden">
                <div className="p-4 border-b border-[rgb(var(--color-border))]">
                  <h3 className="font-semibold text-[rgb(var(--color-fg))]">#{selectedTicket.id} - {selectedTicket.title}</h3>
                  <p className="text-sm text-[rgb(var(--color-muted))] mt-1">{selectedTicket.user.email}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedTicket.id, 'in_progress')}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedTicket.id, 'resolved')}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  </div>
                </div>

                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-4">
                    {selectedTicket.messages.map((message) => (
                      <div key={message.id} className={`p-3 rounded-lg ${
                        message.user === 'admin' 
                          ? 'bg-blue-50 dark:bg-blue-900/20 ml-4' 
                          : 'bg-gray-50 dark:bg-gray-900/20 mr-4'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-[rgb(var(--color-fg))]">{message.user}</span>
                          <span className="text-xs text-[rgb(var(--color-muted))]">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-[rgb(var(--color-fg))]">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-[rgb(var(--color-border))]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your response..."
                      className="flex-1 px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <FiSend className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[rgb(var(--color-card))] rounded-xl border border-[rgb(var(--color-border))] p-8 text-center">
                <FiMessageCircle className="w-12 h-12 text-[rgb(var(--color-muted))] mx-auto mb-4" />
                <p className="text-[rgb(var(--color-muted))]">Select a ticket to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}