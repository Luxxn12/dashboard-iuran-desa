import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { compare, hash } from "bcrypt"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.id !== params.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate request
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Password saat ini dan password baru wajib diisi" }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Password saat ini salah" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[USER_PASSWORD_PUT]", error)
    return NextResponse.json({ message: "Terjadi kesalahan saat mengganti password" }, { status: 500 })
  }
}
