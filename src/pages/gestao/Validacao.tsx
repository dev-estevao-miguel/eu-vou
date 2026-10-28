import { useEffect, useRef, useState } from 'react'
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  CheckIcon,
  CheckSquareOffsetIcon,
  ClockIcon,
  ImageBrokenIcon,
  LockSimpleIcon,
  MagnifyingGlassPlusIcon,
  PaperPlaneTiltIcon,
  StarIcon,
  XIcon,
} from '@phosphor-icons/react'
import {
  Alert,
  Avatar,
  Button,
  EmptyState,
  Modal,
  Segmented,
  Spinner,
  StatusTag,
  TextArea,
  useToast,
} from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { useConsulta } from '../../lib/useConsulta'
import { mensagemDeErro } from '../../lib/erros'
import { NOME_GRUPO, type Grupo } from '../../lib/conta'
import { diaMes, faixaHoraria, quando, semanaCurta, semanaLonga } from '../../lib/datas'
import { NOME_TIPO, tagDaSituacao, type SituacaoPresenca, type TipoAtividade } from '../../lib/agenda'

type Item = {
  presenca_id: string
  situacao: SituacaoPresenca
  perfil_id: string
  nome_completo: string
  nome_exibicao: string
  grupo: Grupo
  congregacao: string
  ocorrencia: string
  tipo: TipoAtividade
  inicio: string
  fim: string
  pontos: number
  foto_path: string | null
  observacao: string | null
  enviado_em: string
  decidido_em: string | null
  motivo: string | null
  saldo_mes: number
}

const MOTIVOS = [
  'A foto não mostra o contexto da atividade',
  'A foto é de outra atividade',
  'A imagem ficou escura ou tremida',
  'Já existe um registro desta pessoa nesta atividade',
]
const MSG_PADRAO =
  'Não foi possível confirmar esta atividade com a imagem enviada. Se tiver dúvidas, fale com a direção do seu grupo.'

