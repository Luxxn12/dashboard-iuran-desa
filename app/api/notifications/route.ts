import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { userId, title, message } = body

    if (!userId || !title || !message) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        userId,
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("[NOTIFICATIONS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
