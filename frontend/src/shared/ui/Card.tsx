import type { ComponentPropsWithoutRef } from 'react'

interface CardProps extends ComponentPropsWithoutRef<'div'> {
  as?: 'div' | 'section' | 'article'
}

export function Card({
  as: Elemento = 'div',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <Elemento
      {...props}
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </Elemento>
  )
}
