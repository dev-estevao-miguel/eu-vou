import type { ReactNode } from 'react'
import { CircleIcon, HourglassMediumIcon } from '@phosphor-icons/react'

type PointsSummaryProps = {
  monthLabel: string
  approved: number
  pending: number
  cycleOpen: boolean
  posGeral?: number | null
  posGrupo?: number | null
  groupLabel: string
  action?: ReactNode
}

/**
 * Bloco de pontuação (P01). Pontos aprovados e em análise ficam sempre
 * separados: os pendentes nunca entram no saldo exibido.
 */
export function PointsSummary({
  monthLabel,
  approved,
  pending,
  cycleOpen,
  posGeral,
  posGrupo,
  groupLabel,
  action,
}: PointsSummaryProps) {
  const onBrand = 'var(--color-accent-200)'
  return (
    <section
      aria-label={`Sua participação em ${monthLabel}`}
      style={{
        padding: 18,
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-brand)',
        color: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, color: onBrand }}>Sua participação em {monthLabel}</span>
        <span style={{ fontSize: 12, color: onBrand, display: 'flex', alignItems: 'center', gap: 4 }}>
          <CircleIcon size={10} aria-hidden="true" />
          {cycleOpen ? 'Ciclo aberto' : 'Ciclo encerrado'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span className="tabular" style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {approved}
        </span>
        <span style={{ fontSize: 15, color: onBrand }}>pontos aprovados</span>
      </div>
      {pending > 0 ? (
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'color-mix(in srgb, var(--color-surface) 10%, transparent)',
            fontSize: 14,
          }}
        >
          <HourglassMediumIcon size={18} style={{ marginTop: 1, flex: 'none' }} aria-hidden="true" />
          <span>
            <strong style={{ fontWeight: 600 }}>{pending} pontos em análise.</strong> Entram no saldo somente após a
            aprovação.
          </span>
        </div>
      ) : null}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) auto',
          gap: 8,
          alignItems: 'center',
          paddingTop: 12,
          borderTop: '1px solid color-mix(in srgb, var(--color-surface) 16%, transparent)',
        }}
      >
        <div>
          <div className="tabular" style={{ fontSize: 20, fontWeight: 600 }}>
            {posGeral ? `${posGeral}º` : '—'}
          </div>
          <div style={{ fontSize: 12, color: onBrand }}>no Geral</div>
        </div>
        <div>
          <div className="tabular" style={{ fontSize: 20, fontWeight: 600 }}>
            {posGrupo ? `${posGrupo}º` : '—'}
          </div>
          <div style={{ fontSize: 12, color: onBrand }}>em {groupLabel}</div>
        </div>
        {action}
      </div>
    </section>
  )
}
