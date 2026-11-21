import { BadgeEstado } from '../../shared/ui/BadgeEstado'
import type { ColumnDef } from '@tanstack/react-table'
import type { PedidoRead } from '../../features/pedidos/pedidoTypes'
import { DataTable } from '../../shared/components/DataTable'
import { Paginacion } from '../../shared/components/Paginacion'

import { useState } from 'react'

import { PedidoEstadoActions } from '../../features/pedidos/PedidoEstadoActions'
import { AdminPedidosResumen } from '../../features/pedidos/AdminPedidosResumen'
import { Link } from 'react-router-dom'

import { usePedidos } from '../../features/pedidos/usePedidos'
import type { EstadoPedido } from '../../features/pedidos/pedidoTypes'
import { getApiErrorMessage } from '../../shared/api/axiosInstance'

const LIMITE = 10

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const estados: EstadoPedido[] = [
  'PENDIENTE',
  'EN_PREPARACION',
  'ENTREGADO',
  'CANCELADO',
]

export function AdminPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [pedidoExpandido, setPedidoExpandido] = useState<number | null>(null)

  const pedidos = usePedidos({
    skip: pagina * LIMITE,
    limit: LIMITE,
    ...(estado ? { estado } : {}),
  })

  const total = pedidos.data?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE))

  const columnas: ColumnDef<PedidoRead>[] = [
    {
      accessorKey: 'id',
      header: 'Pedido',
      cell: ({ row }) => `#${row.original.id}`,
    },
    {
      accessorKey: 'usuario_id',
      header: 'Cliente (ID)',
    },
    {
      accessorKey: 'created_at',
      header: 'Fecha',
      cell: ({ row }) =>
        formatoFecha.format(new Date(row.original.created_at)),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => (
        <BadgeEstado estado={row.original.estado} />
      ),
    },
    {
      accessorKey: 'forma_pago',
      header: 'Forma de pago',
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatoPrecio.format(row.original.total)}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const pedido = row.original

        return (
          <div className="min-w-48 space-y-3">
            <PedidoEstadoActions
              key={`${pedido.id}-${pedido.estado}`}
              pedidoId={pedido.id}
              estadoActual={pedido.estado}
            />

            <button
              type="button"
              onClick={() =>
                setPedidoExpandido((actual) =>
                  actual === pedido.id ? null : pedido.id,
                )
              }
              aria-expanded={pedidoExpandido === pedido.id}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              {pedidoExpandido === pedido.id
                ? 'Ocultar detalle'
                : 'Ver detalle'}
            </button>
          </div>
        )
      },
    },
  ]

  const pedidoSeleccionado = pedidos.data?.items.find(
    (pedido) => pedido.id === pedidoExpandido,
  )

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-3">
          <Link
            to="/admin/resumen"
            className="font-semibold text-emerald-700 underline"
          >
            Volver al panel administrativo
          </Link>

          <h1 className="text-3xl font-bold text-slate-900">
            Administración de pedidos
          </h1>

          <p className="text-slate-600">
            Consultá los pedidos registrados, sus estados y detalles.
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <AdminPedidosResumen />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block max-w-sm">
            <span className="mb-2 block font-medium">
              Filtrar por estado
            </span>

            <select
              value={estado}
              onChange={(evento) => {
                setEstado(evento.target.value as EstadoPedido | '')
                setPagina(0)
                setPedidoExpandido(null)
              }}
              className="w-full rounded-lg border border-slate-300 p-2"
            >
              <option value="">Todos los estados</option>

              {estados.map((valor) => (
                <option key={valor} value={valor}>
                  {valor.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">
            Pedidos registrados
          </h2>

          {pedidos.isPending && (
            <p>Cargando pedidos...</p>
          )}

          {pedidos.isError && (
            <div className="space-y-3">
              <p role="alert" className="text-red-700">
                {getApiErrorMessage(pedidos.error)}
              </p>

              <button
                type="button"
                onClick={() => void pedidos.refetch()}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-white"
              >
                Reintentar
              </button>
            </div>
          )}

          {pedidos.isSuccess && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Total de pedidos: {total}
              </p>

              <DataTable
                datos={pedidos.data.items}
                columnas={columnas}
                obtenerId={(pedido) => String(pedido.id)}
                mensajeVacio="No hay pedidos para mostrar."
              />

              <Paginacion
                pagina={pagina}
                totalPaginas={totalPaginas}
                onAnterior={() => {
                  setPagina((actual) => Math.max(0, actual - 1))
                  setPedidoExpandido(null)
                }}
                onSiguiente={() => {
                  setPagina((actual) => actual + 1)
                  setPedidoExpandido(null)
                }}
              />

              {pedidoSeleccionado && (
                <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold">
                      Detalle del pedido #{pedidoSeleccionado.id}
                    </h3>

                    <button
                      type="button"
                      onClick={() => setPedidoExpandido(null)}
                      className="rounded-lg border border-slate-300 px-3 py-2"
                    >
                      Cerrar detalle
                    </button>
                  </div>

                  <p>
                    Dirección de entrega: {pedidoSeleccionado.direccion_entrega}
                  </p>

                  <p>
                    Notas: {pedidoSeleccionado.notas || 'Sin observaciones'}
                  </p>

                  <h4 className="font-semibold">
                    Productos del pedido
                  </h4>

                  <ul className="space-y-2">
                    {pedidoSeleccionado.items.map((item) => (
                      <li
                        key={item.producto_id}
                        className="border-b border-slate-200 pb-2"
                      >
                        <p>{item.nombre_producto}</p>

                        <p className="text-sm text-slate-600">
                          Cantidad: {item.cantidad}
                          {' | '}
                          Precio unitario: {formatoPrecio.format(item.precio_unitario)}
                          {' | '}
                          Subtotal: {formatoPrecio.format(item.subtotal)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <p className="font-semibold">
                    Total: {formatoPrecio.format(pedidoSeleccionado.total)}
                  </p>
                </section>
              )}
            </div>
          )}

        </section>
      </div>
    </main>
  )
}






