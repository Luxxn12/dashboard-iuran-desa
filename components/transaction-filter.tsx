"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, SearchIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface TransactionFilterProps {
  contributions: {
    id: string
    title: string
  }[]
  selectedContribution?: string
  selectedStatus?: string
  selectedDateRange?: string
}

const formSchema = z.object({
  contribution: z.string().optional(),
  status: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

export function TransactionFilter({
  contributions,
  selectedContribution,
  selectedStatus,
  selectedDateRange,
}: TransactionFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contribution: selectedContribution || "",
      status: selectedStatus || "",
      startDate: selectedDateRange ? new Date(selectedDateRange.split("_")[0]) : undefined,
      endDate: selectedDateRange ? new Date(selectedDateRange.split("_")[1]) : undefined,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const params = new URLSearchParams()

    if (values.contribution) {
      params.set("contribution", values.contribution)
    }

    if (values.status) {
      params.set("status", values.status)
    }

    if (values.startDate && values.endDate) {
      params.set(
        "dateRange",
        `${values.startDate.toISOString().split("T")[0]}_${values.endDate.toISOString().split("T")[0]}`,
      )
    }

    router.push(`/admin/transactions?${params.toString()}`)
  }

  function resetFilters() {
    router.push("/admin/transactions")
    form.reset({
      contribution: "",
      status: "",
      startDate: undefined,
      endDate: undefined,
    })
  }

  const hasFilters = selectedContribution || selectedStatus || selectedDateRange

  return (
    <Card className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-4">
          <FormField
            control={form.control}
            name="contribution"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-[200px]">
                <FormLabel>Program Iuran</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua program iuran" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ALL">Semua program iuran</SelectItem>
                    {contributions.map((contribution) => (
                      <SelectItem key={contribution.id} value={contribution.id}>
                        {contribution.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-[200px]">
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ALL">Semua status</SelectItem>
                    <SelectItem value="PENDING">Menunggu</SelectItem>
                    <SelectItem value="COMPLETED">Berhasil</SelectItem>
                    <SelectItem value="FAILED">Gagal</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Dari Tanggal</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Sampai Tanggal</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2 ml-auto">
            {hasFilters && (
              <Button type="button" variant="outline" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
            <Button type="submit">
              <SearchIcon className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}
