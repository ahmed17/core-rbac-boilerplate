import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RolesClient from "./RolesClient";

export default async function RolesPage() {
  const session = await getServerSession(authOptions) as any;

  // Extra layer of protection on server component
  if (!session?.user?.permissions?.includes("read:admin_panel") || !session?.user?.permissions?.includes("read:roles")) {
    redirect("/dashboard");
  }

  return <RolesClient />;
}
