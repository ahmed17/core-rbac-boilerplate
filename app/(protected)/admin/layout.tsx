"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Users", href: "/admin/users", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ) },
    { name: "Roles & Permissions", href: "/admin/roles", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
    ) },
  ];

  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 border-r border-border/50 bg-muted/30">
        <div className="sticky top-16 p-4 sm:p-6 h-auto md:h-[calc(100vh-4rem)] overflow-y-auto">
          <h2 className="text-sm font-semibold text-muted-foreground tracking-widest uppercase mb-4 px-3">
            Admin Menu
          </h2>
          <nav className="flex flex-col space-y-1" aria-label="Sidebar">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className={`${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 w-full max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
