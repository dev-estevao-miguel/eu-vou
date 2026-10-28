import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import {
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  HourglassMediumIcon,
  MinusCircleIcon,
} from '@phosphor-icons/react'
import { Alert, Chips, IconButton, Spinner, StatusTag } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { useConsulta } from '../../lib/useConsulta'
import { mesAtualIso, mesPorExtenso, nomeDoMes, semanaCurta, somarMeses } from '../../lib/datas'
import { tagDaSituacao, type SituacaoPresenca } from '../../lib/agenda'

type Linha = {
  presenca_id: string
  ocorrencia_id: string
  titulo: string
  inicio: string
  pontos: number
  situacao: SituacaoPresenca
  pontos_creditados: number
}
type Filtro = 'todas' | 'em_analise' | 'aprovada' | 'recusada'

const dia2 = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', timeZone: 'America/Recife' }).format(new Date(iso))

/** P05 · Extrato do mês: aprovados, em análise e não somados ficam separados. */
export default function Presencas() {
  const atual = mesAtualIso()
  const [mes, setMes] = useState(atual)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const extrato = useConsulta<Linha[]>(`extrato-${mes}`, () => supabase.rpc('minhas_presencas', { p_mes: mes }))
  const linhas = extrato.dados ?? []
  const aprovados = linhas.reduce((s, l) => s + l.pontos_creditados, 0)
  const emAnalise = linhas.filter((l) => l.situacao === 'em_analise').reduce((s, l) => s + l.pontos, 0)
  const naoSomados = linhas.filter((l) => l.situacao === 'recusada' || l.situacao === 'cancelada').length
  const visiveis = linhas.filter((l) =>
    filtro === 'todas'
      ? true
      : filtro === 'recusada'
        ? l.situacao === 'recusada' || l.situacao === 'cancelada'
        : l.situacao === filtro,
  )

  return (
    <>
      <div className="screen-header">
        <h1 className="screen-title">Minhas presenças</h1>
      </div>
      <div
        className="card inset"
        style={{
          margin: '8px 16px 12px',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <IconButton label="Mês anterior" onClick={() => setMes(somarMeses(mes, -1))}>
          <CaretLeftIcon size={20} />
        </IconButton>
        <span style={{ fontSize: 15, fontWeight: 500 }}>
          {mesPorExtenso(mes).replace(/^./, (c) => c.toUpperCase())}
          {mes === atual ? ' · ciclo aberto' : ''}
        </span>
        <IconButton
          label="Próximo mês"
          disabled={mes >= atual}
          style={{ opacity: mes >= atual ? 0.35 : 1 }}
          onClick={() => setMes(somarMeses(mes, 1))}
        >
          <CaretRightIcon size={20} />
        </IconButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, padding: '0 16px' }}>
        <Resumo
          icone={<CheckCircleIcon size={14} />}
          rotulo="Aprovados"
          valor={aprovados}
          unidade="pontos"
          cor="success"
        />
        <Resumo
          icone={<HourglassMediumIcon size={14} />}
          rotulo="Em análise"
          valor={emAnalise}
          unidade="pontos"
          cor="warning"
        />
        <Resumo
          icone={<MinusCircleIcon size={14} />}
          rotulo="Não somados"
          valor={naoSomados}
          unidade="registros"
          cor="neutral"
        />
      </div>

      <div style={{ padding: '14px 16px 6px' }}>
        <Chips
          label="Filtrar registros"
          value={filtro}
          onChange={setFiltro}
          options={[
            { value: 'todas', label: 'Todas' },
            { value: 'em_analise', label: 'Em análise' },
            { value: 'aprovada', label: 'Aprovadas' },
            { value: 'recusada', label: 'Não somadas' },
          ]}
        />
      </div>

      <h2 className="section-title" style={{ fontSize: 14, paddingTop: 8 }}>
        Extrato de {nomeDoMes(mes)}
      </h2>
      {extrato.erro ? (
        <div className="inset">
          <Alert tone="error" role="alert">
            {extrato.erro}
          </Alert>
        </div>
      ) : extrato.carregando ? (
        <div style={{ display: 'grid', placeItems: 'center', padding: 30 }}>
          <Spinner label="Carregando o extrato" />
        </div>
      ) : (
        <div className="list inset">
          {visiveis.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 14, color: 'var(--color-muted)' }}>
              {linhas.length === 0 ? 'Nenhum registro neste mês.' : 'Nenhum registro com esse filtro neste mês.'}
            </div>
          ) : (
            visiveis.map((l) => (
              <Link
                key={l.presenca_id}
                to={`/agenda/${l.ocorrencia_id}`}
                className="list__row"
                style={{ minHeight: 64 }}
              >
                <span style={{ width: 44, flex: 'none', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--color-muted)' }}>
                    {semanaCurta(l.inicio)}
                  </span>
                  <span className="tabular" style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>
                    {dia2(l.inicio)}
                  </span>
                </span>
                <span className="list__body">
                  <span className="list__title" style={{ fontWeight: 500 }}>
                    {l.titulo}
                  </span>
                  <span style={{ display: 'block', marginTop: 4 }}>
                    <StatusTag status={tagDaSituacao(l.situacao)} />
                  </span>
                </span>
                <span style={{ textAlign: 'right', flex: 'none' }}>
                  <span
                    className="tabular"
                    style={{
                      display: 'block',
                      fontSize: 15,
                      fontWeight: 600,
                      color:
                        l.pontos_creditados > 0
                          ? 'var(--color-success)'
                          : l.situacao === 'em_analise'
                            ? 'var(--color-warning)'
                            : 'var(--color-muted)',
                    }}
                  >
                    {l.situacao === 'aprovada'
                      ? l.pontos_creditados > 0
                        ? `+${l.pontos_creditados}`
                        : '0'
                      : l.situacao === 'em_analise'
                        ? l.pontos
                        : '—'}
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--color-muted)' }}>
                    {l.situacao === 'aprovada'
                      ? l.pontos > 0
                        ? 'aprovados'
                        : 'sem pontuação'
                      : l.situacao === 'em_analise'
                        ? 'em análise'
                        : 'não soma'}
                  </span>
                </span>
              </Link>
            ))
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: 'var(--color-neutral-100)',
              fontSize: 14,
            }}
          >
            <span style={{ fontWeight: 500 }}>Total aprovado em {nomeDoMes(mes)}</span>
            <span className="tabular" style={{ fontWeight: 600 }}>
              {aprovados} pontos
            </span>
          </div>
        </div>
      )}
      <p style={{ margin: '12px 20px 0', fontSize: 13, color: 'var(--color-muted)' }}>
        Cada atividade soma pontos uma única vez. Os pontos contam no mês da atividade.
      </p>
    </>
  )
}

function Resumo({
  icone,
  rotulo,
  valor,
  unidade,
  cor,
}: {
  icone: ReactNode
  rotulo: string
  valor: number
  unidade: string
  cor: 'success' | 'warning' | 'neutral'
}) {
  const fg = cor === 'neutral' ? 'var(--color-muted)' : `var(--color-${cor})`
  const bg = cor === 'neutral' ? 'var(--color-neutral-200)' : `var(--color-${cor}-bg)`
  return (
    <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: bg }}>
      <div style={{ fontSize: 12, color: fg, display: 'flex', alignItems: 'center', gap: 4 }}>
        {icone}
        {rotulo}
      </div>
      <div
        className="tabular"
        style={{ fontSize: 22, fontWeight: 600, color: cor === 'neutral' ? 'var(--color-text)' : fg }}
      >
        {valor}
      </div>
      <div style={{ fontSize: 12, color: fg }}>{unidade}</div>
    </div>
  )
}
