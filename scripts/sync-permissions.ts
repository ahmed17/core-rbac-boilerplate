import { PrismaClient } from "@prisma/client";
import { MASTER_PERMISSIONS } from "../config/permissions";
import { MASTER_MENUS } from "../config/menus";

const prisma = new PrismaClient();

async function syncPermissions() {
  console.log("Memulai sinkronisasi permissions...");

  const existingPermissions = await prisma.permission.findMany();
  const existingActions = existingPermissions.map(p => p.action);

  const newPermissions = MASTER_PERMISSIONS.filter(
    (p) => !existingActions.includes(p.action)
  );

  if (newPermissions.length > 0) {
    console.log(`Menambahkan ${newPermissions.length} permission baru...`);
    await prisma.permission.createMany({
      data: newPermissions,
      skipDuplicates: true,
    });
  } else {
    console.log("Tidak ada permission baru yang perlu ditambahkan.");
  }

  // Opsional: Hapus permissions lama yang tidak ada di MASTER (Hati-hati jika ada relasi)
  // const masterActions = MASTER_PERMISSIONS.map(p => p.action);
  // const obsoletePermissions = existingActions.filter(a => !masterActions.includes(a));
  // if (obsoletePermissions.length > 0) {
  //   console.log(`Menghapus ${obsoletePermissions.length} permission usang...`);
  //   await prisma.permission.deleteMany({
  //     where: { action: { in: obsoletePermissions } },
  //   });
  // }

  // Pastikan Role 'ADMIN' memiliki semua permissions
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  if (adminRole) {
    const allPermissions = await prisma.permission.findMany();
    await prisma.role.update({
      where: { id: adminRole.id },
      data: {
        permissions: {
          set: allPermissions.map(p => ({ id: p.id }))
        }
      }
    });
    console.log("Berhasil menyinkronkan seluruh hak akses ke Role ADMIN.");
  }

  console.log("Sinkronisasi permissions selesai! ✅");

  // --- MENU SYNCING ---
  console.log("Memulai sinkronisasi menus...");
  
  for (const masterMenu of MASTER_MENUS) {
    // Cari permission jika ada
    let permId = null;
    if (masterMenu.permissionAction) {
      const perm = await prisma.permission.findUnique({ where: { action: masterMenu.permissionAction } });
      if (perm) permId = perm.id;
    }

    // Upsert Parent Menu (menggunakan title sebagai identifier sederhana untuk seeder ini)
    const parentMenu = await prisma.menu.findFirst({ where: { title: masterMenu.title, parentId: null } });
    let parentMenuId = "";
    
    if (!parentMenu) {
      const newMenu = await prisma.menu.create({
        data: {
          title: masterMenu.title,
          url: masterMenu.url,
          icon: masterMenu.icon,
          sortOrder: masterMenu.sortOrder,
          permissionId: permId,
        }
      });
      parentMenuId = newMenu.id;
    } else {
      await prisma.menu.update({
        where: { id: parentMenu.id },
        data: { url: masterMenu.url, icon: masterMenu.icon, sortOrder: masterMenu.sortOrder, permissionId: permId }
      });
      parentMenuId = parentMenu.id;
    }

    // Sync Children
    if (masterMenu.children && masterMenu.children.length > 0) {
      for (const child of masterMenu.children) {
        let childPermId = null;
        if (child.permissionAction) {
          const cPerm = await prisma.permission.findUnique({ where: { action: child.permissionAction } });
          if (cPerm) childPermId = cPerm.id;
        }

        const childMenu = await prisma.menu.findFirst({ where: { title: child.title, parentId: parentMenuId } });
        if (!childMenu) {
          await prisma.menu.create({
            data: {
              title: child.title,
              url: child.url,
              icon: child.icon,
              sortOrder: child.sortOrder,
              permissionId: childPermId,
              parentId: parentMenuId,
            }
          });
        } else {
          await prisma.menu.update({
            where: { id: childMenu.id },
            data: { url: child.url, icon: child.icon, sortOrder: child.sortOrder, permissionId: childPermId }
          });
        }
      }
    }
  }

  console.log("Sinkronisasi menus selesai! ✅");
}

syncPermissions()
  .catch((e) => {
    console.error("Gagal sinkronisasi permissions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
