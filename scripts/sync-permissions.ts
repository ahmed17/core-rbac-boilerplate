import { PrismaClient } from "@prisma/client";
import { MASTER_PERMISSIONS } from "../config/permissions";

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

  console.log("Sinkronisasi permissions selesai! ✅");
}

syncPermissions()
  .catch((e) => {
    console.error("Gagal sinkronisasi permissions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
