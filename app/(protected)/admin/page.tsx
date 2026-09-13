import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminRoot() {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.permissions?.includes("read:admin_panel")) {
    notFound();
  }

  // Langsung redirect ke tab users saat mengunjungi /admin
  redirect("/admin/users");
}
