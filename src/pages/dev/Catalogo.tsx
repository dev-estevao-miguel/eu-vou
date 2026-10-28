import { useState, type ReactNode } from 'react'
import {
  BellIcon,
  CalendarBlankIcon,
  CameraIcon,
  CheckSquareOffsetIcon,
  ListBulletsIcon,
  PaperPlaneTiltIcon,
  XIcon,
  CheckIcon,
  ArrowCounterClockwiseIcon,
  CaretRightIcon,
  KeyIcon,
  PhoneIcon,
} from '@phosphor-icons/react'
import {
  Alert,
  Avatar,
  BottomNav,
  Button,
  Chips,
  ChoiceGroup,
  EmptyState,
  IconButton,
  LogoCompact,
  LogoHorizontal,
  LogoMark,
  Modal,
  PasswordField,
  PointsTag,
  ProgressBar,
  Segmented,
  Sheet,
  STATUS,
  StatusTag,
  TextArea,
  TextField,
  useToast,
  type StatusKey,
} from '../../components/ui'
import { PointsSummary } from '../../components/PointsSummary'
import { isTestEnvironment } from '../../lib/env'

/**
 * Catálogo de componentes — disponível só em desenvolvimento.
 * Serve para conferir a base visual contra o protótipo Lote 1.
 * Todo conteúdo aqui é exemplo fictício.
 */
