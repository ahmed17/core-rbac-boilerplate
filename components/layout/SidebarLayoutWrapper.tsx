"use client";

import { useState } from "react";
import GlobalSidebar from "./GlobalSidebar";
import GlobalHeader from "./GlobalHeader";

interface SidebarLayoutWrapperProps {
  children: React.ReactNode;
  userPermissions: string[];
  userName: string;
  userRole: string;
}

export default function SidebarLayoutWrapper({ 
  children, 
  userPermissions, 
  userName, 
  userRole 
}: SidebarLayoutWrapperProps) {
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <GlobalSidebar 
        userPermissions={userPermissions} 
        isMobileOpen={isMobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      {/* Main Content Area */}
      <div className="relative flex flex-col flex-1 overflow-x-hidden overflow-y-auto">
        {/* Header */}
        <GlobalHeader 
          userName={userName} 
          userRole={userRole} 
          setMobileOpen={setMobileOpen} 
        />
        
        {/* Page Content */}
        <main className="flex-1 w-full p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
