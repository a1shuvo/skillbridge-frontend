"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  // Don't render if 1 or fewer pages
  if (!totalPages || totalPages <= 1) return null

  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes("?") ? "&" : "?"
    return `${baseUrl}${separator}page=${page}`
  }

  // Generate array of pages to show
  const getVisiblePages = () => {
    const pages: (number | string)[] = []
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      }
    }
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
      {/* Previous */}
      {currentPage > 1 ? (
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
          <Link href={getPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" className="h-8 w-8 opacity-50" disabled>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Page Numbers */}
      {visiblePages.map((page, idx) => (
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            className={`h-8 w-8 p-0 ${currentPage === page ? "pointer-events-none" : ""}`}
            asChild={currentPage !== page}
          >
            {currentPage !== page ? (
              <Link href={getPageUrl(page as number)}>{page}</Link>
            ) : (
              <span>{page}</span>
            )}
          </Button>
        )
      ))}

      {/* Next */}
      {currentPage < totalPages ? (
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
          <Link href={getPageUrl(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" className="h-8 w-8 opacity-50" disabled>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}