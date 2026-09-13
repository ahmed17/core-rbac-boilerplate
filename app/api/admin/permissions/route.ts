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
  if (!(await isAuthorized("read:permissions"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { action: 'asc' },
      include: {
        _count: {
          select: { roles: true }
        }
      }
    });

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("GET Permissions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestAction, id, action, description } = body; // action is the permission string like "read:users"

    if (requestAction === "CREATE") {
      if (!(await isAuthorized("create:permissions"))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (!action) {
        return NextResponse.json({ error: "Action string wajib diisi" }, { status: 400 });
      }

      const exists = await prisma.permission.findUnique({ where: { action } });
      if (exists) {
        return NextResponse.json({ error: "Permission sudah ada" }, { status: 400 });
      }

      const permission = await prisma.permission.create({
        data: {
          action: action.toLowerCase(),
          description: description || null,
        }
      });
      return NextResponse.json(permission);
    } 
    
    else if (requestAction === "UPDATE") {
      if (!(await isAuthorized("update:permissions"))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (!id || !action) {
        return NextResponse.json({ error: "ID dan Action wajib diisi" }, { status: 400 });
      }

      const permission = await prisma.permission.update({
        where: { id },
        data: {
          action: action.toLowerCase(),
          description: description || null,
        }
      });
      return NextResponse.json(permission);
    } 
    
    else if (requestAction === "DELETE") {
      if (!(await isAuthorized("delete:permissions"))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (!id) {
        return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
      }

      await prisma.permission.delete({ where: { id } });
      return NextResponse.json({ success: true });
    } 
    
    else {
      return NextResponse.json({ error: "Request Action tidak valid" }, { status: 400 });
    }
  } catch (error) {
    console.error("POST Permissions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
