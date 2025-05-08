"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  totalItems: number
  pageSize: number
  currentPage: number
}

export function Pagination({ totalItems, pageSize, currentPage }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(totalItems / pageSize)

  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null
  }

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  const handlePageChange = (pageNumber: number) => {
    router.push(createPageURL(pageNumber))
  }

  // Calculate page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Calculate start and end of page range
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if at the beginning
      if (currentPage <= 2) {
        end = 4
      }

      // Adjust if at the end
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push(-1) // -1 represents ellipsis
      }

      // Add page numbers
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push(-2) // -2 represents ellipsis
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-muted-foreground">
        Menampilkan {Math.min((currentPage - 1) * pageSize + 1, totalItems)} -{" "}
        {Math.min(currentPage * pageSize, totalItems)} dari {totalItems} item
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          aria-label="Halaman pertama"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber === -1 || pageNumber === -2) {
            return (
              <span key={`ellipsis-${index}`} className="px-2">
                ...
              </span>
            )
          }

          return (
            <Button
              key={pageNumber}
              variant={pageNumber === currentPage ? "default" : "outline"}
              size="icon"
              onClick={() => handlePageChange(pageNumber)}
              aria-label={`Halaman ${pageNumber}`}
              aria-current={pageNumber === currentPage ? "page" : undefined}
            >
              {pageNumber}
            </Button>
          )
        })}

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Halaman terakhir"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
