# Changelog

## [0.1.0] - Dynamic Database RBAC
### Added
- **[Fase 11]** Antarmuka (UI) User Management di halaman Admin Panel menggunakan Client Component (`AdminClient.tsx`).
- **[Fase 11]** Fitur CRUD lengkap (Create User, Update Role, Delete User) via antarmuka tabel bergaya Glassmorphism.
- **[Fase 11]** API `/api/admin/users/route.ts` yang terproteksi (membutuhkan sesi JWT dan permission `read:admin_panel`).
- **[Fase 11]** Penggunaan metode `POST` untuk seluruh mutasi data demi menghindari pemblokiran oleh Web Application Firewall (WAF) lawas.
- **[Fase 11]** Integrasi otomatis dengan sistem Audit Trails; setiap aksi `CREATE`, `UPDATE_ROLE`, dan `DELETE` di-log ke tabel `AuditLog`.
- **[Fase 10]** Tabel `AuditLog` pada Prisma schema untuk mencatat jejak digital (*Digital Footprint*) pengguna secara permanen (append-only).
- **[Fase 10]** Utilitas `lib/audit.ts` universal untuk mencatat aktivitas `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `CREATE`, `UPDATE`, dan `DELETE`.
- **[Fase 9]** Absolute Session Timeout 12 jam (`maxAge`) pada JWT untuk membatasi usia sesi login.
- **[Fase 9]** Idle Auto-Logout 60 menit — komponen `IdleTimeout.tsx` mendeteksi 5 jenis aktivitas (mouse, keyboard, scroll, touch, click) dan otomatis logout jika idle.
- **[Fase 8]** Integrasi Cloudflare Turnstile (Invisible CAPTCHA) pada halaman Login dan Register.
- **[Fase 8]** Utilitas server-side `lib/turnstile.ts` untuk verifikasi token ke API Cloudflare (Server-to-Server).
- **[Fase 8]** Tombol Sign In/Sign Up di-*disable* sampai Turnstile berhasil memverifikasi pengguna.
- **[Fase 7]** Fitur Anti Brute-Force (Account Lockout System) berbasis database Prisma.
- **[Fase 7]** Kolom `failedAttempts` dan `lockedUntil` pada tabel `User`.
- **[Fase 7]** Logika penguncian akun selama 15 menit jika gagal login 5 kali berturut-turut.
- **[Fase 6]** Dynamic Database-driven RBAC menggunakan tabel `Role` dan `Permission`.
- **[Fase 6]** Skrip otomatis Prisma Seeding (`prisma/seed.ts`) untuk migrasi data Role/Permission awal.
- **[Fase 6]** Injeksi array *Permissions* langsung ke dalam Token JWT (Edge-compatible).
- **[Fase 6]** Resolusi tipe kustom TypeScript NextAuth Session untuk mendukung dynamic roles.


Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

## [Unreleased]

### Fase 5: Theme Switcher & UI Contrast Tuning
- **Dark Mode Toggle**: Mengintegrasikan `next-themes` dan membuat komponen `ThemeToggle` (Matahari/Bulan) yang disematkan pada navigasi *Landing Page* dan *Dashboard*.
- **Contrast Resolution**: Merombak gaya `.glass-card` dan `.input-field` di `globals.css` agar secara dinamis menggunakan warna *background* dan *border* yang kontras (*pop-out*) di atas mode Terang maupun mode Gelap.

### Fase 4: Integrasi Component Library (shadcn/ui)
- **Shadcn Initialization**: Inisialisasi arsitektur komponen menggunakan CLI `shadcn/ui` yang dioptimalkan untuk lingkungan Tailwind CSS v4 tanpa merusak konfigurasi *glassmorphism* sebelumnya (`components.json`, `app/globals.css`).
- **Core Utility**: Menambahkan file utilitas dasar `lib/utils.ts` yang mengekspor fungsi cerdas `cn()` (gabungan `clsx` dan `tailwind-merge`) untuk resolusi konflik *class* Tailwind secara aman.
- **Base Components**: Menginstal 5 komponen krusial pertama (`button`, `input`, `card`, `table`, `dropdown-menu`) secara fisik ke dalam direktori `components/ui/` sebagai landasan awal pengembangan fitur *Dashboard* dan *Admin Panel* di masa depan.

### UI & UX Enhancements
- **Landing Page**: Mengganti default Next.js page (`app/page.tsx`) dengan *custom landing page* interaktif berdesain *glassmorphism* dan tombol navigasi dinamis menuju Dashboard/Login.
- **Register Validation**: Memecah validasi *password* menjadi checklist *real-time* yang memberikan indikator hijau pada setiap kriteria yang sudah terpenuhi secara individu (`app/(auth)/register/page.tsx`).
- **Password Visibility**: Menambahkan *toggle* ikon mata (Show/Hide) pada isian *Password* dan *Confirm Password* untuk kemudahan mengecek kesalahan ketik (`app/(auth)/register/page.tsx`).

### Fase 3: RBAC Proxy & Protected Routes
- **Route Protection**: Menggunakan konvensi `proxy.ts` baru dari Next.js 16 (pengganti `middleware.ts`) untuk memproteksi akses menuju halaman di dalam `/dashboard` dan `/admin` berdasarkan validasi JWT token dari `next-auth/jwt`.
- **Protected Layout**: Membuat Layout terproteksi (`app/(protected)/layout.tsx`) dengan *Top Navigation Bar* yang secara cerdas mendeteksi *role* pengguna; Navigasi menu ke "Admin Panel" hanya di-render untuk akun dengan profil `ADMIN`.
- **Dashboard Page**: Halaman root internal (`app/(protected)/dashboard/page.tsx`) yang merangkum *Account Info* (Email, Role) dan tautan navigasi tambahan (jika berlaku).
- **Admin Page**: Halaman *server component* terlindungi berlapis ganda (`app/(protected)/admin/page.tsx`) yang melakukan *query* langsung dengan PrismaClient untuk melisting semua user yang terdaftar ke dalam tabel rapi.
- **Logout Action**: Komponen klien spesifik `LogoutButton.tsx` untuk menangani *sign out* NextAuth dan meneruskan user kembali ke `/login`.

### Fase 2: Authentication UI (Halaman Login & Register)
- **Session Provider**: Membungkus root layout dengan `<Providers>` untuk menyematkan context NextAuth di seluruh aplikasi Client-side (`components/Providers.tsx`, `app/layout.tsx`).
- **Global Styles**: Menerapkan *custom design tokens*, animasi (`fade-in`, `slide-up`, `pulse-slow`), dan utilities tambahan menggunakan fitur dari Tailwind CSS v4 (`app/globals.css`).
- **Auth Layout**: Membuat *Shared Auth Layout* untuk Login dan Register dengan visual background dinamis (`app/(auth)/layout.tsx`).
- **Halaman Login**: Membuat halaman UI modern dengan desain premium (*glassmorphism*) yang dibungkus `<Suspense>` (`app/(auth)/login/page.tsx`).
- **Halaman Register**: Membuat UI registrasi lengkap dengan validasi kecocokan *password* (client-side) dan fitur auto-login (`app/(auth)/register/page.tsx`).

### Fase 1: Foundation (NextAuth Setup & Secure Password Management)
- **Dependencies**: Menambahkan `bcryptjs` untuk hashing password, `@types/bcryptjs` untuk tipe data, dan `tsx` untuk menjalankan script seed TypeScript.
- **Environment Variables**: Menambahkan `NEXTAUTH_SECRET` dan `NEXTAUTH_URL` di konfigurasi environment `.env`.
- **Database Singleton**: Membuat `lib/db.ts` untuk mencegah koneksi Prisma berlebih saat mode development (hot-reload).
- **Type Augmentations**: Menambahkan `next-auth.d.ts` untuk menyisipkan tipe `id` dan `role` pada Session, User, dan JWT agar dikenali oleh TypeScript.
- **NextAuth Integration**: Konfigurasi awal NextAuth dengan `CredentialsProvider` dan `PrismaAdapter` di `lib/auth.ts` serta route handler di `app/api/auth/[...nextauth]/route.ts`.
- **Registration API**: Membuat Endpoint `POST /api/auth/register` dengan validasi password yang ketat (minimal 8 karakter, huruf besar, huruf kecil, angka, dan simbol) serta pengecekan duplikasi email.
- **Prisma Seed**: Membuat script `prisma/seed.ts` untuk mengotomatisasi pembuatan user `ADMIN` pertama (`admin@rbac.local`).
