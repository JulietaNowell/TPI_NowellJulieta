import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error('Falta configurar VITE_API_URL')
}

export const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

interface GestionSesion {
  obtenerVersion: () => number
  invalidarSesion: (version: number) => void
}

let gestionSesion: GestionSesion | null = null

const versionesSolicitud = new WeakMap<object, number>()

export function configurarGestionSesion(
  gestion: GestionSesion,
): () => void {
  gestionSesion = gestion

  return () => {
    if (gestionSesion === gestion) {
      gestionSesion = null
    }
  }
}

api.interceptors.request.use((config) => {
  if (gestionSesion) {
    versionesSolicitud.set(
      config,
      gestionSesion.obtenerVersion(),
    )
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const config = error.config
      const estado = error.response?.status
      const ruta = config?.url ?? ''

      const esEndpointAuth = /^\/?auth(?:\/|$)/.test(ruta)

      if (estado === 401 && config && !esEndpointAuth) {
        const version = versionesSolicitud.get(config)

        if (version !== undefined) {
          gestionSesion?.invalidarSesion(version)
        }
      }
    }

    return Promise.reject(error)
  },
)


export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail

    if (typeof detail === 'string') {
      return detail
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item: unknown) => {
          if (
            typeof item === 'object' &&
            item !== null &&
            'msg' in item &&
            typeof item.msg === 'string'
          ) {
            return item.msg
          }

          return 'Error de validación'
        })
        .join(', ')
    }

    if (!error.response) {
      return 'No se pudo conectar con el servidor'
    }

    return `Error HTTP ${error.response.status}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrió un error inesperado'
}

