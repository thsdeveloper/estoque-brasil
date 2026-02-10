"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"

interface DataTableToolbarProps {
  searchPlaceholder?: string
  children?: ReactNode
  /** When provided, search works in local/state mode instead of URL mode */
  onSearchChange?: (value: string) => void
  /** Custom clear handler (e.g. for local state filters). When absent, clears URL params. */
  onClearFilters?: () => void
  /** Override whether filters are active (for local state mode) */
  hasActiveFilters?: boolean
}

export function DataTableToolbar({
  searchPlaceholder,
  children,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
}: DataTableToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isLocalMode = !!onSearchChange

  const [search, setSearch] = useState(
    isLocalMode ? "" : searchParams.get("search") || ""
  )

  // Sync local state when URL changes externally (URL mode only)
  useEffect(() => {
    if (!isLocalMode) {
      setSearch(searchParams.get("search") || "")
    }
  }, [searchParams, isLocalMode])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLocalMode) {
        onSearchChange(search)
      } else {
        const params = new URLSearchParams(searchParams.toString())
        const currentSearch = params.get("search") || ""

        if (search === currentSearch) return

        params.delete("page")
        if (search) {
          params.set("search", search)
        } else {
          params.delete("search")
        }
        router.push(`${pathname}?${params.toString()}`)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasFilters =
    hasActiveFilters !== undefined
      ? hasActiveFilters
      : isLocalMode
        ? !!search
        : Array.from(searchParams.entries()).some(([key]) => key !== "page")

  const handleClearFilters = useCallback(() => {
    setSearch("")
    if (onClearFilters) {
      onClearFilters()
    } else if (!isLocalMode) {
      router.push(pathname)
    }
  }, [pathname, router, onClearFilters, isLocalMode])

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {searchPlaceholder && (
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      )}

      {children}

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="self-center text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  )
}
