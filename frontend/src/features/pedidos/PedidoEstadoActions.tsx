import { Modal } from '../../shared/ui/Modal'
import { Button } from '../../shared/ui/Button'
import { BadgeEstado } from '../../shared/ui/BadgeEstado'

import { useState } from 'react'

import { useCambiarEstadoPedido } from './usePedidos'
import type { EstadoPedido } from './pedidoTypes'
import { getApiErrorMessage } from '../../shared/api/axiosInstance'

interface PedidoEstadoActionsProps {
  pedidoId: number
  estadoActual: EstadoPedido
}

const transiciones: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

export function PedidoEstadoActions({
  pedidoId,
  estadoActual,
}: PedidoEstadoActionsProps) {
  const cambiarEstado = useCambiarEstadoPedido()
  const [confirmacion, setConfirmacion] = useState<EstadoPedido | null>(null)
  const [mensaje, setMensaje] = useState('')

  const disponibles = transiciones[estadoActual]

  async function confirmarCambio() {
    if (!confirmacion || cambiarEstado.isPending) return

    try {
      await cambiarEstado.mutateAsync({
        id: pedidoId,
        datos: { estado: confirmacion },
      })

      setMensaje(`Pedido actualizado a ${confirmacion.replaceAll('_', ' ')}`)
      setConfirmacion(null)
    } catch {
      setMensaje('')
    }
  }

  return (
    <div className="space-y-3 border-t border-slate-200 pt-4">
      <h4 className="font-semibold">
        Gestión del estado
      </h4>

      {disponibles.length === 0 ? (
        <p className="text-sm text-slate-600">
          Este pedido se encuentra en un estado final.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {disponibles.map((estado) => (
            <button
              key={estado}
              type="button"
              disabled={cambiarEstado.isPending}
              onClick={() => {
                setConfirmacion(estado)
                setMensaje('')
              }}
              className={
                estado === 'CANCELADO'
                  ? 'rounded-lg bg-red-700 px-4 py-2 text-white disabled:opacity-50'
                  : 'rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50'
              }
            >
              {estado === 'EN_PREPARACION'
                ? 'Iniciar preparación'
                : estado === 'ENTREGADO'
                  ? 'Marcar como entregado'
                  : 'Cancelar pedido'}
            </button>
          ))}
        </div>
      )}

      {confirmacion && (
        <Modal
          abierto={confirmacion !== null}
          titulo="Confirmar cambio de estado"
          onCerrar={() => setConfirmacion(null)}
          bloqueado={cambiarEstado.isPending}
        >
          <div className="space-y-4">
            <p>
              ¿Confirmás cambiar el pedido #{pedidoId} a{' '}
              <BadgeEstado estado={confirmacion} />?
            </p>

            {confirmacion === 'CANCELADO' && (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                Al cancelar el pedido se restituirá el stock de sus productos.
              </p>
            )}

            {cambiarEstado.isError && (
              <p role="alert" className="text-sm text-red-700">
                {getApiErrorMessage(cambiarEstado.error)}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="secondary"
                disabled={cambiarEstado.isPending}
                onClick={() => setConfirmacion(null)}
              >
                Volver
              </Button>

              <Button
                variant={
                  confirmacion === 'CANCELADO'
                    ? 'danger'
                    : 'primary'
                }
                disabled={cambiarEstado.isPending}
                onClick={() => void confirmarCambio()}
              >
                {cambiarEstado.isPending
                  ? 'Guardando...'
                  : 'Confirmar cambio'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {!confirmacion && cambiarEstado.isError && (
        <p role="alert" className="text-sm text-red-700">
          {getApiErrorMessage(cambiarEstado.error)}
        </p>
      )}

      {mensaje && (
        <p role="status" className="text-sm text-emerald-700">
          {mensaje}
        </p>
      )}
    </div>
  )
}


