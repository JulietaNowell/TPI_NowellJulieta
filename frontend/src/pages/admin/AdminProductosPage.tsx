import { Skeleton } from '../../shared/ui/Skeleton'
import { EstadoError } from '../../shared/ui/EstadoError'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'

import { ProductoStockForm } from '../../features/productos/ProductoStockForm'
import { ProductoEditForm } from '../../features/productos/ProductoEditForm'
import { ProductoCreateForm } from '../../features/productos/ProductoCreateForm'

import {
  useEliminarProducto,
  useProductos,
} from '../../features/productos/useProductos'

import type { Producto } from '../../features/productos/productoTypes'

import { getApiErrorMessage } from '../../shared/api/axiosInstance'
import { DataTable } from '../../shared/components/DataTable'

const LIMITE_CONSULTA = 100
const TAMANIO_PAGINA = 5

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

export function AdminProductosPage() {
  const [productoEditando, setProductoEditando] =
    useState<Producto | null>(null)

  const [productoStock, setProductoStock] =
    useState<Producto | null>(null)

  const [errorEliminar, setErrorEliminar] = useState('')

  const eliminarProducto = useEliminarProducto()

  const productos = useProductos({
    skip: 0,
    limit: LIMITE_CONSULTA,
  })

  async function eliminar(producto: Producto) {
    const confirmado = window.confirm(
      `¿Eliminar el producto "${producto.nombre}" (ID: ${producto.id})?`,
    )

    if (!confirmado) return

    setErrorEliminar('')

    try {
      await eliminarProducto.mutateAsync(producto.id)

      setProductoEditando(null)
      setProductoStock(null)
    } catch (errorDesconocido) {
      setErrorEliminar(getApiErrorMessage(errorDesconocido))
    }
  }

  const columnas: ColumnDef<Producto>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'nombre',
      header: 'Producto',
      cell: ({ row }) => {
        const producto = row.original

        return (
          <div className="flex min-w-48 items-start gap-3">
            {producto.imagen_url && (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                loading="lazy"
                className="h-14 w-14 shrink-0 rounded-lg object-cover"
              />
            )}

            <div className="space-y-1">
              <p className="font-semibold text-slate-900">
                {producto.nombre}
              </p>

              <p className="text-xs text-slate-600">
                {producto.descripcion || 'Sin descripción'}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      id: 'categoria',
      header: 'Categoría',
      accessorFn: (producto) => producto.categoria.nombre,
    },
    {
      accessorKey: 'precio_base',
      header: 'Precio',
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatoPrecio.format(row.original.precio_base)}
        </span>
      ),
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
    },
    {
      accessorKey: 'disponible',
      header: 'Disponibilidad',
      cell: ({ row }) => (
        <span
          className={
            row.original.disponible
              ? 'font-medium text-emerald-700'
              : 'font-medium text-red-700'
          }
        >
          {row.original.disponible
            ? 'Habilitado'
            : 'No disponible'}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const producto = row.original

        return (
          <div className="flex min-w-36 flex-wrap gap-2">
            <button
              type="button"
              disabled={eliminarProducto.isPending}
              onClick={() => {
                setProductoStock(null)
                setProductoEditando(producto)
              }}
              className="rounded bg-emerald-700 px-3 py-2 text-white disabled:opacity-50"
            >
              Editar
            </button>

            <button
              type="button"
              disabled={eliminarProducto.isPending}
              onClick={() => {
                setProductoEditando(null)
                setProductoStock(producto)
              }}
              className="rounded bg-blue-700 px-3 py-2 text-white disabled:opacity-50"
            >
              Actualizar stock
            </button>

            <button
              type="button"
              disabled={eliminarProducto.isPending}
              onClick={() => void eliminar(producto)}
              className="rounded bg-red-700 px-3 py-2 text-white disabled:opacity-50"
            >
              Eliminar
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
            Administración de productos
          </h1>

          <p className="text-slate-600">
            Consultá los productos, sus precios, stock y disponibilidad.
          </p>
        </header>

        {productoEditando && (
          <ProductoEditForm
            key={productoEditando.id}
            producto={productoEditando}
            onCerrar={() => setProductoEditando(null)}
          />
        )}

        {productoStock && (
          <ProductoStockForm
            key={productoStock.id}
            producto={productoStock}
            onCerrar={() => setProductoStock(null)}
          />
        )}

        <ProductoCreateForm />

        {errorEliminar && (
          <p role="alert" className="text-red-700">
            {errorEliminar}
          </p>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">
            Productos activos
          </h2>

          {productos.isPending && (
            <Skeleton cantidad={3} mensaje="Cargando productos..." />
          )}

          {productos.isError && (
            <EstadoError
              titulo="Error al cargar productos"
              mensaje={getApiErrorMessage(productos.error)}
              onReintentar={() => void productos.refetch()}
              reintentando={productos.isFetching}
            />
          )}

          {productos.isSuccess && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Total de productos: {productos.data.total}
              </p>

              {productos.data.total > productos.data.items.length && (
                <p className="text-sm text-amber-700">
                  Se muestran los primeros {productos.data.items.length}
                  {' '}productos del catálogo.
                </p>
              )}

              <DataTable
                datos={productos.data.items}
                columnas={columnas}
                obtenerId={(producto) => String(producto.id)}
                paginar
                tamanioPagina={TAMANIO_PAGINA}
                mensajeVacio="No hay productos para mostrar."
              />
            </div>
          )}
        </section>
      </div>
    </main>
  )
}


