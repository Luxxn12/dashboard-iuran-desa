import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// This would be a real webhook handler for Midtrans notifications
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // In a real implementation, you would verify the notification signature
    // const signatureKey = process.env.MIDTRANS_SERVER_KEY
    // const orderId = body.order_id
    // const statusCode = body.status_code
    // const grossAmount = body.gross_amount
    // const serverKey = signatureKey
    // const input = orderId + statusCode + grossAmount + serverKey
    // const expectedSignature = crypto.createHash('sha512').update(input).digest('hex')
    //
    // if (body.signature_key !== expectedSignature) {
    //   return new NextResponse("Invalid signature", { status: 401 })
    // }

    // Handle different transaction statuses
    const orderId = body.order_id
    const transactionStatus = body.transaction_status
    const fraudStatus = body.fraud_status

    // Find the transaction by receipt number (which we set to orderId)
    const transaction = await prisma.transaction.findFirst({
      where: {
        receiptNumber: orderId,
      },
      include: {
        user: true,
        contribution: true,
      },
    })

    if (!transaction) {
      return new NextResponse("Transaction not found", { status: 404 })
    }

    // Map Midtrans status to our status
    let newStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED" = "PENDING"

    if (transactionStatus === "capture") {
      // For credit card transaction, need to check the fraud status
      if (fraudStatus === "challenge") {
        newStatus = "PROCESSING" // Need manual review
      } else if (fraudStatus === "accept") {
        newStatus = "COMPLETED"
      }
    } else if (transactionStatus === "settlement") {
      newStatus = "COMPLETED" // Payment completed
    } else if (transactionStatus === "pending") {
      newStatus = "PENDING" // Payment pending
    } else if (transactionStatus === "deny" || transactionStatus === "expire" || transactionStatus === "cancel") {
      newStatus = "FAILED" // Payment failed or cancelled
    }

    // Update transaction status
    await prisma.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: newStatus,
        paymentMethod: body.payment_type || "Midtrans",
        notes: `Paid via Midtrans. Transaction ID: ${body.transaction_id}`,
      },
    })

    // Update payment status
    await prisma.payment.updateMany({
      where: {
        transactionId: transaction.id,
      },
      data: {
        status:
          newStatus === "COMPLETED"
            ? "COMPLETED"
            : newStatus === "FAILED" || newStatus === "CANCELLED"
              ? "FAILED"
              : "PENDING",
      },
    })

    // If payment is completed, update contribution collected amount
    if (newStatus === "COMPLETED" && transaction.contribution) {
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
    } else if (newStatus === "FAILED" || newStatus === "CANCELLED") {
      // Create notification for failed payment
      await prisma.notification.create({
        data: {
          title: "Pembayaran Gagal",
          message: `Pembayaran Anda sebesar Rp ${transaction.amount.toLocaleString("id-ID")} gagal diproses.`,
          userId: transaction.userId,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[MIDTRANS_WEBHOOK]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
