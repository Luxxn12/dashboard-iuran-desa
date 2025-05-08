"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  villageName: z.string().min(2, {
    message: "Nama desa harus minimal 2 karakter.",
  }),
  allowRegistration: z.boolean(),
  autoApprovePayments: z.boolean(),
  notificationEnabled: z.boolean(),
})

export function AppSettingsForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)

  // In a real app, these settings would be loaded from the database
  // For now, we'll use fake default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      villageName: "Desa Kalirejo",
      allowRegistration: true,
      autoApprovePayments: false,
      notificationEnabled: true,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, you would save these settings to the database
      // For demo purposes, we'll just show a success toast
      toast({
        title: "Pengaturan berhasil disimpan",
        description: "Pengaturan aplikasi telah berhasil diperbarui",
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
          name="villageName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Desa</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama desa" {...field} />
              </FormControl>
              <FormDescription>Nama desa yang akan ditampilkan di aplikasi</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allowRegistration"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Pendaftaran Terbuka</FormLabel>
                <FormDescription>Izinkan warga baru untuk mendaftar langsung melalui aplikasi</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} aria-readonly />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autoApprovePayments"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Otomatis Terima Pembayaran</FormLabel>
                <FormDescription>
                  Secara otomatis menyetujui pembayaran yang masuk tanpa perlu persetujuan admin
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} aria-readonly />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notificationEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Notifikasi Sistem</FormLabel>
                <FormDescription>Aktifkan notifikasi sistem untuk pembayaran dan peristiwa penting</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} aria-readonly />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      </form>
    </Form>
  )
}
