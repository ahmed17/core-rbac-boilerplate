"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface SidebarProps {
  userPermissions: string[];
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function GlobalSidebar({ userPermissions, isMobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isAdminExpanded, setIsAdminExpanded] = useState(false);

  // Auto-expand admin menu if we are inside the admin route
  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setIsAdminExpanded(true);
    }
  }, [pathname]);

  const hasAdminAccess = userPermissions.includes("read:admin_panel");

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-[#1C2434] text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-700/50">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">
              R
            </div>
            <span className="text-xl font-bold tracking-tight text-white">RBAC Boilerplate</span>
          </Link>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-4">
          <h3 className="mb-4 ml-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </h3>

          {/* Dashboard Menu Item */}
          <Link 
            href="/dashboard"
            className={`
              flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm
              ${pathname === "/dashboard" 
                ? "bg-slate-800 text-white" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            Dashboard
          </Link>

          {/* Admin Panel (Tree Structure) */}
          {hasAdminAccess && (
            <div className="mt-2">
              <button 
                onClick={() => setIsAdminExpanded(!isAdminExpanded)}
                className={`
                  w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm
                  ${pathname.startsWith("/admin") 
                    ? "bg-slate-800 text-white" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Admin Panel
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${isAdminExpanded ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              {/* Sub Menus */}
              <div 
                className={`
                  flex flex-col gap-1 mt-1 pl-11 overflow-hidden transition-all duration-300 ease-in-out
                  ${isAdminExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
                `}
              >
                <Link 
                  href="/admin/users"
                  className={`
                    px-4 py-2 rounded-lg transition-colors text-sm font-medium
                    ${pathname.includes("/admin/users") 
                      ? "text-white font-semibold" 
                      : "text-slate-400 hover:text-white"
                    }
                  `}
                >
                  Users
                </Link>
                <Link 
                  href="/admin/roles"
                  className={`
                    px-4 py-2 rounded-lg transition-colors text-sm font-medium
                    ${pathname.includes("/admin/roles") 
                      ? "text-white font-semibold" 
                      : "text-slate-400 hover:text-white"
                    }
                  `}
                >
                  Roles & Permissions
                </Link>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer Area of Sidebar */}
        <div className="p-6 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            &copy; 2026 Core RBAC
          </p>
        </div>
      </aside>
    </>
  );
}
