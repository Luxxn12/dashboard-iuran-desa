import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const receiptNumber = searchParams.get("receiptNumber")
    const userId = searchParams.get("userId")
    const contributionId = searchParams.get("contributionId")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build the where clause based on the provided filters
    const where: any = {}

    // Admin can see all transactions, residents can only see their own
    if (session.user.role !== "ADMIN") {
      where.userId = session.user.id
    } else if (userId) {
      where.userId = userId
    }

    if (receiptNumber) {
      where.receiptNumber = receiptNumber
    }

    if (contributionId) {
      where.contributionId = contributionId
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.createdAt = {
        gte: new Date(startDate),
      }
    } else if (endDate) {
      where.createdAt = {
        lte: new Date(endDate),
      }
    }

    // Get transactions with pagination
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contribution: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    const total = await prisma.transaction.count({ where })

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { userId, contributionId, amount, type, description, paymentMethod, receiptNumber, notes } = body

    if (!userId || !amount || !type) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        status: "PENDING",
        description,
        paymentMethod,
        receiptNumber,
        notes,
        user: {
          connect: {
            id: userId,
          },
        },
        ...(contributionId && {
          contribution: {
            connect: {
              id: contributionId,
            },
          },
        }),
      },
    })

    return NextResponse.json({
      success: true,
      transaction,
    })
  } catch (error) {
    console.error("[TRANSACTIONS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
