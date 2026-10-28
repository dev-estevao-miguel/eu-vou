import type { ReactNode } from 'react'
import { CheckCircleIcon, HourglassMediumIcon, InfoIcon, WarningCircleIcon, type Icon } from '@phosphor-icons/react'

type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral'

const ALERT_ICON: Record<Tone, Icon> = {
  success: CheckCircleIcon,
  warning: HourglassMediumIcon,
  error: WarningCircleIcon,
  info: InfoIcon,
  neutral: InfoIcon,
}

type AlertProps = {
  tone: Tone
  title?: ReactNode
  children?: ReactNode
  icon?: Icon
  /** `alert` interrompe o leitor de tela (erros); `status` é educado. */
  role?: 'alert' | 'status'
  className?: string
}

export function Alert({ tone, title, children, icon, role, className }: AlertProps) {
  const IconCmp = icon ?? ALERT_ICON[tone]
  return (
    <div role={role} className={['alert', `alert--${tone}`, className].filter(Boolean).join(' ')}>
      <IconCmp size={20} weight={tone === 'success' ? 'fill' : 'regular'} aria-hidden="true" />
      <div>
        {title ? <div className="alert__title">{title}</div> : null}
        {children ? <div>{children}</div> : null}
      </div>
    </div>
  )
}

export function Spinner({ label = 'Carregando' }: { label?: string }) {
  return (
    <span role="status" style={{ display: 'inline-flex', color: 'var(--color-accent)' }}>
      <span className="spinner" aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </span>
  )
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div className="progress__bar" style={{ width: `${pct}%` }} />
    </div>
  )
}

type EmptyStateProps = {
  icon?: Icon
  title: ReactNode
  children?: ReactNode
  dashed?: boolean
}

export function EmptyState({ icon: IconCmp, title, children, dashed }: EmptyStateProps) {
  return (
    <div className={['empty', dashed && 'empty--dashed'].filter(Boolean).join(' ')}>
      {IconCmp ? <IconCmp size={32} aria-hidden="true" /> : null}
      <div className="empty__title">{title}</div>
      {children ? <div>{children}</div> : null}
    </div>
  )
}
