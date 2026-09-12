# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

## [Unreleased]

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
