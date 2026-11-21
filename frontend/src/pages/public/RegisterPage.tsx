import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'

import { authService } from '../../features/auth/authService'
import { getApiErrorMessage } from '../../shared/api/axiosInstance'

const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const longitudBytes = (valor: string) =>
  new TextEncoder().encode(valor).length

export function RegisterPage() {
  const [errorServidor, setErrorServidor] = useState('')
  const [registroExitoso, setRegistroExitoso] = useState(false)

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
      confirmarPassword: '',
    },

    onSubmit: async ({ value }) => {
      setErrorServidor('')

      try {
        await authService.register({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })

        setRegistroExitoso(true)
      } catch (error) {
        setErrorServidor(getApiErrorMessage(error))
      }
    },
  })

  if (registroExitoso) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <section className="w-full max-w-md space-y-5 rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-emerald-700">
            Registro exitoso
          </h1>

          <p className="text-slate-600">
            Tu cuenta fue creada correctamente.
            Ya podes iniciar sesion.
          </p>

          <Link
            to="/login"
            className="inline-block rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white"
          >
            Iniciar sesion
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Crear cuenta
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Completa tus datos para registrarte en Food Store.
        </p>

        <form
          className="mt-6 space-y-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{
              onBlur: ({ value }) =>
                value.trim().length === 0
                  ? 'El nombre de usuario es obligatorio'
                  : undefined,
              onChange: ({ value }) =>
                value.trim().length === 0
                  ? 'El nombre de usuario es obligatorio'
                  : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold"
                >
                  Nombre de usuario
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  autoComplete="username"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
            name="full_name"
            validators={{
              onBlur: ({ value }) =>
                value.trim().length === 0
                  ? 'El nombre completo es obligatorio'
                  : undefined,
              onChange: ({ value }) =>
                value.trim().length === 0
                  ? 'El nombre completo es obligatorio'
                  : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold"
                >
                  Nombre completo
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  autoComplete="name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
            name="email"
            validators={{
              onBlur: ({ value }) =>
                emailValido.test(value.trim())
                  ? undefined
                  : 'Ingresa un correo electronico valido',
              onChange: ({ value }) =>
                emailValido.test(value.trim())
                  ? undefined
                  : 'Ingresa un correo electronico valido',
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold"
                >
                  Correo electronico
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
              onBlur: ({ value }) => {
                if (value.length < 8) {
                  return 'La contraseña debe tener al menos 8 caracteres'
                }

                if (longitudBytes(value) > 72) {
                  return 'La contraseña no puede superar los 72 bytes'
                }

                return undefined
              },
              onChange: ({ value }) => {
                if (value.length < 8) {
                  return 'La contraseña debe tener al menos 8 caracteres'
                }

                if (longitudBytes(value) > 72) {
                  return 'La contraseña no puede superar los 72 bytes'
                }

                return undefined
              },
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold"
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
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
            name="confirmarPassword"
            validators={{
              onBlur: ({ value, fieldApi }) =>
                value === fieldApi.form.getFieldValue('password')
                  ? undefined
                  : 'Las contraseñas no coinciden',
              onChange: ({ value, fieldApi }) =>
                value === fieldApi.form.getFieldValue('password')
                  ? undefined
                  : 'Las contraseñas no coinciden',
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold"
                >
                  Confirmar contraseña
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
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
            <p role="alert" className="text-sm text-red-700">
              {errorServidor}
            </p>
          )}

          <form.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isSubmitting,
            ]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
              </button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tenes cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-emerald-700 underline"
          >
            Iniciar sesion
          </Link>
        </p>
      </section>
    </main>
  )
}
