import { BadgeEstado } from '../../shared/ui/BadgeEstado'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  useCancelarPedido,
  usePedidos,
} from '../../features/pedidos/usePedidos'
import type {
  EstadoPedido,
  PedidoRead,
} from '../../features/pedidos/pedidoTypes'
import { useAuthStore } from '../../features/auth/authStore'
import { getApiErrorMessage } from '../../shared/api/axiosInstance'

const LIMITE = 5

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function formatearFecha(fecha: string) {
  const valor = new Date(fecha)

  return Number.isNaN(valor.getTime())
    ? fecha
    : formatoFecha.format(valor)
}

function DetallePedido({ pedido }: { pedido: PedidoRead }) {
  return (
    <div className="space-y-4 border-t border-slate-200 pt-4">
      <h3 className="font-bold">Detalle del pedido</h3>

      <div className="space-y-3">
        {pedido.items.map((item) => (
          <div
            key={item.producto_id}
            className="flex justify-between gap-4 text-sm"
          >
            <div>
              <p className="font-medium">
                {item.nombre_producto}
              </p>

              <p className="text-slate-600">
                {item.cantidad} x{' '}
                {formatoPrecio.format(item.precio_unitario)}
              </p>
            </div>

            <p className="font-semibold">
              {formatoPrecio.format(item.subtotal)}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
        <p>
          <strong>Dirección:</strong>{' '}
          {pedido.direccion_entrega}
        </p>

        <p>
          <strong>Forma de pago:</strong>{' '}
          {pedido.forma_pago === 'EFECTIVO'
            ? 'Efectivo'
            : 'Transferencia'}
        </p>

        {pedido.notas && (
          <p>
            <strong>Notas:</strong> {pedido.notas}
          </p>
        )}

        <p>
          <strong>Última actualización:</strong>{' '}
          {formatearFecha(pedido.updated_at)}
        </p>
      </div>
    </div>
  )
}

export function MisPedidosPage() {
  const usuario = useAuthStore((state) => state.usuario)

  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [detalleAbierto, setDetalleAbierto] = useState<number | null>(null)
  const [pedidoACancelar, setPedidoACancelar] = useState<number | null>(null)
  const [errorCancelacion, setErrorCancelacion] = useState('')

  const filtros = {
    skip: pagina * LIMITE,
    limit: LIMITE,
    ...(estado ? { estado } : {}),
  }

  const {
    data,
    isPending,
    isError,
    isFetching,
    refetch,
  } = usePedidos(filtros)

  const cancelarPedido = useCancelarPedido()

  const total = data?.total ?? 0
  const totalPaginas = Math.ceil(total / LIMITE)

  function cambiarEstado(nuevoEstado: EstadoPedido | '') {
    setEstado(nuevoEstado)
    setPagina(0)
    setDetalleAbierto(null)
    setPedidoACancelar(null)
    setErrorCancelacion('')
  }

  async function confirmarCancelacion(id: number) {
    if (cancelarPedido.isPending) return

    setErrorCancelacion('')

    try {
      await cancelarPedido.mutateAsync(id)
      setPedidoACancelar(null)
      setDetalleAbierto(null)
    } catch (error) {
      setErrorCancelacion(getApiErrorMessage(error))
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Mis pedidos
            </h1>

            <p className="mt-1 text-slate-600">
              Consultá el historial y estado de tus compras.
            </p>
          </div>

          <Link
            to="/"
            className="font-semibold text-emerald-700 underline"
          >
            Volver al catálogo
          </Link>
        </header>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <label
            htmlFor="filtro-estado"
            className="mb-2 block text-sm font-semibold"
          >
            Filtrar por estado
          </label>

          <select
            id="filtro-estado"
            value={estado}
            onChange={(event) =>
              cambiarEstado(
                event.target.value as EstadoPedido | '',
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 sm:max-w-xs"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PREPARACION">
              En preparación
            </option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </section>

        {isPending && (
          <p role="status">Cargando pedidos...</p>
        )}

        {isError && (
          <section
            role="alert"
            className="space-y-3 rounded-xl bg-white p-6 shadow-sm"
          >
            <p className="text-red-700">
              No se pudieron cargar los pedidos.
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-white"
            >
              Reintentar
            </button>
          </section>
        )}

        {data && !isError && (
          <>
            <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
              <p>
                {total} pedido{total === 1 ? '' : 's'}
              </p>

              {isFetching && (
                <p role="status">Actualizando...</p>
              )}
            </div>

            {data.items.length === 0 ? (
              <section className="space-y-3 rounded-xl bg-white p-8 text-center shadow-sm">
                <h2 className="text-xl font-bold">
                  No hay pedidos para mostrar
                </h2>

                <p className="text-slate-600">
                  {estado
                    ? 'No tenés pedidos con este estado.'
                    : 'Todavía no realizaste pedidos.'}
                </p>

                <Link
                  to="/"
                  className="inline-block font-semibold text-emerald-700 underline"
                >
                  Explorar catálogo
                </Link>
              </section>
            ) : (
              <div className="space-y-4">
                {data.items.map((pedido) => {
                  const puedeCancelar =
                    pedido.estado === 'PENDIENTE' &&
                    pedido.usuario_id === usuario?.id

                  const detalleVisible =
                    detalleAbierto === pedido.id

                  const confirmacionVisible =
                    pedidoACancelar === pedido.id

                  return (
                    <article
                      key={pedido.id}
                      className="space-y-4 rounded-xl bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-bold">
                            Pedido #{pedido.id}
                          </h2>

                          <p className="mt-1 text-sm text-slate-600">
                            {formatearFecha(pedido.created_at)}
                          </p>
                        </div>

                        <BadgeEstado estado={pedido.estado} />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-lg font-bold">
                          {formatoPrecio.format(pedido.total)}
                        </p>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setDetalleAbierto(
                                detalleVisible ? null : pedido.id,
                              )
                            }
                            className="font-semibold text-emerald-700 underline"
                          >
                            {detalleVisible
                              ? 'Ocultar detalle'
                              : 'Ver detalle'}
                          </button>

                          {puedeCancelar && (
                            <button
                              type="button"
                              disabled={cancelarPedido.isPending}
                              onClick={() => {
                                setPedidoACancelar(pedido.id)
                                setErrorCancelacion('')
                              }}
                              className="font-semibold text-red-700 underline disabled:opacity-50"
                            >
                              Cancelar pedido
                            </button>
                          )}
                        </div>
                      </div>

                      {detalleVisible && (
                        <DetallePedido pedido={pedido} />
                      )}

                      {confirmacionVisible && (
                        <div className="space-y-3 rounded-lg border border-red-200 p-4">
                          <p className="font-semibold">
                            ¿Confirmás la cancelación del pedido #{pedido.id}?
                          </p>

                          <p className="text-sm text-slate-600">
                            Esta operación no se puede deshacer.
                          </p>

                          {errorCancelacion && (
                            <p role="alert" className="text-sm text-red-700">
                              {errorCancelacion}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              disabled={cancelarPedido.isPending}
                              onClick={() =>
                                void confirmarCancelacion(pedido.id)
                              }
                              className="rounded-lg bg-red-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
                            >
                              {cancelarPedido.isPending
                                ? 'Cancelando...'
                                : 'Sí, cancelar pedido'}
                            </button>

                            <button
                              type="button"
                              disabled={cancelarPedido.isPending}
                              onClick={() => {
                                setPedidoACancelar(null)
                                setErrorCancelacion('')
                              }}
                              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold disabled:opacity-50"
                            >
                              Volver
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}

            {totalPaginas > 1 && (
              <nav
                aria-label="Paginación de pedidos"
                className="flex items-center justify-center gap-4"
              >
                <button
                  type="button"
                  disabled={pagina === 0 || isFetching}
                  onClick={() => {
                    setPagina((actual) => Math.max(0, actual - 1))
                    setDetalleAbierto(null)
                    setPedidoACancelar(null)
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 disabled:opacity-50"
                >
                  Anterior
                </button>

                <span className="text-sm font-semibold">
                  Página {pagina + 1} de {totalPaginas}
                </span>

                <button
                  type="button"
                  disabled={
                    pagina + 1 >= totalPaginas || isFetching
                  }
                  onClick={() => {
                    setPagina((actual) => actual + 1)
                    setDetalleAbierto(null)
                    setPedidoACancelar(null)
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  )
}

