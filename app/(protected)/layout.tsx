import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SidebarLayoutWrapper from "@/components/layout/SidebarLayoutWrapper";
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
    <>
      <IdleTimeout />
      <SidebarLayoutWrapper
        userPermissions={session.user?.permissions || []}
        userName={session.user?.name || "User"}
        userRole={session.user?.roleName || "USER"}
      >
        {children}
      </SidebarLayoutWrapper>
    </>
  );
}
