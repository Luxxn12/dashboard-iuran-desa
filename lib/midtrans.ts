// This is a simplified Midtrans integration for demonstration
// In a production environment, you would use the official Midtrans SDK

import { v4 as uuidv4 } from "uuid"

// Types for Midtrans API responses
export interface MidtransTransaction {
  token: string
  redirect_url: string
  order_id: string
  gross_amount: string
  transaction_status: string
}

// Function to create a Midtrans Snap token
export async function createMidtransTransaction({
  orderId,
  amount,
  customerName,
  customerEmail,
  description,
}: {
  orderId: string
  amount: number
  customerName: string
  customerEmail: string
  description: string
}): Promise<MidtransTransaction> {
  try {
    // In a real implementation, you would call the Midtrans API here
    // For demonstration purposes, we'll create a real Snap token if possible

    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY is not defined")
    }

    const apiUrl = "https://app.sandbox.midtrans.com/snap/v1/transactions"

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(serverKey + ":").toString("base64")}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        customer_details: {
          first_name: customerName,
          email: customerEmail,
        },
        item_details: [
          {
            id: "item1",
            price: amount,
            quantity: 1,
            name: description,
          },
        ],
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment-success`,
          error: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment-failed`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment-pending`,
        },
      }),
    })

    if (!response.ok) {
      // If the API call fails, fall back to a mock response
      console.error("Failed to create Midtrans transaction, using mock response")
      return createMockMidtransTransaction(orderId, amount)
    }

    const data = await response.json()

    return {
      token: data.token,
      redirect_url: data.redirect_url,
      order_id: orderId,
      gross_amount: amount.toString(),
      transaction_status: "pending",
    }
  } catch (error) {
    console.error("Error creating Midtrans transaction:", error)
    // Fall back to a mock response if there's an error
    return createMockMidtransTransaction(orderId, amount)
  }
}

// Create a mock Midtrans transaction (fallback)
function createMockMidtransTransaction(orderId: string, amount: number): MidtransTransaction {
  return {
    token: `snap-token-${uuidv4()}`,
    redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/dummy-token`,
    order_id: orderId,
    gross_amount: amount.toString(),
    transaction_status: "pending",
  }
}

// Function to check a Midtrans transaction status
export async function checkMidtransTransaction(orderId: string): Promise<MidtransTransaction | null> {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY is not defined")
    }

    const apiUrl = `https://api.sandbox.midtrans.com/v2/${orderId}/status`

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(serverKey + ":").toString("base64")}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return {
      token: "",
      redirect_url: "",
      order_id: data.order_id,
      gross_amount: data.gross_amount,
      transaction_status: data.transaction_status,
    }
  } catch (error) {
    console.error("Error checking Midtrans transaction:", error)
    return null
  }
}
