"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface ResumePaymentButtonProps {
  transactionId: string
  amount: number
  contributionTitle: string
}

export function ResumePaymentButton({ transactionId, amount, contributionTitle }: ResumePaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [midtransScriptLoaded, setMidtransScriptLoaded] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleResumePayment = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/payments/resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Terjadi kesalahan saat memproses pembayaran")
      }

      const data = await response.json()

      if (data.snapToken && midtransScriptLoaded && window.snap) {
        // Open Midtrans Snap payment popup
        window.snap.pay(data.snapToken, {
          onSuccess: async (result: any) => {
            // Update transaction status
            try {
              await fetch(`/api/transactions/${transactionId}/status`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "COMPLETED" }),
              })
            } catch (error) {
              console.error("Error updating transaction status:", error)
            }

            toast({
              title: "Pembayaran berhasil",
              description: "Terima kasih atas kontribusi Anda",
            })
            router.push("/dashboard/payment-success")
            router.refresh()
          },
          onPending: (result: any) => {
            toast({
              title: "Pembayaran tertunda",
              description: "Silakan selesaikan pembayaran Anda",
            })
            router.push("/dashboard/payment-pending")
            router.refresh()
          },
          onError: async (result: any) => {
            // Update transaction status
            try {
              await fetch(`/api/transactions/${transactionId}/status`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "FAILED" }),
              })
            } catch (error) {
              console.error("Error updating transaction status:", error)
            }

            toast({
              variant: "destructive",
              title: "Pembayaran gagal",
              description: "Terjadi kesalahan saat memproses pembayaran",
            })
            router.push("/dashboard/payment-failed")
            router.refresh()
          },
          onClose: () => {
            setIsLoading(false)
            toast({
              variant: "destructive",
              title: "Pembayaran dibatalkan",
              description: "Anda menutup halaman pembayaran",
            })
          },
        })
      } else if (data.redirectUrl) {
        // Fallback to redirect URL if Snap.js is not loaded
        window.location.href = data.redirectUrl
      } else {
        // If no token or redirect URL is available, show an error
        throw new Error("Tidak dapat memuat halaman pembayaran Midtrans")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: error instanceof Error ? error.message : "Silakan coba lagi nanti",
      })
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Load Midtrans Snap.js */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => setMidtransScriptLoaded(true)}
        onError={() => {
          toast({
            variant: "destructive",
            title: "Gagal memuat Midtrans",
            description: "Tidak dapat memuat sistem pembayaran. Silakan coba lagi nanti.",
          })
        }}
      />

      <Button onClick={handleResumePayment} className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          "Lanjutkan Pembayaran"
        )}
      </Button>
    </>
  )
}
