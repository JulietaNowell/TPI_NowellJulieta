import { api } from '../../shared/api/axiosInstance'

import type {
  Producto,
  ProductoCreate,
  ProductoFiltros,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from './productoTypes'

export const productoService = {
  async listar(
    filtros: ProductoFiltros = {},
  ): Promise<ProductosPaginados> {
    const response = await api.get<ProductosPaginados>(
      '/productos',
      { params: filtros },
    )

    return response.data
  },

  async obtener(id: number): Promise<Producto> {
    const response = await api.get<Producto>(`/productos/${id}`)
    return response.data
  },

  async crear(datos: ProductoCreate): Promise<Producto> {
    const response = await api.post<Producto>('/productos', datos)
    return response.data
  },

  async actualizar(
    id: number,
    datos: ProductoUpdate,
  ): Promise<Producto> {
    const response = await api.put<Producto>(
      `/productos/${id}`,
      datos,
    )
    return response.data
  },

  async actualizarStock(
    id: number,
    datos: ProductoStockUpdate,
  ): Promise<Producto> {
    const response = await api.patch<Producto>(
      `/productos/${id}/stock`,
      datos,
    )
    return response.data
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/productos/${id}`)
  },
}
