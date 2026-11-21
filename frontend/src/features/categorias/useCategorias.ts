import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { categoriaService } from './categoriaService'

import type {
  CategoriaCreate,
  CategoriaUpdate,
} from './categoriaTypes'

export const categoriaQueryKeys = {
  all: ['categorias'] as const,
  detalle: (id: number) => ['categorias', 'detalle', id] as const,
}

export function useCategorias() {
  return useQuery({
    queryKey: categoriaQueryKeys.all,
    queryFn: categoriaService.listar,
  })
}

export function useCrearCategoria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: CategoriaCreate) =>
      categoriaService.crear(datos),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: categoriaQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ['productos'],
        }),
      ])
    },
  })
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number
      datos: CategoriaUpdate
    }) => categoriaService.actualizar(id, datos),

    onSuccess: async (categoria) => {
      queryClient.setQueryData(
        categoriaQueryKeys.detalle(categoria.id),
        categoria,
      )

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: categoriaQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ['productos'],
        }),
      ])
    },
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      categoriaService.eliminar(id),

    onSuccess: async (_resultado, id) => {
      queryClient.removeQueries({
        queryKey: categoriaQueryKeys.detalle(id),
      })

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: categoriaQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ['productos'],
        }),
      ])
    },
  })
}
