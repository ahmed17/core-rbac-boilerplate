import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import MenusClient from "./MenusClient";

export const metadata = {
  title: "Menu Management | Core RBAC",
  description: "Kelola struktur menu aplikasi",
};

export default async function MenusPage() {
  const session = await getServerSession(authOptions) as any;

  // Proteksi Halaman (Role Based)
  if (!session?.user?.permissions?.includes("read:admin_panel")) {
    notFound();
  }

  return <MenusClient />;
}
