import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'

import { productoQueryKeys } from '../productos/useProductos'
import { pedidoService } from './pedidoService'

import type {
  CambioEstadoPedido,
  PedidoCreate,
  PedidoFiltros,
  PedidoRead,
} from './pedidoTypes'

export const pedidoQueryKeys = {
  all: ['pedidos'] as const,

  listas: () =>
    [...pedidoQueryKeys.all, 'lista'] as const,

  lista: (filtros: PedidoFiltros) =>
    [...pedidoQueryKeys.listas(), filtros] as const,

  detalle: (id: number) =>
    [...pedidoQueryKeys.all, 'detalle', id] as const,

  resumen: () =>
    [...pedidoQueryKeys.all, 'resumen'] as const,
}

async function invalidarStockProductos(
  queryClient: QueryClient,
  pedido: PedidoRead,
) {
  const productoIds = [
    ...new Set(
      pedido.items.map((item) => item.producto_id),
    ),
  ]

  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: productoQueryKeys.all,
    }),

    ...productoIds.map((id) =>
      queryClient.invalidateQueries({
        queryKey: productoQueryKeys.detalle(id),
        exact: true,
      }),
    ),
  ])
}

async function actualizarCachePedido(
  queryClient: QueryClient,
  pedido: PedidoRead,
  afectaStock: boolean,
) {
  const invalidaciones = [
    queryClient.invalidateQueries({
      queryKey: pedidoQueryKeys.listas(),
    }),

    queryClient.invalidateQueries({
      queryKey: pedidoQueryKeys.detalle(pedido.id),
      exact: true,
    }),

    queryClient.invalidateQueries({
      queryKey: pedidoQueryKeys.resumen(),
    }),
  ]

  if (afectaStock) {
    invalidaciones.push(
      invalidarStockProductos(queryClient, pedido),
    )
  }

  await Promise.all(invalidaciones)
}

export function usePedidos(
  filtros: PedidoFiltros = {},
) {
  return useQuery({
    queryKey: pedidoQueryKeys.lista(filtros),
    queryFn: () => pedidoService.listar(filtros),
  })
}

export function usePedido(id: number) {
  return useQuery({
    queryKey: pedidoQueryKeys.detalle(id),
    queryFn: () => pedidoService.obtenerPorId(id),
    enabled: Number.isSafeInteger(id) && id > 0,
  })
}

export function useCrearPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: PedidoCreate) =>
      pedidoService.crear(datos),

    onSuccess: async (pedido) => {
      await actualizarCachePedido(
        queryClient,
        pedido,
        true,
      )
    },
  })
}

export function useCancelarPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      pedidoService.cancelar(id),

    onSuccess: async (pedido) => {
      await actualizarCachePedido(
        queryClient,
        pedido,
        true,
      )
    },
  })
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: pedidoQueryKeys.resumen(),
    queryFn: () => pedidoService.obtenerResumen(),
  })
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number
      datos: CambioEstadoPedido
    }) => pedidoService.cambiarEstado(id, datos),

    onSuccess: async (pedido) => {
      await actualizarCachePedido(
        queryClient,
        pedido,
        pedido.estado === 'CANCELADO',
      )
    },
  })
}