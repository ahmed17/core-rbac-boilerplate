import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  // Langsung redirect ke tab users saat mengunjungi /admin
  redirect("/admin/users");
}
