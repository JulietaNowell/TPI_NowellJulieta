import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'

import { useForm } from '@tanstack/react-form'

import type { Categoria, CategoriaCreate } from './categoriaTypes'

interface CategoriaFormProps {
  categoria: Categoria | null
  guardando: boolean
  error: string
  onGuardar: (datos: CategoriaCreate) => Promise<boolean>
  onCancelar: () => void
}

function validarNombre(value: string): string | undefined {
  const nombre = value.trim()

  if (nombre.length < 2 || nombre.length > 100) {
    return 'El nombre debe contener entre 2 y 100 caracteres.'
  }

  return undefined
}

export function CategoriaForm({
  categoria,
  guardando,
  error,
  onGuardar,
  onCancelar,
}: CategoriaFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    },

    onSubmit: async ({ value }) => {
      if (guardando) return

      const guardado = await onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
      })

      if (guardado && !categoria) {
        form.reset()
      }
    },
  })

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => validarNombre(value),
          onBlur: ({ value }) => validarNombre(value),
          onSubmit: ({ value }) => validarNombre(value),
        }}
      >
        {(field) => (
          <div className="space-y-1">
            <label
              htmlFor={field.name}
              className="mb-1 block font-medium"
            >
              Nombre
            </label>

            <Input
              id={field.name}
              name={field.name}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) =>
                field.handleChange(event.target.value)
              }
              disabled={guardando}
              maxLength={100}
              className="w-full rounded-lg border border-slate-300 p-3"
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
            <label
              htmlFor={field.name}
              className="mb-1 block font-medium"
            >
              Descripción (opcional)
            </label>

            <textarea
              id={field.name}
              name={field.name}
              rows={3}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) =>
                field.handleChange(event.target.value)
              }
              disabled={guardando}
              className="w-full rounded-lg border border-slate-300 p-3"
            />
          </div>
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
          nombre: state.values.nombre,
        })}
      >
        {({ canSubmit, isSubmitting, nombre }) => (
          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={
                !canSubmit ||
                isSubmitting ||
                guardando ||
                !!validarNombre(nombre)
              }
              className="px-5 py-3"
            >
              {guardando || isSubmitting
                ? 'Guardando...'
                : categoria
                  ? 'Guardar cambios'
                  : 'Crear categoría'}
            </Button>

            {categoria && (
              <Button
                type="button"
                onClick={onCancelar}
                disabled={guardando || isSubmitting}
                variant="secondary" className="px-5 py-3"
              >
                Cancelar edición
              </Button>
            )}
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}

