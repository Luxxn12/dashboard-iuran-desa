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
  name: z.string().min(2, {
    message: "Nama harus minimal 2 karakter.",
  }),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
})

interface AdminProfileFormProps {
  user: {
    id: string
    name: string
    phoneNumber?: string | null
    address?: string | null
  }
}

export function AdminProfileForm({ user }: AdminProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Terjadi kesalahan saat memperbarui profil")
      }

      toast({
        title: "Profil berhasil diperbarui",
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input placeholder="Nama lengkap Anda" {...field} />
              </FormControl>
              <FormDescription>Nama Anda yang akan ditampilkan di aplikasi</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Telepon</FormLabel>
              <FormControl>
                <Input placeholder="Nomor telepon Anda" {...field} />
              </FormControl>
              <FormDescription>Nomor telepon yang dapat dihubungi</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat</FormLabel>
              <FormControl>
                <Textarea placeholder="Alamat lengkap Anda" className="min-h-20" {...field} />
              </FormControl>
              <FormDescription>Alamat tempat tinggal Anda</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </form>
    </Form>
  )
}
