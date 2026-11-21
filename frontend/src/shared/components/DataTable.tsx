import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'

import type { ColumnDef } from '@tanstack/react-table'
import { Paginacion } from './Paginacion'

interface DataTableProps<T> {
  datos: T[]
  columnas: ColumnDef<T>[]
  paginar?: boolean
  tamanioPagina?: number
  mensajeVacio?: string
  obtenerId: (fila: T) => string
}

export function DataTable<T>({
  datos,
  columnas,
  paginar = false,
  tamanioPagina = 10,
  mensajeVacio = 'No hay registros para mostrar.',
  obtenerId,
}: DataTableProps<T>) {
  // TanStack Table administra internamente el estado de la tabla.
  const tabla = useReactTable({
    data: datos,
    columns: columnas,
    getRowId: obtenerId,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: paginar
      ? getPaginationRowModel()
      : undefined,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: tamanioPagina,
      },
    },
  })

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr
                key={grupo.id}
                className="border-b border-slate-200"
              >
                {grupo.headers.map((encabezado) => (
                  <th
                    key={encabezado.id}
                    colSpan={encabezado.colSpan}
                    scope="col"
                    className="p-3 font-semibold text-slate-700"
                  >
                    {encabezado.isPlaceholder
                      ? null
                      : flexRender(
                          encabezado.column.columnDef.header,
                          encabezado.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {tabla.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={tabla.getVisibleLeafColumns().length}
                  className="p-6 text-center text-slate-500"
                >
                  {mensajeVacio}
                </td>
              </tr>
            ) : (
              tabla.getRowModel().rows.map((fila) => (
                <tr
                  key={fila.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  {fila.getVisibleCells().map((celda) => (
                    <td
                      key={celda.id}
                      className="p-3 align-top"
                    >
                      {flexRender(
                        celda.column.columnDef.cell,
                        celda.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginar && datos.length > 0 && (
        <Paginacion
          pagina={tabla.getState().pagination.pageIndex}
          totalPaginas={tabla.getPageCount()}
          onAnterior={() => tabla.previousPage()}
          onSiguiente={() => tabla.nextPage()}
        />
      )}
    </div>
  )
}
