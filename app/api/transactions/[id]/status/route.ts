import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return new NextResponse("Missing status field", { status: 400 })
    }

    // Validate status
    const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return new NextResponse("Invalid status", { status: 400 })
    }

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        contribution: true,
      },
    })

    if (!transaction) {
      return new NextResponse("Transaction not found", { status: 404 })
    }

    // Update transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: {
        id,
      },
      data: {
        status,
      },
    })

    // Update payment status
    await prisma.payment.updateMany({
      where: {
        transactionId: id,
      },
      data: {
        status:
          status === "COMPLETED" ? "COMPLETED" : status === "FAILED" || status === "CANCELLED" ? "FAILED" : "PENDING",
      },
    })

    // If payment is completed, update contribution collected amount
    if (status === "COMPLETED" && transaction.contribution) {
      await prisma.contribution.update({
        where: {
          id: transaction.contribution.id,
        },
        data: {
          collectedAmount: {
            increment: transaction.amount,
          },
        },
      })

      // Create notification for the user
      await prisma.notification.create({
        data: {
          title: "Pembayaran Berhasil",
          message: `Pembayaran Anda sebesar Rp ${transaction.amount.toLocaleString("id-ID")} telah berhasil.`,
          userId: transaction.userId,
        },
      })
    } else if (status === "FAILED" || status === "CANCELLED") {
      // Create notification for failed payment
      await prisma.notification.create({
        data: {
          title: "Pembayaran Gagal",
          message: `Pembayaran Anda sebesar Rp ${transaction.amount.toLocaleString("id-ID")} gagal diproses.`,
          userId: transaction.userId,
        },
      })
    }

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
    })
  } catch (error) {
    console.error("[TRANSACTION_STATUS_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
