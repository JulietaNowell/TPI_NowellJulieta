import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'

import { useAuthStore } from '../../features/auth/authStore'
import { getApiErrorMessage } from '../../shared/api/axiosInstance'

export function LoginPage() {
  const location = useLocation()

  const usuario = useAuthStore((state) => state.usuario)
  const sessionStatus = useAuthStore((state) => state.sessionStatus)
  const cargando = useAuthStore((state) => state.cargando)
  const login = useAuthStore((state) => state.login)

  const [errorServidor, setErrorServidor] = useState('')

  const procesando =
    cargando ||
    sessionStatus === 'unknown' ||
    sessionStatus === 'checking'

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },

    onSubmit: async ({ value }) => {
      if (procesando) return

      setErrorServidor('')

      try {
        await login({
          username: value.username.trim(),
          password: value.password,
        })

        form.reset()
      } catch (error) {
        setErrorServidor(getApiErrorMessage(error))
      }
    },
  })

  if (sessionStatus === 'authenticated' && usuario) {
    const destinoPorRol =
      usuario.role === 'admin' ? '/admin/resumen' : '/'

    const rutaSolicitada = (
      location.state as { from?: unknown } | null
    )?.from

    const rutasPermitidas = [
      '/',
      '/carrito',
      '/checkout',
      '/mis-pedidos',
    ]

    if (usuario.role === 'admin') {
      rutasPermitidas.push(
        '/admin',
        '/admin/resumen',
        '/admin/categorias',
        '/admin/productos',
        '/admin/pedidos',
        '/admin/usuarios',
      )
    }

    const destino =
      typeof rutaSolicitada === 'string' &&
      rutasPermitidas.includes(rutaSolicitada)
        ? rutaSolicitada
        : destinoPorRol

    return <Navigate to={destino} replace />
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <header className="space-y-2 text-center">
          <div className="text-sm font-semibold text-emerald-700">
            Food Store
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Iniciar sesión
          </h1>

          <p className="text-sm text-slate-600">
            Ingresá tus credenciales para continuar.
          </p>
        </header>

        <form
          className="space-y-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()

            if (!procesando) {
              void form.handleSubmit()
            }
          }}
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim().length === 0
                  ? 'El nombre de usuario es obligatorio'
                  : undefined,
              onBlur: ({ value }) =>
                value.trim().length === 0
                  ? 'El nombre de usuario es obligatorio'
                  : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-slate-700"
                >
                  Usuario
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  autoComplete="username"
                  placeholder="Nombre de usuario"
                  disabled={procesando}
                  className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-600 focus:outline-none disabled:opacity-50"
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

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length === 0
                  ? 'La contraseña es obligatoria'
                  : undefined,
              onBlur: ({ value }) =>
                value.length === 0
                  ? 'La contraseña es obligatoria'
                  : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-slate-700"
                >
                  Contraseña
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  autoComplete="current-password"
                  placeholder="Ingresá tu contraseña"
                  disabled={procesando}
                  className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-600 focus:outline-none disabled:opacity-50"
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

          {errorServidor && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {errorServidor}
            </p>
          )}

          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
              username: state.values.username,
              password: state.values.password,
            })}
          >
            {({ canSubmit, isSubmitting, username, password }) => (
              <button
                type="submit"
                disabled={
                  !canSubmit ||
                  isSubmitting ||
                  procesando ||
                  !username.trim() ||
                  !password
                }
                className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {procesando || isSubmitting
                  ? 'Procesando...'
                  : 'Iniciar sesión'}
              </button>
            )}
          </form.Subscribe>
        </form>

        <div className="space-y-2 border-t border-slate-200 pt-5 text-center text-sm">
          <p className="text-slate-600">
            ¿Todavía no tenés una cuenta?
          </p>

          <Link
            to="/register"
            className="font-semibold text-emerald-700 hover:underline"
          >
            Registrate
          </Link>
        </div>
      </section>
    </main>
  )
}

