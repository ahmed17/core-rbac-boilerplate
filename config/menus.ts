export const MASTER_MENUS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: "LayoutDashboard",
    sortOrder: 1,
    permissionAction: null, // Public for all logged-in users
    children: [],
  },
  {
    title: "Admin Panel",
    url: "/admin",
    icon: "Shield",
    sortOrder: 2,
    permissionAction: "read:admin_panel",
    children: [
      {
        title: "Users",
        url: "/admin/users",
        icon: "Users",
        sortOrder: 1,
        permissionAction: "read:users",
      },
      {
        title: "Roles & Permissions",
        url: "/admin/roles",
        icon: "Key",
        sortOrder: 2,
        permissionAction: "read:roles",
      },
      {
        title: "Menu Management",
        url: "/admin/menus",
        icon: "ListTree",
        sortOrder: 3,
        permissionAction: "read:menus",
      },
    ],
  },
];
