import { Button } from './Button'

interface EstadoErrorProps {
  mensaje: string
  titulo?: string
  onReintentar?: () => void
  reintentando?: boolean
}

export function EstadoError({
  mensaje,
  titulo = 'Ocurrió un error',
  onReintentar,
  reintentando = false,
}: EstadoErrorProps) {
  return (
    <div
      role="alert"
      className="space-y-3 rounded-lg border border-red-300 bg-red-50 p-4"
    >
      <h3 className="font-semibold text-red-800">
        {titulo}
      </h3>

      <p className="text-sm text-red-700">
        {mensaje}
      </p>

      {onReintentar && (
        <Button
          variant="secondary"
          onClick={onReintentar}
          disabled={reintentando}
        >
          {reintentando ? 'Reintentando...' : 'Reintentar'}
        </Button>
      )}
    </div>
  )
}
