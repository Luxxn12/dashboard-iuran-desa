import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, address, phoneNumber } = body

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Nama, email, dan password wajib diisi." }, { status: 400 })
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar. Silakan gunakan email lain." }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "RESIDENT", // Default role for new users
        address: address || null,
        phoneNumber: phoneNumber || null,
      },
    })

    // Create welcome notification for the user
    await prisma.notification.create({
      data: {
        title: "Selamat Datang di Aplikasi Iuran Desa",
        message: "Terima kasih telah mendaftar. Anda sekarang dapat melihat dan membayar iuran desa.",
        userId: user.id,
      },
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("[REGISTER_POST]", error)
    return NextResponse.json({ message: "Terjadi kesalahan saat mendaftar." }, { status: 500 })
  }
}
