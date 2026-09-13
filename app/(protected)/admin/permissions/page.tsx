import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PermissionsClient from "./PermissionsClient";

export const metadata = {
  title: "Permissions Management | Core RBAC",
  description: "Kelola data hak akses sistem",
};

export default async function PermissionsPage() {
  const session = await getServerSession(authOptions) as any;

  if (!session?.user?.permissions?.includes("read:permissions")) {
    redirect("/dashboard?error=unauthorized");
  }

  return <PermissionsClient />;
}
