"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { CalendarIcon, FilterIcon, X } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"

interface TransactionFilterProps {
  contributions: {
    id: string
    title: string
  }[]
  selectedContribution?: string
  selectedStatus?: string
  selectedDateRange?: string
}

export function TransactionFilter({
  contributions,
  selectedContribution,
  selectedStatus,
  selectedDateRange,
}: TransactionFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (selectedDateRange) {
      const [from, to] = selectedDateRange.split("_")
      return {
        from: new Date(from),
        to: new Date(to),
      }
    }
    return undefined
  })

  // Count active filters
  const activeFilters = [
    selectedContribution && selectedContribution !== "ALL",
    selectedStatus && selectedStatus !== "ALL",
    selectedDateRange,
  ].filter(Boolean).length

  const updateSearchParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    // Reset to page 1 when filters change
    params.set("page", "1")

    if (value === null || value === "ALL") {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    return params.toString()
  }

  const handleContributionChange = (value: string) => {
    const queryString = updateSearchParams("contribution", value === "ALL" ? null : value)
    router.push(`${pathname}?${queryString}`)
  }

  const handleStatusChange = (value: string) => {
    const queryString = updateSearchParams("status", value === "ALL" ? null : value)
    router.push(`${pathname}?${queryString}`)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDate(range)
    const params = new URLSearchParams(searchParams.toString())

    // Reset to page 1 when filters change
    params.set("page", "1")

    if (range?.from && range?.to) {
      const fromDate = format(range.from, "yyyy-MM-dd")
      const toDate = format(range.to, "yyyy-MM-dd")
      params.set("dateRange", `${fromDate}_${toDate}`)
    } else {
      params.delete("dateRange")
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    // Preserve only pagination parameters
    const params = new URLSearchParams()
    params.set("page", "1")
    if (searchParams.has("perPage")) {
      params.set("perPage", searchParams.get("perPage")!)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FilterIcon className="h-5 w-5 text-muted-foreground" />
          Filter Transaksi
          {activeFilters > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilters} aktif
            </Badge>
          )}
        </h3>
        {activeFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Reset Filter
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Program Iuran</label>
          <Select value={selectedContribution || "ALL"} onValueChange={handleContributionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Program</SelectItem>
              {contributions.map((contribution) => (
                <SelectItem key={contribution.id} value={contribution.id}>
                  {contribution.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select value={selectedStatus || "ALL"} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="PENDING">Menunggu</SelectItem>
              <SelectItem value="PROCESSING">Diproses</SelectItem>
              <SelectItem value="COMPLETED">Selesai</SelectItem>
              <SelectItem value="FAILED">Gagal</SelectItem>
              <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Rentang Tanggal</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd MMM yyyy", { locale: id })} -{" "}
                      {format(date.to, "dd MMM yyyy", { locale: id })}
                    </>
                  ) : (
                    format(date.from, "dd MMM yyyy", { locale: id })
                  )
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                locale={id}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
