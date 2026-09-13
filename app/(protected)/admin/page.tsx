import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions) as any;

  // Extra layer of protection on server component just in case proxy is bypassed
  if (!session?.user?.permissions?.includes("read:admin_panel")) {
    redirect("/dashboard");
  }

  return <AdminClient />;
}
