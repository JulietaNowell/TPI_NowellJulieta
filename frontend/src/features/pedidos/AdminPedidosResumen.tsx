import { useResumenPedidos } from './usePedidos'
import { getApiErrorMessage } from '../../shared/api/axiosInstance'

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

export function AdminPedidosResumen() {
  const resumen = useResumenPedidos()

  if (resumen.isPending) {
    return <p role="status">Cargando resumen de pedidos...</p>
  }

  if (resumen.isError) {
    return (
      <section className="rounded-lg border border-red-300 p-4">
        <p role="alert" className="text-red-700">
          {getApiErrorMessage(resumen.error)}
        </p>
        <button
          type="button"
          onClick={() => void resumen.refetch()}
          className="mt-3 rounded bg-emerald-700 px-4 py-2 text-white"
        >
          Reintentar resumen
        </button>
      </section>
    )
  }

  const indicadores = [
    { titulo: 'Pendientes', valor: resumen.data.pendientes },
    { titulo: 'En preparación', valor: resumen.data.en_preparacion },
    { titulo: 'Entregados', valor: resumen.data.entregados },
    { titulo: 'Cancelados', valor: resumen.data.cancelados },
    { titulo: 'Pedidos de hoy', valor: resumen.data.pedidos_hoy },
    {
      titulo: 'Ingresos entregados',
      valor: formatoMoneda.format(resumen.data.ingresos_entregados),
    },
  ]

  return (
    <section aria-label="Resumen administrativo de pedidos">
      <h2 className="mb-4 text-xl font-semibold">
        Resumen de pedidos
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {indicadores.map((indicador) => (
          <article
            key={indicador.titulo}
            className="rounded-lg border border-slate-200 p-4"
          >
            <p className="text-sm text-slate-600">
              {indicador.titulo}
            </p>

            <p className="mt-2 text-2xl font-bold">
              {indicador.valor}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

