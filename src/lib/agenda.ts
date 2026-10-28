import type { StatusKey } from '../components/ui'

export type TipoAtividade = 'culto' | 'oracao' | 'ensaio' | 'estudo' | 'outra'
export type Publico = 'todos' | 'jovens' | 'adolescentes'
export type SituacaoPresenca = 'em_analise' | 'ajuste_solicitado' | 'aprovada' | 'recusada' | 'cancelada' | 'revogada'

export const NOME_TIPO: Record<TipoAtividade, string> = {
  culto: 'Culto',
  oracao: 'Oração',
  ensaio: 'Ensaio',
  estudo: 'Estudo',
  outra: 'Outra',
}

export const NOME_PUBLICO: Record<Publico, string> = {
  todos: 'Jovens e Adolescentes',
  jovens: 'Jovens',
  adolescentes: 'Adolescentes',
}

/** Linha de public.minha_agenda(). */
export type OcorrenciaAgenda = {
  id: string
  titulo: string
  tipo: TipoAtividade
  publico: Publico
  pontos: number
  local: string | null
  inicio: string
  fim: string
  cancelada: boolean
  motivo_cancelamento: string | null
  registro_abre: string
  registro_fecha: string
  presenca_id: string | null
  presenca_situacao: SituacaoPresenca | null
  presenca_motivo: string | null
}

const SITUACAO_TAG: Record<SituacaoPresenca, StatusKey> = {
  em_analise: 'em_analise',
  ajuste_solicitado: 'ajuste_solicitado',
  aprovada: 'aprovada',
  recusada: 'recusada',
  cancelada: 'cancelada_participante',
  revogada: 'revogada',
}

export const tagDaSituacao = (s: SituacaoPresenca): StatusKey => SITUACAO_TAG[s]

/** Janela de envio (C10): do término até 24 h depois. */
export function janela(
  o: Pick<OcorrenciaAgenda, 'registro_abre' | 'registro_fecha' | 'cancelada'>,
  agora = new Date(),
) {
  if (o.cancelada) return 'cancelada' as const
  if (agora < new Date(o.registro_abre)) return 'antes' as const
  if (agora <= new Date(o.registro_fecha)) return 'aberta' as const
  return 'encerrada' as const
}

/** Situação exibida na agenda: o registro da pessoa tem prioridade sobre a janela. */
export function situacaoNaAgenda(o: OcorrenciaAgenda, agora = new Date()): StatusKey {
  if (o.presenca_situacao) return tagDaSituacao(o.presenca_situacao)
  const j = janela(o, agora)
  if (j === 'cancelada') return 'cancelada'
  if (j === 'antes') return 'prevista'
  if (j === 'aberta') return 'disponivel'
  return 'encerrada'
}

export const podeRegistrar = (o: OcorrenciaAgenda, agora = new Date()) =>
  !o.presenca_situacao && janela(o, agora) === 'aberta'
