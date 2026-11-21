import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { productoService } from './productoService'

import type {
  ProductoCreate,
  ProductoFiltros,
  ProductoStockUpdate,
  ProductoUpdate,
} from './productoTypes'

export const productoQueryKeys = {
  all: ['productos'] as const,
  lista: (filtros: ProductoFiltros) =>
    ['productos', filtros] as const,
  detalle: (id: number) => ['producto', id] as const,
}

export function useProductos(filtros: ProductoFiltros = {}) {
  return useQuery({
    queryKey: productoQueryKeys.lista(filtros),
    queryFn: () => productoService.listar(filtros),
  })
}

export function useProducto(id: number) {
  return useQuery({
    queryKey: productoQueryKeys.detalle(id),
    queryFn: () => productoService.obtener(id),
    enabled: Number.isSafeInteger(id) && id > 0,
  })
}

export function useCrearProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: ProductoCreate) =>
      productoService.crear(datos),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: productoQueryKeys.all,
      })
    },
  })
}

export function useActualizarProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number
      datos: ProductoUpdate
    }) => productoService.actualizar(id, datos),

    onSuccess: async (producto) => {
      queryClient.setQueryData(
        productoQueryKeys.detalle(producto.id),
        producto,
      )

      await queryClient.invalidateQueries({
        queryKey: productoQueryKeys.all,
      })
    },
  })
}

export function useActualizarStockProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number
      datos: ProductoStockUpdate
    }) => productoService.actualizarStock(id, datos),

    onSuccess: async (producto) => {
      queryClient.setQueryData(
        productoQueryKeys.detalle(producto.id),
        producto,
      )

      await queryClient.invalidateQueries({
        queryKey: productoQueryKeys.all,
      })
    },
  })
}

export function useEliminarProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      productoService.eliminar(id),

    onSuccess: async (_resultado, id) => {
      queryClient.removeQueries({
        queryKey: productoQueryKeys.detalle(id),
      })

      await queryClient.invalidateQueries({
        queryKey: productoQueryKeys.all,
      })
    },
  })
}