export default function Catalogo() {
  const toast = useToast()
  const [grupo, setGrupo] = useState<'adolescentes' | 'jovens' | null>('adolescentes')
  const [modo, setModo] = useState<'lista' | 'cal'>('lista')
  const [rank, setRank] = useState<'geral' | 'adol' | 'jov'>('geral')
  const [filtro, setFiltro] = useState('todas')
  const [nota, setNota] = useState('')
  const [sheet, setSheet] = useState(false)
  const [modal, setModal] = useState(false)

  return (
    <div className="screen">
      <main className="screen__content" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div className="screen-header">
          <LogoCompact />
          {isTestEnvironment ? <span className="env-badge">Dados fictícios</span> : null}
        </div>
        <div style={{ padding: '0 20px' }}>
          <h1 className="screen-title">Catálogo de componentes</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 4 }}>
            Base visual do Lote 1. Página disponível apenas em desenvolvimento.
          </p>
        </div>

        <Secao titulo="Marca">
          <LogoHorizontal />
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <LogoMark size={64} />
            <LogoMark size={44} />
            <LogoMark size={32} />
          </div>
        </Secao>

        <Secao titulo="Botões">
          <Button size="md" block>
            Entrar
          </Button>
          <Button size="md" variant="secondary" block>
            Criar minha conta
          </Button>
          <Button size="md" block loading>
            Entrando…
          </Button>
          <Button size="lg" block icon={<CameraIcon size={20} />}>
            Registrar presença
          </Button>
          <Button size="md" block disabled>
            Desabilitado
          </Button>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary">Secundário</Button>
            <Button variant="text">Esqueci minha senha</Button>
            <Button variant="danger" icon={<XIcon size={18} />}>
              Recusar
            </Button>
            <IconButton label="Notificações" badge={2}>
              <BellIcon size={24} />
            </IconButton>
          </div>
        </Secao>

        <Secao titulo="Campos">
          <TextField
            label="Nome de usuário"
            placeholder="ex.: anaclara.m"
            autoCapitalize="none"
            hint="Sem espaços. Maiúsculas e minúsculas são iguais."
          />
          <PasswordField label="Senha" autoComplete="new-password" />
          <TextField
            label="WhatsApp com DDD"
            inputMode="tel"
            defaultValue="(00) 0000"
            error="Informe o número completo com DDD."
          />
          <TextArea
            label="Observação"
            optional
            maxLength={200}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Ex.: cheguei no início do culto com a turma do louvor."
          />
          <ChoiceGroup
            legend="Grupo"
            name="grupo"
            value={grupo}
            onChange={setGrupo}
            options={[
              { value: 'adolescentes', label: 'Adolescente' },
              { value: 'jovens', label: 'Jovem' },
            ]}
            hint="Funções de liderança nunca aparecem no cadastro."
          />
        </Secao>

        <Secao titulo="Avatares">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Avatar name="Ana Clara M." size={56} />
            <Avatar name="Lucas M." size={40} />
            <Avatar name="Júlia S." size={36} ring />
            <Avatar size={36} />
          </div>
        </Secao>

        <Secao titulo="Situações e pontos">
          <div className="chips">
            {(Object.keys(STATUS) as StatusKey[]).map((k) => (
              <StatusTag key={k} status={k} />
            ))}
          </div>
          <div className="chips">
            <PointsTag points={45} />
            <PointsTag points={0} />
            <span className="tag tag--today">HOJE</span>
          </div>
        </Secao>

        <Secao titulo="Alertas">
          <Alert tone="success" title="Presença aprovada.">
            Você recebeu 45 pontos.
          </Alert>
          <Alert tone="warning" title="O mês está em apuração.">
            O resultado sai após as revisões.
          </Alert>
          <Alert tone="error" title="Não foi possível enviar." role="alert">
            A foto continua salva neste dispositivo.
          </Alert>
          <Alert tone="info">Cada participação conta.</Alert>
        </Secao>

        <Secao titulo="Bloco de pontuação" semMargem>
          <div className="inset">
            <PointsSummary
              monthLabel="outubro"
              approved={250}
              pending={45}
              cycleOpen
              posGeral={2}
              posGrupo={1}
              groupLabel="Adolescentes"
              action={<Button variant="on-brand">Ver extrato</Button>}
            />
          </div>
        </Secao>

        <Secao titulo="Abas e filtros">
          <Segmented
            label="Modo da agenda"
            value={modo}
            onChange={setModo}
            options={[
              { value: 'lista', label: 'Lista', icon: <ListBulletsIcon size={18} /> },
              { value: 'cal', label: 'Calendário', icon: <CalendarBlankIcon size={18} /> },
            ]}
          />
          <Segmented
            label="Classificação"
            value={rank}
            onChange={setRank}
            options={[
              { value: 'geral', label: 'Geral' },
              { value: 'adol', label: 'Adolescentes' },
              { value: 'jov', label: 'Jovens' },
            ]}
          />
          <Chips
            label="Filtrar por tipo"
            value={filtro}
            onChange={setFiltro}
            options={[
              { value: 'todas', label: 'Todas' },
              { value: 'culto', label: 'Cultos' },
              { value: 'oracao', label: 'Orações' },
              { value: 'ensaio', label: 'Ensaios e estudos' },
            ]}
          />
        </Secao>

        <Secao titulo="Lista e item de ranking" semMargem>
          <div className="list inset">
            <button type="button" className="list__row">
              <PhoneIcon size={20} className="list__icon" />
              <span className="list__body">
                <span className="list__title">WhatsApp</span>
                <span className="list__sub">Número terminado em 47 (fictício)</span>
              </span>
              <CaretRightIcon size={18} className="list__icon" />
            </button>
            <button type="button" className="list__row">
              <KeyIcon size={20} className="list__icon" />
              <span className="list__body">
                <span className="list__title">Senha</span>
                <span className="list__sub">Alterar senha</span>
              </span>
              <CaretRightIcon size={18} className="list__icon" />
            </button>
            <div className="list__row" style={{ background: 'var(--color-accent-100)' }}>
              <span className="tabular" style={{ width: 28, fontWeight: 600, color: 'var(--color-muted)' }}>
                2º
              </span>
              <Avatar name="Ana Clara M." size={36} />
              <span className="list__body" style={{ fontWeight: 500 }}>
                Ana Clara M.{' '}
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
              </span>
              <span className="tabular" style={{ fontWeight: 600 }}>
                250
              </span>
            </div>
          </div>
        </Secao>

        <Secao titulo="Vazio e progresso">
          <EmptyState icon={CheckSquareOffsetIcon} title="Nenhum registro em análise">
            Novos envios do seu escopo aparecem aqui.
          </EmptyState>
          <ProgressBar value={64} label="Enviando foto" />
          <p style={{ fontSize: 14, color: 'var(--color-muted)' }}>64% · mantenha esta tela aberta.</p>
        </Secao>

        <Secao titulo="Painéis e avisos">
          <Button variant="secondary" block onClick={() => setSheet(true)}>
            Abrir painel inferior
          </Button>
          <Button variant="secondary" block onClick={() => setModal(true)}>
            Abrir confirmação
          </Button>
          <Button variant="secondary" block onClick={() => toast.show('Rascunho salvo neste dispositivo.')}>
            Mostrar aviso breve
          </Button>
        </Secao>

        <Sheet open={sheet} onClose={() => setSheet(false)} title="Sair sem enviar?">
          <p style={{ fontSize: 15, color: 'var(--color-muted)' }}>
            A foto fica salva neste dispositivo como rascunho. Ela ainda não foi enviada e não conta como presença.
          </p>
          <Button size="md" block onClick={() => setSheet(false)}>
            Continuar registro
          </Button>
          <Button size="md" variant="secondary" block onClick={() => setSheet(false)}>
            Sair e manter rascunho
          </Button>
          <Button variant="text-danger" onClick={() => setSheet(false)}>
            Descartar foto
          </Button>
        </Sheet>

        <Modal
          open={modal}
          onClose={() => setModal(false)}
          title="Aprovar presença?"
          text="45 pontos serão creditados a Ana Clara Moura no ciclo de outubro, pela data da atividade."
          actions={
            <>
              <Button variant="secondary" onClick={() => setModal(false)}>
                Cancelar
              </Button>
              <Button icon={<CheckIcon size={18} />} onClick={() => setModal(false)}>
                Aprovar
              </Button>
            </>
          }
        />

        <Secao titulo="Ações da análise">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button icon={<CheckIcon size={18} />}>Aprovar presença</Button>
            <Button variant="secondary" icon={<ArrowCounterClockwiseIcon size={18} />}>
              Solicitar ajuste
            </Button>
            <Button variant="danger" icon={<XIcon size={18} />}>
              Recusar
            </Button>
          </div>
          <Button size="lg" block icon={<PaperPlaneTiltIcon size={20} />}>
            Enviar para análise
          </Button>
        </Secao>
      </main>
      <BottomNav />
    </div>
  )
}

function Secao({ titulo, children, semMargem }: { titulo: string; children: ReactNode; semMargem?: boolean }) {
  return (
    <section>
      <h2 className="section-title" style={{ paddingTop: 0 }}>
        {titulo}
      </h2>
      <div className={semMargem ? undefined : 'stack'} style={semMargem ? undefined : { padding: '0 16px' }}>
        {children}
      </div>
    </section>
  )
}
