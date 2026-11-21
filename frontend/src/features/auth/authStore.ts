import axios from 'axios'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { queryClient } from '../../shared/api/queryClient'
import { authService } from './authService'
import type { LoginData, UserPublic } from './authTypes'

type SessionStatus =
  | 'unknown'
  | 'checking'
  | 'authenticated'
  | 'unauthenticated'
  | 'error'

interface AuthState {
  usuario: UserPublic | null
  sessionStatus: SessionStatus
  cargando: boolean

  login: (datos: LoginData) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  invalidarSesion: (version: number) => void
}

let sessionRequest: Promise<void> | null = null
let sessionVersion = 0

export function obtenerVersionSesion(): number {
  return sessionVersion
}

const consultasPublicas = new Set([
  'categorias',
  'productos',
  'producto',
])

function limpiarCachePrivada() {
  queryClient.removeQueries({
    predicate: (query) => {
      const clave = query.queryKey[0]

      return (
        typeof clave !== 'string' ||
        !consultasPublicas.has(clave)
      )
    },
  })

  queryClient.getMutationCache().clear()
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      sessionStatus: 'unknown',
      cargando: false,

      login: async (datos) => {
        const version = ++sessionVersion

        set({
          cargando: true,
          sessionStatus: 'checking',
        })

        try {
          await authService.login(datos)
          const usuario = await authService.me()

          if (version !== sessionVersion) return

          limpiarCachePrivada()

          set({
            usuario,
            sessionStatus: 'authenticated',
          })
        } catch (error) {
          if (version === sessionVersion) {
            limpiarCachePrivada()

            set({
              usuario: null,
              sessionStatus: 'unauthenticated',
            })
          }

          throw error
        } finally {
          if (version === sessionVersion) {
            set({ cargando: false })
          }
        }
      },

      logout: async () => {
        const version = ++sessionVersion

        set({ cargando: true })

        try {
          await authService.logout()

          if (version !== sessionVersion) return

          limpiarCachePrivada()

          set({
            usuario: null,
            sessionStatus: 'unauthenticated',
          })
        } catch (error) {
          if (version === sessionVersion) {
            set({
              sessionStatus: 'unknown',
            })
          }

          throw error
        } finally {
          if (version === sessionVersion) {
            set({ cargando: false })
          }
        }
      },

      invalidarSesion: (version) => {
        const estado = get()

        if (
          version !== sessionVersion ||
          estado.sessionStatus !== 'authenticated' ||
          estado.cargando
        ) {
          return
        }

        sessionVersion++
        sessionRequest = null

        limpiarCachePrivada()

        set({
          usuario: null,
          sessionStatus: 'unauthenticated',
          cargando: false,
        })
      },


      checkSession: () => {
        if (sessionRequest) {
          return sessionRequest
        }

        const version = sessionVersion

        set({
          cargando: true,
          sessionStatus: 'checking',
        })

        const request = (async () => {
          try {
            const usuario = await authService.me()

            if (version !== sessionVersion) return

            const anterior = get().usuario

            if (anterior?.id !== usuario.id) {
              limpiarCachePrivada()
            }

            set({
              usuario,
              sessionStatus: 'authenticated',
            })
          } catch (error) {
            if (version !== sessionVersion) return

            limpiarCachePrivada()

            const noAutorizado =
              axios.isAxiosError(error) &&
              (error.response?.status === 401 ||
                error.response?.status === 403 ||
                (error.response?.status === 400 &&
                  error.response?.data?.detail ===
                    'Cuenta de usuario desactivada'))

            set({
              usuario: null,
              sessionStatus: noAutorizado
                ? 'unauthenticated'
                : 'error',
            })
          } finally {
            if (version === sessionVersion) {
              set({ cargando: false })
            }
          }
        })()

        sessionRequest = request

        void request.finally(() => {
          if (sessionRequest === request) {
            sessionRequest = null
          }
        })

        return request
      },
    }),
    {
      name: 'foodstore-auth',

      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        usuario: state.usuario,
      }),

      onRehydrateStorage: () => (state) => {
        if (state) {
          state.sessionStatus = 'unknown'
          state.cargando = false
        }
      },
    },
  ),
)

