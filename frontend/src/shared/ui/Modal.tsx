import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react'

import { Button } from './Button'

interface ModalProps {
  abierto: boolean
  titulo: string
  children: ReactNode
  onCerrar: () => void
  bloqueado?: boolean
}

export function Modal({
  abierto,
  titulo,
  children,
  onCerrar,
  bloqueado = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const tituloId = useId()

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    if (abierto && !dialog.open) {
      dialog.showModal()
    } else if (!abierto && dialog.open) {
      dialog.close()
    }
  }, [abierto])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={tituloId}
      onCancel={(event) => {
        event.preventDefault()

        if (!bloqueado) {
          onCerrar()
        }
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-black/50"
    >
      <div className="space-y-5">
        <header className="flex items-center justify-between gap-4">
          <h2
            id={tituloId}
            className="text-xl font-semibold"
          >
            {titulo}
          </h2>

          <Button
            variant="secondary"
            aria-label="Cerrar ventana"
            onClick={onCerrar}
            disabled={bloqueado}
          >
            Cerrar
          </Button>
        </header>

        {children}
      </div>
    </dialog>
  )
}
