import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logAudit } from "@/lib/audit";

// --- MIDDLEWARE PENGAMAN API ---
async function requireAdmin() {
  const session = await getServerSession(authOptions) as any;
  if (!session || !session.user?.permissions?.includes("read:admin_panel")) {
    return { error: "Forbidden", status: 403, session: null };
  }
  return { error: null, status: 200, session };
}

// ==========================================
// [GET] Ambil semua data User
// ==========================================
export async function GET() {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        failedAttempts: true,
        lockedUntil: true,
        role: {
          select: {
            name: true,
          }
        }
      },
      orderBy: { id: "asc" },
    });

    const roles = await prisma.role.findMany({
      select: { id: true, name: true },
    });

    return NextResponse.json({ users, roles });
  } catch (err) {
    console.error("GET users error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ==========================================
// [POST] Endpoint Mutasi (Create, Update, Delete)
// Memakai POST untuk menghindari blokir WAF
// ==========================================
export async function POST(request: Request) {
  const { error, status, session } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  try {
    const body = await request.json();
    const { action } = body;

    // --- AKSI: CREATE USER ---
    if (action === "CREATE") {
      const { name, email, password, roleId } = body;

      if (!name || !email || !password) {
        return NextResponse.json({ error: "Nama, email, dan password wajib diisi." }, { status: 400 });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roleId: roleId || null,
        },
      });

      await logAudit({
        userId: session.user.id,
        userName: session.user.name,
        action: "CREATE",
        target: `/api/admin/users`,
        metadata: { createdUserId: newUser.id, createdUserEmail: newUser.email },
      });

      return NextResponse.json({ success: true, message: "User berhasil dibuat." }, { status: 201 });
    }

    // --- AKSI: UPDATE ROLE ---
    if (action === "UPDATE_ROLE") {
      const { userId, roleId } = body;

      if (!userId) {
        return NextResponse.json({ error: "ID User wajib diisi." }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { roleId: roleId || null },
      });

      await logAudit({
        userId: session.user.id,
        userName: session.user.name,
        action: "UPDATE",
        target: `/api/admin/users`,
        metadata: { updatedUserId: userId, newRoleId: roleId },
      });

      return NextResponse.json({ success: true, message: "Role berhasil diperbarui." });
    }

    // --- AKSI: DELETE USER ---
    if (action === "DELETE") {
      const { userId } = body;

      if (!userId) {
        return NextResponse.json({ error: "ID User wajib diisi." }, { status: 400 });
      }

      // Pencegahan: Admin tidak boleh menghapus dirinya sendiri
      if (userId === session.user.id) {
        return NextResponse.json({ error: "Anda tidak bisa menghapus akun Anda sendiri." }, { status: 403 });
      }

      const userToDelete = await prisma.user.findUnique({ where: { id: userId } });
      if (!userToDelete) {
         return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
      }

      await prisma.user.delete({
        where: { id: userId },
      });

      await logAudit({
        userId: session.user.id,
        userName: session.user.name,
        action: "DELETE",
        target: `/api/admin/users`,
        metadata: { deletedUserId: userId, deletedUserEmail: userToDelete.email },
      });

      return NextResponse.json({ success: true, message: "User berhasil dihapus." });
    }

    return NextResponse.json({ error: "Action tidak valid." }, { status: 400 });

  } catch (err) {
    console.error("POST users error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
