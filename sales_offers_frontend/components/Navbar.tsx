"use client";

import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX, FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check theme
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                    localStorage.getItem('theme') === 'dark' ||
                    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(isDark);
    };

    checkTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const storedUsername = localStorage.getItem("username");
      if (token && storedUsername) {
        setIsLoggedIn(true);
        setUsername(storedUsername);
      } else {
        setIsLoggedIn(false);
        setUsername("");
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("authChange", checkAuth);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", checkAuth);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername("");
    window.dispatchEvent(new Event("authChange"));
    window.location.href = "/";
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-[rgb(var(--color-card))] shadow-sm border-b border-[rgb(var(--color-border))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/sales_and_offers_blabk_bg_white_-removebg-preview icon only.svg"
              alt="Sales & Offers Logo"
              width={40}
              height={40}
              className={`h-10 w-10 ${isDarkMode ? 'text-[#E2E2E2]' : 'text-[#171717]'}`}
            />
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/offers" className="text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] transition-colors font-medium">
              Browse Offers
            </Link>
            <Link href="/sellers" className="text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] transition-colors font-medium">
              Sellers
            </Link>
            <Link href="/about" className="text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] transition-colors font-medium">
              About
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-200 font-medium text-sm max-w-20 truncate">{username}</span>
                  <FiChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <Link
                      href="/seller/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                    <hr className="my-2 border-gray-200 dark:border-gray-600" />
                    <button
                      onClick={() => { handleLogout(); setDropdownOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[rgb(var(--color-primary))] text-[rgb(var(--color-on-primary))] px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-[rgb(var(--color-muted))] focus:outline-none">
              <FiMenu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Side Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleMenu}></div>
          <div className="fixed top-0 right-0 h-full w-80 bg-[rgb(var(--color-card))] shadow-xl z-50 transform transition-transform duration-300 md:hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <Image
                    src="/images/sales_and_offers_blabk_bg_white_-removebg-preview icon only.svg"
                    alt="Sales & Offers Logo"
                    width={32}
                    height={32}
                    className={`h-8 w-8 ${isDarkMode ? 'text-[#E2E2E2]' : 'text-[#171717]'}`}
                  />
                </div>
                <button onClick={toggleMenu} className="text-[rgb(var(--color-muted))]">
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <Link
                  href="/offers"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                  onClick={toggleMenu}
                >
                  Browse Offers
                </Link>
                <Link
                  href="/sellers"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                  onClick={toggleMenu}
                >
                  Sellers
                </Link>
                <Link
                  href="/about"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                  onClick={toggleMenu}
                >
                  About
                </Link>
                
                <div className="border-t border-[rgb(var(--color-border))] pt-4 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-[rgb(var(--color-muted))]">Theme</span>
                    <ThemeToggle />
                  </div>
                  
                  {isLoggedIn ? (
                    <div className="space-y-2">
                      <Link
                        href="/seller/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                        onClick={toggleMenu}
                      >
                        <FiUser className="w-5 h-5" />
                        <span>{username}</span>
                      </Link>
                      <button
                        onClick={() => { handleLogout(); toggleMenu(); }}
                        className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/login"
                        className="block px-4 py-3 rounded-lg text-base font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                        onClick={toggleMenu}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="block w-full text-center bg-[rgb(var(--color-primary))] text-[rgb(var(--color-on-primary))] px-4 py-3 rounded-lg text-base font-medium hover:shadow-lg transition-all duration-300"
                        onClick={toggleMenu}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}