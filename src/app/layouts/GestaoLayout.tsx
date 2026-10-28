import { NavLink, Outlet, useLocation } from 'react-router'
import {
  ArrowsLeftRightIcon,
  BuildingsIcon,
  CalendarBlankIcon,
  CheckSquareOffsetIcon,
  LinkSimpleIcon,
  SignOutIcon,
  UserCheckIcon,
  UserGearIcon,
  type Icon,
} from '@phosphor-icons/react'
import { Avatar, Button, LogoCompact } from '../../components/ui'
import { useConta, useContaConectada } from '../conta/ContaProvider'
import { ehAdmin, escoposDeConvite, NOME_FUNCAO, participanteAtivo, podeValidar, type Conta } from '../../lib/conta'
import { isTestEnvironment } from '../../lib/env'

type Item = { to: string; label: string; icon: Icon }

/** Destinos visíveis conforme a função. Itens sem permissão ficam ocultos; o servidor confere de novo. */
export function itensGestao(conta: Conta): Item[] {
  const itens: Item[] = []
  if (podeValidar(conta)) itens.push({ to: '/gestao/validacao', label: 'Validação', icon: CheckSquareOffsetIcon })
  itens.push({ to: '/gestao/cadastros', label: 'Cadastros pendentes', icon: UserCheckIcon })
  if (ehAdmin(conta) || escoposDeConvite(conta, []).length > 0) {
    itens.push({ to: '/gestao/convites', label: 'Convites', icon: LinkSimpleIcon })
  }
  if (ehAdmin(conta)) {
    itens.push({ to: '/gestao/agenda', label: 'Agenda', icon: CalendarBlankIcon })
    itens.push({ to: '/gestao/congregacoes', label: 'Congregações', icon: BuildingsIcon })
    itens.push({ to: '/gestao/funcoes', label: 'Funções', icon: UserGearIcon })
  }
  return itens
}

function escopoTexto(conta: Conta) {
  if (ehAdmin(conta)) return 'Todas as congregações'
  const nomes = [...new Set(conta.funcoes.map((f) => f.congregacao).filter(Boolean))]
  return nomes.join(' · ')
}

export function GestaoLayout() {
  const conta = useContaConectada()
  const { sair } = useConta()
  const local = useLocation()
  const itens = itensGestao(conta)
  const atual = itens.find((i) => local.pathname.startsWith(i.to))
  const funcaoPrincipal = conta.funcoes[0]
  const p = conta.perfil!

  return (
    <div className="gestao">
      <aside className="gestao__lateral" aria-label="Navegação da gestão">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px' }}>
          <LogoCompact size={32} />
        </div>
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-neutral-100)',
            border: '1px solid var(--color-divider)',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>Área da direção · escopo</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{escopoTexto(conta)}</div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {itens.map(({ to, label, icon: IconCmp }) => (
            <NavLink key={to} to={to} className="gestao__nav-item">
              {({ isActive }) => (
                <>
                  <IconCmp size={20} weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div
          style={{
            marginTop: 'auto',
            padding: 12,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-divider)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Avatar name={p.nome_completo} seed={p.id} size={36} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{p.nome_exibicao}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                {funcaoPrincipal ? NOME_FUNCAO[funcaoPrincipal.funcao] : ''}
              </div>
            </div>
          </div>
          {participanteAtivo(conta) ? (
            <NavLink to="/inicio" className="btn btn--secondary" style={{ fontSize: 13 }}>
              <ArrowsLeftRightIcon size={16} aria-hidden="true" />
              Área do participante
            </NavLink>
          ) : null}
          <Button variant="text-danger" onClick={sair} icon={<SignOutIcon size={18} />}>
            Sair
          </Button>
        </div>
      </aside>

      <div className="gestao__principal">
        <header className="gestao__topo">
          <div className="gestao__marca-mobile">
            <LogoCompact />
            <Button variant="text-danger" onClick={sair}>
              Sair
            </Button>
          </div>
          <div>
            <h1 className="gestao__titulo">{atual?.label ?? 'Área da direção'}</h1>
            <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{escopoTexto(conta)}</div>
          </div>
          <div className="gestao__contexto">
            {conta.funcoes.map((f) => (
              <span key={f.id} className="tag tag--muted">
                {NOME_FUNCAO[f.funcao]}
                {f.funcao !== 'admin' && f.congregacao ? ` · ${f.congregacao}` : ''}
              </span>
            ))}
            {isTestEnvironment ? <span className="env-badge">Ambiente de teste</span> : null}
          </div>
          <nav className="gestao__abas" aria-label="Navegação da gestão">
            {itens.map(({ to, label, icon: IconCmp }) => (
              <NavLink key={to} to={to} className="chip">
                <IconCmp size={16} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
            {participanteAtivo(conta) ? (
              <NavLink to="/inicio" className="chip">
                <ArrowsLeftRightIcon size={16} aria-hidden="true" />
                Área do participante
              </NavLink>
            ) : null}
          </nav>
        </header>
        <main className="gestao__conteudo">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
