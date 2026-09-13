/**
 * Daftar Master Permissions (Hak Akses) yang tersedia di sistem.
 * Setiap kali menambah/mengurangi permissions di sini,
 * jalankan `npm run sync:permissions` agar masuk ke database.
 */

export const MASTER_PERMISSIONS = [
  // --- Admin Panel ---
  {
    action: "read:admin_panel",
    description: "Mengizinkan pengguna untuk mengakses halaman Admin Panel secara keseluruhan.",
  },
  
  // --- User Management ---
  {
    action: "read:users",
    description: "Melihat daftar pengguna di dalam Admin Panel.",
  },
  {
    action: "create:users",
    description: "Membuat pengguna baru melalui menu Admin Panel.",
  },
  {
    action: "update:users",
    description: "Mengedit profil (nama, email) dan me-reset password pengguna lain.",
  },
  {
    action: "delete:users",
    description: "Menghapus akun pengguna secara permanen.",
  },
  {
    action: "assign:roles",
    description: "Mengubah atau menetapkan Role kepada seorang pengguna.",
  },

  // --- Role Management ---
  {
    action: "read:roles",
    description: "Melihat daftar Role dan hak akses yang tersedia.",
  },
  {
    action: "create:roles",
    description: "Membuat Role baru.",
  },
  {
    action: "update:roles",
    description: "Mengedit nama Role dan mengatur hak akses (permissions) yang dimiliki Role tersebut.",
  },
  {
    action: "delete:roles",
    description: "Menghapus Role dari sistem.",
  },

  // --- Menu Management ---
  {
    action: "read:menus",
    description: "Melihat daftar menu sistem.",
  },
  {
    action: "create:menus",
    description: "Menambahkan menu baru.",
  },
  {
    action: "update:menus",
    description: "Memperbarui konfigurasi menu (ikon, URL, izin).",
  },
  {
    action: "delete:menus",
    description: "Menghapus menu dari sistem.",
  },
];
