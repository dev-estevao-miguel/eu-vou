import { Link, useNavigate } from 'react-router'
import { CameraIcon, CaretRightIcon, ClockIcon, InfoIcon, MapPinIcon, UsersThreeIcon } from '@phosphor-icons/react'
import { Alert, Button, LogoCompact, Spinner, StatusTag } from '../../components/ui'
import { PointsSummary } from '../../components/PointsSummary'
import { useContaConectada } from '../../app/conta/ContaProvider'
import { supabase } from '../../lib/supabase'
import { useConsulta } from '../../lib/useConsulta'
import { NOME_GRUPO } from '../../lib/conta'
import {
  chaveDia,
  diaMes,
  hojeIso,
  hora,
  mesAtualIso,
  nomeDoMes,
  quando,
  semanaCurta,
  somarDias,
} from '../../lib/datas'
import { podeRegistrar, tagDaSituacao, type OcorrenciaAgenda, type SituacaoPresenca } from '../../lib/agenda'

type Extrato = {
  presenca_id: string
  ocorrencia_id: string
  titulo: string
  inicio: string
  pontos: number
  situacao: SituacaoPresenca
  pontos_creditados: number
}
type Ranking = { sou_eu: boolean; posicao_geral: number; posicao_grupo: number; pontos: number }

