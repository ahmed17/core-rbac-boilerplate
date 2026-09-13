import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SidebarLayoutWrapper from "@/components/layout/SidebarLayoutWrapper";
import IdleTimeout from "./IdleTimeout";
import { getAuthorizedMenus } from "@/lib/menus";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions) as any;

  if (!session) {
    redirect("/login");
  }

  const userPermissions = session.user?.permissions || [];
  const dynamicMenus = await getAuthorizedMenus(userPermissions);

  return (
    <>
      <IdleTimeout />
      <SidebarLayoutWrapper
        userPermissions={userPermissions}
        userName={session.user?.name || "User"}
        userRole={session.user?.roleName || "USER"}
        menus={dynamicMenus}
      >
        {children}
      </SidebarLayoutWrapper>
    </>
  );
}
