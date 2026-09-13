import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any;

    if (!session || !session.user?.permissions?.includes("read:roles")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Ambil daftar roles dan perhitungannya (jumlah user per role)
    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // Ambil semua daftar permissions master yang tersedia di sistem
    const permissions = await prisma.permission.findMany({
      orderBy: { action: "asc" },
    });

    return NextResponse.json({ roles, permissions });
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // --- AKSI: CREATE ROLE ---
    if (action === "CREATE") {
      if (!session.user?.permissions?.includes("create:roles")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const { name, description, permissionIds } = body;

      if (!name) {
        return NextResponse.json({ error: "Nama Role wajib diisi." }, { status: 400 });
      }

      // Cek nama kembar
      const existing = await prisma.role.findUnique({ where: { name } });
      if (existing) {
        return NextResponse.json({ error: "Nama Role sudah digunakan." }, { status: 409 });
      }

      const newRole = await prisma.role.create({
        data: {
          name,
          description,
          permissions: {
            connect: (permissionIds || []).map((id: string) => ({ id })),
          },
        },
      });

      await logAudit({
        userId: session.user.id,
        userName: session.user.name,
        action: "CREATE",
        target: `/api/admin/roles`,
        metadata: { roleId: newRole.id, roleName: newRole.name },
      });

      return NextResponse.json({ success: true, message: "Role berhasil dibuat." }, { status: 201 });
    }

    // --- AKSI: UPDATE ROLE ---
    if (action === "UPDATE") {
      if (!session.user?.permissions?.includes("update:roles")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const { roleId, name, description, permissionIds } = body;

      if (!roleId || !name) {
        return NextResponse.json({ error: "ID dan Nama Role wajib diisi." }, { status: 400 });
      }

      // Hindari mengedit nama role jika kembar dengan yang lain
      const existing = await prisma.role.findUnique({ where: { name } });
      if (existing && existing.id !== roleId) {
        return NextResponse.json({ error: "Nama Role sudah digunakan." }, { status: 409 });
      }

      await prisma.role.update({
        where: { id: roleId },
        data: {
          name,
          description,
          permissions: {
            set: [], // Hapus relasi lama
            connect: (permissionIds || []).map((id: string) => ({ id })), // Hubungkan yang baru
          },
        },
      });

      await logAudit({
        userId: session.user.id,
        userName: session.user.name,
        action: "UPDATE",
        target: `/api/admin/roles`,
        metadata: { roleId, newName: name },
      });

      return NextResponse.json({ success: true, message: "Role berhasil diperbarui." });
    }

    // --- AKSI: DELETE ROLE ---
    if (action === "DELETE") {
      if (!session.user?.permissions?.includes("delete:roles")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const { roleId } = body;

      if (!roleId) {
        return NextResponse.json({ error: "ID Role wajib diisi." }, { status: 400 });
      }

      // Cek apakah ada user yang masih menggunakan Role ini
      const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: { _count: { select: { users: true } } },
      });

      if (!role) {
        return NextResponse.json({ error: "Role tidak ditemukan." }, { status: 404 });
      }

      if (role._count.users > 0) {
        return NextResponse.json({ error: "Gagal: Terdapat user yang masih menggunakan Role ini. Pindahkan user terlebih dahulu." }, { status: 400 });
      }

      await prisma.role.delete({
        where: { id: roleId },
      });

      await logAudit({
        userId: session.user.id,
        userName: session.user.name,
        action: "DELETE",
        target: `/api/admin/roles`,
        metadata: { roleId, roleName: role.name },
      });

      return NextResponse.json({ success: true, message: "Role berhasil dihapus." });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
  } catch (error) {
    console.error("Roles API error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
