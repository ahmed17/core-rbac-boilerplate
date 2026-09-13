import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import IdleTimeout from "./IdleTimeout";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions) as any;

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <IdleTimeout />
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <span className="text-xl font-bold tracking-tight text-primary">RBAC</span>
              <div className="hidden sm:flex space-x-6">
                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                {session.user?.permissions?.includes("read:admin_panel") && (
                  <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-right hidden sm:block">
                <p className="font-medium">{session.user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{session.user?.roleName?.toLowerCase() || "User"}</p>
              </div>
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
