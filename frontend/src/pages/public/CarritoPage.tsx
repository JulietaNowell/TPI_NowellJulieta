import { Link } from 'react-router-dom'

import {
  obtenerCantidadTotal,
  obtenerImporteTotal,
  useCarritoStore,
} from '../../features/carrito/carritoStore'

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

export function CarritoPage() {
  const items = useCarritoStore((state) => state.items)
  const actualizarCantidad = useCarritoStore(
    (state) => state.actualizarCantidad,
  )
  const eliminarProducto = useCarritoStore(
    (state) => state.eliminarProducto,
  )
  const vaciarCarrito = useCarritoStore(
    (state) => state.vaciarCarrito,
  )

  const cantidadTotal = obtenerCantidadTotal(items)
  const importeTotal = obtenerImporteTotal(items)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Mi carrito
            </h1>

            <p className="mt-2 text-slate-600">
              {cantidadTotal} unidad(es) agregada(s)
            </p>
          </div>

          <Link
            to="/"
            className="font-semibold text-emerald-700 underline"
          >
            Seguir comprando
          </Link>
        </header>

        {items.length === 0 ? (
          <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg text-slate-600">
              Tu carrito esta vacio.
            </p>

            <Link
              to="/"
              className="mt-4 inline-block rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white"
            >
              Ver productos
            </Link>
          </section>
        ) : (
          <>
            <section
              aria-label="Productos del carrito"
              className="space-y-4"
            >
              {items.map((item) => (
                <article
                  key={item.producto_id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center"
                >
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                    {item.imagen_url ? (
                      <img
                        src={item.imagen_url}
                        alt={item.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-center text-xs text-slate-500">
                        Sin imagen
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {item.nombre}
                    </h2>

                    <p className="text-sm text-slate-600">
                      Precio unitario: {formatoPrecio.format(item.precio_unitario)}
                    </p>

                    <p className="text-sm text-slate-600">
                      Stock conocido: {item.stock}
                    </p>

                    <button
                      type="button"
                      onClick={() => eliminarProducto(item.producto_id)}
                      className="text-sm font-medium text-red-700 underline"
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="space-y-3 sm:text-right">
                    <div className="flex items-center gap-3 sm:justify-end">
                      <button
                        type="button"
                        aria-label={`Disminuir cantidad de ${item.nombre}`}
                        onClick={() =>
                          actualizarCantidad(
                            item.producto_id,
                            item.cantidad - 1,
                          )
                        }
                        disabled={item.cantidad <= 1}
                        className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40"
                      >
                        -
                      </button>

                      <span className="min-w-8 text-center font-semibold">
                        {item.cantidad}
                      </span>

                      <button
                        type="button"
                        aria-label={`Aumentar cantidad de ${item.nombre}`}
                        onClick={() =>
                          actualizarCantidad(
                            item.producto_id,
                            item.cantidad + 1,
                          )
                        }
                        disabled={item.cantidad >= item.stock}
                        className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <p className="font-bold text-slate-900">
                      {formatoPrecio.format(
                        item.precio_unitario * item.cantidad,
                      )}
                    </p>
                  </div>
                </article>
              ))}
            </section>

            <section
              aria-label="Resumen del carrito"
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex justify-between gap-4">
                <span className="text-slate-600">
                  Cantidad total
                </span>

                <span className="font-semibold">
                  {cantidadTotal}
                </span>
              </div>

              <div className="mt-4 flex justify-between gap-4 border-t border-slate-200 pt-4">
                <span className="text-xl font-bold">
                  Total estimado
                </span>

                <span className="text-xl font-bold text-emerald-700">
                  {formatoPrecio.format(importeTotal)}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                Los precios y el stock se verificaran al confirmar el pedido.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/checkout"
                  className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white"
                >
                  Continuar al checkout
                </Link>

                <button
                  type="button"
                  onClick={vaciarCarrito}
                  className="rounded-lg border border-red-300 px-5 py-3 font-semibold text-red-700"
                >
                  Vaciar carrito
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
