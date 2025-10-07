"use client";

import Link from "next/link";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        <FiMail className="text-purple-600 dark:text-indigo-400 text-6xl mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          We'd love to hear from you! Whether you have a question, feedback, or need support, 
          our team is ready to assist you.
        </p>
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center text-gray-700 dark:text-gray-300">
            <FiMail className="text-purple-600 dark:text-indigo-400 text-2xl mr-3" />
            <p className="text-lg">support@salesandoffers.com</p>
          </div>
          <div className="flex items-center justify-center text-gray-700 dark:text-gray-300">
            <FiPhone className="text-purple-600 dark:text-indigo-400 text-2xl mr-3" />
            <p className="text-lg">+1 (555) 123-4567</p>
          </div>
          <div className="flex items-center justify-center text-gray-700 dark:text-gray-300">
            <FiMapPin className="text-purple-600 dark:text-indigo-400 text-2xl mr-3" />
            <p className="text-lg">123 Deal Street, Offer City, 98765</p>
          </div>
        </div>
        <Link href="/" className="text-purple-600 hover:underline font-medium">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

