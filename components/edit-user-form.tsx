"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nama harus minimal 2 karakter.",
  }),
  email: z.string().email({
    message: "Email tidak valid.",
  }),
  password: z
    .string()
    .min(6, {
      message: "Password minimal 6 karakter.",
    })
    .optional()
    .or(z.literal("")),
  role: z.enum(["ADMIN", "RESIDENT"], {
    required_error: "Role wajib dipilih.",
  }),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
})

interface EditUserFormProps {
  user: {
    id: string
    name: string
    email: string
    role: "ADMIN" | "RESIDENT"
    address?: string | null
    phoneNumber?: string | null
  }
}

export function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      address: user.address || "",
      phoneNumber: user.phoneNumber || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Remove empty password from values if not provided
      const dataToSubmit = { ...values }
      if (!dataToSubmit.password) {
        delete dataToSubmit.password
      }

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Terjadi kesalahan saat memperbarui pengguna.")
      }

      toast({
        title: "Pengguna berhasil diperbarui",
        description: `Informasi pengguna ${values.name} telah berhasil diperbarui.`,
      })

      router.refresh()
      router.push("/admin/residents")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal memperbarui pengguna",
        description: error instanceof Error ? error.message : "Silakan coba lagi nanti.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Pengguna</CardTitle>
        <CardDescription>Perbarui informasi pengguna</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap pengguna" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password (Opsional)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Kosongkan jika tidak ingin mengubah" {...field} />
                  </FormControl>
                  <FormDescription>Biarkan kosong jika tidak ingin mengubah password</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role pengguna" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="RESIDENT">Warga</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Role menentukan hak akses pengguna dalam sistem</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Alamat lengkap pengguna" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nomor telepon pengguna" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/residents")}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
