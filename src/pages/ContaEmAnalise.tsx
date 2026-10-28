import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { HourglassMediumIcon, XCircleIcon } from '@phosphor-icons/react'
import { Alert, Button, LogoCompact } from '../components/ui'
import { useConta, useContaConectada } from '../app/conta/ContaProvider'
import { NOME_GRUPO, participanteAtivo, temGestao } from '../lib/conta'

/** A03 · Cadastro aguardando a aprovação do vínculo (C03). Ainda não registra presenças. */
export default function ContaEmAnalise() {
  const conta = useContaConectada()
  const { sair, recarregar } = useConta()
  const [atualizando, setAtualizando] = useState(false)

  if (participanteAtivo(conta)) return <Navigate to="/inicio" replace />

  const v = conta.vinculo
  const recusado = v?.situacao === 'recusado'
  const nome = conta.perfil?.nome_completo.split(' ')[0] ?? ''

  return (
    <div
      className="screen"
      style={{ padding: 'calc(12px + var(--safe-top)) 20px calc(16px + var(--safe-bottom))', gap: 20 }}
    >
      <LogoCompact />
      <span
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          display: 'grid',
          placeItems: 'center',
          marginTop: 24,
          background: recusado ? 'var(--color-error-bg)' : 'var(--color-warning-bg)',
          color: recusado ? 'var(--color-error)' : 'var(--color-warning)',
        }}
      >
        {recusado ? <XCircleIcon size={30} aria-hidden="true" /> : <HourglassMediumIcon size={30} aria-hidden="true" />}
      </span>
      {v && !recusado ? (
        <div className="stack" style={{ gap: 8 }}>
          <h1 style={{ fontSize: 24 }}>Olá, {nome}! Seu cadastro está em análise.</h1>
          <p style={{ color: 'var(--color-muted)' }}>
            A direção vai confirmar sua participação em <strong>{NOME_GRUPO[v.grupo]}</strong> na{' '}
            <strong>{v.congregacao}</strong>. Enquanto isso, ainda não é possível registrar presenças.
          </p>
        </div>
      ) : recusado ? (
        <div className="stack" style={{ gap: 12 }}>
          <h1 style={{ fontSize: 24 }}>Seu cadastro não foi aprovado</h1>
          <Alert tone="error" title="Motivo informado pela direção">
            {v?.motivo}
          </Alert>
          <p style={{ color: 'var(--color-muted)' }}>Se tiver dúvidas, fale com a direção do seu grupo.</p>
        </div>
      ) : (
        <div className="stack" style={{ gap: 8 }}>
          <h1 style={{ fontSize: 24 }}>Sua conta ainda não participa de um grupo</h1>
          <p style={{ color: 'var(--color-muted)' }}>Peça um link de convite à direção do seu grupo.</p>
        </div>
      )}

      <div className="stack" style={{ marginTop: 'auto', gap: 10 }}>
        {temGestao(conta) ? (
          <Link className="btn btn--primary btn--md btn--block" to="/gestao">
            Ir para a área da direção
          </Link>
        ) : null}
        <Button
          size="md"
          variant={temGestao(conta) ? 'secondary' : 'primary'}
          block
          loading={atualizando}
          onClick={async () => {
            setAtualizando(true)
            await recarregar()
            setAtualizando(false)
          }}
        >
          Verificar de novo
        </Button>
        <Button variant="text-danger" onClick={sair}>
          Sair da conta
        </Button>
      </div>
    </div>
  )
}
