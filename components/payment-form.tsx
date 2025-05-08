"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import Script from "next/script"

interface PaymentFormProps {
  contributionId: string
  contributionTitle: string
  minAmount?: number
  maxAmount?: number
}

export function PaymentForm({
  contributionId,
  contributionTitle,
  minAmount = 0,
  maxAmount = 1000000000,
}: PaymentFormProps) {
  const [amount, setAmount] = useState<number>(minAmount)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (isNaN(value)) {
      setAmount(0)
    } else {
      setAmount(Math.min(Math.max(value, minAmount), maxAmount))
    }
  }

  const handlePayment = async () => {
    if (amount < minAmount) {
      toast({
        title: "Jumlah terlalu kecil",
        description: `Minimal pembayaran adalah Rp ${minAmount.toLocaleString("id-ID")}`,
        variant: "destructive",
      })
      return
    }

    if (amount > maxAmount) {
      toast({
        title: "Jumlah terlalu besar",
        description: `Maksimal pembayaran adalah Rp ${maxAmount.toLocaleString("id-ID")}`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contributionId,
          amount,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process payment")
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Pembayaran diproses",
          description: "Anda akan diarahkan ke halaman pembayaran",
        })

        // If we have a snap token, open the Midtrans payment popup
        if (data.snapToken && isScriptLoaded && window.snap) {
          window.snap.pay(data.snapToken, {
            onSuccess: async (result) => {
              // Update the transaction status to COMPLETED
              await updateTransactionStatus(data.transaction.id, "COMPLETED")
              toast({
                title: "Pembayaran berhasil",
                description: "Terima kasih atas kontribusi Anda",
              })
              router.push("/dashboard/payment-success")
              router.refresh()
            },
            onPending: (result) => {
              toast({
                title: "Pembayaran tertunda",
                description: "Silakan selesaikan pembayaran Anda",
              })
              router.push("/dashboard/payment-pending")
              router.refresh()
            },
            onError: async (result) => {
              // Update the transaction status to FAILED
              await updateTransactionStatus(data.transaction.id, "FAILED")
              toast({
                title: "Pembayaran gagal",
                description: "Terjadi kesalahan saat memproses pembayaran",
                variant: "destructive",
              })
              router.push("/dashboard/payment-failed")
              router.refresh()
            },
            onClose: () => {
              setIsLoading(false)
              toast({
                title: "Pembayaran dibatalkan",
                description: "Anda telah menutup halaman pembayaran",
                variant: "destructive",
              })
            },
          })
        } else if (data.redirectUrl) {
          // If we don't have a snap token or the script isn't loaded, redirect to the payment URL
          window.location.href = data.redirectUrl
        } else {
          // If we don't have a redirect URL, redirect to the success page
          router.push("/dashboard/payment-success")
          router.refresh()
        }
      } else {
        throw new Error(data.message || "Failed to process payment")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Function to update transaction status
  const updateTransactionStatus = async (transactionId: string, status: string) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        console.error("Failed to update transaction status")
      }
    } catch (error) {
      console.error("Error updating transaction status:", error)
    }
  }

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => setIsScriptLoaded(true)}
        onError={(e) => {
          console.error("Error loading Midtrans script:", e)
          toast({
            title: "Error",
            description: "Failed to load payment gateway. Please try again later.",
            variant: "destructive",
          })
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Pembayaran Iuran</CardTitle>
          <CardDescription>Masukkan jumlah yang ingin Anda bayarkan untuk program {contributionTitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Jumlah (Rp)
              </label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                min={minAmount}
                max={maxAmount}
                className="font-mono"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Minimal Rp {minAmount.toLocaleString("id-ID")} dan maksimal Rp {maxAmount.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Metode Pembayaran Tersedia:</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  <span>Transfer Bank</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  <span>QRIS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  <span>GoPay</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  <span>ShopeePay</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handlePayment} disabled={isLoading || amount < minAmount} className="w-full">
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Bayar Sekarang"
            )}
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
