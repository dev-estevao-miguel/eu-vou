import { Link } from 'react-router'
import { CaretRightIcon } from '@phosphor-icons/react'
import { PointsTag, StatusTag } from './ui'
import { hora } from '../lib/datas'
import { NOME_PUBLICO, NOME_TIPO, situacaoNaAgenda, type OcorrenciaAgenda } from '../lib/agenda'

/** Cartão de atividade da agenda (P02): horário, título, tipo, público, pontos e situação. */
export function CartaoAtividade({ o }: { o: OcorrenciaAgenda }) {
  return (
    <Link
      to={`/agenda/${o.id}`}
      className="card card--interactive"
      style={{ gap: 12, alignItems: 'flex-start', padding: 14, textDecoration: 'none' }}
    >
      <span className="tabular" style={{ width: 52, flex: 'none', fontSize: 14, fontWeight: 600, paddingTop: 1 }}>
        {hora(o.inicio)}
      </span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 500 }}>{o.titulo}</span>
        <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
          {NOME_TIPO[o.tipo]} · {NOME_PUBLICO[o.publico]}
        </span>
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <PointsTag points={o.pontos} />
          <StatusTag status={situacaoNaAgenda(o)} />
        </span>
      </span>
      <CaretRightIcon size={18} style={{ color: 'var(--color-muted)', marginTop: 2 }} aria-hidden="true" />
    </Link>
  )
}
