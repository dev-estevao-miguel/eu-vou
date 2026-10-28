import { useNavigate } from 'react-router'
import {
  ArrowsLeftRightIcon,
  CakeIcon,
  CaretRightIcon,
  IdentificationBadgeIcon,
  LockSimpleIcon,
  MapPinIcon,
  PhoneIcon,
  SignOutIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react'
import { Avatar } from '../components/ui'
import { useConta, useContaConectada } from '../app/conta/ContaProvider'
import { NOME_GRUPO, temGestao } from '../lib/conta'

/** P11 · Perfil (versão da Etapa 2: dados da conta, área da direção e saída). */
export default function Perfil() {
  const conta = useContaConectada()
  const { sair } = useConta()
  const navegar = useNavigate()
  const p = conta.perfil!
  const v = conta.vinculo

  return (
    <>
      <div className="screen-header">
        <h1 className="screen-title">Perfil</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px 16px' }}>
        <Avatar name={p.nome_completo} seed={p.id} size={72} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{p.nome_completo}</div>
          <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>
            @{p.usuario} · no ranking: {p.nome_exibicao}
          </div>
          {v ? (
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <span className="tag tag--brand">{NOME_GRUPO[v.grupo]}</span>
              <span className="tag tag--muted">{v.congregacao}</span>
            </div>
          ) : null}
        </div>
      </div>

      <h2 className="section-title" style={{ fontSize: 13, color: 'var(--color-muted)', paddingTop: 4 }}>
        Seus dados
      </h2>
      <div className="list inset">
        <div className="list__row">
          <IdentificationBadgeIcon size={20} className="list__icon" aria-hidden="true" />
          <span className="list__body">
            <span className="list__title">Nome no ranking</span>
            <span className="list__sub">{p.nome_exibicao} · alterado só pela direção</span>
          </span>
          <LockSimpleIcon size={18} className="list__icon" aria-label="Alterado só pela direção" />
        </div>
        <div className="list__row">
          <PhoneIcon size={20} className="list__icon" aria-hidden="true" />
          <span className="list__body">
            <span className="list__title">WhatsApp</span>
            <span className="list__sub">Número terminado em {p.whatsapp.slice(-2)}</span>
          </span>
        </div>
      </div>

      <h2 className="section-title" style={{ fontSize: 13, color: 'var(--color-muted)' }}>
        Mudanças que passam pela direção
      </h2>
      <div className="list inset">
        {v ? (
          <>
            <div className="list__row">
              <UsersThreeIcon size={20} className="list__icon" aria-hidden="true" />
              <span className="list__body">
                <span className="list__title">Grupo</span>
                <span className="list__sub">{NOME_GRUPO[v.grupo]}</span>
              </span>
              <LockSimpleIcon size={18} className="list__icon" aria-label="Exige análise" />
            </div>
            <div className="list__row">
              <MapPinIcon size={20} className="list__icon" aria-hidden="true" />
              <span className="list__body">
                <span className="list__title">Congregação</span>
                <span className="list__sub">{v.congregacao}</span>
              </span>
              <LockSimpleIcon size={18} className="list__icon" aria-label="Exige análise" />
            </div>
          </>
        ) : null}
        <div className="list__row">
          <CakeIcon size={20} className="list__icon" aria-hidden="true" />
          <span className="list__body">
            <span className="list__title">Data de nascimento</span>
            <span className="list__sub">Visível só para a liderança autorizada</span>
          </span>
          <LockSimpleIcon size={18} className="list__icon" aria-label="Exige análise" />
        </div>
      </div>

      <h2 className="section-title" style={{ fontSize: 13, color: 'var(--color-muted)' }}>
        Ajuda e segurança
      </h2>
      <div className="list inset">
        {temGestao(conta) ? (
          <button type="button" className="list__row" onClick={() => navegar('/gestao')}>
            <ArrowsLeftRightIcon size={20} aria-hidden="true" />
            <span className="list__body list__title">Área da direção</span>
            <CaretRightIcon size={18} className="list__icon" aria-hidden="true" />
          </button>
        ) : null}
        <button type="button" className="list__row" style={{ color: 'var(--color-error)' }} onClick={sair}>
          <SignOutIcon size={20} aria-hidden="true" />
          <span className="list__body list__title">Sair da conta</span>
        </button>
      </div>
    </>
  )
}
