import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { Producto } from '../productos/productoTypes'
import {
  productoACarritoItem,
  type CarritoItem,
  type CarritoPedidoItem,
} from './carritoTypes'

interface CarritoState {
  items: CarritoItem[]
  agregarProducto: (producto: Producto, cantidad?: number) => void
  actualizarCantidad: (productoId: number, cantidad: number) => void
  eliminarProducto: (productoId: number) => void
  vaciarCarrito: () => void
}

function cantidadValida(cantidad: number, stock: number): number {
  if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
    return 0
  }

  if (!Number.isSafeInteger(stock) || stock < 1) {
    return 0
  }

  return Math.min(cantidad, stock)
}

export const useCarritoStore = create<CarritoState>()(
  persist(
    (set) => ({
      items: [],

      agregarProducto: (producto, cantidad = 1) =>
        set((state) => {
          if (
            !producto.activo ||
            !producto.disponible ||
            !producto.categoria.activo
          ) {
            return state
          }

          const cantidadAgregar = cantidadValida(
            cantidad,
            producto.stock,
          )

          if (cantidadAgregar === 0) {
            return state
          }

          const existente = state.items.find(
            (item) => item.producto_id === producto.id,
          )

          if (!existente) {
            return {
              items: [
                ...state.items,
                productoACarritoItem(producto, cantidadAgregar),
              ],
            }
          }

          const nuevaCantidad = Math.min(
            existente.cantidad + cantidadAgregar,
            producto.stock,
          )

          return {
            items: state.items.map((item) =>
              item.producto_id === producto.id
                ? {
                    ...productoACarritoItem(producto, nuevaCantidad),
                  }
                : item,
            ),
          }
        }),

      actualizarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.producto_id !== productoId) {
              return item
            }

            const nuevaCantidad = cantidadValida(
              cantidad,
              item.stock,
            )

            if (nuevaCantidad === 0) {
              return item
            }

            return {
              ...item,
              cantidad: nuevaCantidad,
            }
          }),
        })),

      eliminarProducto: (productoId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.producto_id !== productoId,
          ),
        })),

      vaciarCarrito: () => set({ items: [] }),
    }),
    {
      name: 'foodstore-carrito',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
)

export function obtenerCantidadTotal(items: CarritoItem[]): number {
  return items.reduce(
    (total, item) => total + item.cantidad,
    0,
  )
}

export function obtenerImporteTotal(items: CarritoItem[]): number {
  return items.reduce(
    (total, item) =>
      total + item.precio_unitario * item.cantidad,
    0,
  )
}

export function obtenerItemsPedido(
  items: CarritoItem[],
): CarritoPedidoItem[] {
  return items.map((item) => ({
    producto_id: item.producto_id,
    cantidad: item.cantidad,
  }))
}
