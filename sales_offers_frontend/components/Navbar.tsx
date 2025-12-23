"use client";

import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX, FiUser, FiLogOut, FiChevronDown, FiChevronUp } from "react-icons/fi";
import ProfilePicture from "./ProfilePicture";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import { FiHeart } from "react-icons/fi"; // Replace cart with favorites
import { useNavbar } from "../contexts/NavbarContext";
import { API_BASE_URL } from "../lib/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userProfile, setUserProfile] = useState<{ name?: string, profilePicture?: string, profile_picture?: string, google_picture?: string }>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const { navHidden, setNavHidden } = useNavbar();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith('/admin');

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

    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUsername = localStorage.getItem("username");

      if (token && storedUsername) {
        setIsLoggedIn(true);
        setUsername(storedUsername);

        // Fetch fresh user profile data
        try {
          const response = await fetch(`${API_BASE_URL}/api/accounts/profile/`, {
            headers: { Authorization: `Token ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setUserProfile({
              name: userData.first_name && userData.last_name ? `${userData.first_name} ${userData.last_name}` : userData.username,
              profile_picture: userData.profile_picture,
              google_picture: userData.google_picture,
              profilePicture: userData.profile_picture || userData.google_picture
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setIsLoggedIn(false);
        setUsername("");
        setUserProfile({});
      }
    };

    checkAuth();
    fetchSubscription();
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
    localStorage.removeItem("userProfile");
    localStorage.removeItem("is_staff");
    localStorage.removeItem("is_superuser");
    setIsLoggedIn(false);
    setUsername("");
    setUserProfile({});
    window.dispatchEvent(new Event("authChange"));
    setSubscription(null);
    window.location.href = "/";
  };

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await fetch(`${API_BASE_URL}/api/sellers/stats/`, {
          headers: { Authorization: `Token ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
        }
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const canAccessAdmin = () => {
    if (typeof window === 'undefined') return false;
    const isStaff = localStorage.getItem("is_staff") === "true";
    const isSuperuser = localStorage.getItem("is_superuser") === "true";
    return isStaff && isSuperuser;
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-[rgb(var(--color-card))]/95 shadow-sm border-b border-[rgb(var(--color-border))] transition-all duration-300 ${navHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="max-w-7xl mx-auto overflow-visible" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
          <div className="flex justify-between items-center h-16 w-full overflow-visible">
            <div className="flex-shrink-0 min-w-[180px] sm:min-w-[220px]">
              <Link href="/" style={{ display: 'inline-block' }}>
                <Image
                  src="/images/sales_and_offers_logo.svg"
                  alt="Sales & Offers Logo"
                  width={317}
                  height={50}
                  className="h-5 w-auto sm:h-8"
                  style={{
                    filter: isDarkMode
                      ? 'brightness(0) saturate(100%) invert(89%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(89%) contrast(89%)'
                      : 'brightness(0) saturate(100%) invert(9%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(9%) contrast(89%)'
                  }}
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
              <Link href="/offers" className="text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] transition-colors font-medium">
                Browse Deals
              </Link>
              <Link href="/sellers" className="text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] transition-colors font-medium">
                Sellers
              </Link>
              <Link href="/blog" className="text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] transition-colors font-medium">
                Blog
              </Link>
              {canAccessAdmin() && (
                <Link href="/admin/dashboard" className="text-purple-600 dark:text-purple-400 transition-colors font-semibold">
                  Admin
                </Link>
              )}
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              {isLoggedIn && (
                <Link href="/favorites" className="p-2 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] transition-colors relative">
                  <FiHeart className="w-5 h-5" />
                </Link>
              )}
              {isLoggedIn && <NotificationBell />}
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ProfilePicture
                      src={userProfile.profile_picture || userProfile.google_picture || userProfile.profilePicture}
                      alt={userProfile.name || username}
                      size="md"
                      clickable={true}
                    />
                    <span className="text-gray-700 dark:text-gray-200 font-medium text-sm max-w-20 truncate">
                      {userProfile.name || username}
                    </span>
                    <FiChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-[100]">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/seller/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Seller Dashboard
                      </Link>
                      <Link
                        href="/favorites"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Favorites
                      </Link>
                      <Link
                        href="/favorites"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Favorites
                      </Link>
                      <Link
                        href="/messages"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Messages
                      </Link>
                      <Link
                        href="/notifications"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Notifications
                      </Link>
                      <Link
                        href="/subscription"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Subscription ({subscription?.plan_name || 'No Plan'})
                      </Link>
                      {canAccessAdmin() && (
                        <Link
                          href="/admin/dashboard"
                          className="block px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors font-medium"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <hr className="my-2 border-gray-200 dark:border-gray-600" />
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
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
            <div className="md:hidden flex items-center space-x-3">
              {isLoggedIn && (
                <Link href="/favorites" className="p-2 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] transition-colors">
                  <FiHeart className="w-5 h-5" />
                </Link>
              )}
              {isLoggedIn && <NotificationBell />}
              <button onClick={toggleMenu} className="p-2 text-[rgb(var(--color-muted))] focus:outline-none">
                <FiMenu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Side Menu */}
        {isOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-[9998] md:hidden" onClick={toggleMenu}></div>
            <div className="fixed top-0 right-0 h-full w-80 bg-[rgb(var(--color-card))]/95 shadow-xl z-[9999] transform translate-x-0 transition-transform duration-300 md:hidden isolate border-l border-[rgb(var(--color-border))] overflow-hidden" style={{ position: 'fixed', top: 0, right: 0, height: '100vh', zIndex: 9999 }}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-3 pb-2 flex-shrink-0">
                  <div className="flex-1 min-w-0">
                    <Image
                      src="/images/sales_and_offers_logo.svg"
                      alt="Sales & Offers Logo"
                      width={317}
                      height={50}
                      className="h-5 w-auto"
                      style={{
                        filter: isDarkMode
                          ? 'brightness(0) saturate(100%) invert(89%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(89%) contrast(89%)'
                          : 'brightness(0) saturate(100%) invert(9%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(9%) contrast(89%)'
                      }}
                    />
                  </div>
                  <button onClick={toggleMenu} className="text-[rgb(var(--color-muted))] flex-shrink-0 ml-3 p-2">
                    <FiX className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-6">
                  <div className="space-y-2">
                    <Link
                      href="/offers"
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                      onClick={toggleMenu}
                    >
                      Browse Deals
                    </Link>
                    <Link
                      href="/sellers"
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                      onClick={toggleMenu}
                    >
                      Sellers
                    </Link>
                    <Link
                      href="/blog"
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                      onClick={toggleMenu}
                    >
                      Blog
                    </Link>
                    <Link
                      href="/help"
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                      onClick={toggleMenu}
                    >
                      Help Center
                    </Link>
                    <Link
                      href="/contact"
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                      onClick={toggleMenu}
                    >
                      Contact
                    </Link>
                    <Link
                      href="/pricing"
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                      onClick={toggleMenu}
                    >
                      Pricing
                    </Link>
                    {isLoggedIn && (
                      <Link
                        href="/dashboard"
                        className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                        onClick={toggleMenu}
                      >
                        Dashboard
                      </Link>
                    )}

                    <div className="border-t border-[rgb(var(--color-border))] pt-3 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-[rgb(var(--color-muted))]">Theme</span>
                        <ThemeToggle />
                      </div>

                      {isLoggedIn ? (
                        <div className="space-y-2">
                          <Link
                            href="/dashboard"
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                            onClick={toggleMenu}
                          >
                            <ProfilePicture
                              src={userProfile.profile_picture || userProfile.google_picture || userProfile.profilePicture}
                              alt={userProfile.name || username}
                              size="sm"
                              clickable={true}
                            />
                            <span className="truncate">{userProfile.name || username}</span>
                          </Link>
                          <Link
                            href="/favorites"
                            className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                            onClick={toggleMenu}
                          >
                            My Favorites
                          </Link>
                          <Link
                            href="/messages"
                            className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                            onClick={toggleMenu}
                          >
                            Messages
                          </Link>
                          <Link
                            href="/notifications"
                            className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                            onClick={toggleMenu}
                          >
                            Notifications
                          </Link>
                          <Link
                            href="/subscription"
                            className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                            onClick={toggleMenu}
                          >
                            Subscription ({subscription?.plan_name || 'No Plan'})
                          </Link>
                          <Link
                            href="/seller/dashboard"
                            className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                            onClick={toggleMenu}
                          >
                            Seller Dashboard
                          </Link>
                          <Link
                            href="/seller/profile"
                            className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                            onClick={toggleMenu}
                          >
                            Seller Profile
                          </Link>
                          <Link
                            href="/seller/offers"
                            className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                            onClick={toggleMenu}
                          >
                            My Advertisements
                          </Link>
                          {canAccessAdmin() && (
                            <Link
                              href="/admin/dashboard"
                              className="block px-3 py-2 rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                              onClick={toggleMenu}
                            >
                              Admin Dashboard
                            </Link>
                          )}
                          <Link
                            href="/profile"
                            className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                            onClick={toggleMenu}
                          >
                            Profile
                          </Link>
                          <button
                            onClick={() => { handleLogout(); toggleMenu(); }}
                            className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <FiLogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Link
                            href="/login"
                            className="block px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-card))] transition-colors"
                            onClick={toggleMenu}
                          >
                            Login
                          </Link>
                          <Link
                            href="/register"
                            className="block w-full text-center bg-[rgb(var(--color-primary))] text-[rgb(var(--color-on-primary))] px-3 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
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
            </div>
          </>
        )}
      </nav>

      {/* Chevron Toggle Button - Only show on admin pages */}
      {isAdminPage && (
        <div className={`fixed top-0 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ${navHidden ? 'translate-y-2' : 'translate-y-16'}`}>
          <button
            onClick={() => setNavHidden(!navHidden)}
            className="bg-[rgb(var(--color-card))] border border-[rgb(var(--color-border))] rounded-b-lg px-3 py-1 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-ui))] transition-all duration-200 shadow-sm"
            title={navHidden ? 'Show main navigation' : 'Hide main navigation'}
          >
            {navHidden ? (
              <FiChevronDown className="w-4 h-4" />
            ) : (
              <FiChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </>
  );
}