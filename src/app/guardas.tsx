import { Navigate, Outlet, useLocation } from 'react-router'
import { useConta } from './conta/ContaProvider'
import { destinoInicial, participanteAtivo, temGestao } from '../lib/conta'
import { supabaseConfigurado } from '../lib/supabase'
import { AcessoRestrito, ConfiguracaoAusente, TelaCarregando, TelaErroConta } from '../pages/Estados'

// As guardas só decidem a navegação. A proteção dos dados está no banco (RLS e funções),
// então alterar a URL nunca dá acesso a dados de outro grupo ou congregação.

/** Telas que exigem login. */
export function ExigeLogin() {
  const { estado, recarregar } = useConta()
  const local = useLocation()
  if (!supabaseConfigurado) return <ConfiguracaoAusente />
  if (estado.status === 'carregando') return <TelaCarregando />
  if (estado.status === 'erro') return <TelaErroConta onTentar={recarregar} />
  if (estado.status === 'anonimo') {
    return <Navigate to="/entrar" replace state={{ volta: local.pathname + local.search }} />
  }
  return <Outlet />
}

/** Área do participante: exige vínculo ativo. */
export function ExigeParticipante() {
  const { estado } = useConta()
  if (estado.status !== 'conectado') return null
  if (!participanteAtivo(estado.conta)) return <Navigate to={destinoInicial(estado.conta)} replace />
  return <Outlet />
}

/** Área da direção: exige alguma função de liderança. */
export function ExigeGestao() {
  const { estado } = useConta()
  if (estado.status !== 'conectado') return null
  if (!temGestao(estado.conta)) {
    return (
      <AcessoRestrito
        texto="A área da direção é exclusiva para quem tem função de liderança atribuída pelo administrador."
        voltarPara={destinoInicial(estado.conta)}
      />
    )
  }
  return <Outlet />
}

/** Telas de quem ainda não entrou (entrada, convite). Conectado vai para o destino da conta. */
export function SoVisitante() {
  const { estado } = useConta()
  if (estado.status === 'carregando') return <TelaCarregando />
  if (estado.status === 'conectado') return <Navigate to={destinoInicial(estado.conta)} replace />
  return <Outlet />
}
