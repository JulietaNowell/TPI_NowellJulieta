import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'

import {
  obtenerImporteTotal,
  obtenerItemsPedido,
  useCarritoStore,
} from '../../features/carrito/carritoStore'
import { useCrearPedido } from '../../features/pedidos/usePedidos'
import type {
  FormaPago,
  PedidoRead,
} from '../../features/pedidos/pedidoTypes'
import { getApiErrorMessage } from '../../shared/api/axiosInstance'

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

export function CheckoutPage() {
  const crearPedido = useCrearPedido()
  const items = useCarritoStore((state) => state.items)
  const vaciarCarrito = useCarritoStore(
    (state) => state.vaciarCarrito,
  )

  const [errorServidor, setErrorServidor] = useState('')
  const [pedidoConfirmado, setPedidoConfirmado] =
    useState<PedidoRead | null>(null)

  const envioEnCurso = useRef(false)

  const totalEstimado = obtenerImporteTotal(items)

  const form = useForm({
    defaultValues: {
      forma_pago: 'EFECTIVO' as FormaPago,
      direccion_entrega: '',
      notas: '',
    },

    onSubmit: async ({ value }) => {
      if (envioEnCurso.current || items.length === 0) {
        return
      }

      envioEnCurso.current = true
      setErrorServidor('')

      try {
        const pedido = await crearPedido.mutateAsync({
          items: obtenerItemsPedido(items),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        })

        setPedidoConfirmado(pedido)
        vaciarCarrito()
      } catch (error) {
        setErrorServidor(getApiErrorMessage(error))
      } finally {
        envioEnCurso.current = false
      }
    },
  })

  if (pedidoConfirmado) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <section className="mx-auto max-w-2xl space-y-5 rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-emerald-700">
            Pedido confirmado
          </h1>

          <p className="text-slate-600">
            Tu pedido fue registrado correctamente.
          </p>

          <div className="space-y-2 rounded-lg bg-slate-50 p-5">
            <p>
              <strong>Pedido:</strong> #{pedidoConfirmado.id}
            </p>

            <p>
              <strong>Estado:</strong> {pedidoConfirmado.estado}
            </p>

            <p>
              <strong>Forma de pago:</strong>{' '}
              {pedidoConfirmado.forma_pago}
            </p>

            <p>
              <strong>Dirección:</strong>{' '}
              {pedidoConfirmado.direccion_entrega}
            </p>

            <p className="text-xl font-bold">
              Total confirmado:{' '}
              {formatoPrecio.format(pedidoConfirmado.total)}
            </p>
          </div>

          <Link
            to="/mis-pedidos"
            className="inline-block rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white"
          >
            Ver mis pedidos
          </Link>
        </section>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <section className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">
            Tu carrito está vacío
          </h1>

          <p className="text-slate-600">
            Agregá productos antes de confirmar un pedido.
          </p>

          <Link
            to="/"
            className="inline-block rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white"
          >
            Ir al catálogo
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
        <section className="space-y-5 rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            Confirmar pedido
          </h1>

          <form
            className="space-y-5"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <form.Field name="forma_pago">
              {(field) => (
                <div className="space-y-2">
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-semibold"
                  >
                    Forma de pago
                  </label>

                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(
                        event.target.value as FormaPago,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="EFECTIVO">
                      Efectivo
                    </option>

                    <option value="TRANSFERENCIA">
                      Transferencia
                    </option>
                  </select>
                </div>
              )}
            </form.Field>

            <form.Field
              name="direccion_entrega"
              validators={{
                onBlur: ({ value }) => {
                  const longitud = value.trim().length

                  if (longitud < 5) {
                    return 'La dirección debe tener al menos 5 caracteres'
                  }

                  if (longitud > 200) {
                    return 'La dirección no puede superar los 200 caracteres'
                  }

                  return undefined
                },
                onChange: ({ value }) => {
                  const longitud = value.trim().length

                  if (longitud < 5) {
                    return 'La dirección debe tener al menos 5 caracteres'
                  }

                  if (longitud > 200) {
                    return 'La dirección no puede superar los 200 caracteres'
                  }

                  return undefined
                },
              }}
            >
              {(field) => (
                <div className="space-y-1">
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-semibold"
                  >
                    Dirección de entrega
                  </label>

                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    autoComplete="street-address"
                    placeholder="Calle, número y localidad"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />

                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-700">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    )}
                </div>
              )}
            </form.Field>

            <form.Field name="notas">
              {(field) => (
                <div className="space-y-1">
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-semibold"
                  >
                    Notas adicionales (opcional)
                  </label>

                  <textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              )}
            </form.Field>

            {errorServidor && (
              <p role="alert" className="text-sm text-red-700">
                {errorServidor}
              </p>
            )}

            <form.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
              ]}
            >
              {([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={
                    !canSubmit ||
                    isSubmitting ||
                    items.length === 0
                  }
                  className="w-full rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting
                    ? 'Confirmando pedido...'
                    : 'Confirmar pedido'}
                </button>
              )}
            </form.Subscribe>
          </form>

          <Link
            to="/carrito"
            className="inline-block font-semibold text-emerald-700 underline"
          >
            Volver al carrito
          </Link>
        </section>

        <aside className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Resumen de compra
          </h2>

          {items.map((item) => (
            <div
              key={item.producto_id}
              className="flex justify-between gap-4 border-b border-slate-100 pb-3"
            >
              <div>
                <p className="font-semibold">
                  {item.nombre}
                </p>

                <p className="text-sm text-slate-600">
                  Cantidad: {item.cantidad}
                </p>
              </div>

              <p className="font-semibold">
                {formatoPrecio.format(
                  item.precio_unitario * item.cantidad,
                )}
              </p>
            </div>
          ))}

          <div className="flex justify-between gap-4 border-t border-slate-200 pt-4">
            <span className="text-lg font-bold">
              Total estimado
            </span>

            <span className="text-lg font-bold text-emerald-700">
              {formatoPrecio.format(totalEstimado)}
            </span>
          </div>

          <p className="text-sm text-slate-500">
            El servidor verificará nuevamente precios,
            disponibilidad y stock al crear el pedido.
          </p>
        </aside>
      </div>
    </main>
  )
}
