import { Skeleton } from "@/shared/components/ui/skeleton"

export function InventariosTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Column visibility button skeleton */}
      <div className="flex items-center justify-end">
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        {/* Header */}
        <div className="bg-muted/30 border-b border-border px-2 py-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-2 py-3 border-b border-border/50 last:border-0"
          >
            {/* Codigo */}
            <Skeleton className="h-7 w-12 rounded-md" />
            {/* Loja */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-12" />
            </div>
            {/* Empresa */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-8" />
            </div>
            {/* Periodo */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-3 w-24 ml-6" />
            </div>
            {/* Status */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 w-14" />
            </div>
            {/* Lote */}
            <Skeleton className="h-5 w-10 rounded-md" />
            {/* Validade */}
            <Skeleton className="h-5 w-10 rounded-md" />
            {/* Actions */}
            <Skeleton className="h-8 w-8 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
