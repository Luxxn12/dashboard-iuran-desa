"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  amount: z.coerce.number().min(1000, {
    message: "Jumlah minimal Rp 1.000",
  }),
})

interface PaymentFormProps {
  contributionId: string
}

export function PaymentForm({ contributionId }: PaymentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)

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

      // Redirect to Midtrans payment page
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        // For demo purposes, we'll just show a success message
        toast({
          title: "Pembayaran berhasil",
          description: "Terima kasih atas kontribusi Anda",
        })
        router.refresh()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: error instanceof Error ? error.message : "Silakan coba lagi nanti",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Memproses..." : "Bayar Sekarang"}
        </Button>
      </form>
    </Form>
  )
}
