import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ClassicPagination({
  page,
  totalPages,
  onPageChange,
  loading,
}: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  loading?: boolean
}) {
  const maxVisiblePages = 3
  const pages = []

  const half = Math.floor(maxVisiblePages / 2)
  let startPage = Math.max(1, page - half)
  let endPage = startPage + maxVisiblePages - 1

  if (endPage > totalPages) {
    endPage = totalPages
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center mt-4 space-x-1">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1 || loading}
      >
        Anterior
      </Button>

      {startPage > 1 && (
        <>
          <Button size="sm" variant="ghost" onClick={() => onPageChange(1)}>
            1
          </Button>
          {startPage > 2 && <span className="px-1 text-muted-foreground">…</span>}
        </>
      )}

      {pages.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={p === page ? "default" : "ghost"}
          onClick={() => onPageChange(p)}
          disabled={loading}
          className={cn(p === page && "pointer-events-none")}
        >
          {p}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
          <Button size="sm" variant="ghost" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </Button>
        </>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages || loading}
      >
        Siguiente
      </Button>
    </div>
  )
}
