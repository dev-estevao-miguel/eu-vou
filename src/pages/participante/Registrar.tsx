import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  ArrowLeftIcon,
  ArrowsClockwiseIcon,
  CameraIcon,
  EyeIcon,
  FileImageIcon,
  HourglassMediumIcon,
  ImagesIcon,
  InfoIcon,
  PaperPlaneTiltIcon,
} from '@phosphor-icons/react'
import {
  Alert,
  Button,
  EmptyState,
  IconButton,
  PointsTag,
  ProgressBar,
  Sheet,
  Spinner,
  TextArea,
  useToast,
} from '../../components/ui'
import { useContaConectada } from '../../app/conta/ContaProvider'
import { supabase } from '../../lib/supabase'
import { mensagemDeErro } from '../../lib/erros'
import { useOcorrencia } from '../../lib/useOcorrencia'
import { diaMes, hora, semanaCurta } from '../../lib/datas'
import { podeRegistrar } from '../../lib/agenda'
import { enviarFoto, ErroFoto, prepararFoto, tamanhoLegivel } from '../../lib/foto'

type Etapa = 'foto' | 'conferir' | 'enviando' | 'resultado'
type Foto = { blob: Blob; url: string; origem: string; tamanhoOriginal: number }

/** P04 · Registrar presença: foto → conferência → envio → em análise. */
export default function Registrar() {
  const { id = '' } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const conta = useContaConectada()
  const uid = conta.perfil!.id
  const { dados: o, carregando, erro } = useOcorrencia(id, uid)
  const [etapa, setEtapa] = useState<Etapa>('foto')
  const [foto, setFoto] = useState<Foto | null>(null)
  const [preparando, setPreparando] = useState(false)
  const [erroFoto, setErroFoto] = useState<string | null>(null)
  const [nota, setNota] = useState('')
  const [progresso, setProgresso] = useState(0)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [sair, setSair] = useState(false)
  const cancelar = useRef<(() => void) | null>(null)
  const camera = useRef<HTMLInputElement>(null)
  const galeria = useRef<HTMLInputElement>(null)

  useEffect(() => () => (foto ? URL.revokeObjectURL(foto.url) : undefined), [foto])

  async function escolher(e: ChangeEvent<HTMLInputElement>, origem: string) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    setErroFoto(null)
    setPreparando(true)
    try {
      const { blob } = await prepararFoto(arquivo)
      setFoto({ blob, url: URL.createObjectURL(blob), origem, tamanhoOriginal: arquivo.size })
      setEtapa('conferir')
    } catch (err) {
      setErroFoto(err instanceof ErroFoto ? err.message : 'Não foi possível abrir a foto. Tente outra.')
    } finally {
      setPreparando(false)
    }
  }

  async function enviar() {
    if (!foto || !o) return
    setErroEnvio(null)
    setProgresso(0)
    setEtapa('enviando')
    const caminho = `${uid}/${o.id}/${crypto.randomUUID()}.jpg`
    const envio = enviarFoto(caminho, foto.blob, setProgresso)
    cancelar.current = envio.cancelar
    try {
      await envio.promessa
    } catch (err) {
      setEtapa('conferir')
      if (err instanceof ErroFoto && err.message === 'cancelado') toast.show('Envio cancelado. Sua foto continua aqui.')
      else
        setErroEnvio(
          navigator.onLine
            ? (err as Error).message
            : 'Sem conexão. Sua foto continua nesta tela; envie quando a internet voltar.',
        )
      return
    } finally {
      cancelar.current = null
    }
    const { error } = await supabase.rpc('registrar_presenca', {
      p_ocorrencia: o.id,
      p_foto_path: caminho,
      p_tamanho: foto.blob.size,
      p_tipo_mime: 'image/jpeg',
      p_observacao: nota.trim() || null,
    })
    if (error) {
      setEtapa('conferir')
      setErroEnvio(mensagemDeErro(error))
      return
    }
    setEtapa('resultado')
  }

  function voltar() {
    if (etapa === 'conferir') setSair(true)
    else if (etapa === 'resultado') navegar('/inicio')
    else if (etapa === 'foto') navegar(-1)
  }

  const cabecalho = (
    <>
      <div className="screen-header screen-header--back">
        <IconButton label="Voltar" onClick={voltar} disabled={etapa === 'enviando'}>
          <ArrowLeftIcon size={24} />
        </IconButton>
        <span style={{ fontSize: 16, fontWeight: 500, flex: 1 }}>Registrar presença</span>
        {o ? (
          <span style={{ fontSize: 13, color: 'var(--color-muted)', paddingRight: 10 }}>
            Etapa {etapa === 'foto' ? 1 : etapa === 'conferir' ? 2 : 3} de 3
          </span>
        ) : null}
      </div>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, padding: '0 20px 12px' }}
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              height: 4,
              borderRadius: 2,
              background:
                i <= ({ foto: 0, conferir: 1, enviando: 2, resultado: 2 } as const)[etapa]
                  ? 'var(--color-accent)'
                  : 'var(--color-divider)',
            }}
          />
        ))}
      </div>
    </>
  )

  if (carregando) {
    return (
      <>
        {cabecalho}
        <div style={{ display: 'grid', placeItems: 'center', padding: 40 }}>
          <Spinner label="Carregando a atividade" />
        </div>
      </>
    )
  }
  if (erro || !o || (etapa === 'foto' && !podeRegistrar(o))) {
    return (
      <>
        {cabecalho}
        <div className="inset stack">
          {erro ? (
            <Alert tone="error" role="alert">
              {erro}
            </Alert>
          ) : (
            <EmptyState icon={HourglassMediumIcon} title="Registro indisponível" dashed>
              {!o
                ? 'Atividade não encontrada.'
                : o.presenca_situacao
                  ? 'Você já registrou presença nesta atividade.'
                  : 'O registro abre no fim da atividade e fica disponível por 24 horas.'}
            </EmptyState>
          )}
          <Button variant="secondary" onClick={() => navegar(-1)}>
            Voltar
          </Button>
        </div>
      </>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {cabecalho}
      <div
        className="card inset"
        style={{
          marginBottom: 12,
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{o.titulo}</div>
          <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            {semanaCurta(o.inicio)} {diaMes(o.inicio)} · {hora(o.inicio)} – {hora(o.fim)}
          </div>
        </div>
        <PointsTag points={o.pontos} />
      </div>

      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => escolher(e, 'Câmera')}
      />
      <input ref={galeria} type="file" accept="image/*" hidden onChange={(e) => escolher(e, 'Galeria')} />

      {etapa === 'foto' ? (
        <div className="inset stack">
          <h1 style={{ fontSize: 20 }}>Envie uma foto da atividade</h1>
          {erroFoto ? (
            <Alert tone="error" role="alert">
              {erroFoto}
            </Alert>
          ) : null}
          {preparando ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 12 }}>
              <Spinner label="Preparando a foto" /> Preparando a foto…
            </div>
          ) : null}
          <button
            type="button"
            className="card card--interactive"
            disabled={preparando}
            onClick={() => camera.current?.click()}
            style={{
              gap: 14,
              alignItems: 'center',
              padding: '18px 16px',
              minHeight: 72,
              border: '1.5px solid var(--color-accent)',
              background: 'var(--color-accent-100)',
            }}
          >
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: 'var(--color-accent)',
                color: 'var(--color-surface)',
                display: 'grid',
                placeItems: 'center',
                flex: 'none',
              }}
            >
              <CameraIcon size={24} aria-hidden="true" />
            </span>
            <span>
              <span style={{ display: 'block', fontSize: 16, fontWeight: 500 }}>Tirar foto</span>
              <span style={{ display: 'block', fontSize: 13, color: 'var(--color-muted)' }}>
                Abre a câmera do celular
              </span>
            </span>
          </button>
          <button
            type="button"
            className="card card--interactive"
            disabled={preparando}
            onClick={() => galeria.current?.click()}
            style={{
              gap: 14,
              alignItems: 'center',
              padding: '18px 16px',
              minHeight: 72,
              borderColor: 'var(--color-field)',
            }}
          >
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: 'var(--color-neutral-200)',
                display: 'grid',
                placeItems: 'center',
                flex: 'none',
              }}
            >
              <ImagesIcon size={24} aria-hidden="true" />
            </span>
            <span>
              <span style={{ display: 'block', fontSize: 16, fontWeight: 500 }}>Escolher da galeria</span>
              <span style={{ display: 'block', fontSize: 13, color: 'var(--color-muted)' }}>Uma foto por envio</span>
            </span>
          </button>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: 13,
              color: 'var(--color-muted)',
              padding: '4px 2px',
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              <FileImageIcon size={16} style={{ flex: 'none' }} aria-hidden="true" />
              JPG, PNG ou HEIC, até 10 MB. A foto é reduzida antes do envio para economizar dados.
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <EyeIcon size={16} style={{ flex: 'none' }} aria-hidden="true" />A direção do seu grupo confere a foto.
              Ela não aparece no ranking nem vira foto de perfil.
            </div>
          </div>
        </div>
      ) : null}

      {(etapa === 'conferir' || etapa === 'enviando') && foto ? (
        <div className="inset stack">
          <h1 style={{ fontSize: 20 }}>{etapa === 'enviando' ? 'Enviando foto…' : 'Confira antes de enviar'}</h1>
          {erroEnvio ? (
            <Alert tone="error" role="alert" title="Não foi possível enviar">
              {erroEnvio}
            </Alert>
          ) : null}
          <img
            src={foto.url}
            alt="Prévia da foto escolhida"
            style={{
              width: '100%',
              aspectRatio: '4 / 3',
              objectFit: 'cover',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-divider)',
              background: 'var(--color-neutral-200)',
            }}
          />
          {etapa === 'enviando' ? (
            <div className="stack" style={{ gap: 8 }}>
              <ProgressBar value={progresso} label="Enviando foto" />
              <p style={{ fontSize: 14, color: 'var(--color-muted)' }}>{progresso}% · mantenha esta tela aberta.</p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: 'var(--color-muted)',
                }}
              >
                <span>
                  {foto.origem} · {tamanhoLegivel(foto.tamanhoOriginal)} → {tamanhoLegivel(foto.blob.size)}
                </span>
                <Button variant="secondary" icon={<ArrowsClockwiseIcon size={18} />} onClick={() => setEtapa('foto')}>
                  Trocar foto
                </Button>
              </div>
              <TextArea
                label="Observação"
                optional
                maxLength={200}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Ex.: cheguei no início do culto com a turma do louvor."
              />
              <Alert tone="neutral" icon={InfoIcon}>
                {o.pontos > 0
                  ? `Se aprovada, a presença soma ${o.pontos} pontos. Até lá, os pontos aparecem como em análise.`
                  : 'Atividade sem pontuação: registra sua participação, sem somar pontos.'}
              </Alert>
            </>
          )}
        </div>
      ) : null}

      {etapa === 'resultado' ? (
        <div className="inset stack" style={{ paddingTop: 8, gap: 14 }}>
          <span
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: 'var(--color-warning-bg)',
              color: 'var(--color-warning)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <HourglassMediumIcon size={30} aria-hidden="true" />
          </span>
          <h1 style={{ fontSize: 24 }}>Presença em análise</h1>
          <p style={{ color: 'var(--color-muted)' }}>
            A direção do seu grupo vai conferir a foto.{' '}
            {o.pontos > 0 ? `Os ${o.pontos} pontos entram no seu saldo somente depois da aprovação.` : ''}
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>A situação aparece em Minhas presenças.</p>
        </div>
      ) : null}

      <div className="sticky-actions">
        {etapa === 'conferir' ? (
          <Button size="lg" block icon={<PaperPlaneTiltIcon size={20} />} onClick={enviar}>
            Enviar para análise
          </Button>
        ) : null}
        {etapa === 'enviando' ? (
          <Button variant="secondary" block onClick={() => cancelar.current?.()}>
            Cancelar envio
          </Button>
        ) : null}
        {etapa === 'resultado' ? (
          <>
            <Button size="lg" block onClick={() => navegar('/presencas', { replace: true })}>
              Ver minhas presenças
            </Button>
            <Button size="md" variant="secondary" block onClick={() => navegar('/inicio', { replace: true })}>
              Voltar ao início
            </Button>
          </>
        ) : null}
      </div>

      <Sheet open={sair} onClose={() => setSair(false)} title="Sair sem enviar?">
        <p style={{ fontSize: 15, color: 'var(--color-muted)' }}>
          A foto ainda não foi enviada e não conta como presença. Se sair agora, ela será descartada.
        </p>
        <Button size="md" block onClick={() => setSair(false)}>
          Continuar registro
        </Button>
        <Button variant="text-danger" onClick={() => navegar(-1)}>
          Sair e descartar foto
        </Button>
      </Sheet>
    </div>
  )
}
