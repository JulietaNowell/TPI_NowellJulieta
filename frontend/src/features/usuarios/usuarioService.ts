import { api } from '../../shared/api/axiosInstance'
import type { UserPublic } from '../auth/authTypes'

export const usuarioService = {
  async listar(): Promise<UserPublic[]> {
    const response = await api.get<UserPublic[]>('/admin/usuarios')
    return response.data
  },

  async activar(id: number): Promise<UserPublic> {
    const response = await api.post<UserPublic>(
      `/admin/usuarios/${id}/activar`,
    )
    return response.data
  },

  async desactivar(id: number): Promise<UserPublic> {
    const response = await api.post<UserPublic>(
      `/admin/usuarios/${id}/desactivar`,
    )
    return response.data
  },
}
