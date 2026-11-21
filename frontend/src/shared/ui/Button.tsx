import type { ComponentPropsWithoutRef } from 'react'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'info'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant
}

const estilos: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-700 text-white hover:bg-emerald-800',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger:
    'bg-red-700 text-white hover:bg-red-800',
  info:
    'bg-blue-700 text-white hover:bg-blue-800',
}

export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`rounded-lg px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${estilos[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
