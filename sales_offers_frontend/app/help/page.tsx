"use client";

import Link from "next/link";
import { FiHelpCircle } from "react-icons/fi";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        <FiHelpCircle className="text-purple-600 dark:text-indigo-400 text-6xl mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Help Center</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Welcome to our Help Center! Here you can find answers to frequently asked questions, 
          troubleshooting guides, and resources to help you make the most of Sales & Offers.
        </p>
        <div className="space-y-4 mb-8 text-left">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Popular Topics</h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
            <li>How to register as a buyer?</li>
            <li>How to become a seller?</li>
            <li>How to post an offer?</li>
            <li>Payment methods and issues</li>
            <li>Account management</li>
          </ul>
        </div>
        <Link href="/contact" className="text-purple-600 hover:underline font-medium">
          Can't find what you're looking for? Contact Support
        </Link>
        <div className="mt-6">
          <Link href="/" className="text-gray-600 dark:text-gray-300 hover:underline font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

