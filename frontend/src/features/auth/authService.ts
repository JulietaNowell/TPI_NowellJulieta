import { api } from '../../shared/api/axiosInstance'
import type {
  AuthMessage,
  LoginData,
  RegisterData,
  UserPublic,
} from './authTypes'

export const authService = {
  async register(data: RegisterData): Promise<UserPublic> {
    const response = await api.post<UserPublic>(
      '/auth/register',
      data,
    )

    return response.data
  },

  async login(data: LoginData): Promise<AuthMessage> {
    const form = new URLSearchParams()

    form.set('username', data.username)
    form.set('password', data.password)

    const response = await api.post<AuthMessage>(
      '/auth/token',
      form,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )

    return response.data
  },

  async me(): Promise<UserPublic> {
    const response = await api.get<UserPublic>('/auth/me')
    return response.data
  },

  async logout(): Promise<AuthMessage> {
    const response = await api.post<AuthMessage>('/auth/logout')
    return response.data
  },
}
