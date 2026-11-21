import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../../shared/components/DataTable'

import { useState } from 'react'
import { Link } from 'react-router-dom'

import { CategoriaForm } from '../../features/categorias/CategoriaForm'

import type { Categoria, CategoriaCreate } from '../../features/categorias/categoriaTypes'
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../../features/categorias/useCategorias'
import { getApiErrorMessage } from '../../shared/api/axiosInstance'



export function AdminCategoriasPage() {
  const categorias = useCategorias()
  const crearCategoria = useCrearCategoria()
  const actualizarCategoria = useActualizarCategoria()
  const eliminarCategoria = useEliminarCategoria()


  const [categoriaEditando, setCategoriaEditando] =
    useState<Categoria | null>(null)
  const [categoriaEliminando, setCategoriaEliminando] =
    useState<Categoria | null>(null)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [errorEliminacion, setErrorEliminacion] = useState('')
  const [mensaje, setMensaje] = useState('')

  const guardando =
    crearCategoria.isPending || actualizarCategoria.isPending

  function limpiarFormulario() {

    setCategoriaEditando(null)
    setErrorFormulario('')
  }

  function iniciarEdicion(categoria: Categoria) {
    setCategoriaEditando(categoria)

    setErrorFormulario('')
    setMensaje('')
  }

  async function guardarCategoria(
    datos: CategoriaCreate,
  ): Promise<boolean> {
    if (guardando) return false

    setErrorFormulario('')
    setMensaje('')

    try {
      if (categoriaEditando) {
        await actualizarCategoria.mutateAsync({
          id: categoriaEditando.id,
          datos,
        })
        setMensaje('Categoría actualizada correctamente.')
      } else {
        await crearCategoria.mutateAsync(datos)
        setMensaje('Categoría creada correctamente.')
      }

      limpiarFormulario()
      return true
    } catch (error) {
      setErrorFormulario(getApiErrorMessage(error))
      return false
    }
  }

  async function confirmarEliminacion() {
    if (!categoriaEliminando || eliminarCategoria.isPending) return

    setErrorEliminacion('')
    setMensaje('')

    try {
      await eliminarCategoria.mutateAsync(categoriaEliminando.id)

      if (categoriaEditando?.id === categoriaEliminando.id) {
        limpiarFormulario()
      }

      setCategoriaEliminando(null)
      setMensaje('Categoría desactivada correctamente.')
    } catch (error) {
      setErrorEliminacion(getApiErrorMessage(error))
    }
  }

  const columnas: ColumnDef<Categoria>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) =>
        row.original.descripcion || 'Sin descripción',
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const categoria = row.original

        return (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => iniciarEdicion(categoria)}
              disabled={guardando || eliminarCategoria.isPending}
              className="rounded-lg border border-blue-300 px-4 py-2 text-blue-800 disabled:opacity-50"
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => {
                setCategoriaEliminando(categoria)
                setErrorEliminacion('')
                setMensaje('')
              }}
              disabled={guardando || eliminarCategoria.isPending}
              className="rounded-lg border border-red-300 px-4 py-2 text-red-800 disabled:opacity-50"
            >
              Desactivar
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <Link
            to="/admin/resumen"
            className="font-semibold text-emerald-700 underline"
          >
            Volver al panel administrativo
          </Link>

          <h1 className="text-3xl font-bold text-slate-900">
            Administración de categorías
          </h1>

          <p className="text-slate-600">
            Creá, modificá y desactivá las categorías del catálogo.
          </p>
        </header>

        {mensaje && (
          <p
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
          >
            {mensaje}
          </p>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">
            {categoriaEditando
              ? `Editar categoría #${categoriaEditando.id}`
              : 'Nueva categoría'}
          </h2>

          <CategoriaForm
            key={categoriaEditando?.id ?? 'nueva'}
            categoria={categoriaEditando}
            guardando={guardando}
            error={errorFormulario}
            onGuardar={guardarCategoria}
            onCancelar={limpiarFormulario}
          />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">
            Categorías activas
          </h2>

          {categorias.isPending && <p>Cargando categorías...</p>}

          {categorias.isError && (
            <div className="space-y-3">
              <p role="alert" className="text-red-700">
                {getApiErrorMessage(categorias.error)}
              </p>
              <button
                type="button"
                onClick={() => void categorias.refetch()}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-white"
              >
                Reintentar
              </button>
            </div>
          )}

          {categorias.isSuccess && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Total de categorías: {categorias.data.length}
              </p>

              <DataTable
                datos={categorias.data}
                columnas={columnas}
                obtenerId={(categoria) => String(categoria.id)}
                paginar
                tamanioPagina={5}
                mensajeVacio="No hay categorías activas."
              />
            </div>
          )}

        </section>

        {categoriaEliminando && (
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmar-eliminacion"
            className="rounded-xl border border-red-300 bg-white p-6 shadow-sm"
          >
            <h2
              id="confirmar-eliminacion"
              className="text-xl font-semibold"
            >
              Confirmar desactivación
            </h2>

            <p className="mt-3">
              ¿Querés desactivar la categoría{' '}
              <strong>{categoriaEliminando.nombre}</strong>?
            </p>

            <p className="mt-2 text-sm text-slate-600">
              La categoría dejará de aparecer en los listados
              de categorías activas.
            </p>

            {errorEliminacion && (
              <p role="alert" className="mt-3 text-red-700">
                {errorEliminacion}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => void confirmarEliminacion()}
                disabled={eliminarCategoria.isPending}
                className="rounded-lg bg-red-700 px-4 py-2 text-white disabled:opacity-50"
              >
                {eliminarCategoria.isPending
                  ? 'Desactivando...'
                  : 'Confirmar desactivación'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategoriaEliminando(null)
                  setErrorEliminacion('')
                }}
                disabled={eliminarCategoria.isPending}
                className="rounded-lg border border-slate-300 px-4 py-2"
              >
                Cancelar
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}



