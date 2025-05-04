import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import prisma from "@/lib/prisma"

// This is a temporary endpoint to create an admin user
// You should remove this in production
export async function GET() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: "admin@example.com",
      },
    })

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin user already exists" })
    }

    // Create admin user
    const hashedPassword = await hash("password123", 10)

    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    })

    // Remove sensitive data
    const { password, ...adminWithoutPassword } = admin

    return NextResponse.json({
      message: "Admin user created successfully",
      user: adminWithoutPassword,
    })
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json({ message: "Error creating admin user" }, { status: 500 })
  }
}
