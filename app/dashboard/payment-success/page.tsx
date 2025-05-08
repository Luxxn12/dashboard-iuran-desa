"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isUpdating, setIsUpdating] = useState(false)

  // Get transaction ID and order ID from URL if available
  const transactionId = searchParams.get("transaction_id")
  const orderId = searchParams.get("order_id")

  useEffect(() => {
    // If we have a transaction ID from Midtrans, update the transaction status
    if (orderId) {
      const updateTransactionStatus = async () => {
        setIsUpdating(true)
        try {
          // Find transaction by receipt number (order ID)
          const findResponse = await fetch(`/api/transactions?receiptNumber=${orderId}`, {
            method: "GET",
          })

          if (findResponse.ok) {
            const data = await findResponse.json()
            if (data.transactions && data.transactions.length > 0) {
              const transaction = data.transactions[0]

              // Update transaction status to COMPLETED
              const updateResponse = await fetch(`/api/transactions/${transaction.id}/status`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "COMPLETED" }),
              })

              if (!updateResponse.ok) {
                console.error("Failed to update transaction status")
              }
            }
          }
        } catch (error) {
          console.error("Error updating transaction status:", error)
        } finally {
          setIsUpdating(false)
        }
      }

      updateTransactionStatus()
    }
  }, [orderId])

  return (
    <div className="container max-w-md py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Icons.check className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Pembayaran Berhasil</CardTitle>
          <CardDescription>Terima kasih atas kontribusi Anda. Pembayaran Anda telah berhasil diproses.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {isUpdating ? (
            <div className="flex justify-center">
              <Icons.spinner className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Anda akan menerima notifikasi konfirmasi pembayaran dalam beberapa saat.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/dashboard/history">Lihat Riwayat Transaksi</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/contributions">Kembali ke Daftar Iuran</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
