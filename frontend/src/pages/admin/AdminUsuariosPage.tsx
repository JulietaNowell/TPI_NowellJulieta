import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  useActivarUsuario,
  useDesactivarUsuario,
  useUsuarios,
} from '../../features/usuarios/useUsuarios'
import { useAuthStore } from '../../features/auth/authStore'
import type { UserPublic } from '../../features/auth/authTypes'
import { getApiErrorMessage } from '../../shared/api/axiosInstance'

type AccionUsuario = 'activar' | 'desactivar'

interface Confirmacion {
  usuario: UserPublic
  accion: AccionUsuario
}

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function AdminUsuariosPage() {
  const usuarios = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()

  const administrador = useAuthStore((estado) => estado.usuario)

  const [confirmacion, setConfirmacion] =
    useState<Confirmacion | null>(null)

  const [mensaje, setMensaje] = useState('')
  const [errorAccion, setErrorAccion] = useState('')

  const guardando = activar.isPending || desactivar.isPending

  async function confirmarAccion() {
    if (!confirmacion || guardando) return

    const { usuario, accion } = confirmacion

    setMensaje('')
    setErrorAccion('')

    try {
      if (accion === 'activar') {
        await activar.mutateAsync(usuario.id)
      } else {
        await desactivar.mutateAsync(usuario.id)
      }

      setMensaje(
        `Usuario ${usuario.username} ${
          accion === 'activar' ? 'activado' : 'desactivado'
        } correctamente.`,
      )

      setConfirmacion(null)
    } catch (error) {
      setErrorAccion(getApiErrorMessage(error))
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-3">
          <Link
            to="/admin/resumen"
            className="font-semibold text-emerald-700 underline"
          >
            Volver al panel administrativo
          </Link>

          <h1 className="text-3xl font-bold text-slate-900">
            Administración de usuarios
          </h1>

          <p className="text-slate-600">
            Consultá los usuarios registrados y administrá
            el estado de sus cuentas.
          </p>
        </header>

        {mensaje && (
          <p
            role="status"
            className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-800"
          >
            {mensaje}
          </p>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">
            Usuarios registrados
          </h2>

          {usuarios.isPending && (
            <p role="status">Cargando usuarios...</p>
          )}

          {usuarios.isError && (
            <div className="space-y-3">
              <p role="alert" className="text-red-700">
                {getApiErrorMessage(usuarios.error)}
              </p>

              <button
                type="button"
                onClick={() => void usuarios.refetch()}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-white"
              >
                Reintentar
              </button>
            </div>
          )}

          {usuarios.isSuccess && usuarios.data.length === 0 && (
            <p>No hay usuarios registrados.</p>
          )}

          {usuarios.isSuccess && usuarios.data.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Total de usuarios: {usuarios.data.length}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="p-3">Usuario</th>
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Correo</th>
                      <th className="p-3">Rol</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Registro</th>
                      <th className="p-3">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuarios.data.map((usuario) => {
                      const esCuentaPropia =
                        administrador?.id === usuario.id

                      return (
                        <tr
                          key={usuario.id}
                          className="border-b border-slate-100"
                        >
                          <td className="p-3 font-medium">
                            {usuario.username}
                            {esCuentaPropia && (
                              <span className="ml-2 text-xs text-slate-500">
                                (Tu cuenta)
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            {usuario.full_name}
                          </td>

                          <td className="p-3">
                            {usuario.email}
                          </td>

                          <td className="p-3">
                            {usuario.role === 'admin'
                              ? 'Administrador'
                              : 'Usuario'}
                          </td>

                          <td className="p-3">
                            <span
                              className={
                                usuario.disabled
                                  ? 'font-medium text-red-700'
                                  : 'font-medium text-emerald-700'
                              }
                            >
                              {usuario.disabled
                                ? 'Desactivado'
                                : 'Activo'}
                            </span>
                          </td>

                          <td className="p-3">
                            {formatoFecha.format(
                              new Date(usuario.created_at),
                            )}
                          </td>

                          <td className="p-3">
                            {usuario.disabled ? (
                              <button
                                type="button"
                                disabled={guardando}
                                onClick={() => {
                                  setConfirmacion({
                                    usuario,
                                    accion: 'activar',
                                  })
                                  setErrorAccion('')
                                }}
                                className="rounded-lg bg-emerald-700 px-3 py-2 text-white disabled:opacity-50"
                              >
                                Activar
                              </button>
                            ) : esCuentaPropia ? (
                              <span className="text-xs text-slate-500">
                                No podés desactivar tu cuenta
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={guardando}
                                onClick={() => {
                                  setConfirmacion({
                                    usuario,
                                    accion: 'desactivar',
                                  })
                                  setErrorAccion('')
                                }}
                                className="rounded-lg bg-red-700 px-3 py-2 text-white disabled:opacity-50"
                              >
                                Desactivar
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {confirmacion && (
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar cambio de estado"
            className="rounded-xl border border-amber-300 bg-amber-50 p-6"
          >
            <h2 className="mb-3 text-xl font-semibold">
              Confirmar operación
            </h2>

            <p>
              ¿Confirmás que querés{' '}
              <strong>{confirmacion.accion}</strong> la cuenta{' '}
              <strong>{confirmacion.usuario.username}</strong>?
            </p>

            {errorAccion && (
              <p role="alert" className="mt-3 text-red-700">
                {errorAccion}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={guardando}
                onClick={() => void confirmarAccion()}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Confirmar'}
              </button>

              <button
                type="button"
                disabled={guardando}
                onClick={() => {
                  setConfirmacion(null)
                  setErrorAccion('')
                }}
                className="rounded-lg border border-slate-300 px-4 py-2"
              >
                Volver
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

