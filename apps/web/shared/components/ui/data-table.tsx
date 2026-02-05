"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { cn } from "@/shared/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  // Server-side pagination props
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  onPaginationChange?: (pageIndex: number, pageSize: number) => void
  // Row click handler
  onRowClick?: (row: TData) => void
  // Optional features
  showColumnVisibility?: boolean
  showPagination?: boolean
  showPageSizeSelector?: boolean
  // Custom empty state
  emptyMessage?: string
  // Loading state
  loading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pageIndex = 0,
  pageSize = 10,
  onPaginationChange,
  onRowClick,
  showColumnVisibility = true,
  showPagination = true,
  showPageSizeSelector = true,
  emptyMessage = "Nenhum resultado encontrado.",
  loading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const isServerSide = pageCount !== undefined && onPaginationChange !== undefined

  const table = useReactTable({
    data,
    columns,
    pageCount: isServerSide ? pageCount : undefined,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(isServerSide && {
        pagination: {
          pageIndex,
          pageSize,
        },
      }),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    ...(isServerSide
      ? { manualPagination: true }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          getSortedRowModel: getSortedRowModel(),
        }),
  })

  const handlePageChange = (newPageIndex: number) => {
    if (isServerSide && onPaginationChange) {
      onPaginationChange(newPageIndex, pageSize)
    } else {
      table.setPageIndex(newPageIndex)
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    if (isServerSide && onPaginationChange) {
      onPaginationChange(0, newPageSize)
    } else {
      table.setPageSize(newPageSize)
    }
  }

  const currentPageIndex = isServerSide ? pageIndex : table.getState().pagination.pageIndex
  const currentPageSize = isServerSide ? pageSize : table.getState().pagination.pageSize
  const totalPages = isServerSide ? pageCount : table.getPageCount()

  // Column name mapping for display
  const columnLabels: Record<string, string> = {
    id: "Inventario",
    idLoja: "Loja",
    idEmpresa: "Empresa",
    dataInicio: "Periodo",
    dataTermino: "Data Termino",
    ativo: "Status",
    lote: "Lote",
    validade: "Validade",
  }

  return (
    <div className="space-y-4">
      {showColumnVisibility && (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 text-muted-foreground hover:text-foreground"
              >
                <Columns3 className="h-4 w-4" />
                <span>Colunas</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {columnLabels[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/30 hover:bg-muted/30 border-b border-border"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="h-10 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
                    <span className="text-sm text-muted-foreground">Carregando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    "group transition-colors duration-150",
                    "hover:bg-brand-orange/5",
                    index !== table.getRowModel().rows.length - 1 && "border-b border-border/50",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "py-3 transition-colors group-hover:text-foreground",
                        cellIndex === 0 && "group-hover:shadow-[inset_3px_0_0_0_#f84704]"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {emptyMessage}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {showPageSizeSelector && (
              <>
                <span className="hidden sm:inline">Linhas por pagina</span>
                <Select
                  value={String(currentPageSize)}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                  <SelectTrigger className="h-8 w-16 text-xs">
                    <SelectValue placeholder={currentPageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 50].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground tabular-nums">
              {currentPageIndex + 1} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(0)}
                disabled={currentPageIndex === 0}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <span className="sr-only">Primeira pagina</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPageIndex - 1)}
                disabled={currentPageIndex === 0}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <span className="sr-only">Pagina anterior</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPageIndex + 1)}
                disabled={currentPageIndex >= totalPages - 1}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <span className="sr-only">Proxima pagina</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPageIndex >= totalPages - 1}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <span className="sr-only">Ultima pagina</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
