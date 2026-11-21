import { Card } from './Card'

interface EstadoVacioProps {
  mensaje: string
  titulo?: string
}

export function EstadoVacio({
  mensaje,
  titulo,
}: EstadoVacioProps) {
  return (
    <Card className="space-y-2 p-6 text-center" role="status">
      {titulo && (
        <h3 className="font-semibold text-slate-900">
          {titulo}
        </h3>
      )}

      <p className="text-slate-600">
        {mensaje}
      </p>
    </Card>
  )
}
