import type { ComponentPropsWithoutRef } from 'react'

type InputProps = ComponentPropsWithoutRef<'input'>

export function Input({
  className = '',
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      className={`rounded-lg border border-slate-300 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  )
}
