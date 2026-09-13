import { prisma } from "@/lib/db";

/**
 * Jenis aksi yang bisa dicatat oleh sistem Audit.
 */
export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "PAGE_VIEW"
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE";

interface AuditLogParams {
  userId?: string | null;
  userName?: string | null;
  action: AuditAction;
  target?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Mencatat aktivitas pengguna ke tabel AuditLog.
 * Fungsi ini bersifat "fire-and-forget" — tidak akan mengganggu
 * alur utama aplikasi jika pencatatan gagal.
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        userName: params.userName ?? null,
        action: params.action,
        target: params.target ?? null,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (error) {
    // Jangan pernah biarkan kegagalan pencatatan log
    // menghancurkan alur utama aplikasi.
    console.error("Audit log error:", error);
  }
}
