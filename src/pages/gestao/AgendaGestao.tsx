import { useState, type FormEvent } from 'react'
import { CalendarPlusIcon, PencilSimpleIcon } from '@phosphor-icons/react'
import {
  Alert,
  Button,
  EmptyState,
  Modal,
  PointsTag,
  Segmented,
  Spinner,
  StatusTag,
  TextArea,
  TextField,
  useToast,
} from '../../components/ui'
import { useContaConectada } from '../../app/conta/ContaProvider'
import { supabase } from '../../lib/supabase'
import { useConsulta } from '../../lib/useConsulta'
import { mensagemDeErro } from '../../lib/erros'
import { ehAdmin } from '../../lib/conta'
import { chaveDia, diaMes, faixaHoraria, hojeIso, semanaCurta, somarDias } from '../../lib/datas'
import { NOME_PUBLICO, NOME_TIPO, type Publico, type TipoAtividade } from '../../lib/agenda'
import { AcessoRestrito } from '../Estados'

type Cong = { id: string; nome: string }
type Ocorrencia = {
  id: string
  titulo: string
  tipo: TipoAtividade
  publico: Publico
  pontos: number
  inicio: string
  fim: string
  cancelada_em: string | null
  atividade_id: string
}

const DIAS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

/** AD04 (versão da Etapa 3) · Agenda comum e pontos das atividades. Exclusivo do administrador. */
export default function AgendaGestao() {
  const conta = useContaConectada()
  const toast = useToast()
  const hoje = hojeIso()
  const congs = useConsulta<Cong[]>('agenda-congs', () =>
    supabase.from('congregacoes').select('id, nome').eq('ativa', true).order('nome'),
  )
  const [congId, setCongId] = useState('')
  const cong = (congs.dados ?? []).find((c) => c.id === congId) ?? (congs.dados ?? [])[0]
  const ocorrencias = useConsulta<Ocorrencia[]>(`agenda-oc-${cong?.id ?? ''}`, () =>
    cong
      ? supabase
          .from('ocorrencias')
          .select('id, titulo, tipo, publico, pontos, inicio, fim, cancelada_em, atividade_id')
          .eq('congregacao_id', cong.id)
          .gte('inicio', `${somarDias(hoje, -2)}T00:00:00-03:00`)
          .lte('inicio', `${somarDias(hoje, 45)}T23:59:59-03:00`)
          .order('inicio')
      : Promise.resolve({ data: [], error: null }),
  )

  const [form, setForm] = useState({
    titulo: '',
    tipo: 'culto' as TipoAtividade,
    publico: 'todos' as Publico,
    pontos: '45',
    repeticao: 'semanal' as 'semanal' | 'unica',
    diaSemana: '0',
    dataInicio: hoje,
    dataFim: somarDias(hoje, 90),
    horaInicio: '19:30',
    horaFim: '21:00',
    local: '',
  })
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [cancelar, setCancelar] = useState<Ocorrencia | null>(null)
  const [motivo, setMotivo] = useState('')
  const [pontosDe, setPontosDe] = useState<Ocorrencia | null>(null)
  const [novosPontos, setNovosPontos] = useState('')

  if (!ehAdmin(conta)) {
    return (
      <AcessoRestrito
        texto="A agenda comum e a pontuação das atividades são configuradas pelo administrador."
        voltarPara="/gestao"
      />
    )
  }

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function criar(e: FormEvent) {
    e.preventDefault()
    const pontos = Number(form.pontos)
    if (form.titulo.trim().length < 2) return setErroForm('Informe o nome da atividade.')
    if (!Number.isInteger(pontos) || pontos < 0 || pontos > 50) return setErroForm('A pontuação vai de 0 a 50.')
    if (form.horaFim <= form.horaInicio) return setErroForm('O horário de término deve ser depois do início.')
    if (form.repeticao === 'semanal' && form.dataFim < form.dataInicio)
      return setErroForm('A data final deve ser depois da inicial.')
    if (!cong) return
    setErroForm(null)
    setSalvando(true)
    const { data, error } = await supabase.rpc('criar_atividade', {
      p_congregacao: cong.id,
      p_titulo: form.titulo,
      p_tipo: form.tipo,
      p_publico: form.publico,
      p_pontos: pontos,
      p_local: form.local,
      p_dia_semana: form.repeticao === 'semanal' ? Number(form.diaSemana) : null,
      p_data_inicio: form.dataInicio,
      p_data_fim: form.repeticao === 'semanal' ? form.dataFim : form.dataInicio,
      p_hora_inicio: form.horaInicio,
      p_hora_fim: form.horaFim,
    })
    setSalvando(false)
    if (error) return setErroForm(mensagemDeErro(error))
    toast.show(`Atividade criada com ${data} ${data === 1 ? 'ocorrência' : 'ocorrências'}.`)
    setForm((f) => ({ ...f, titulo: '', local: '' }))
    ocorrencias.recarregar()
  }

  async function confirmarCancelamento() {
    if (!cancelar) return
    const { error } = await supabase.rpc('cancelar_ocorrencia', { p_ocorrencia: cancelar.id, p_motivo: motivo })
    toast.show(error ? mensagemDeErro(error) : 'Ocorrência cancelada.')
    setCancelar(null)
    setMotivo('')
    ocorrencias.recarregar()
  }

  async function confirmarPontos() {
    if (!pontosDe) return
    const p = Number(novosPontos)
    if (!Number.isInteger(p) || p < 0 || p > 50) return toast.show('A pontuação vai de 0 a 50.')
    const { data, error } = await supabase.rpc('alterar_pontos_atividade', {
      p_atividade: pontosDe.atividade_id,
      p_pontos: p,
    })
    toast.show(error ? mensagemDeErro(error) : `Pontuação alterada em ${data} ocorrências futuras.`)
    setPontosDe(null)
    ocorrencias.recarregar()
  }

  const dias = new Map<string, Ocorrencia[]>()
  for (const o of ocorrencias.dados ?? []) {
    const k = chaveDia(o.inicio)
    dias.set(k, [...(dias.get(k) ?? []), o])
  }

  return (
    <div className="stack" style={{ gap: 20, maxWidth: 860 }}>
      {congs.dados && congs.dados.length === 0 ? (
        <Alert tone="warning" title="Nenhuma congregação ativa">
          Cadastre uma congregação em Congregações antes de montar a agenda.
        </Alert>
      ) : null}
      {(congs.dados ?? []).length > 1 ? (
        <div className="field" style={{ maxWidth: 360 }}>
          <label className="field__label" htmlFor="ag-cong">
            Congregação
          </label>
          <select
            id="ag-cong"
            className="input campo-select"
            value={cong?.id ?? ''}
            onChange={(e) => setCongId(e.target.value)}
          >
            {(congs.dados ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {cong ? (
        <form
          className="card card--pad stack"
          style={{ gap: 14 }}
          onSubmit={criar}
          noValidate
          aria-labelledby="nova-atividade"
        >
          <h2 id="nova-atividade" style={{ fontSize: 16 }}>
            Nova atividade · {cong.nome}
          </h2>
          {erroForm ? (
            <Alert tone="error" role="alert">
              {erroForm}
            </Alert>
          ) : null}
          <TextField
            label="Nome da atividade"
            placeholder="Ex.: Culto oficial"
            value={form.titulo}
            onChange={(e) => set('titulo')(e.target.value)}
          />
          <div className="form-grade">
            <Selecao
              id="ag-tipo"
              label="Tipo"
              value={form.tipo}
              onChange={set('tipo')}
              opcoes={Object.entries(NOME_TIPO)}
            />
            <Selecao
              id="ag-publico"
              label="Público"
              value={form.publico}
              onChange={set('publico')}
              opcoes={Object.entries(NOME_PUBLICO)}
            />
            <TextField
              label="Pontos (0 a 50)"
              type="number"
              inputMode="numeric"
              min={0}
              max={50}
              value={form.pontos}
              onChange={(e) => set('pontos')(e.target.value)}
              hint="Mesmo valor para Jovens e Adolescentes."
            />
          </div>
          <Segmented
            label="Repetição"
            value={form.repeticao}
            onChange={set('repeticao')}
            options={[
              { value: 'semanal', label: 'Toda semana' },
              { value: 'unica', label: 'Data única' },
            ]}
          />
          <div className="form-grade">
            {form.repeticao === 'semanal' ? (
              <>
                <Selecao
                  id="ag-dia"
                  label="Dia da semana"
                  value={form.diaSemana}
                  onChange={set('diaSemana')}
                  opcoes={DIAS.map((d, i) => [String(i), d])}
                />
                <TextField
                  label="A partir de"
                  type="date"
                  value={form.dataInicio}
                  onChange={(e) => set('dataInicio')(e.target.value)}
                />
                <TextField
                  label="Até"
                  type="date"
                  value={form.dataFim}
                  onChange={(e) => set('dataFim')(e.target.value)}
                  hint="No máximo 400 dias."
                />
              </>
            ) : (
              <TextField
                label="Data"
                type="date"
                value={form.dataInicio}
                onChange={(e) => set('dataInicio')(e.target.value)}
              />
            )}
            <TextField
              label="Início"
              type="time"
              value={form.horaInicio}
              onChange={(e) => set('horaInicio')(e.target.value)}
            />
            <TextField
              label="Término"
              type="time"
              value={form.horaFim}
              onChange={(e) => set('horaFim')(e.target.value)}
              hint="O registro abre neste horário."
            />
          </div>
          <TextField
            label="Local"
            optional
            value={form.local}
            onChange={(e) => set('local')(e.target.value)}
            placeholder="Ex.: Templo"
          />
          <div>
            <Button type="submit" icon={<CalendarPlusIcon size={18} />} loading={salvando}>
              Criar atividade
            </Button>
          </div>
        </form>
      ) : null}

      {cong ? (
        <section className="stack" style={{ gap: 10 }} aria-labelledby="proximas">
          <h2 id="proximas" style={{ fontSize: 16 }}>
            Próximas ocorrências · {cong.nome}
          </h2>
          {ocorrencias.erro ? (
            <Alert tone="error" role="alert">
              {ocorrencias.erro}
            </Alert>
          ) : ocorrencias.carregando ? (
            <Spinner label="Carregando a agenda" />
          ) : dias.size === 0 ? (
            <div className="card">
              <EmptyState icon={CalendarPlusIcon} title="Nenhuma atividade nos próximos 45 dias" />
            </div>
          ) : (
            <div className="list">
              {[...dias.values()].flat().map((o) => (
                <div key={o.id} className="list__row" style={{ flexWrap: 'wrap', opacity: o.cancelada_em ? 0.6 : 1 }}>
                  <span style={{ width: 64, flex: 'none' }}>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--color-muted)' }}>
                      {semanaCurta(o.inicio)}
                    </span>
                    <span className="tabular" style={{ fontWeight: 600 }}>
                      {diaMes(o.inicio)}
                    </span>
                  </span>
                  <span className="list__body">
                    <span className="list__title" style={{ fontWeight: 500 }}>
                      {o.titulo}
                    </span>
                    <span className="list__sub">
                      {faixaHoraria(o.inicio, o.fim)} · {NOME_TIPO[o.tipo]} · {NOME_PUBLICO[o.publico]}
                    </span>
                  </span>
                  <PointsTag points={o.pontos} />
                  {o.cancelada_em ? (
                    <StatusTag status="cancelada" />
                  ) : (
                    <span style={{ display: 'flex', gap: 4 }}>
                      {new Date(o.inicio) > new Date() ? (
                        <Button
                          variant="text"
                          icon={<PencilSimpleIcon size={16} />}
                          onClick={() => {
                            setPontosDe(o)
                            setNovosPontos(String(o.pontos))
                          }}
                        >
                          Pontos
                        </Button>
                      ) : null}
                      <Button variant="text-danger" onClick={() => setCancelar(o)}>
                        Cancelar
                      </Button>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      <Modal
        open={!!cancelar}
        onClose={() => setCancelar(null)}
        title="Cancelar esta ocorrência?"
        text={
          cancelar
            ? `${cancelar.titulo} · ${semanaCurta(cancelar.inicio)} ${diaMes(cancelar.inicio)}. Registros ainda em análise serão cancelados, sem pontos.`
            : ''
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setCancelar(null)}>
              Manter
            </Button>
            <Button variant="danger-solid" disabled={!motivo.trim()} onClick={confirmarCancelamento}>
              Cancelar ocorrência
            </Button>
          </>
        }
      >
        <TextArea
          label="Motivo"
          maxLength={200}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          hint="Aparece para os participantes."
        />
      </Modal>

      <Modal
        open={!!pontosDe}
        onClose={() => setPontosDe(null)}
        title="Alterar pontuação"
        text={
          pontosDe ? `Vale para as próximas ocorrências de “${pontosDe.titulo}”. As já realizadas mantêm o valor.` : ''
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setPontosDe(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarPontos}>Salvar</Button>
          </>
        }
      >
        <TextField
          label="Pontos (0 a 50)"
          type="number"
          inputMode="numeric"
          min={0}
          max={50}
          value={novosPontos}
          onChange={(e) => setNovosPontos(e.target.value)}
        />
      </Modal>
    </div>
  )
}

function Selecao({
  id,
  label,
  value,
  onChange,
  opcoes,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  opcoes: [string, string][]
}) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <select id={id} className="input campo-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {opcoes.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  )
}
