import { useState } from 'react'

import { ProductoForm } from './ProductoForm'
import { useCrearProducto } from './useProductos'
import type { ProductoCreate } from './productoTypes'
import { getApiErrorMessage } from '../../shared/api/axiosInstance'

export function ProductoCreateForm() {
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const crearProducto = useCrearProducto()

  function limpiarMensajes() {
    setError('')
    setMensaje('')
  }

  async function guardar(datos: ProductoCreate): Promise<boolean> {
    if (crearProducto.isPending) return false

    limpiarMensajes()

    try {
      const producto = await crearProducto.mutateAsync(datos)

      setMensaje(`Producto "${producto.nombre}" creado correctamente.`)
      return true
    } catch (errorDesconocido) {
      setError(getApiErrorMessage(errorDesconocido))
      return false
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold">
        Crear producto
      </h2>

      <ProductoForm
        pendiente={crearProducto.isPending}
        error={error}
        mensaje={mensaje}
        onGuardar={guardar}
        onCambiar={limpiarMensajes}
      />
    </section>
  )
}
