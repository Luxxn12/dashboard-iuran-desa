import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { hash } from "bcrypt"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, role, address, phoneNumber } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Nama, email, password, dan role wajib diisi." }, { status: 400 })
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
        role,
        address: address || null,
        phoneNumber: phoneNumber || null,
      },
    })

    // Create welcome notification for the user
    await prisma.notification.create({
      data: {
        title: "Selamat Datang di Aplikasi Iuran Desa",
        message: `Akun Anda telah dibuat oleh admin dengan role ${role === "ADMIN" ? "Admin" : "Warga"}.`,
        userId: user.id,
      },
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("[ADMIN_USERS_POST]", error)
    return NextResponse.json({ message: "Terjadi kesalahan saat menambahkan pengguna." }, { status: 500 })
  }
}
