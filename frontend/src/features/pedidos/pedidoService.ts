import { api } from '../../shared/api/axiosInstance'

import type {
  CambioEstadoPedido,
  PedidoCreate,
  PedidoFiltros,
  PedidoRead,
  PedidosPaginados,
  ResumenPedidos,
} from './pedidoTypes'

export const pedidoService = {
  async crear(datos: PedidoCreate): Promise<PedidoRead> {
    const response = await api.post<PedidoRead>(
      '/pedidos',
      datos,
    )

    return response.data
  },

  async listar(
    filtros: PedidoFiltros = {},
  ): Promise<PedidosPaginados> {
    const response = await api.get<PedidosPaginados>(
      '/pedidos',
      { params: filtros },
    )

    return response.data
  },

  async obtenerPorId(id: number): Promise<PedidoRead> {
    const response = await api.get<PedidoRead>(
      `/pedidos/${id}`,
    )

    return response.data
  },

  async obtenerResumen(): Promise<ResumenPedidos> {
    const response = await api.get<ResumenPedidos>(
      '/pedidos/resumen',
    )

    return response.data
  },

  async cambiarEstado(
    id: number,
    datos: CambioEstadoPedido,
  ): Promise<PedidoRead> {
    const response = await api.patch<PedidoRead>(
      `/pedidos/${id}/estado`,
      datos,
    )

    return response.data
  },

  async cancelar(id: number): Promise<PedidoRead> {
    const response = await api.patch<PedidoRead>(
      `/pedidos/${id}/cancelar`,
    )

    return response.data
  },
}

