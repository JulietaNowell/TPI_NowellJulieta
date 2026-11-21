import { Button } from '../../shared/ui/Button'
import { Card } from '../../shared/ui/Card'

import { useCarritoStore } from '../carrito/carritoStore'
import type { Producto } from './productoTypes'

interface ProductoCardProps {
  producto: Producto
}

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregarProducto = useCarritoStore(
    (state) => state.agregarProducto,
  )

  const cantidadEnCarrito = useCarritoStore(
    (state) =>
      state.items.find(
        (item) => item.producto_id === producto.id,
      )?.cantidad ?? 0,
  )

  const comprable =
    producto.activo &&
    producto.disponible &&
    producto.stock > 0 &&
    producto.categoria.activo

  const stockAlcanzado =
    cantidadEnCarrito >= producto.stock

  const puedeAgregar =
    comprable && !stockAlcanzado

  function agregarAlCarrito() {
    if (!puedeAgregar) {
      return
    }

    agregarProducto(producto)
  }

  return (
    <Card as="article" className="overflow-hidden">
      <div className="flex h-44 items-center justify-center bg-slate-100">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-sm text-slate-500">
            Imagen no disponible
          </span>
        )}
      </div>

      <div className="space-y-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          {producto.categoria.nombre}
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          {producto.nombre}
        </h2>

        <p className="min-h-10 text-sm text-slate-600">
          {producto.descripcion ?? 'Sin descripcion'}
        </p>

        <p className="text-xl font-bold text-slate-900">
          {formatoPrecio.format(producto.precio_base)}
        </p>

        <div className="flex items-center justify-between gap-3">
          <span
            className={
              comprable
                ? 'text-sm font-medium text-emerald-700'
                : 'text-sm font-medium text-red-700'
            }
          >
            {comprable ? 'Disponible' : 'No disponible'}
          </span>

          <span className="text-xs text-slate-500">
            Stock: {producto.stock}
          </span>
        </div>

        <Button
          type="button"
          onClick={agregarAlCarrito}
          disabled={!puedeAgregar}
          className="w-full disabled:bg-slate-300"
        >
          {!comprable
            ? 'No disponible'
            : stockAlcanzado
              ? 'Stock maximo alcanzado'
              : 'Agregar al carrito'}
        </Button>

        {cantidadEnCarrito > 0 && (
          <p
            role="status"
            className="text-center text-sm font-medium text-emerald-700"
          >
            En el carrito: {cantidadEnCarrito}
          </p>
        )}
      </div>
    </Card>
  )
}

