"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  FiHome, FiUsers, FiTag, FiShoppingBag, FiMail, FiBarChart, 
  FiSettings, FiFileText, FiActivity, FiServer, FiMenu, FiX,
  FiLogOut, FiShield, FiUser
} from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: FiHome, label: "Dashboard", href: "/admin/dashboard", adminOnly: false },
  { icon: FiUsers, label: "Users", href: "/admin/users", adminOnly: false },
  { icon: FiTag, label: "Deals", href: "/admin/deals", adminOnly: false },
  { icon: FiShoppingBag, label: "Sellers", href: "/admin/sellers", adminOnly: false },
  { icon: FiMail, label: "Newsletter", href: "/admin/newsletter", adminOnly: false },
  { icon: FiBarChart, label: "Analytics", href: "/admin/analytics", adminOnly: false },
  { icon: FiFileText, label: "Reports", href: "/admin/reports", adminOnly: true },
  { icon: FiActivity, label: "Logs", href: "/admin/logs", adminOnly: true },
  { icon: FiServer, label: "System", href: "/admin/system", adminOnly: true },
  { icon: FiSettings, label: "Settings", href: "/admin/settings", adminOnly: true },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "staff" | null>(null);
  const [username, setUsername] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if user is admin/staff
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    
    if (!token) {
      router.push("/login");
      return;
    }

    // Mock role check - in real app, verify with backend
    const mockRole = localStorage.getItem("userRole") || "staff";
    setUserRole(mockRole as "admin" | "staff");
    setUsername(storedUsername || "Admin");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || userRole === "admin"
  );

  if (!userRole) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[rgb(var(--color-card))] border-r border-[rgb(var(--color-border))] transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-[rgb(var(--color-border))]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <FiShield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[rgb(var(--color-fg))]">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))]"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-r-2 border-red-600'
                      : 'text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-ui))]'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-red-600 dark:text-red-400' : ''}`} />
                  {item.label}
                  {item.adminOnly && userRole === "admin" && (
                    <FiShield className="ml-auto h-3 w-3 text-red-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[rgb(var(--color-border))]">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[rgb(var(--color-fg))] truncate">{username}</p>
                <p className="text-xs text-[rgb(var(--color-muted))] capitalize">{userRole}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Bar */}
        <header className="bg-[rgb(var(--color-card))] border-b border-[rgb(var(--color-border))] px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))]"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-[rgb(var(--color-muted))]">Admin Dashboard</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}