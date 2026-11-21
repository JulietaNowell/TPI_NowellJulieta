import type { Producto } from '../productos/productoTypes'

export interface CarritoItem {
  producto_id: number
  nombre: string
  precio_unitario: number
  imagen_url: string | null
  stock: number
  cantidad: number
}

export interface CarritoPedidoItem {
  producto_id: number
  cantidad: number
}

export function productoACarritoItem(
  producto: Producto,
  cantidad = 1,
): CarritoItem {
  return {
    producto_id: producto.id,
    nombre: producto.nombre,
    precio_unitario: producto.precio_base,
    imagen_url: producto.imagen_url,
    stock: producto.stock,
    cantidad,
  }
}
