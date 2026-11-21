import type { EstadoPedido } from '../../features/pedidos/pedidoTypes'

interface BadgeEstadoProps {
  estado: EstadoPedido
}

const configuracion: Record<
  EstadoPedido,
  { etiqueta: string; estilos: string }
> = {
  PENDIENTE: {
    etiqueta: 'Pendiente',
    estilos: 'bg-amber-100 text-amber-800',
  },
  EN_PREPARACION: {
    etiqueta: 'En preparación',
    estilos: 'bg-blue-100 text-blue-800',
  },
  ENTREGADO: {
    etiqueta: 'Entregado',
    estilos: 'bg-emerald-100 text-emerald-800',
  },
  CANCELADO: {
    etiqueta: 'Cancelado',
    estilos: 'bg-red-100 text-red-800',
  },
}

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const { etiqueta, estilos } = configuracion[estado]

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${estilos}`}
    >
      {etiqueta}
    </span>
  )
}
