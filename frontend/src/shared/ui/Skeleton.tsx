interface SkeletonProps {
  cantidad?: number
  variante?: 'tarjeta' | 'bloque'
  mensaje?: string
}

export function Skeleton({
  cantidad = 1,
  variante = 'bloque',
  mensaje = 'Cargando...',
}: SkeletonProps) {
  return (
    <div role="status" aria-busy="true" className="space-y-3">
      <span className="sr-only">{mensaje}</span>

      <div
        aria-hidden="true"
        className={
          variante === 'tarjeta'
            ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
            : 'space-y-3'
        }
      >
        {Array.from({ length: cantidad }, (_, indice) => (
          <div
            key={indice}
            className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white motion-reduce:animate-none"
          >
            {variante === 'tarjeta' && (
              <div className="h-44 bg-slate-200" />
            )}

            <div className="space-y-3 p-5">
              <div className="h-3 w-1/3 rounded bg-slate-200" />
              <div className="h-5 w-2/3 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />

              {variante === 'tarjeta' && (
                <div className="h-10 rounded-lg bg-slate-200" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
