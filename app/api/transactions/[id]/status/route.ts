import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !["COMPLETED", "FAILED"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 })
    }

    // Find the transaction
    const transaction = await prisma.payment.findUnique({
      where: { id: params.id },
    })

    if (!transaction) {
      return new NextResponse("Transaction not found", { status: 404 })
    }

    // Update transaction status
    const updatedTransaction = await prisma.payment.update({
      where: { id: params.id },
      data: { status },
    })

    // If the transaction is marked as completed, update the contribution collected amount
    if (status === "COMPLETED" && transaction.status !== "COMPLETED") {
      await prisma.contribution.update({
        where: { id: transaction.contributionId },
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
          message: `Pembayaran Anda sebesar Rp ${transaction.amount.toLocaleString("id-ID")} telah dikonfirmasi.`,
          userId: transaction.userId,
        },
      })
    }

    // If the transaction is marked as failed and was previously completed, update the contribution amount
    if (status === "FAILED" && transaction.status === "COMPLETED") {
      await prisma.contribution.update({
        where: { id: transaction.contributionId },
        data: {
          collectedAmount: {
            decrement: transaction.amount,
          },
        },
      })

      // Create notification for the user
      await prisma.notification.create({
        data: {
          title: "Pembayaran Gagal",
          message: `Mohon maaf, pembayaran Anda sebesar Rp ${transaction.amount.toLocaleString("id-ID")} telah ditandai gagal.`,
          userId: transaction.userId,
        },
      })
    }

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error("[TRANSACTION_STATUS_PUT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
