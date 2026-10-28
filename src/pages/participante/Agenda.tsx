import { useState } from 'react'
import { CalendarBlankIcon } from '@phosphor-icons/react'
import { Alert, Chips, EmptyState, Spinner } from '../../components/ui'
import { CartaoAtividade } from '../../components/CartaoAtividade'
import { useContaConectada } from '../../app/conta/ContaProvider'
import { supabase } from '../../lib/supabase'
import { useConsulta } from '../../lib/useConsulta'
import { NOME_GRUPO } from '../../lib/conta'
import { chaveDia, diaPorExtenso, hojeIso, somarDias } from '../../lib/datas'
import type { OcorrenciaAgenda, TipoAtividade } from '../../lib/agenda'

type Filtro = 'todas' | 'culto' | 'oracao' | 'ensaio_estudo' | 'outra'

const passa = (f: Filtro, t: TipoAtividade) =>
  f === 'todas' || (f === 'ensaio_estudo' ? t === 'ensaio' || t === 'estudo' : t === f)

/** P02 · Agenda em lista, agrupada por dia, com filtro por tipo. */
export default function Agenda() {
  const conta = useContaConectada()
  const v = conta.vinculo!
  const hoje = hojeIso()
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const agenda = useConsulta<OcorrenciaAgenda[]>(`agenda-${hoje}`, () =>
    supabase.rpc('minha_agenda', { p_de: somarDias(hoje, -2), p_ate: somarDias(hoje, 30) }),
  )

  const dias = new Map<string, OcorrenciaAgenda[]>()
  for (const o of (agenda.dados ?? []).filter((o) => passa(filtro, o.tipo))) {
    const k = chaveDia(o.inicio)
    dias.set(k, [...(dias.get(k) ?? []), o])
  }

  return (
    <>
      <div className="screen-header">
        <h1 className="screen-title">Agenda</h1>
      </div>
      <p className="screen-subtitle">
        {v.congregacao} · atividades para {NOME_GRUPO[v.grupo]}
      </p>
      <div style={{ padding: '0 16px 12px' }}>
        <Chips
          label="Filtrar por tipo"
          value={filtro}
          onChange={setFiltro}
          options={[
            { value: 'todas', label: 'Todas' },
            { value: 'culto', label: 'Cultos' },
            { value: 'oracao', label: 'Orações' },
            { value: 'ensaio_estudo', label: 'Ensaios e estudos' },
            { value: 'outra', label: 'Outras' },
          ]}
        />
      </div>

      {agenda.erro ? (
        <div className="inset">
          <Alert tone="error" role="alert" title="Não foi possível carregar a agenda">
            {agenda.erro}
          </Alert>
        </div>
      ) : agenda.carregando ? (
        <div style={{ display: 'grid', placeItems: 'center', padding: 40 }}>
          <Spinner label="Carregando a agenda" />
        </div>
      ) : dias.size === 0 ? (
        <div className="inset">
          <EmptyState icon={CalendarBlankIcon} title="Nenhuma atividade neste período" dashed>
            {filtro === 'todas' ? 'A agenda é publicada pela administração.' : 'Sem atividades desse tipo.'}
          </EmptyState>
        </div>
      ) : (
        [...dias.entries()].map(([dia, itens]) => (
          <section key={dia} aria-label={diaPorExtenso(itens[0].inicio)}>
            <h2
              style={{
                padding: '12px 20px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: 0,
              }}
            >
              {diaPorExtenso(itens[0].inicio)}
              {dia === hoje ? <span className="tag tag--today">HOJE</span> : null}
            </h2>
            <div className="stack" style={{ gap: 8, padding: '0 16px' }}>
              {itens.map((o) => (
                <CartaoAtividade key={o.id} o={o} />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  )
}
