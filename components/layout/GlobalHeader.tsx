"use client";

import { useState, useRef, useEffect } from "react";
import LogoutButton from "@/app/(protected)/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  userName: string;
  userRole: string;
  setMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function GlobalHeader({ userName, userRole, setMobileOpen, isCollapsed, setIsCollapsed }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b border-border/40">
      <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11">
        
        {/* Left Side: Menus & Toggles */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Hamburger Menu (Mobile Only) */}
          <button
            onClick={() => setMobileOpen(true)}
            className="z-50 block rounded-sm border border-border bg-background p-1.5 shadow-sm lg:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>

          {/* Desktop Toggle Button (Like TailAdmin) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border/50"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <line x1="9" x2="9" y1="3" y2="21"/>
            </svg>
          </button>
          
          <span className="text-lg font-bold text-primary lg:hidden">RBAC</span>
        </div>

        {/* Spacer for desktop to push items to the right */}
        <div className="hidden lg:block flex-grow" />

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-4 sm:gap-6">
          <ThemeToggle />
          
          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-4 hover:opacity-80 transition-opacity focus:outline-none"
            >
              <div className="hidden text-right sm:block">
                <span className="block text-sm font-medium text-foreground">
                  {userName}
                </span>
                <span className="block text-xs text-muted-foreground capitalize">
                  {userRole.toLowerCase()}
                </span>
              </div>
              
              {/* Avatar Circle */}
              <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center bg-muted/50 text-foreground font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>

              {/* Chevron icon */}
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
                className={`hidden sm:block text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-4 flex w-48 flex-col rounded-xl border border-border bg-background shadow-lg animate-fade-in z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border/50 sm:hidden">
                  <span className="block text-sm font-medium text-foreground truncate">{userName}</span>
                  <span className="block text-xs text-muted-foreground capitalize">{userRole.toLowerCase()}</span>
                </div>
                <div className="p-2">
                  <div onClick={() => setIsDropdownOpen(false)} className="w-full">
                    <LogoutButton />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
