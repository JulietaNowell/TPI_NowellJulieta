import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '../../features/auth/authStore'
import type { UserRole } from '../../features/auth/authTypes'

interface ProtectedRouteProps {
  roles?: UserRole[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((state) => state.usuario)
  const sessionStatus = useAuthStore((state) => state.sessionStatus)
  const location = useLocation()

  if (sessionStatus === 'unknown' || sessionStatus === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Verificando sesion...</p>
      </main>
    )
  }

  if (sessionStatus === 'error') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-semibold">
          No se pudo verificar la sesion
        </h1>
        <p>Comproba la conexion con el servidor e intenta nuevamente.</p>
        <button
          type="button"
          onClick={() => void useAuthStore.getState().checkSession()}
          className="rounded bg-emerald-700 px-4 py-2 text-white"
        >
          Reintentar
        </button>
      </main>
    )
  }

  if (sessionStatus !== 'authenticated' || !usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

