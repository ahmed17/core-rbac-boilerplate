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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-expand admin menu if we are inside the admin route
  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setIsAdminExpanded(true);
    }
  }, [pathname]);

  const hasAdminAccess = userPermissions.includes("read:admin_panel");

  const handleAdminPanelClick = () => {
    if (isCollapsed) {
      // If collapsed, expand the sidebar first, then expand the menu
      setIsCollapsed(false);
      setIsAdminExpanded(true);
    } else {
      setIsAdminExpanded(!isAdminExpanded);
    }
  };

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
          fixed inset-y-0 left-0 z-50 flex flex-col bg-[#1C2434] text-slate-300 transition-all duration-300 ease-in-out lg:static lg:translate-x-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        {/* Logo Area */}
        <div className={`flex items-center py-6 border-b border-slate-700/50 ${isCollapsed ? "justify-center px-0" : "justify-between px-6"}`}>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20 shrink-0">
              R
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap animate-fade-in">
                RBAC Boilerplate
              </span>
            )}
          </Link>
          
          {/* Mobile Close Button */}
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden py-6 flex flex-col gap-1 ${isCollapsed ? "px-2" : "px-4"}`}>
          {!isCollapsed && (
            <h3 className="mb-4 ml-2 text-xs font-semibold text-slate-500 uppercase tracking-wider animate-fade-in">
              Menu
            </h3>
          )}

          {/* Dashboard Menu Item */}
          <Link 
            href="/dashboard"
            className={`
              flex items-center gap-3 py-2.5 rounded-lg transition-colors font-medium text-sm
              ${isCollapsed ? "justify-center px-0" : "px-4"}
              ${pathname === "/dashboard" 
                ? "bg-slate-800 text-white" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }
            `}
            title={isCollapsed ? "Dashboard" : undefined}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
          </Link>

          {/* Admin Panel (Tree Structure) */}
          {hasAdminAccess && (
            <div className="mt-2">
              <button 
                onClick={handleAdminPanelClick}
                className={`
                  w-full flex items-center gap-3 py-2.5 rounded-lg transition-colors font-medium text-sm
                  ${isCollapsed ? "justify-center px-0" : "justify-between px-4"}
                  ${pathname.startsWith("/admin") 
                    ? "bg-slate-800 text-white" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }
                `}
                title={isCollapsed ? "Admin Panel" : undefined}
              >
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  {!isCollapsed && <span className="whitespace-nowrap">Admin Panel</span>}
                </div>
                {!isCollapsed && (
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
                    className={`shrink-0 transition-transform duration-200 ${isAdminExpanded ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                )}
              </button>

              {/* Sub Menus */}
              {!isCollapsed && (
                <div 
                  className={`
                    flex flex-col gap-1 mt-1 pl-11 overflow-hidden transition-all duration-300 ease-in-out
                    ${isAdminExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
                  `}
                >
                  <Link 
                    href="/admin/users"
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap
                      ${pathname.includes("/admin/users") 
                        ? "text-white font-semibold" 
                        : "text-slate-400 hover:text-white"
                      }
                    `}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Users
                  </Link>
                  <Link 
                    href="/admin/roles"
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap
                      ${pathname.includes("/admin/roles") 
                        ? "text-white font-semibold" 
                        : "text-slate-400 hover:text-white"
                      }
                    `}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                    Roles & Perms
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>
        
        {/* Footer Area of Sidebar (Toggle Button) */}
        <div className="p-4 border-t border-slate-700/50 flex justify-center lg:justify-end">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="9" y1="3" y2="21"/>
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
