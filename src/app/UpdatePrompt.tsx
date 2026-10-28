import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '../components/ui'

/**
 * Nova versão do app: a pessoa decide quando atualizar. Atualização automática
 * poderia recarregar a página no meio do envio de uma foto.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        top: 'calc(8px + var(--safe-top))',
        left: 16,
        right: 16,
        zIndex: 60,
        maxWidth: 448,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-lg)',
        fontSize: 14,
      }}
    >
      <span style={{ flex: 1 }}>Nova versão do Eu Vou disponível.</span>
      <Button variant="text" onClick={() => setNeedRefresh(false)}>
        Depois
      </Button>
      <Button onClick={() => updateServiceWorker()}>Atualizar</Button>
    </div>
  )
}
