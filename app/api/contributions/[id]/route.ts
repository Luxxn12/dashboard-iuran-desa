import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return new NextResponse("Contribution ID is required", { status: 400 })
    }

    const contribution = await prisma.contribution.findUnique({
      where: {
        id: params.id,
      },
      include: {
        payments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!contribution) {
      return new NextResponse("Contribution not found", { status: 404 })
    }

    return NextResponse.json(contribution)
  } catch (error) {
    console.error("[CONTRIBUTION_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Contribution ID is required", { status: 400 })
    }

    const body = await request.json()
    const { title, description, targetAmount, startDate, endDate, status } = body

    if (!title || !description || !targetAmount || !startDate || !endDate || !status) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const contribution = await prisma.contribution.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        description,
        targetAmount,
        startDate,
        endDate,
        status,
      },
    })

    return NextResponse.json(contribution)
  } catch (error) {
    console.error("[CONTRIBUTION_PUT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Contribution ID is required", { status: 400 })
    }

    // Check if there are any payments for this contribution
    const paymentsCount = await prisma.payment.count({
      where: {
        contributionId: params.id,
      },
    })

    if (paymentsCount > 0) {
      // If there are payments, just update the status to CANCELLED
      await prisma.contribution.update({
        where: {
          id: params.id,
        },
        data: {
          status: "CANCELLED",
        },
      })
    } else {
      // If no payments, we can safely delete the contribution
      await prisma.contribution.delete({
        where: {
          id: params.id,
        },
      })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CONTRIBUTION_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
