import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// This is a simplified version without actual Midtrans integration
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

    // Check if user has already paid for this contribution
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId: session.user.id,
        contributionId,
        status: "COMPLETED",
      },
    })

    if (existingPayment) {
      return new NextResponse("You have already paid for this contribution", { status: 400 })
    }

    // In a real implementation, we would integrate with Midtrans here
    // For demo purposes, we'll create a payment record directly

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount,
        status: "COMPLETED", // In real implementation, this would be PENDING until confirmed by Midtrans
        paymentMethod: "Demo Payment", // In real implementation, this would be set by Midtrans
        userId: session.user.id,
        contributionId,
      },
    })

    // Update contribution collected amount
    await prisma.contribution.update({
      where: {
        id: contributionId,
      },
      data: {
        collectedAmount: {
          increment: amount,
        },
      },
    })

    // Create notification for the user
    await prisma.notification.create({
      data: {
        title: "Pembayaran Berhasil",
        message: `Pembayaran Anda sebesar Rp ${amount.toLocaleString("id-ID")} untuk program ${contribution.title} telah berhasil.`,
        userId: session.user.id,
      },
    })

    // In a real implementation, we would return a redirect URL to Midtrans payment page
    return NextResponse.json({
      success: true,
      payment,
      // redirectUrl: "https://midtrans-payment-page.com/example",
    })
  } catch (error) {
    console.error("[PAYMENTS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
