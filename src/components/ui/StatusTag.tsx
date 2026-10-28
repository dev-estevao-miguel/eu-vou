import {
  ArrowCounterClockwiseIcon,
  ArrowUUpLeftIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockCountdownIcon,
  ClockIcon,
  DeviceMobileIcon,
  HourglassMediumIcon,
  LockSimpleIcon,
  ProhibitIcon,
  UploadSimpleIcon,
  XCircleIcon,
  type Icon,
} from '@phosphor-icons/react'

type Tone = 'accent' | 'warning' | 'success' | 'error' | 'muted'

// Situações do Documento de design (seção 02). Nenhuma depende só da cor.
export const STATUS = {
  rascunho: { label: 'Rascunho neste dispositivo', icon: DeviceMobileIcon, tone: 'accent' },
  enviando: { label: 'Enviando', icon: UploadSimpleIcon, tone: 'accent' },
  em_analise: { label: 'Em análise', icon: HourglassMediumIcon, tone: 'warning' },
  ajuste_solicitado: { label: 'Ajuste solicitado', icon: ArrowCounterClockwiseIcon, tone: 'warning' },
  reenviado: { label: 'Reenviado · em análise', icon: HourglassMediumIcon, tone: 'warning' },
  aprovada: { label: 'Aprovada', icon: CheckCircleIcon, tone: 'success' },
  recusada: { label: 'Recusada', icon: XCircleIcon, tone: 'error' },
  cancelada_participante: { label: 'Cancelado pelo participante', icon: ProhibitIcon, tone: 'muted' },
  revogada: { label: 'Aprovação revogada', icon: ArrowUUpLeftIcon, tone: 'error' },
  fora_prazo: { label: 'Envio fora do prazo', icon: ClockCountdownIcon, tone: 'warning' },
  prevista: { label: 'Prevista', icon: ClockIcon, tone: 'muted' },
  disponivel: { label: 'Disponível para registro', icon: CameraIcon, tone: 'accent' },
  encerrada: { label: 'Encerrada', icon: LockSimpleIcon, tone: 'muted' },
  cancelada: { label: 'Cancelada', icon: ProhibitIcon, tone: 'error' },
} as const satisfies Record<string, { label: string; icon: Icon; tone: Tone }>

export type StatusKey = keyof typeof STATUS

export function StatusTag({ status, large }: { status: StatusKey; large?: boolean }) {
  const s = STATUS[status]
  const IconCmp = s.icon
  return (
    <span className={['tag', `tag--${s.tone}`, large && 'tag--lg'].filter(Boolean).join(' ')}>
      <IconCmp size={large ? 15 : 14} aria-hidden="true" />
      {s.label}
    </span>
  )
}

/** Valor da atividade: "45 pts" ou "Sem pontuação". */
export function PointsTag({ points, large }: { points: number; large?: boolean }) {
  return (
    <span className={['tag', points > 0 ? 'tag--brand' : 'tag--muted', large && 'tag--lg'].filter(Boolean).join(' ')}>
      {points > 0 ? `${points} pts` : 'Sem pontuação'}
    </span>
  )
}
