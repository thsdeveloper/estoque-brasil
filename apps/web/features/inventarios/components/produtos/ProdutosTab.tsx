"use client"

import { useState, useMemo, useCallback, useRef } from "react"
import { Upload, Download, Search, RefreshCw, AlertCircle, Package } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { DataTable } from "@/shared/components/ui/data-table"
import { useProdutos } from "../../hooks/useProdutos"
import { getColumns } from "./produtos-columns"

interface ProdutosTabProps {
  inventarioId: number
}

export function ProdutosTab({ inventarioId }: ProdutosTabProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    data,
    totalPages,
    isLoading,
    isError,
    error,
    mutate,
  } = useProdutos({
    idInventario: inventarioId,
    page: page + 1,
    limit: pageSize,
    search: debouncedSearch || undefined,
  })

  const columns = useMemo(() => getColumns(), [])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        setDebouncedSearch(value)
        setPage(0)
      }, 300)
    },
    []
  )

  const handlePaginationChange = useCallback(
    (newPageIndex: number, newPageSize: number) => {
      if (newPageSize !== pageSize) {
        setPageSize(newPageSize)
        setPage(0)
      } else {
        setPage(newPageIndex)
      }
    },
    [pageSize]
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Produtos do Inventario</CardTitle>
          <CardDescription>
            Produtos importados para contagem
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por codigo ou descricao..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              Erro ao carregar dados
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
              {error}
            </p>
            <Button
              onClick={() => mutate()}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        ) : !isLoading && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border border-dashed border-border bg-muted/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              {debouncedSearch ? "Nenhum resultado" : "Nenhum produto"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
              {debouncedSearch
                ? "Nenhum produto encontrado com a busca"
                : "Nenhum produto importado neste inventario"}
            </p>
            {!debouncedSearch && (
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Importar produtos
              </Button>
            )}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            pageCount={totalPages}
            pageIndex={page}
            pageSize={pageSize}
            onPaginationChange={handlePaginationChange}
            loading={isLoading}
            showColumnVisibility={true}
            pageSizeOptions={[10, 20, 50, 100]}
            emptyMessage={
              debouncedSearch
                ? "Nenhum produto encontrado com a busca"
                : "Nenhum produto importado neste inventario"
            }
          />
        )}
      </CardContent>
    </Card>
  )
}
