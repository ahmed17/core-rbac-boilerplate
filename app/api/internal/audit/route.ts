import { NextResponse } from "next/server";
import { logAudit, type AuditAction } from "@/lib/audit";

/**
 * API Route Internal untuk menerima log dari Edge Middleware.
 * Middleware (proxy.ts) berjalan di Edge Runtime yang tidak bisa
 * mengakses Prisma secara langsung, sehingga ia mengirim data
 * log ke endpoint ini via fetch.
 *
 * Endpoint ini dilindungi oleh header rahasia internal
 * agar tidak bisa dipanggil dari luar.
 */
export async function POST(request: Request) {
  // Proteksi: hanya terima request dari Middleware internal
  const internalKey = request.headers.get("x-internal-key");
  if (internalKey !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, userName, action, target, ip, userAgent, metadata } = body;

    await logAudit({
      userId,
      userName,
      action: action as AuditAction,
      target,
      ip,
      userAgent,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Internal audit API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
