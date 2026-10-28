import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react'

type DialogBaseProps = {
  open: boolean
  onClose: () => void
  title: ReactNode
  children?: ReactNode
}

/**
 * `<dialog>` nativo aberto com showModal(): prende o foco, fecha com Esc e
 * torna o restante da página inerte. Toque fora do conteúdo também fecha.
 */
function useNativeDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handleCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    el.addEventListener('cancel', handleCancel)
    return () => el.removeEventListener('cancel', handleCancel)
  }, [onClose])
  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) onClose()
  }
  return { ref, onBackdropClick }
}

/** Painel inferior (bottom sheet). */
export function Sheet({ open, onClose, title, children }: DialogBaseProps) {
  const { ref, onBackdropClick } = useNativeDialog(open, onClose)
  const titleId = useId()
  return (
    <dialog ref={ref} className="sheet" aria-labelledby={titleId} onClick={onBackdropClick}>
      <div className="sheet__inner">
        <span className="sheet__handle" aria-hidden="true" />
        <h2 id={titleId} className="sheet__title">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  )
}

type ModalProps = DialogBaseProps & { text?: ReactNode; actions: ReactNode }

/** Confirmação centralizada (ex.: "Aprovar presença?"). */
export function Modal({ open, onClose, title, text, actions, children }: ModalProps) {
  const { ref, onBackdropClick } = useNativeDialog(open, onClose)
  const titleId = useId()
  return (
    <dialog ref={ref} className="modal" aria-labelledby={titleId} onClick={onBackdropClick}>
      <div className="modal__inner">
        <h2 id={titleId} className="modal__title">
          {title}
        </h2>
        {text ? <p className="modal__text">{text}</p> : null}
        {children}
        <div className="modal__actions">{actions}</div>
      </div>
    </dialog>
  )
}
