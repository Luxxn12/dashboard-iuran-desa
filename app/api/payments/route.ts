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
    const { contributionId, amount } = body

    if (!contributionId || !amount) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if contribution exists and is active
    const contribution = await prisma.contribution.findUnique({
      where: {
        id: contributionId,
        status: "ACTIVE",
      },
    })

    if (!contribution) {
      return new NextResponse("Contribution not found or not active", { status: 404 })
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

    // Create a unique order ID
    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create a transaction record
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type: "PAYMENT",
        status: "PENDING",
        description: `Pembayaran untuk ${contribution.title}`,
        receiptNumber: orderId,
        user: {
          connect: {
            id: session.user.id,
          },
        },
        contribution: {
          connect: {
            id: contributionId,
          },
        },
      },
    })

    // Create payment record linked to the transaction
    const payment = await prisma.payment.create({
      data: {
        amount,
        status: "PENDING",
        paymentMethod: "Midtrans",
        userId: session.user.id,
        contributionId,
        transactionId: transaction.id,
      },
    })

    // Create notification for the user
    await prisma.notification.create({
      data: {
        title: "Pembayaran Diproses",
        message: `Pembayaran Anda sebesar Rp ${amount.toLocaleString("id-ID")} untuk program ${contribution.title} sedang diproses.`,
        userId: session.user.id,
      },
    })

    // Create Midtrans transaction
    const midtransResponse = await createMidtransTransaction({
      orderId,
      amount,
      customerName: user.name || "User",
      customerEmail: user.email || "user@example.com",
      description: `Pembayaran untuk ${contribution.title}`,
    })

    return NextResponse.json({
      success: true,
      payment,
      transaction,
      snapToken: midtransResponse.token,
      redirectUrl: midtransResponse.redirect_url,
    })
  } catch (error) {
    console.error("[PAYMENTS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
