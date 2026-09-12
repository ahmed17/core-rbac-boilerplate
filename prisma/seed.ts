import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Permissions
  const permissions = ["read:admin_panel", "read:dashboard", "manage:users"];
  
  for (const action of permissions) {
    await prisma.permission.upsert({
      where: { action },
      update: {},
      create: { action, description: `Permission to ${action}` },
    });
  }

  const allPermissions = await prisma.permission.findMany();

  // 2. Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {
      permissions: {
        set: allPermissions.map((p) => ({ id: p.id })),
      },
    },
    create: {
      name: "ADMIN",
      description: "Super Administrator",
      permissions: {
        connect: allPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  const dashboardPermission = await prisma.permission.findUnique({
    where: { action: "read:dashboard" },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {
      permissions: {
        set: dashboardPermission ? [{ id: dashboardPermission.id }] : [],
      },
    },
    create: {
      name: "USER",
      description: "Standard User",
      permissions: {
        connect: dashboardPermission ? [{ id: dashboardPermission.id }] : [],
      },
    },
  });

  // 3. Create Default Admin User
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  await prisma.user.upsert({
    where: { email: "admin@rbac.local" },
    update: {
      roleId: adminRole.id,
    },
    create: {
      name: "Super Admin",
      email: "admin@rbac.local",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
