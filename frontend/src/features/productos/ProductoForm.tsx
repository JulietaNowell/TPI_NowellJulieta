import { useId } from 'react'
import { useForm } from '@tanstack/react-form'

import { useCategorias } from '../categorias/useCategorias'
import { getApiErrorMessage } from '../../shared/api/axiosInstance'

import type { Producto, ProductoCreate } from './productoTypes'
import {
  validarNombreProducto,
  validarPrecio,
  validarStock,
} from './productoFormValidators'

interface Props {
  producto?: Producto
  pendiente: boolean
  error: string
  mensaje?: string
  onGuardar: (datos: ProductoCreate) => Promise<boolean>
  onCancelar?: () => void
  onCambiar?: () => void
}

const claseCampo =
  'w-full rounded-lg border border-slate-300 p-2 disabled:opacity-50'

export function ProductoForm({
  producto,
  pendiente,
  error,
  mensaje,
  onGuardar,
  onCancelar,
  onCambiar,
}: Props) {
  const formId = useId()
  const categorias = useCategorias()

  function validarCategoria(value: string) {
    const id = Number(value)

    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      !categorias.data?.some((categoria) => categoria.id === id)
    ) {
      return 'Seleccioná una categoría activa.'
    }

    return undefined
  }

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto ? String(producto.precio_base) : '',
      imagen_url: producto?.imagen_url ?? '',
      stock: producto ? String(producto.stock) : '0',
      disponible: producto?.disponible ?? true,
      categoria_id: producto ? String(producto.categoria_id) : '',
    },

    onSubmit: async ({ value }) => {
      if (pendiente || !categorias.isSuccess) return

      const guardado = await onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      })

      if (guardado && !producto) {
        form.reset()
      }
    },
  })

  return (
    <>
      {categorias.isPending && <p>Cargando categorías...</p>}

      {categorias.isError && (
        <div className="mb-4 space-y-2">
          <p role="alert" className="text-red-700">
            {getApiErrorMessage(categorias.error)}
          </p>

          <button
            type="button"
            onClick={() => void categorias.refetch()}
            className="rounded bg-emerald-700 px-4 py-2 text-white"
          >
            Reintentar categorías
          </button>
        </div>
      )}

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
          name="nombre"
          validators={{
            onChange: ({ value }) => validarNombreProducto(value),
            onBlur: ({ value }) => validarNombreProducto(value),
            onSubmit: ({ value }) => validarNombreProducto(value),
          }}
        >
          {(field) => (
            <div className="space-y-1">
              <label htmlFor={`${formId}-${field.name}`} className="block font-medium">
                Nombre *
              </label>

              <input
                id={`${formId}-${field.name}`}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) => {
                  field.handleChange(evento.target.value)
                  onCambiar?.()
                }}
                disabled={pendiente}
                className={claseCampo}
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

        <form.Field name="descripcion">
          {(field) => (
            <div className="space-y-1">
              <label htmlFor={`${formId}-${field.name}`} className="block font-medium">
                Descripción
              </label>

              <textarea
                id={`${formId}-${field.name}`}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) => {
                  field.handleChange(evento.target.value)
                  onCambiar?.()
                }}
                disabled={pendiente}
                className={claseCampo}
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) => validarPrecio(value),
            onBlur: ({ value }) => validarPrecio(value),
            onSubmit: ({ value }) => validarPrecio(value),
          }}
        >
          {(field) => (
            <div className="space-y-1">
              <label htmlFor={`${formId}-${field.name}`} className="block font-medium">
                Precio base *
              </label>

              <input
                id={`${formId}-${field.name}`}
                name={field.name}
                type="number"
                min="0"
                step="any"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) => {
                  field.handleChange(evento.target.value)
                  onCambiar?.()
                }}
                disabled={pendiente}
                className={claseCampo}
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

        <form.Field name="imagen_url">
          {(field) => (
            <div className="space-y-1">
              <label htmlFor={`${formId}-${field.name}`} className="block font-medium">
                URL de imagen
              </label>

              <input
                id={`${formId}-${field.name}`}
                name={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) => {
                  field.handleChange(evento.target.value)
                  onCambiar?.()
                }}
                disabled={pendiente}
                className={claseCampo}
              />
            </div>
          )}
        </form.Field>

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
              <label htmlFor={`${formId}-${field.name}`} className="block font-medium">
                Stock *
              </label>

              <input
                id={`${formId}-${field.name}`}
                name={field.name}
                type="number"
                min="0"
                step="1"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) => {
                  field.handleChange(evento.target.value)
                  onCambiar?.()
                }}
                disabled={pendiente}
                className={claseCampo}
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

        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) => validarCategoria(value),
            onBlur: ({ value }) => validarCategoria(value),
            onSubmit: ({ value }) => validarCategoria(value),
          }}
        >
          {(field) => (
            <div className="space-y-1">
              <label htmlFor={`${formId}-${field.name}`} className="block font-medium">
                Categoría *
              </label>

              <select
                id={`${formId}-${field.name}`}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) => {
                  field.handleChange(evento.target.value)
                  onCambiar?.()
                }}
                disabled={pendiente || !categorias.isSuccess}
                className={claseCampo}
              >
                <option value="">Seleccionar categoría</option>

                {categorias.data?.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>

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
                  onCambiar?.()
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

        {mensaje && (
          <p role="status" className="text-emerald-700">
            {mensaje}
          </p>
        )}

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
            values: state.values,
          })}
        >
          {({ canSubmit, isSubmitting, values }) => (
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={
                  !canSubmit ||
                  isSubmitting ||
                  pendiente ||
                  !categorias.isSuccess ||
                  !!validarNombreProducto(values.nombre) ||
                  !!validarPrecio(values.precio_base) ||
                  !!validarStock(values.stock) ||
                  !!validarCategoria(values.categoria_id)
                }
                className="rounded-lg bg-emerald-700 px-5 py-2 text-white disabled:opacity-50"
              >
                {pendiente || isSubmitting
                  ? 'Guardando...'
                  : producto
                    ? 'Guardar cambios'
                    : 'Crear producto'}
              </button>

              {onCancelar && (
                <button
                  type="button"
                  onClick={onCancelar}
                  disabled={pendiente || isSubmitting}
                  className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          )}
        </form.Subscribe>
      </form>
    </>
  )
}

