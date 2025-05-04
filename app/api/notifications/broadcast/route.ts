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
    const { title, message } = body

    if (!title || !message) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Get all resident users
    const residents = await prisma.user.findMany({
      where: {
        role: "RESIDENT",
      },
      select: {
        id: true,
      },
    })

    // Create notification for each resident
    const notificationData = residents.map((resident) => ({
      title,
      message,
      userId: resident.id,
    }))

    // Batch create notifications
    await prisma.notification.createMany({
      data: notificationData,
    })

    return NextResponse.json({
      success: true,
      count: notificationData.length,
    })
  } catch (error) {
    console.error("[NOTIFICATIONS_BROADCAST_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
