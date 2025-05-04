"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Judul harus minimal 3 karakter.",
  }),
  message: z.string().min(10, {
    message: "Pesan harus minimal 10 karakter.",
  }),
})

interface SendNotificationFormProps {
  userId: string
  userName: string
}

export function SendNotificationForm({ userId, userName }: SendNotificationFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          title: values.title,
          message: values.message,
        }),
      })

      if (!response.ok) {
        throw new Error("Terjadi kesalahan saat mengirim notifikasi")
      }

      toast({
        title: "Notifikasi berhasil dikirim",
        description: `Notifikasi telah dikirim ke ${userName}`,
      })

      form.reset()
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Notifikasi</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan judul notifikasi" {...field} />
              </FormControl>
              <FormDescription>Judul notifikasi yang akan dikirim ke warga</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pesan Notifikasi</FormLabel>
              <FormControl>
                <Textarea placeholder="Masukkan pesan notifikasi" className="min-h-20" {...field} />
              </FormControl>
              <FormDescription>Pesan notifikasi yang akan dikirim ke warga</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Mengirim..." : "Kirim Notifikasi"}
        </Button>
      </form>
    </Form>
  )
}
