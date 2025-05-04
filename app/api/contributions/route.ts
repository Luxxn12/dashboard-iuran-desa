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
    const { title, description, targetAmount, startDate, endDate, status } = body

    if (!title || !description || !targetAmount || !startDate || !endDate) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const contribution = await prisma.contribution.create({
      data: {
        title,
        description,
        targetAmount,
        startDate,
        endDate,
        status: status || "ACTIVE",
      },
    })

    return NextResponse.json(contribution)
  } catch (error) {
    console.error("[CONTRIBUTIONS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET() {
  try {
    const contributions = await prisma.contribution.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(contributions)
  } catch (error) {
    console.error("[CONTRIBUTIONS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
