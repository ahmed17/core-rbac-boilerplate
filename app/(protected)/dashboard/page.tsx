import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, <span className="font-medium text-foreground">{session?.user?.name}</span>! Here is your overview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">Account Info</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{session?.user?.email}</dd>
            </div>
            <div className="flex justify-between items-center pt-1">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium px-2.5 py-0.5 bg-primary/10 text-primary rounded-md text-xs tracking-wider">
                {session?.user?.role}
              </dd>
            </div>
          </dl>
        </div>
        
        {session?.user?.role === "ADMIN" && (
          <div className="glass-card p-6 rounded-2xl border-primary/20 bg-primary/[0.02] flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Admin Privileges
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                You have administrator privileges. You can manage users and system settings in the Admin Panel.
              </p>
            </div>
            <Link href="/admin" className="text-sm font-medium text-primary hover:underline group inline-flex items-center w-fit">
              Go to Admin Panel 
              <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
