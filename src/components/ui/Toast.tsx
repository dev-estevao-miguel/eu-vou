import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { InfoIcon } from '@phosphor-icons/react'

type ToastApi = { show: (text: string) => void }

const ToastContext = createContext<ToastApi | null>(null)

const DURATION_MS = 2600

/** Aviso breve no rodapé. A região `status` existe sempre para o leitor de tela anunciar. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((t: string) => {
    window.clearTimeout(timer.current)
    setText(t)
    timer.current = window.setTimeout(() => setText(null), DURATION_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {text ? (
          <div className="toast">
            <InfoIcon size={18} aria-hidden="true" />
            {text}
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return ctx
}
