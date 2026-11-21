import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { usuarioService } from './usuarioService'

export const usuarioQueryKeys = {
  all: ['usuarios'] as const,
  listas: () => [...usuarioQueryKeys.all, 'lista'] as const,
}

export function useUsuarios() {
  return useQuery({
    queryKey: usuarioQueryKeys.listas(),
    queryFn: () => usuarioService.listar(),
  })
}

export function useActivarUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usuarioService.activar(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: usuarioQueryKeys.all,
      })
    },
  })
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usuarioService.desactivar(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: usuarioQueryKeys.all,
      })
    },
  })
}
