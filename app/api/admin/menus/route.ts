import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Pengecekan Otorisasi Internal
async function isAuthorized(requiredPermission: string) {
  const session = await getServerSession(authOptions) as any;
  if (!session) return false;
  return session.user.permissions?.includes(requiredPermission);
}

export async function GET() {
  if (!(await isAuthorized("read:menus"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Mengambil menu (diurutkan dan dikelompokkan: parent -> children)
    const menus = await prisma.menu.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        permission: true,
        children: {
          orderBy: { sortOrder: 'asc' },
          include: { permission: true }
        }
      }
    });

    // Mengambil daftar permission untuk dropdown form
    const permissions = await prisma.permission.findMany({
      orderBy: { action: 'asc' }
    });

    return NextResponse.json({ menus, permissions });
  } catch (error) {
    console.error("GET Menus error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id, title, url, icon, sortOrder, parentId, permissionId } = body;

    if (action === "CREATE") {
      if (!(await isAuthorized("create:menus"))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (!title) {
        return NextResponse.json({ error: "Title wajib diisi" }, { status: 400 });
      }

      const menu = await prisma.menu.create({
        data: {
          title,
          url: url || null,
          icon: icon || null,
          sortOrder: parseInt(sortOrder) || 0,
          parentId: parentId || null,
          permissionId: permissionId || null,
        }
      });
      return NextResponse.json(menu);
    } 
    
    else if (action === "UPDATE") {
      if (!(await isAuthorized("update:menus"))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (!id || !title) {
        return NextResponse.json({ error: "ID dan Title wajib diisi" }, { status: 400 });
      }

      const menu = await prisma.menu.update({
        where: { id },
        data: {
          title,
          url: url || null,
          icon: icon || null,
          sortOrder: parseInt(sortOrder) || 0,
          parentId: parentId || null,
          permissionId: permissionId || null,
        }
      });
      return NextResponse.json(menu);
    } 
    
    else if (action === "DELETE") {
      if (!(await isAuthorized("delete:menus"))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (!id) {
        return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
      }

      // Prisma cascade akan otomatis menghapus sub-menu jika parent dihapus
      await prisma.menu.delete({ where: { id } });
      return NextResponse.json({ success: true });
    } 
    
    else {
      return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
    }
  } catch (error) {
    console.error("POST Menus error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
