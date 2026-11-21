import { Input } from '../../shared/ui/Input'
import { Card } from '../../shared/ui/Card'
import { Paginacion } from '../../shared/components/Paginacion'

import { useState } from 'react'

import { useCategorias } from '../../features/categorias/useCategorias'
import { ProductoCard } from '../../features/productos/ProductoCard'
import { useProductos } from '../../features/productos/useProductos'
import { getApiErrorMessage } from '../../shared/api/axiosInstance'

const LIMITE = 5

export function CatalogoPage() {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [soloDisponibles, setSoloDisponibles] = useState(false)
  const [pagina, setPagina] = useState(1)

  const categoriasQuery = useCategorias()

  const productosQuery = useProductos({
    skip: (pagina - 1) * LIMITE,
    limit: LIMITE,
    search: busqueda.trim() || undefined,
    categoria_id: categoriaId ? Number(categoriaId) : undefined,
    disponible: soloDisponibles ? true : undefined,
  })

  const categorias = categoriasQuery.data ?? []
  const productos = productosQuery.data?.items ?? []
  const total = productosQuery.data?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE))

  function actualizarBusqueda(valor: string) {
    setBusqueda(valor)
    setPagina(1)
  }

  function actualizarCategoria(valor: string) {
    setCategoriaId(valor)
    setPagina(1)
  }

  function actualizarDisponibilidad(valor: boolean) {
    setSoloDisponibles(valor)
    setPagina(1)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-2">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Catálogo de productos
            </h1>

            <p className="text-slate-600">
              Explora nuestro catalogo de productos.
            </p>
          </div>

        </header>

        <Card as="section"
          aria-label="Filtros del catalogo"
          className="grid gap-4 p-5 md:grid-cols-3"
        >
          <label className="space-y-2">
            <span className="block text-sm font-medium">
              Buscar producto
            </span>

            <Input
              type="search"
              value={busqueda}
              onChange={(event) =>
                actualizarBusqueda(event.target.value)
              }
              placeholder="Ejemplo: Pizza"
              className="w-full rounded-lg border border-slate-300 p-2"
            />
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium">
              Categoria
            </span>

            <select
              value={categoriaId}
              onChange={(event) =>
                actualizarCategoria(event.target.value)
              }
              disabled={categoriasQuery.isPending}
              className="w-full rounded-lg border border-slate-300 p-2"
            >
              <option value="">Todas las categorias</option>

              {categorias
                .filter((categoria) => categoria.activo)
                .map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
            </select>
          </label>

          <label className="flex items-center gap-3 self-end pb-2">
            <input
              type="checkbox"
              checked={soloDisponibles}
              onChange={(event) =>
                actualizarDisponibilidad(event.target.checked)
              }
              className="h-4 w-4"
            />

            <span className="text-sm font-medium">
              Solo disponibles
            </span>
          </label>
        </Card>

        {categoriasQuery.isError && (
          <div
            role="alert"
            className="rounded-lg border border-amber-300 bg-amber-50 p-4"
          >
            <p>
              No se pudieron cargar las categorias:
              {' '}
              {getApiErrorMessage(categoriasQuery.error)}
            </p>

            <button
              type="button"
              onClick={() => void categoriasQuery.refetch()}
              className="mt-2 text-sm font-semibold underline"
            >
              Reintentar
            </button>
          </div>
        )}

        <section aria-label="Listado de productos">
          {productosQuery.isPending ? (
            <p role="status">Cargando productos...</p>
          ) : productosQuery.isError ? (
            <div
              role="alert"
              className="rounded-lg border border-red-300 bg-red-50 p-4"
            >
              <p>
                Error al cargar productos:
                {' '}
                {getApiErrorMessage(productosQuery.error)}
              </p>

              <button
                type="button"
                onClick={() => void productosQuery.refetch()}
                className="mt-2 font-semibold underline"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  {total} producto(s) encontrado(s)
                </p>

                <p className="text-sm text-slate-600">
                  Pagina {pagina} de {totalPaginas}
                </p>
              </div>

              {productos.length === 0 ? (
                <p className="rounded-lg bg-white p-6 text-slate-600">
                  No se encontraron productos para los filtros seleccionados.
                </p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {productos.map((producto) => (
                    <ProductoCard
                      key={producto.id}
                      producto={producto}
                    />
                  ))}
                </div>
              )}

              <Paginacion
                pagina={pagina - 1}
                totalPaginas={totalPaginas}
                deshabilitada={productosQuery.isFetching}
                onAnterior={() =>
                  setPagina((actual) => Math.max(1, actual - 1))
                }
                onSiguiente={() =>
                  setPagina((actual) =>
                    Math.min(totalPaginas, actual + 1),
                  )
                }
              />
            </div>
          )}
        </section>
      </div>
    </main>
  )
}


