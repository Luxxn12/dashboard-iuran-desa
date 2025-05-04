import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { name, phoneNumber, address } = body

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
        phoneNumber,
        address,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[PROFILE_PUT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
