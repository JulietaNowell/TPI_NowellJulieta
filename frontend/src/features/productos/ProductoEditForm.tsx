import { useState } from 'react'

import { ProductoForm } from './ProductoForm'
import { useActualizarProducto } from './useProductos'
import type { Producto, ProductoCreate } from './productoTypes'
import { getApiErrorMessage } from '../../shared/api/axiosInstance'

interface Props {
  producto: Producto
  onCerrar: () => void
}

export function ProductoEditForm({ producto, onCerrar }: Props) {
  const [error, setError] = useState('')

  const actualizar = useActualizarProducto()

  async function guardar(datos: ProductoCreate): Promise<boolean> {
    if (actualizar.isPending) return false

    setError('')

    try {
      await actualizar.mutateAsync({
        id: producto.id,
        datos,
      })

      onCerrar()
      return true
    } catch (errorDesconocido) {
      setError(getApiErrorMessage(errorDesconocido))
      return false
    }
  }

  return (
    <section className="rounded-xl border border-emerald-300 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold">
        Editar producto: {producto.nombre}
      </h2>

      <ProductoForm
        key={producto.id}
        producto={producto}
        pendiente={actualizar.isPending}
        error={error}
        onGuardar={guardar}
        onCancelar={onCerrar}
        onCambiar={() => setError('')}
      />
    </section>
  )
}
