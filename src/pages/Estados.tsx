import type { ReactNode } from 'react'
import { LockKeyIcon, WarningCircleIcon, WrenchIcon } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { Button, LogoMark, Spinner } from '../components/ui'

function Centro({ children }: { children: ReactNode }) {
  return (
    <div className="screen" style={{ justifyContent: 'center', padding: 24 }}>
      <div className="stack" style={{ alignItems: 'flex-start', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

function Icone({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        background: 'var(--color-neutral-200)',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {children}
    </span>
  )
}

export function TelaCarregando() {
  return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', gap: 16 }}>
      <LogoMark size={56} />
      <Spinner label="Carregando sua conta" />
    </div>
  )
}

export function TelaErroConta({ onTentar }: { onTentar: () => void }) {
  return (
    <Centro>
      <Icone>
        <WarningCircleIcon size={30} style={{ color: 'var(--color-error)' }} aria-hidden="true" />
      </Icone>
      <h1 className="screen-title">Não foi possível carregar sua conta</h1>
      <p style={{ color: 'var(--color-muted)' }}>Confira a conexão com a internet e tente de novo.</p>
      <Button size="md" onClick={onTentar}>
        Tentar de novo
      </Button>
    </Centro>
  )
}

/** Acesso a uma área ou registro fora da permissão. Nenhum dado protegido é carregado. */
export function AcessoRestrito({ texto, voltarPara = '/' }: { texto: string; voltarPara?: string }) {
  return (
    <Centro>
      <Icone>
        <LockKeyIcon size={30} aria-hidden="true" />
      </Icone>
      <h1 className="screen-title">Acesso restrito</h1>
      <p style={{ color: 'var(--color-muted)' }}>{texto}</p>
      <Link className="btn btn--secondary" to={voltarPara}>
        Voltar
      </Link>
    </Centro>
  )
}

/** Desenvolvimento sem .env.local: explica o que falta, sem fingir login. */
export function ConfiguracaoAusente() {
  return (
    <Centro>
      <Icone>
        <WrenchIcon size={30} aria-hidden="true" />
      </Icone>
      <h1 className="screen-title">Configuração do Supabase ausente</h1>
      <p style={{ color: 'var(--color-muted)' }}>
        Crie o arquivo <code>.env.local</code> a partir de <code>.env.example</code> com a URL do projeto e a chave
        publicável. Depois reinicie o <code>npm run dev</code>.
      </p>
    </Centro>
  )
}
