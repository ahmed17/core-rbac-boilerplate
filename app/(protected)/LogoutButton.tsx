"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm font-medium px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted transition-colors"
    >
      Logout
    </button>
  );
}
