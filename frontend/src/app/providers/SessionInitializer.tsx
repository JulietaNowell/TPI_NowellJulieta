import { useEffect } from 'react'
import type { ReactNode } from 'react'

import {
  obtenerVersionSesion,
  useAuthStore,
} from '../../features/auth/authStore'

import {
  configurarGestionSesion,
} from '../../shared/api/axiosInstance'

interface SessionInitializerProps {
  children: ReactNode
}

export function SessionInitializer({
  children,
}: SessionInitializerProps) {
  const checkSession = useAuthStore((state) => state.checkSession)

  useEffect(() => {
    const desconectar = configurarGestionSesion({
      obtenerVersion: obtenerVersionSesion,
      invalidarSesion: (version) => {
        useAuthStore.getState().invalidarSesion(version)
      },
    })

    void checkSession()

    return desconectar
  }, [checkSession])

  return <>{children}</>
}
