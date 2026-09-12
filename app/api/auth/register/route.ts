import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
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
