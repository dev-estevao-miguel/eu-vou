import { useState } from 'react'
import {
  CalendarCheckIcon,
  CaretRightIcon,
  CheckCircleIcon,
  EqualsIcon,
  InfoIcon,
  MedalIcon,
  QuestionIcon,
  ScalesIcon,
} from '@phosphor-icons/react'
import { Alert, Avatar, Button, EmptyState, Segmented, Sheet, Spinner } from '../../components/ui'
import { useContaConectada } from '../../app/conta/ContaProvider'
import { supabase } from '../../lib/supabase'
import { useConsulta } from '../../lib/useConsulta'
import { NOME_GRUPO, type Grupo } from '../../lib/conta'
import { mesAtualIso, nomeDoMes } from '../../lib/datas'

type Linha = {
  perfil_id: string
  nome_exibicao: string
  grupo: Grupo
  pontos: number
  posicao_geral: number
  posicao_grupo: number
  sou_eu: boolean
}
type Visao = 'geral' | 'adolescentes' | 'jovens'

/** P07 · Três classificações. Os filtros mudam quem aparece, não os pontos de cada pessoa. */
export default function Ranking() {
  const conta = useContaConectada()
  const v = conta.vinculo!
  const mes = mesAtualIso()
  const [visao, setVisao] = useState<Visao>('geral')
  const [regras, setRegras] = useState(false)
  const ranking = useConsulta<Linha[]>(`ranking-${mes}`, () => supabase.rpc('ranking', { p_mes: mes }))

  const todos = ranking.dados ?? []
  const lista = (visao === 'geral' ? todos : todos.filter((l) => l.grupo === visao)).map((l) => ({
    ...l,
    pos: visao === 'geral' ? l.posicao_geral : l.posicao_grupo,
  }))
  const empatados = (pos: number) => lista.filter((l) => l.pos === pos).length > 1
  const eu = lista.find((l) => l.sou_eu)
  const podio = lista.filter((l) => l.pontos > 0).slice(0, 3)
  const ordemPodio = podio.length === 3 ? [podio[1], podio[0], podio[2]] : podio
  const resto = lista.filter((l) => !podio.includes(l))
  const ALTURA: Record<number, number> = { 1: 84, 2: 64, 3: 48 }

  return (
    <>
      <div className="screen-header">
        <h1 className="screen-title">Ranking de {nomeDoMes(mes)}</h1>
      </div>
      <p className="screen-subtitle">
        {v.congregacao}
        {v.campanha ? ` · ${v.campanha.nome}` : ''} · ciclo aberto
      </p>
      <div style={{ padding: '0 16px' }}>
        <Segmented
          label="Classificação"
          value={visao}
          onChange={setVisao}
          options={[
            { value: 'geral', label: 'Geral' },
            { value: 'adolescentes', label: 'Adolescentes' },
            { value: 'jovens', label: 'Jovens' },
          ]}
        />
      </div>

      {ranking.erro ? (
        <div className="inset" style={{ marginTop: 12 }}>
          <Alert tone="error" role="alert">
            {ranking.erro}
          </Alert>
        </div>
      ) : ranking.carregando ? (
        <div style={{ display: 'grid', placeItems: 'center', padding: 40 }}>
          <Spinner label="Carregando o ranking" />
        </div>
      ) : (
        <>
          <div
            style={{
              margin: '12px 16px 0',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent-100)',
              border: '1px solid var(--color-accent-300)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span className="tabular" style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-brand)', width: 40 }}>
              {eu && eu.pontos > 0 ? `${eu.pos}º` : '—'}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 15, fontWeight: 500 }}>Sua posição</span>
              <span style={{ display: 'block', fontSize: 13, color: 'var(--color-muted)' }}>
                {eu && eu.pontos === 0
                  ? 'Ainda sem pontos aprovados neste mês.'
                  : eu
                    ? `${visao === 'geral' ? 'Geral' : NOME_GRUPO[visao]} · somente pontos aprovados${empatados(eu.pos) ? ' · empate' : ''}`
                    : 'Você não faz parte deste grupo. Os pontos de cada pessoa são os mesmos em todas as visões.'}
              </span>
            </span>
            {eu ? (
              <span style={{ textAlign: 'right' }}>
                <span className="tabular" style={{ display: 'block', fontSize: 20, fontWeight: 600 }}>
                  {eu.pontos}
                </span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--color-muted)' }}>pontos</span>
              </span>
            ) : null}
          </div>

          {lista.length === 0 ? (
            <div className="inset" style={{ marginTop: 12 }}>
              <EmptyState title="Ninguém neste grupo ainda" dashed />
            </div>
          ) : (
            <>
              {podio.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${ordemPodio.length}, minmax(0, 1fr))`,
                    alignItems: 'end',
                    gap: 8,
                    padding: '20px 16px 0',
                  }}
                >
                  {ordemPodio.map((p) => (
                    <div
                      key={p.perfil_id}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}
                    >
                      <Avatar name={p.nome_exibicao} seed={p.perfil_id} size={p.pos === 1 ? 56 : 48} ring={p.sou_eu} />
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {p.nome_exibicao}
                      </span>
                      <span className="tabular" style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                        {p.pontos} pts
                      </span>
                      <span
                        style={{
                          width: '100%',
                          height: ALTURA[Math.min(p.pos, 3)],
                          borderRadius: '10px 10px 4px 4px',
                          background: p.pos === 1 ? 'var(--color-accent-100)' : 'var(--color-neutral-200)',
                          borderTop: `3px solid ${p.pos === 1 ? 'var(--color-red)' : 'var(--color-accent-300)'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          paddingTop: 8,
                        }}
                      >
                        <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-brand)' }}>{p.pos}º</span>
                        {empatados(p.pos) ? (
                          <span style={{ fontSize: 11, color: 'var(--color-warning)' }}>empate</span>
                        ) : null}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
              {resto.length > 0 ? (
                <div
                  className="list inset"
                  style={{ borderRadius: podio.length ? '0 0 var(--radius-lg) var(--radius-lg)' : undefined }}
                >
                  {resto.map((r) => (
                    <div
                      key={r.perfil_id}
                      className="list__row"
                      style={{ background: r.sou_eu ? 'var(--color-accent-100)' : undefined }}
                    >
                      <span
                        className="tabular"
                        style={{ width: 28, fontSize: 14, fontWeight: 600, color: 'var(--color-muted)' }}
                      >
                        {r.pos}º
                      </span>
                      <Avatar name={r.nome_exibicao} seed={r.perfil_id} size={36} />
                      <span className="list__body">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 500 }}>
                          {r.nome_exibicao}
                          {r.sou_eu ? (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: 'var(--color-surface)',
                                background: 'var(--color-accent)',
                                padding: '1px 6px',
                                borderRadius: 4,
                              }}
                            >
                              VOCÊ
                            </span>
                          ) : null}
                        </span>
                        {visao === 'geral' ? <span className="list__sub">{NOME_GRUPO[r.grupo]}</span> : null}
                      </span>
                      <span className="tabular" style={{ fontSize: 15, fontWeight: 600 }}>
                        {r.pontos}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          )}

          <div className="inset stack" style={{ marginTop: 12, gap: 8 }}>
            <button
              type="button"
              className="btn btn--secondary btn--md"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => setRegras(true)}
            >
              <QuestionIcon size={20} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
              <span style={{ flex: 1, textAlign: 'left' }}>Como funciona a pontuação</span>
              <CaretRightIcon size={18} style={{ color: 'var(--color-muted)' }} aria-hidden="true" />
            </button>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', display: 'flex', gap: 6 }}>
              <InfoIcon size={16} style={{ flex: 'none', marginTop: 1 }} aria-hidden="true" />O ranking mostra a
              participação registrada e aprovada na campanha. Pontos em análise não entram na classificação.
            </p>
          </div>
        </>
      )}

      <Sheet open={regras} onClose={() => setRegras(false)} title="Como funciona a pontuação">
        <div className="stack" style={{ gap: 10, fontSize: 14 }}>
          {[
            [
              CheckCircleIcon,
              'var(--color-success)',
              'Somente presenças aprovadas somam pontos. Pontos em análise aparecem separados.',
            ],
            [
              CalendarCheckIcon,
              'var(--color-accent)',
              'Cada atividade vale de 0 a 50 pontos e soma uma única vez por pessoa. O total do mês pode passar de 50.',
            ],
            [
              EqualsIcon,
              'var(--color-accent)',
              'A mesma atividade vale o mesmo para Jovens e Adolescentes. Os filtros mudam quem aparece, não os pontos.',
            ],
            [
              ScalesIcon,
              'var(--color-accent)',
              'Pontos iguais ficam na mesma posição. O critério de desempate ainda será definido.',
            ],
            [MedalIcon, 'var(--color-accent)', 'A premiação do mês será divulgada pela direção da campanha.'],
          ].map(([I, cor, t]) => {
            const IconCmp = I as typeof CheckCircleIcon
            return (
              <div key={t as string} style={{ display: 'flex', gap: 10 }}>
                <IconCmp size={20} style={{ color: cor as string, flex: 'none' }} aria-hidden="true" />
                {t as string}
              </div>
            )
          })}
        </div>
        <Button size="md" variant="secondary" block onClick={() => setRegras(false)}>
          Entendi
        </Button>
      </Sheet>
    </>
  )
}
