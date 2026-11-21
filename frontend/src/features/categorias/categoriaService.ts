import { api } from '../../shared/api/axiosInstance'

import type {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
} from './categoriaTypes'

export const categoriaService = {
  async listar(): Promise<Categoria[]> {
    const response = await api.get<Categoria[]>('/categorias')
    return response.data
  },

  async obtener(id: number): Promise<Categoria> {
    const response = await api.get<Categoria>(`/categorias/${id}`)
    return response.data
  },

  async crear(datos: CategoriaCreate): Promise<Categoria> {
    const response = await api.post<Categoria>('/categorias', datos)
    return response.data
  },

  async actualizar(
    id: number,
    datos: CategoriaUpdate,
  ): Promise<Categoria> {
    const response = await api.put<Categoria>(
      `/categorias/${id}`,
      datos,
    )
    return response.data
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/categorias/${id}`)
  },
}