/** P01 · Início: saldo aprovado separado do pendente, o que dá para registrar agora e pendências. */
export default function Inicio() {
  const conta = useContaConectada()
  const navegar = useNavigate()
  const v = conta.vinculo!
  const hoje = hojeIso()
  const mes = mesAtualIso()
  const agenda = useConsulta<OcorrenciaAgenda[]>(`inicio-agenda-${hoje}`, () =>
    supabase.rpc('minha_agenda', { p_de: somarDias(hoje, -2), p_ate: somarDias(hoje, 14) }),
  )
  const extrato = useConsulta<Extrato[]>(`inicio-extrato-${mes}`, () =>
    supabase.rpc('minhas_presencas', { p_mes: mes }),
  )
  const ranking = useConsulta<Ranking[]>(`inicio-ranking-${mes}`, () => supabase.rpc('ranking', { p_mes: mes }))

  const carregando = agenda.carregando || extrato.carregando || ranking.carregando
  const erro = agenda.erro || extrato.erro || ranking.erro
  const lista = agenda.dados ?? []
  const registros = extrato.dados ?? []
  const eu = (ranking.dados ?? []).find((r) => r.sou_eu)
  const aprovados = registros.reduce((s, r) => s + r.pontos_creditados, 0)
  const emAnalise = registros.filter((r) => r.situacao === 'em_analise').reduce((s, r) => s + r.pontos, 0)
  const disponiveis = lista.filter((o) => podeRegistrar(o))
  const pendencias = registros.filter((r) => r.situacao === 'em_analise' || r.situacao === 'ajuste_solicitado')
  const agora = new Date()
  const proxima = lista.find((o) => !o.cancelada && new Date(o.inicio) > agora)
  const nome = conta.perfil!.nome_completo.split(' ')[0]

  return (
    <>
      <div className="screen-header">
        <LogoCompact />
      </div>
      <div style={{ padding: '8px 20px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 style={{ fontSize: 24 }}>Olá, {nome}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', fontSize: 13, color: 'var(--color-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPinIcon size={16} aria-hidden="true" />
            {v.congregacao}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <UsersThreeIcon size={16} aria-hidden="true" />
            {NOME_GRUPO[v.grupo]}
          </span>
        </div>
      </div>

      {erro ? (
        <div className="inset">
          <Alert tone="error" role="alert" title="Não foi possível carregar">
            {erro}
          </Alert>
        </div>
      ) : carregando ? (
        <div style={{ display: 'grid', placeItems: 'center', padding: 40 }}>
          <Spinner label="Carregando sua participação" />
        </div>
      ) : (
        <>
          <div className="inset">
            <PointsSummary
              monthLabel={nomeDoMes(mes)}
              approved={aprovados}
              pending={emAnalise}
              cycleOpen
              posGeral={eu && eu.pontos > 0 ? eu.posicao_geral : null}
              posGrupo={eu && eu.pontos > 0 ? eu.posicao_grupo : null}
              groupLabel={NOME_GRUPO[v.grupo]}
              action={
                <Button variant="on-brand" onClick={() => navegar('/presencas')}>
                  Ver extrato
                </Button>
              }
            />
          </div>

          {disponiveis.length > 0 ? (
            <>
              <h2 className="section-title">Pode registrar agora</h2>
              <div className="inset stack">
                {disponiveis.map((o) => (
                  <div key={o.id} className="card card--pad stack" style={{ gap: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <StatusTag status="disponivel" />
                      <span
                        style={{
                          fontSize: 13,
                          color: 'var(--color-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <ClockIcon size={15} aria-hidden="true" />
                        Envio até {quando(o.registro_fecha)}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 500 }}>{o.titulo}</div>
                      <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>
                        {semanaCurta(o.inicio)}, {diaMes(o.inicio)} · {hora(o.inicio)} – {hora(o.fim)} ·{' '}
                        {o.pontos > 0 ? `${o.pontos} pontos se aprovada` : 'sem pontuação'}
                      </div>
                    </div>
                    <Button
                      size="md"
                      block
                      icon={<CameraIcon size={20} />}
                      onClick={() => navegar(`/agenda/${o.id}/registrar`)}
                    >
                      Registrar presença
                    </Button>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          <h2 className="section-title">Minhas pendências</h2>
          <div className="list inset">
            {pendencias.length === 0 ? (
              <div style={{ padding: 16, fontSize: 14, color: 'var(--color-muted)' }}>
                Nenhuma pendência no momento.
              </div>
            ) : (
              pendencias.map((r) => (
                <Link
                  key={r.presenca_id}
                  to={`/agenda/${r.ocorrencia_id}`}
                  className="list__row"
                  style={{ minHeight: 64 }}
                >
                  <span className="list__body">
                    <span className="list__title" style={{ fontWeight: 500 }}>
                      {r.titulo} · {semanaCurta(r.inicio)} {diaMes(r.inicio)}
                    </span>
                    <span style={{ display: 'block', marginTop: 4 }}>
                      <StatusTag status={tagDaSituacao(r.situacao)} />
                    </span>
                  </span>
                  <span className="list__sub">{r.pontos > 0 ? `${r.pontos} pts após aprovação` : 'sem pontuação'}</span>
                  <CaretRightIcon size={18} className="list__icon" aria-hidden="true" />
                </Link>
              ))
            )}
          </div>

          {proxima ? (
            <>
              <h2 className="section-title">Próxima atividade</h2>
              <Link
                to={`/agenda/${proxima.id}`}
                className="card card--interactive inset"
                style={{ width: 'auto', gap: 14, alignItems: 'center', padding: '14px 16px', textDecoration: 'none' }}
              >
                <span
                  style={{
                    width: 52,
                    flex: 'none',
                    textAlign: 'center',
                    padding: '6px 0',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-neutral-200)',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 600,
                      color: chaveDia(proxima.inicio) === hoje ? 'var(--color-red)' : 'var(--color-muted)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {chaveDia(proxima.inicio) === hoje
                      ? 'HOJE'
                      : `${semanaCurta(proxima.inicio).toUpperCase()} ${diaMes(proxima.inicio)}`}
                  </span>
                  <span className="tabular" style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>
                    {hora(proxima.inicio)}
                  </span>
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 500 }}>{proxima.titulo}</span>
                  <span style={{ display: 'block', fontSize: 13, color: 'var(--color-muted)' }}>
                    {proxima.pontos > 0 ? `${proxima.pontos} pontos` : 'Atividade sem pontuação'} · registro abre às{' '}
                    {hora(proxima.registro_abre)}
                  </span>
                </span>
                <CaretRightIcon size={18} style={{ color: 'var(--color-muted)' }} aria-hidden="true" />
              </Link>
            </>
          ) : null}

          <p style={{ margin: '20px 20px 0', fontSize: 13, color: 'var(--color-muted)', display: 'flex', gap: 6 }}>
            <InfoIcon size={16} style={{ flex: 'none', marginTop: 1 }} aria-hidden="true" />O registro abre no fim de
            cada atividade e fica disponível por 24 horas. Os pontos entram no mês da atividade.
          </p>
        </>
      )}
    </>
  )
}
