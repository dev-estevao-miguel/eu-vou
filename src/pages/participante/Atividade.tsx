import { useNavigate, useParams } from 'react-router'
import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  CameraIcon,
  ClockIcon,
  HandsPrayingIcon,
  InfoIcon,
  LockSimpleIcon,
  MapPinIcon,
  StarIcon,
  UploadSimpleIcon,
  UsersIcon,
  UsersThreeIcon,
  type Icon,
} from '@phosphor-icons/react'
import { Alert, Button, EmptyState, IconButton, PointsTag, Spinner, StatusTag } from '../../components/ui'
import { useContaConectada } from '../../app/conta/ContaProvider'
import { useOcorrencia } from '../../lib/useOcorrencia'
import { diaMes, faixaHoraria, quando, semanaLonga } from '../../lib/datas'
import { janela, NOME_PUBLICO, NOME_TIPO, podeRegistrar, situacaoNaAgenda } from '../../lib/agenda'

/** P03 · Detalhe da atividade, com a janela de envio e a orientação para a foto. */
export default function Atividade() {
  const { id = '' } = useParams()
  const navegar = useNavigate()
  const conta = useContaConectada()
  const { dados: o, erro, carregando } = useOcorrencia(id, conta.perfil!.id)

  const voltar = (
    <div className="screen-header screen-header--back">
      <IconButton label="Voltar" onClick={() => navegar(-1)}>
        <ArrowLeftIcon size={24} />
      </IconButton>
      <span style={{ fontSize: 16, fontWeight: 500 }}>Atividade</span>
    </div>
  )

  if (carregando) {
    return (
      <>
        {voltar}
        <div style={{ display: 'grid', placeItems: 'center', padding: 40 }}>
          <Spinner label="Carregando a atividade" />
        </div>
      </>
    )
  }
  if (erro || !o) {
    return (
      <>
        {voltar}
        <div className="inset">
          {erro ? (
            <Alert tone="error" role="alert" title="Não foi possível carregar">
              {erro}
            </Alert>
          ) : (
            <EmptyState title="Atividade não encontrada">
              Ela pode ter sido removida ou não ser da sua congregação.
            </EmptyState>
          )}
        </div>
      </>
    )
  }

  const grupo = conta.vinculo!.grupo
  const paraMeuGrupo = o.publico === 'todos' || o.publico === grupo
  const j = janela(o)
  const envioTexto =
    j === 'cancelada'
      ? 'Atividade cancelada'
      : j === 'antes'
        ? `Abre ${quando(o.registro_abre)} e fica disponível por 24 h`
        : j === 'aberta'
          ? `Aberto até ${quando(o.registro_fecha)}`
          : 'Prazo encerrado'

  const linhas: { icon: Icon; k: string; v: string }[] = [
    { icon: CalendarBlankIcon, k: 'Data', v: `${semanaLonga(o.inicio)}, ${diaMes(o.inicio)}` },
    { icon: ClockIcon, k: 'Horário', v: faixaHoraria(o.inicio, o.fim) },
    ...(o.local ? [{ icon: MapPinIcon, k: 'Local', v: o.local }] : []),
    { icon: UsersThreeIcon, k: 'Público', v: NOME_PUBLICO[o.publico] },
    {
      icon: StarIcon,
      k: 'Pontos',
      v:
        o.pontos > 0 ? `${o.pontos} pontos, somados uma vez se a presença for aprovada` : '0 · atividade sem pontuação',
    },
    { icon: UploadSimpleIcon, k: 'Envio da presença', v: envioTexto },
  ]

  const nota =
    o.presenca_situacao === 'em_analise'
      ? 'Sua presença está em análise. Os pontos entram depois da aprovação.'
      : o.presenca_situacao === 'aprovada'
        ? o.pontos > 0
          ? `Presença aprovada · ${o.pontos} pontos creditados.`
          : 'Presença aprovada · atividade sem pontuação.'
        : o.presenca_situacao === 'recusada'
          ? 'Registro recusado.'
          : !paraMeuGrupo
            ? `Esta atividade é para ${NOME_PUBLICO[o.publico]}.`
            : j === 'antes'
              ? `O registro abre ${quando(o.registro_abre)}, ao fim da atividade.`
              : j === 'cancelada'
                ? 'Atividade cancelada.'
                : j === 'encerrada'
                  ? 'O prazo de envio terminou.'
                  : ''

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {voltar}
      <div style={{ padding: '4px 20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
          {NOME_TIPO[o.tipo]} · {semanaLonga(o.inicio)}, {diaMes(o.inicio)}
        </span>
        <h1 style={{ fontSize: 26, lineHeight: 1.15 }}>{o.titulo}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <PointsTag points={o.pontos} large />
          <StatusTag status={situacaoNaAgenda(o)} large />
        </div>
      </div>

      <div className="list inset">
        {linhas.map(({ icon: IconCmp, k, v }) => (
          <div key={k} className="list__row" style={{ alignItems: 'flex-start' }}>
            <IconCmp size={20} className="list__icon" style={{ marginTop: 1 }} aria-hidden="true" />
            <span className="list__body">
              <span style={{ display: 'block', fontSize: 12, color: 'var(--color-muted)' }}>{k}</span>
              <span style={{ display: 'block', fontSize: 15 }}>{v}</span>
            </span>
          </div>
        ))}
      </div>

      {o.cancelada && o.motivo_cancelamento ? (
        <div className="inset" style={{ marginTop: 12 }}>
          <Alert tone="error" title="Atividade cancelada">
            {o.motivo_cancelamento}
          </Alert>
        </div>
      ) : null}
      {o.pontos === 0 ? (
        <div className="inset" style={{ marginTop: 12 }}>
          <Alert tone="neutral" icon={InfoIcon}>
            Atividade sem pontuação. O registro conta como participação, mas não soma pontos ao saldo.
          </Alert>
        </div>
      ) : null}
      {o.presenca_situacao === 'recusada' && o.presenca_motivo ? (
        <div className="inset" style={{ marginTop: 12 }}>
          <Alert tone="error" title="Motivo informado pela direção">
            {o.presenca_motivo}
          </Alert>
        </div>
      ) : null}

      <div
        className="inset"
        style={{
          marginTop: 16,
          padding: 16,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-neutral-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          fontSize: 14,
        }}
      >
        <div style={{ fontWeight: 500, fontSize: 15 }}>Como comprovar</div>
        {[
          [CameraIcon, 'Uma foto ao final da atividade. Não precisa ser selfie.'],
          [UsersIcon, 'Evite enquadrar outras pessoas sem necessidade.'],
          [HandsPrayingIcon, 'Respeite o momento do culto: registre depois do encerramento.'],
          [LockSimpleIcon, 'A foto é privada e é vista apenas pela liderança autorizada.'],
        ].map(([I, t]) => {
          const IconCmp = I as Icon
          return (
            <div key={t as string} style={{ display: 'flex', gap: 8 }}>
              <IconCmp size={18} style={{ flex: 'none' }} aria-hidden="true" />
              {t as string}
            </div>
          )
        })}
      </div>

      <div className="sticky-actions">
        {paraMeuGrupo && podeRegistrar(o) ? (
          <Button size="lg" block icon={<CameraIcon size={20} />} onClick={() => navegar(`/agenda/${o.id}/registrar`)}>
            Registrar presença
          </Button>
        ) : (
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-muted)', padding: 8 }}>{nota}</p>
        )}
      </div>
    </div>
  )
}
