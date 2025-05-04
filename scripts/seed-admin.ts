import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: "admin@example.com",
      },
    })

    if (existingAdmin) {
      console.log("Admin user already exists")
      return
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

    console.log("Admin user created:", admin)
  } catch (error) {
    console.error("Error seeding admin user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
