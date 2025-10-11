"use client";

import { useState } from "react";
import { FiMail, FiCheck } from "react-icons/fi";
import axios from "axios";
import { API_BASE_URL } from "../lib/api";

export default function NewsletterSubscription() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_BASE_URL}/api/newsletter/subscribe/`, { email });
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
        <FiCheck className="w-5 h-5" />
        <span className="text-sm font-medium">Successfully subscribed!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1 relative">
        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-muted))] w-4 h-4" />
        <input
          type="email"
          required
          className="w-full pl-10 pr-4 py-2 text-sm border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] bg-[rgb(var(--color-card))] text-[rgb(var(--color-fg))]"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 text-sm bg-[rgb(var(--color-primary))] text-[rgb(var(--color-on-primary))] rounded-lg hover:bg-[rgb(var(--color-primary))]/90 transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "Subscribe"}
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-1 w-full">{error}</p>
      )}
    </form>
  );
}