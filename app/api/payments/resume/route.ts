import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createMidtransTransaction } from "@/lib/midtrans"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { transactionId } = body

    if (!transactionId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
        userId: session.user.id,
        status: "PENDING",
      },
      include: {
        contribution: true,
      },
    })

    if (!transaction) {
      return new NextResponse("Transaction not found or not pending", { status: 404 })
    }

    // Get user details for the payment
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Create Midtrans transaction
    const midtransResponse = await createMidtransTransaction({
      orderId: transaction.receiptNumber || `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amount: transaction.amount,
      customerName: user.name || "User",
      customerEmail: user.email || "user@example.com",
      description: transaction.description || `Pembayaran untuk ${transaction.contribution?.title || "program iuran"}`,
    })

    return NextResponse.json({
      success: true,
      transaction,
      snapToken: midtransResponse.token,
      redirectUrl: midtransResponse.redirect_url,
    })
  } catch (error) {
    console.error("[PAYMENTS_RESUME_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
