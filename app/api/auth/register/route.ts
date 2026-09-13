import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyTurnstileToken } from "@/lib/turnstile";

// Validasi password: min 8 karakter, huruf besar, huruf kecil, angka, simbol
function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password harus minimal 8 karakter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password harus mengandung minimal satu huruf kecil.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password harus mengandung minimal satu huruf besar.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password harus mengandung minimal satu angka.";
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return "Password harus mengandung minimal satu simbol.";
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Cek apakah registrasi publik diizinkan
    if (process.env.NEXT_PUBLIC_ALLOW_REGISTRATION !== "true") {
      return NextResponse.json(
        { error: "Public registration is currently disabled." },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const { name, email, password, turnstileToken } = await req.json();

    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    // Verifikasi Turnstile Token
    if (turnstileToken) {
      const isTurnstileValid = await verifyTurnstileToken(turnstileToken);
      if (!isTurnstileValid) {
        return NextResponse.json(
          { error: "Verifikasi keamanan gagal. Silakan muat ulang halaman." },
          { status: 403 }
        );
      }
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    // Validasi password
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // role default USER sudah di-set di schema Prisma
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      { message: "Registrasi berhasil.", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
