"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { MenuItem } from "@/lib/menus";
import { icons } from "lucide-react";

interface SidebarProps {
  userPermissions: string[];
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  menus: MenuItem[];
}

// Komponen Helper untuk Ikon Dinamis
const DynamicIcon = ({ name, className }: { name: string | null; className?: string }) => {
  if (!name) return null;
  const LucideIcon = icons[name as keyof typeof icons] as any;
  if (!LucideIcon) {
    const FallbackIcon = icons["Circle"] as any;
    return <FallbackIcon className={className} />;
  }
  return <LucideIcon className={className} />;
};

export default function GlobalSidebar({ userPermissions, isMobileOpen, setMobileOpen, isCollapsed, setIsCollapsed, menus }: SidebarProps) {
  const pathname = usePathname();
  // State untuk menyimpan menu induk mana saja yang sedang terbuka
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Auto-expand menu induk jika kita sedang berada di halamannya
  useEffect(() => {
    const newExpandedState: Record<string, boolean> = {};
    menus.forEach(menu => {
      if (menu.children && menu.children.length > 0 && menu.url) {
        if (pathname.startsWith(menu.url)) {
          newExpandedState[menu.id] = true;
        }
      }
    });
    setExpandedMenus(prev => ({ ...prev, ...newExpandedState }));
  }, [pathname, menus]);

  const toggleMenu = (menuId: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setExpandedMenus(prev => ({ ...prev, [menuId]: true }));
    } else {
      setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
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
            <DynamicIcon name="X" className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Menu (Dinamis dari Database) */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden py-6 flex flex-col gap-1 ${isCollapsed ? "px-2" : "px-4"}`}>
          {!isCollapsed && (
            <h3 className="mb-4 ml-2 text-xs font-semibold text-slate-500 uppercase tracking-wider animate-fade-in">
              Menu
            </h3>
          )}

          {menus.map((menu) => {
            const hasChildren = menu.children && menu.children.length > 0;
            const isExpanded = expandedMenus[menu.id] || false;
            
            // Logika Halaman Aktif (Parent atau Tunggal)
            const isActive = menu.url && (menu.url === "/" ? pathname === "/" : pathname.startsWith(menu.url));

            if (hasChildren) {
              return (
                <div key={menu.id} className="mt-1">
                  <button 
                    onClick={() => toggleMenu(menu.id)}
                    className={`
                      w-full flex items-center gap-3 py-2.5 rounded-lg transition-colors font-medium text-sm
                      ${isCollapsed ? "justify-center px-0" : "justify-between px-4"}
                      ${isActive
                        ? "bg-slate-800 text-white" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }
                    `}
                    title={isCollapsed ? menu.title : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <DynamicIcon name={menu.icon} className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span className="whitespace-nowrap">{menu.title}</span>}
                    </div>
                    {!isCollapsed && (
                      <DynamicIcon 
                        name="ChevronDown" 
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} 
                      />
                    )}
                  </button>

                  {/* Sub Menus */}
                  {!isCollapsed && (
                    <div 
                      className={`
                        flex flex-col gap-1 mt-1 pl-11 overflow-hidden transition-all duration-300 ease-in-out
                        ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                      `}
                    >
                      {menu.children?.map(child => {
                        const isChildActive = pathname === child.url;
                        return (
                          <Link 
                            key={child.id}
                            href={child.url || "#"}
                            className={`
                              flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap
                              ${isChildActive 
                                ? "text-white font-semibold" 
                                : "text-slate-400 hover:text-white"
                              }
                            `}
                          >
                            {child.icon && <DynamicIcon name={child.icon} className="w-4 h-4 shrink-0" />}
                            {child.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Menu Tunggal (Tanpa Anak)
            return (
              <Link 
                key={menu.id}
                href={menu.url || "#"}
                className={`
                  flex items-center gap-3 py-2.5 rounded-lg transition-colors font-medium text-sm mt-1
                  ${isCollapsed ? "justify-center px-0" : "px-4"}
                  ${isActive 
                    ? "bg-slate-800 text-white" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }
                `}
                title={isCollapsed ? menu.title : undefined}
              >
                <DynamicIcon name={menu.icon} className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">{menu.title}</span>}
              </Link>
            );
          })}
        </div>
        
        {/* Footer Area of Sidebar */}
        <div className="p-6 border-t border-slate-700/50">
          {!isCollapsed && (
            <p className="text-xs text-slate-500 text-center animate-fade-in">
              &copy; 2026 Core RBAC
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
