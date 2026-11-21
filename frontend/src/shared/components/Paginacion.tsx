interface PaginacionProps {
  pagina: number
  totalPaginas: number
  onAnterior: () => void
  onSiguiente: () => void
  deshabilitada?: boolean
}

export function Paginacion({
  pagina,
  totalPaginas,
  onAnterior,
  onSiguiente,
  deshabilitada = false,
}: PaginacionProps) {
  const paginas = Math.max(1, totalPaginas)

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-between gap-3 pt-4"
    >
      <button
        type="button"
        onClick={onAnterior}
        disabled={deshabilitada || pagina <= 0}
        className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50"
      >
        Anterior
      </button>

      <p className="text-sm text-slate-600" aria-live="polite">
        Página {pagina + 1} de {paginas}
      </p>

      <button
        type="button"
        onClick={onSiguiente}
        disabled={deshabilitada || pagina + 1 >= paginas}
        className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50"
      >
        Siguiente
      </button>
    </nav>
  )
}
