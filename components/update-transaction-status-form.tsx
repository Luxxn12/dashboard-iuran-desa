"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  status: z.enum(["COMPLETED", "FAILED"], {
    required_error: "Status wajib dipilih.",
  }),
})

interface UpdateTransactionStatusFormProps {
  transactionId: string
}

export function UpdateTransactionStatusForm({ transactionId }: UpdateTransactionStatusFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/transactions/${transactionId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Gagal memperbarui status transaksi")
      }

      toast({
        title: "Status transaksi diperbarui",
        description: `Status transaksi berhasil diubah menjadi ${values.status === "COMPLETED" ? "Berhasil" : "Gagal"}`,
      })

      router.refresh()
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Perbarui Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status transaksi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="COMPLETED">Berhasil</SelectItem>
                  <SelectItem value="FAILED">Gagal</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Perubahan status akan mempengaruhi data program iuran terkait</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Memproses..." : "Perbarui Status"}
        </Button>
      </form>
    </Form>
  )
}
