export function validarNombreProducto(value: string) {
  return value.trim().length === 0
    ? 'El nombre es obligatorio.'
    : undefined
}

export function validarPrecio(value: string) {
  const precio = Number(value)

  if (
    value.trim() === '' ||
    !Number.isFinite(precio) ||
    precio < 0
  ) {
    return 'El precio debe ser mayor o igual a cero.'
  }

  return undefined
}

export function validarStock(value: string) {
  const stock = Number(value)

  if (
    value.trim() === '' ||
    !Number.isSafeInteger(stock) ||
    stock < 0
  ) {
    return 'El stock debe ser un entero mayor o igual a cero.'
  }

  return undefined
}
