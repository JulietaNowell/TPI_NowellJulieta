import { Link } from 'react-router-dom'

import { useAuthStore } from '../../features/auth/authStore'

const secciones = [
  {
    titulo: 'Categorías',
    descripcion: 'Crear, consultar, modificar y eliminar categorías.',
    ruta: '/admin/categorias',
  },
  {
    titulo: 'Productos',
    descripcion: 'Administrar el catálogo, los precios y el stock.',
    ruta: '/admin/productos',
  },
  {
    titulo: 'Pedidos',
    descripcion: 'Consultar pedidos y gestionar sus estados.',
    ruta: '/admin/pedidos',
  },
  {
    titulo: 'Usuarios',
    descripcion: 'Consultar usuarios y administrar su estado.',
    ruta: '/admin/usuarios',
  },
]

export function AdminDashboardPage() {
  const usuario = useAuthStore((state) => state.usuario)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <Link
            to="/"
            className="font-semibold text-emerald-700 underline"
          >
            Volver al catálogo
          </Link>

          <h1 className="text-3xl font-bold text-slate-900">
            Panel de administración
          </h1>

          <p className="text-slate-600">
            Bienvenido, {usuario?.full_name ?? 'Administrador'}.
            Seleccioná una sección para comenzar.
          </p>
        </header>

        <section
          aria-label="Módulos administrativos"
          className="grid gap-5 sm:grid-cols-2"
        >
          {secciones.map((seccion) => (
            <Link
              key={seccion.ruta}
              to={seccion.ruta}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-500 hover:shadow-md"
            >
              <h2 className="text-xl font-bold text-slate-900">
                {seccion.titulo}
              </h2>

              <p className="mt-3 text-slate-600">
                {seccion.descripcion}
              </p>

              <p className="mt-5 font-semibold text-emerald-700">
                Acceder a la sección
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
