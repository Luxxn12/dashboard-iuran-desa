"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  amount: z.coerce.number().min(1000, {
    message: "Jumlah minimal Rp 1.000",
  }),
})

interface PaymentFormProps {
  contributionId: string
  contributionTitle: string
}

export function PaymentForm({ contributionId, contributionTitle }: PaymentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [midtransScriptLoaded, setMidtransScriptLoaded] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contributionId,
          amount: values.amount,
        }),
      })

      if (!response.ok) {
        throw new Error("Terjadi kesalahan saat memproses pembayaran")
      }

      const data = await response.json()

      if (data.snapToken && midtransScriptLoaded && window.snap) {
        // Open Midtrans Snap payment popup
        window.snap.pay(data.snapToken, {
          onSuccess: (result: any) => {
            toast({
              title: "Pembayaran berhasil",
              description: "Terima kasih atas kontribusi Anda",
            })
            router.push("/dashboard/payment-success")
          },
          onPending: (result: any) => {
            toast({
              title: "Pembayaran tertunda",
              description: "Silakan selesaikan pembayaran Anda",
            })
            router.push("/dashboard/payment-pending")
          },
          onError: (result: any) => {
            toast({
              variant: "destructive",
              title: "Pembayaran gagal",
              description: "Terjadi kesalahan saat memproses pembayaran",
            })
            router.push("/dashboard/payment-failed")
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

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pembayaran Iuran</CardTitle>
          <CardDescription>Bayar iuran untuk program {contributionTitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Pembayaran</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                        <Input type="number" placeholder="0" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>Masukkan jumlah yang ingin Anda bayarkan</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-sm text-muted-foreground">
                <p>Metode pembayaran yang tersedia:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Transfer Bank (BCA, BNI, BRI, Mandiri, Permata)</li>
                  <li>E-Wallet (GoPay, QRIS, ShopeePay)</li>
                  <li>Retail (Alfamart, Indomaret)</li>
                  <li>Kartu Kredit</li>
                </ul>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Bayar Sekarang"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-muted-foreground">
          <p>Powered by Midtrans</p>
          <p>Pembayaran aman & terjamin</p>
        </CardFooter>
      </Card>
    </>
  )
}
