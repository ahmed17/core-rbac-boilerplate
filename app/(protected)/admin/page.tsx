import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function AdminPage() {
  const session = await getServerSession(authOptions) as any;

  // Extra layer of protection on server component just in case proxy is bypassed
  if (!session?.user?.permissions?.includes("read:admin_panel")) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: {
        select: { name: true }
      },
    },
    orderBy: {
      role: { name: 'asc' },
    }
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Manage system users and view their roles.
        </p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{user.name || "-"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full tracking-wide ${
                      user.role?.name === 'ADMIN' 
                        ? 'bg-blue-500/10 text-blue-500' 
                        : 'bg-zinc-500/10 text-zinc-500'
                    }`}>
                      {user.role?.name || "No Role"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
