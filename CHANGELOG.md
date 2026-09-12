# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **NextAuth Integration**: Konfigurasi awal NextAuth dengan `CredentialsProvider` dan `PrismaAdapter` (`lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`).
- **Database Singleton**: `lib/db.ts` untuk mencegah koneksi Prisma berlebih saat mode development (hot-reload).
- **Registration API**: Endpoint `POST /api/auth/register` dengan validasi password yang ketat (minimal 8 karakter, huruf besar, huruf kecil, angka, dan simbol) serta pengecekan duplikasi email.
- **Type Augmentations**: `next-auth.d.ts` untuk menambahkan tipe `id` dan `role` pada Session, User, dan JWT agar dikenali oleh TypeScript.
- **Prisma Seed**: Script `prisma/seed.ts` untuk mengotomatisasi pembuatan user `ADMIN` pertama (`admin@rbac.local`).
- **Dependencies**: `bcryptjs` untuk hashing password, `@types/bcryptjs` untuk tipe data, dan `tsx` untuk menjalankan script seed TypeScript.
- **Environment Variables**: Penambahan `NEXTAUTH_SECRET` dan `NEXTAUTH_URL` di konfigurasi environment.
