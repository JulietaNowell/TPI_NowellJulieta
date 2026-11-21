import { useState } from 'react'
import { useForm } from '@tanstack/react-form'

import { getApiErrorMessage } from '../../shared/api/axiosInstance'
import type { Producto } from './productoTypes'
import { useActualizarStockProducto } from './useProductos'
import { validarStock } from './productoFormValidators'

interface Props {
  producto: Producto
  onCerrar: () => void
}

export function ProductoStockForm({ producto, onCerrar }: Props) {
  return (
    <ProductoStockFormContent
      key={producto.id}
      producto={producto}
      onCerrar={onCerrar}
    />
  )
}

function ProductoStockFormContent({ producto, onCerrar }: Props) {
  const [error, setError] = useState('')

  const actualizarStock = useActualizarStockProducto()

  const pendiente = actualizarStock.isPending

  const form = useForm({
    defaultValues: {
      stock: String(producto.stock),
      disponible: producto.disponible,
    },

    onSubmit: async ({ value }) => {
      if (pendiente) return

      setError('')

      try {
        await actualizarStock.mutateAsync({
          id: producto.id,
          datos: {
            stock: Number(value.stock),
            disponible: value.disponible,
          },
        })

        onCerrar()
      } catch (errorDesconocido) {
        setError(getApiErrorMessage(errorDesconocido))
      }
    },
  })

  return (
    <section className="rounded-xl border border-blue-300 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold">
        Actualizar stock y disponibilidad
      </h2>

      <p className="mb-5 text-slate-600">
        Producto: {producto.nombre} (ID: {producto.id})
      </p>

      <form
        noValidate
        className="space-y-4"
        onSubmit={(evento) => {
          evento.preventDefault()
          evento.stopPropagation()

          if (!pendiente) {
            void form.handleSubmit()
          }
        }}
      >
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => validarStock(value),
            onBlur: ({ value }) => validarStock(value),
            onSubmit: ({ value }) => validarStock(value),
          }}
        >
          {(field) => (
            <div className="space-y-1">
              <label htmlFor="stock-edicion" className="block font-medium">
                Stock *
              </label>

              <input
                id="stock-edicion"
                name={field.name}
                type="number"
                min="0"
                step="1"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) => {
                  field.handleChange(evento.target.value)
                  setError('')
                }}
                disabled={pendiente}
                className="w-full rounded-lg border border-slate-300 p-2"
              />

              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <p role="alert" className="text-sm text-red-700">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
            </div>
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2">
              <input
                name={field.name}
                type="checkbox"
                checked={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) => {
                  field.handleChange(evento.target.checked)
                  setError('')
                }}
                disabled={pendiente}
              />

              Producto disponible
            </label>
          )}
        </form.Field>

        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
            stock: state.values.stock,
          })}
        >
          {({ canSubmit, isSubmitting, stock }) => (
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={
                  !canSubmit ||
                  isSubmitting ||
                  pendiente ||
                  !!validarStock(stock)
                }
                className="rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
              >
                {pendiente || isSubmitting
                  ? 'Actualizando...'
                  : 'Guardar stock'}
              </button>

              <button
                type="button"
                onClick={onCerrar}
                disabled={pendiente || isSubmitting}
                className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </section>
  )
}
