import { prisma } from "@/lib/db";
import { Menu } from "@prisma/client";

export type MenuItem = Menu & {
  children?: Menu[];
};

export async function getAuthorizedMenus(userPermissions: string[]): Promise<MenuItem[]> {
  // Ambil semua parent menu yang diurutkan
  const allParentMenus = await prisma.menu.findMany({
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

  // Filter berdasarkan hak akses
  const authorizedMenus = allParentMenus.reduce<MenuItem[]>((acc, menu) => {
    // 1. Cek apakah parent menu diizinkan
    const isParentAllowed = !menu.permissionId || (menu.permission && userPermissions.includes(menu.permission.action));
    
    if (isParentAllowed) {
      // 2. Filter children (sub-menu) yang diizinkan
      const allowedChildren = menu.children.filter(child => {
        return !child.permissionId || (child.permission && userPermissions.includes(child.permission.action));
      });

      // 3. Masukkan menu ke hasil
      acc.push({
        ...menu,
        children: allowedChildren
      });
    }

    return acc;
  }, []);

  return authorizedMenus;
}
