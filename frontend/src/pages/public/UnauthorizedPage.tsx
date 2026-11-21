import { useNavigate } from 'react-router-dom'

import { Card } from '../../shared/ui/Card'
import { Button } from '../../shared/ui/Button'

export function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-lg space-y-5 p-8 text-center">
        <p className="text-5xl font-bold text-red-700">
          403
        </p>

        <h1 className="text-2xl font-semibold">
          Acceso no autorizado
        </h1>

        <p className="text-slate-600">
          No tenés los permisos necesarios para acceder
          a esta sección de Food Store.
        </p>

        <Button
          onClick={() => navigate('/', { replace: true })}
        >
          Volver al catálogo
        </Button>
      </Card>
    </main>
  )
}
