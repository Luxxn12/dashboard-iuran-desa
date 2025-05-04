"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Judul harus minimal 3 karakter.",
  }),
  description: z.string().min(10, {
    message: "Deskripsi harus minimal 10 karakter.",
  }),
  targetAmount: z.coerce.number().min(1000, {
    message: "Target minimal Rp 1.000.",
  }),
  startDate: z.date({
    required_error: "Tanggal mulai wajib diisi.",
  }),
  endDate: z.date({
    required_error: "Tanggal berakhir wajib diisi.",
  }),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"], {
    required_error: "Status wajib dipilih.",
  }),
})

interface ContributionFormProps {
  contribution?: {
    id: string
    title: string
    description: string
    targetAmount: number
    startDate: Date
    endDate: Date
    status: string
  }
}

export function ContributionForm({ contribution }: ContributionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: contribution?.title || "",
      description: contribution?.description || "",
      targetAmount: contribution?.targetAmount || 0,
      startDate: contribution?.startDate ? new Date(contribution.startDate) : new Date(),
      endDate: contribution?.endDate ? new Date(contribution.endDate) : new Date(),
      status: (contribution?.status as "ACTIVE" | "COMPLETED" | "CANCELLED") || "ACTIVE",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const endpoint = contribution ? `/api/contributions/${contribution.id}` : "/api/contributions"

      const method = contribution ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Terjadi kesalahan saat menyimpan data")
      }

      toast({
        title: contribution ? "Program iuran berhasil diperbarui" : "Program iuran berhasil ditambahkan",
        description: "Anda akan diarahkan ke halaman daftar program iuran",
      })

      router.refresh()
      router.push("/admin/contributions")
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
    <Card>
      <CardHeader>
        <CardTitle>{contribution ? "Edit Program Iuran" : "Tambah Program Iuran Baru"}</CardTitle>
        <CardDescription>
          {contribution
            ? "Perbarui informasi program iuran yang sudah ada"
            : "Isi formulir berikut untuk membuat program iuran baru"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Program</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan judul program iuran" {...field} />
                  </FormControl>
                  <FormDescription>Judul program iuran yang akan ditampilkan kepada warga</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Masukkan deskripsi program iuran" className="min-h-32" {...field} />
                  </FormControl>
                  <FormDescription>Jelaskan secara detail tentang program iuran ini</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Dana</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                      <Input type="number" placeholder="0" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>Jumlah dana yang ingin dikumpulkan</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Tanggal program iuran dimulai</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Berakhir</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < form.getValues("startDate")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Tanggal program iuran berakhir</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {contribution && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Aktif</SelectItem>
                        <SelectItem value="COMPLETED">Selesai</SelectItem>
                        <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Status program iuran saat ini</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/contributions")}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : contribution ? "Perbarui" : "Simpan"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
