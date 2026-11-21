import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuthStore } from '../../features/auth/authStore'
import {
  obtenerCantidadTotal,
  useCarritoStore,
} from '../../features/carrito/carritoStore'
import { getApiErrorMessage } from '../api/axiosInstance'

export function Navbar() {
  const navigate = useNavigate()

  const usuario = useAuthStore((state) => state.usuario)
  const sessionStatus = useAuthStore((state) => state.sessionStatus)
  const cargando = useAuthStore((state) => state.cargando)
  const logout = useAuthStore((state) => state.logout)
  const checkSession = useAuthStore((state) => state.checkSession)

  const items = useCarritoStore((state) => state.items)
  const cantidad = obtenerCantidadTotal(items)

  const [error, setError] = useState('')

  const autenticado =
    sessionStatus === 'authenticated' && usuario !== null

  const esAdmin = autenticado && usuario.role === 'admin'

  const enlaceClassName = ({
    isActive,
  }: {
    isActive: boolean
  }) =>
    isActive
      ? 'rounded-lg bg-emerald-100 px-3 py-2 font-semibold text-emerald-800'
      : 'rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100'

  async function handleLogout() {
    setError('')

    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setError(getApiErrorMessage(error))
      await checkSession()
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="text-xl font-bold text-emerald-700"
          >
            Food Store
          </Link>

          <nav
            aria-label="Navegación principal"
            className="flex flex-wrap items-center gap-2 text-sm"
          >
            <NavLink to="/" end className={enlaceClassName}>
              Catálogo
            </NavLink>

            <NavLink
              to="/carrito"
              className={enlaceClassName}
            >
              Carrito ({cantidad})
            </NavLink>

            {autenticado && (
              <NavLink
                to="/mis-pedidos"
                className={enlaceClassName}
              >
                Mis pedidos
              </NavLink>
            )}

            {esAdmin && (
              <NavLink
                to="/admin/resumen"
                className={enlaceClassName}
              >
                Administración
              </NavLink>
            )}
          </nav>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            {sessionStatus === 'unknown' ||
            sessionStatus === 'checking' ? (
              <span role="status" className="text-slate-500">
                Verificando sesión...
              </span>
            ) : sessionStatus === 'error' ? (
              <button
                type="button"
                disabled={cargando}
                onClick={() => void checkSession()}
                className="font-semibold text-emerald-700"
              >
                Reintentar sesión
              </button>
            ) : autenticado ? (
              <>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">
                    {usuario.full_name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {esAdmin ? 'Administrador' : 'Cliente'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  disabled={cargando}
                  className="rounded-lg border border-red-300 px-3 py-2 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {cargando ? 'Procesando...' : 'Cerrar sesión'}
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/register"
                  className={enlaceClassName}
                >
                  Registrarse
                </NavLink>

                <Link
                  to="/login"
                  className="rounded-lg bg-emerald-700 px-3 py-2 font-semibold text-white hover:bg-emerald-800"
                >
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
      </div>
    </header>
  )
}