/** G02/G03 · Fila de validação e análise individual. Aprovação em lote fica fora do MVP. */
export default function Validacao() {
  const toast = useToast()
  const [aba, setAba] = useState<'pend' | 'dec'>('pend')
  const fila = useConsulta<Item[]>(`fila-${aba}`, () => supabase.rpc('fila_validacao', { p_decididos: aba === 'dec' }))
  const [selId, setSelId] = useState<string | null>(null)
  const [aprovar, setAprovar] = useState(false)
  const [recusar, setRecusar] = useState(false)
  const [motivoIdx, setMotivoIdx] = useState(0)
  const [mensagem, setMensagem] = useState(MSG_PADRAO)
  const [salvando, setSalvando] = useState(false)
  const [ampliar, setAmpliar] = useState(false)
  const analise = useRef<HTMLElement>(null)

  function selecionar(id: string) {
    setSelId(id)
    if (window.matchMedia('(max-width: 1099px)').matches)
      analise.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const itens = fila.dados ?? []
  const sel = itens.find((i) => i.presenca_id === selId) ?? itens[0] ?? null

  async function decidir(aprovado: boolean) {
    if (!sel) return
    setSalvando(true)
    const { error } = await supabase.rpc('decidir_presenca', {
      p_presenca: sel.presenca_id,
      p_aprovar: aprovado,
      p_motivo: aprovado ? null : `${MOTIVOS[motivoIdx]}. ${mensagem}`.trim(),
    })
    setSalvando(false)
    setAprovar(false)
    setRecusar(false)
    toast.show(
      error
        ? mensagemDeErro(error)
        : aprovado
          ? sel.pontos > 0
            ? `${sel.pontos} pontos creditados a ${sel.nome_completo}.`
            : `Participação de ${sel.nome_completo} registrada.`
          : 'Registro recusado. A pessoa verá o motivo.',
    )
    setSelId(null)
    fila.recarregar()
  }

  return (
    <div className="validacao">
      <section className="validacao__fila card" aria-label="Fila de validação">
        <div style={{ padding: 12, borderBottom: '1px solid var(--color-divider)' }}>
          <Segmented
            label="Situação"
            value={aba}
            onChange={(a) => {
              setAba(a)
              setSelId(null)
            }}
            options={[
              { value: 'pend', label: `Em análise${aba === 'pend' && fila.dados ? ` (${itens.length})` : ''}` },
              { value: 'dec', label: 'Decididos' },
            ]}
          />
        </div>
        {fila.erro ? (
          <div style={{ padding: 12 }}>
            <Alert tone="error" role="alert">
              {fila.erro}
            </Alert>
          </div>
        ) : fila.carregando ? (
          <div style={{ display: 'grid', placeItems: 'center', padding: 30 }}>
            <Spinner label="Carregando a fila" />
          </div>
        ) : itens.length === 0 ? (
          <EmptyState
            icon={CheckSquareOffsetIcon}
            title={aba === 'pend' ? 'Nenhum registro em análise' : 'Nenhuma decisão ainda'}
          >
            {aba === 'pend' ? 'Novos envios do seu escopo aparecem aqui.' : 'As decisões tomadas aparecem aqui.'}
          </EmptyState>
        ) : (
          <div>
            {itens.map((it) => {
              const ativo = sel?.presenca_id === it.presenca_id
              return (
                <button
                  key={it.presenca_id}
                  type="button"
                  aria-current={ativo || undefined}
                  onClick={() => selecionar(it.presenca_id)}
                  className="list__row"
                  style={{
                    alignItems: 'flex-start',
                    background: ativo ? 'var(--color-accent-100)' : undefined,
                    boxShadow: ativo ? 'inset 3px 0 0 var(--color-accent)' : undefined,
                  }}
                >
                  <Avatar name={it.nome_completo} seed={it.perfil_id} size={40} />
                  <span className="list__body" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 500 }}>{it.nome_exibicao}</span>
                      <span className="tabular" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-brand)' }}>
                        {it.pontos} pts
                      </span>
                    </span>
                    <span className="list__sub">
                      {it.ocorrencia} · {semanaCurta(it.inicio)} {diaMes(it.inicio)} · {NOME_GRUPO[it.grupo]}
                    </span>
                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <StatusTag status={tagDaSituacao(it.situacao)} />
                      <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>enviado {quando(it.enviado_em)}</span>
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
        <p
          style={{
            padding: '10px 16px',
            fontSize: 12,
            color: 'var(--color-muted)',
            borderTop: '1px solid var(--color-divider)',
          }}
        >
          Revisão individual. Seus próprios registros são revisados por outra pessoa da liderança.
        </p>
      </section>

      <section ref={analise} className="validacao__analise" aria-label="Análise do registro">
        {sel ? (
          <div className="stack" style={{ gap: 18 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <Avatar name={sel.nome_completo} seed={sel.perfil_id} size={52} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 22, fontWeight: 500 }}>{sel.nome_completo}</div>
                <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>
                  {NOME_GRUPO[sel.grupo]} · {sel.congregacao} · no ranking: {sel.nome_exibicao}
                </div>
              </div>
              <StatusTag status={tagDaSituacao(sel.situacao)} large />
            </div>

            <div className="validacao__grade">
              <FotoPrivada
                key={sel.foto_path ?? sel.presenca_id}
                caminho={sel.foto_path}
                ampliar={ampliar}
                aoAmpliar={setAmpliar}
                nome={sel.nome_completo}
              />
              <div className="list">
                {[
                  [CalendarCheckIcon, 'Atividade', `${sel.ocorrencia} · ${NOME_TIPO[sel.tipo]}`],
                  [
                    ClockIcon,
                    'Data e horário',
                    `${semanaLonga(sel.inicio)}, ${diaMes(sel.inicio)} · ${faixaHoraria(sel.inicio, sel.fim)}`,
                  ],
                  [PaperPlaneTiltIcon, 'Enviado em', quando(sel.enviado_em)],
                  [
                    StarIcon,
                    'Pontuação que será creditada',
                    sel.pontos > 0 ? `${sel.pontos} pontos, uma única vez` : '0 · atividade sem pontuação',
                  ],
                ].map(([I, k, v]) => {
                  const IconCmp = I as typeof ClockIcon
                  return (
                    <div key={k as string} className="list__row" style={{ alignItems: 'flex-start' }}>
                      <IconCmp size={18} className="list__icon" aria-hidden="true" />
                      <span className="list__body">
                        <span style={{ display: 'block', fontSize: 12, color: 'var(--color-muted)' }}>
                          {k as string}
                        </span>
                        <span style={{ display: 'block', fontSize: 14 }}>{v as string}</span>
                      </span>
                    </div>
                  )
                })}
                <div style={{ padding: '12px 14px', background: 'var(--color-accent-100)' }}>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    {sel.situacao === 'em_analise' ? 'Com a aprovação' : 'Saldo aprovado no mês'}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-brand)' }}>
                    {sel.situacao === 'em_analise' && sel.pontos > 0
                      ? `${sel.saldo_mes} → ${sel.saldo_mes + sel.pontos} pontos no mês`
                      : `${sel.saldo_mes} pontos no mês`}
                  </div>
                </div>
              </div>
            </div>

            <div className="validacao__grade">
              <div className="stack" style={{ gap: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Observação do participante</div>
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-neutral-200)',
                    fontSize: 14,
                  }}
                >
                  {sel.observacao || 'Sem observação.'}
                </div>
              </div>
              {sel.motivo ? (
                <Alert tone="error" title="Motivo da recusa">
                  {sel.motivo}
                </Alert>
              ) : null}
            </div>

            {sel.situacao === 'em_analise' ? (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button size="md" icon={<CheckIcon size={18} />} onClick={() => setAprovar(true)}>
                  Aprovar presença
                </Button>
                <Button size="md" variant="danger" icon={<XIcon size={18} />} onClick={() => setRecusar(true)}>
                  Recusar
                </Button>
              </div>
            ) : null}
          </div>
        ) : !fila.carregando && itens.length > 0 ? null : (
          <EmptyState icon={CheckSquareOffsetIcon} title="Nada para analisar agora">
            Novos envios aparecem aqui assim que chegam.
          </EmptyState>
        )}
      </section>

      <Modal
        open={aprovar}
        onClose={() => setAprovar(false)}
        title="Aprovar presença?"
        text={
          sel
            ? sel.pontos > 0
              ? `${sel.pontos} pontos serão creditados a ${sel.nome_completo} no mês da atividade. Para desfazer depois, será preciso revogar com justificativa.`
              : `A participação de ${sel.nome_completo} será registrada. A atividade não tem pontuação.`
            : ''
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setAprovar(false)}>
              Cancelar
            </Button>
            <Button icon={<CheckIcon size={18} />} loading={salvando} onClick={() => decidir(true)}>
              Aprovar
            </Button>
          </>
        }
      />

      <Modal
        open={recusar}
        onClose={() => setRecusar(false)}
        title={sel ? `Recusar registro de ${sel.nome_exibicao}?` : ''}
        actions={
          <>
            <Button variant="secondary" onClick={() => setRecusar(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger-solid"
              loading={salvando}
              disabled={!mensagem.trim()}
              onClick={() => decidir(false)}
            >
              Confirmar recusa
            </Button>
          </>
        }
      >
        <fieldset className="choice-group" style={{ gap: 6 }}>
          <legend className="field__label" style={{ marginBottom: 6 }}>
            Motivo objetivo
          </legend>
          {MOTIVOS.map((m, i) => (
            <label
              key={m}
              className="choice"
              style={{
                minHeight: 0,
                padding: '10px 12px',
                flexDirection: 'row',
                alignItems: 'center',
                fontWeight: 400,
                fontSize: 14,
              }}
            >
              <input type="radio" name="motivo" checked={motivoIdx === i} onChange={() => setMotivoIdx(i)} />
              {m}
            </label>
          ))}
        </fieldset>
        <TextArea
          label="Mensagem que o participante verá"
          maxLength={250}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          hint="Use linguagem respeitosa e objetiva. Fica registrada no histórico."
        />
      </Modal>
    </div>
  )
}

/** Busca um link temporário (5 min) só no momento de exibir; o Storage confere a permissão. */
function FotoPrivada({
  caminho,
  ampliar,
  aoAmpliar,
  nome,
}: {
  caminho: string | null
  ampliar: boolean
  aoAmpliar: (v: boolean) => void
  nome: string
}) {
  const [url, setUrl] = useState<string | null | 'erro'>(null)
  useEffect(() => {
    let ativo = true
    if (!caminho) return
    supabase.storage
      .from('comprovantes')
      .createSignedUrl(caminho, 300)
      .then(({ data, error }) => ativo && setUrl(error || !data ? 'erro' : data.signedUrl))
    return () => {
      ativo = false
    }
  }, [caminho])

  return (
    <div className="stack" style={{ gap: 8 }}>
      <div
        style={{
          aspectRatio: '4 / 3',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-divider)',
          background: 'var(--color-neutral-200)',
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--color-muted)',
        }}
      >
        {url === 'erro' || !caminho ? (
          <span style={{ display: 'grid', placeItems: 'center', gap: 6, fontSize: 13 }}>
            <ImageBrokenIcon size={32} aria-hidden="true" />
            Foto indisponível
          </span>
        ) : url ? (
          <img
            src={url}
            alt={`Foto de comprovação enviada por ${nome}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Spinner label="Carregando a foto" />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <LockSimpleIcon size={14} aria-hidden="true" />
          Privada · visível só para quem pode analisar
        </span>
        {url && url !== 'erro' ? (
          <Button variant="secondary" icon={<MagnifyingGlassPlusIcon size={16} />} onClick={() => aoAmpliar(true)}>
            Ampliar
          </Button>
        ) : null}
      </div>
      <Modal
        open={ampliar && !!url && url !== 'erro'}
        onClose={() => aoAmpliar(false)}
        title="Foto de comprovação"
        actions={
          <Button variant="secondary" icon={<ArrowRightIcon size={16} />} onClick={() => aoAmpliar(false)}>
            Fechar
          </Button>
        }
      >
        {url && url !== 'erro' ? (
          <img
            src={url}
            alt={`Foto ampliada enviada por ${nome}`}
            style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
          />
        ) : null}
      </Modal>
    </div>
  )
}
