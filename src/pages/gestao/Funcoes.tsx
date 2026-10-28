import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { MagnifyingGlassIcon, UserGearIcon } from '@phosphor-icons/react'
import { Alert, Avatar, Button, EmptyState, Modal, TextArea, TextField, useToast } from '../../components/ui'
import { useContaConectada } from '../../app/conta/ContaProvider'
import { supabase } from '../../lib/supabase'
import { mensagemDeErro } from '../../lib/erros'
import { ehAdmin, NOME_FUNCAO, type Funcao } from '../../lib/conta'
import { AcessoRestrito } from '../Estados'

type Pessoa = { id: string; usuario: string; nome_completo: string; teste: boolean }
type FuncaoLinha = {
  id: string
  funcao: Funcao
  concedida_em: string
  congregacoes: { nome: string } | null
  campanhas: { nome: string } | null
}
type Opcao = { id: string; nome: string }

const FUNCOES: Funcao[] = [
  'direcao_jovens',
  'direcao_adolescentes',
  'responsavel_congregacao',
  'direcao_campanha',
  'admin',
]

/** AD03 (versão da Etapa 2) · conceder e revogar funções. Exclusivo do administrador. */
export default function Funcoes() {
  const conta = useContaConectada()
  const toast = useToast()
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState<Pessoa[] | null>(null)
  const [pessoa, setPessoa] = useState<Pessoa | null>(null)
  const [funcoes, setFuncoes] = useState<FuncaoLinha[]>([])
  const [congregacoes, setCongregacoes] = useState<Opcao[]>([])
  const [campanhas, setCampanhas] = useState<Opcao[]>([])
  const [nova, setNova] = useState<Funcao>('direcao_jovens')
  const [escopo, setEscopo] = useState('')
  const [revogar, setRevogar] = useState<FuncaoLinha | null>(null)
  const [justificativa, setJustificativa] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    void (async () => {
      const [cg, ca] = await Promise.all([
        supabase.from('congregacoes').select('id, nome').eq('ativa', true).order('nome'),
        supabase.from('campanhas').select('id, nome, congregacoes(nome)').eq('ativa', true).order('nome'),
      ])
      setCongregacoes(cg.data ?? [])
      setCampanhas(
        ((ca.data ?? []) as unknown as { id: string; nome: string; congregacoes: { nome: string } | null }[]).map(
          (c) => ({ id: c.id, nome: `${c.nome} · ${c.congregacoes?.nome ?? ''}` }),
        ),
      )
    })()
  }, [])

  const carregarFuncoes = useCallback(async (id: string) => {
    const { data } = await supabase
      .from('funcoes')
      .select('id, funcao, concedida_em, congregacoes(nome), campanhas(nome)')
      .eq('perfil_id', id)
      .is('revogada_em', null)
    setFuncoes((data ?? []) as unknown as FuncaoLinha[])
  }, [])

  if (!ehAdmin(conta)) {
    return (
      <AcessoRestrito texto="A gestão de funções é exclusiva do administrador da plataforma." voltarPara="/gestao" />
    )
  }

  async function procurar(e: FormEvent) {
    e.preventDefault()
    const termo = busca.trim().replace(/[%_,()]/g, '')
    if (termo.length < 2) return
    const { data, error } = await supabase
      .from('perfis')
      .select('id, usuario, nome_completo, teste')
      .or(`usuario.ilike.%${termo}%,nome_completo.ilike.%${termo}%`)
      .order('nome_completo')
      .limit(20)
    if (error) toast.show(mensagemDeErro(error))
    setResultados(data ?? [])
  }

  async function escolher(p: Pessoa) {
    setPessoa(p)
    await carregarFuncoes(p.id)
  }

  const opcoesEscopo = nova === 'admin' ? [] : nova === 'direcao_campanha' ? campanhas : congregacoes
  const escopoValido = nova === 'admin' || opcoesEscopo.some((o) => o.id === escopo)

  async function conceder(e: FormEvent) {
    e.preventDefault()
    if (!pessoa || !escopoValido) return
    setSalvando(true)
    const { error } = await supabase.rpc('conceder_funcao', {
      p_perfil: pessoa.id,
      p_funcao: nova,
      p_congregacao: nova === 'admin' || nova === 'direcao_campanha' ? null : escopo,
      p_campanha: nova === 'direcao_campanha' ? escopo : null,
    })
    setSalvando(false)
    toast.show(error ? mensagemDeErro(error) : `${NOME_FUNCAO[nova]} concedida.`)
    await carregarFuncoes(pessoa.id)
  }

  async function confirmarRevogacao() {
    if (!revogar || !pessoa) return
    setSalvando(true)
    const { error } = await supabase.rpc('revogar_funcao', { p_funcao_id: revogar.id, p_justificativa: justificativa })
    setSalvando(false)
    setRevogar(null)
    setJustificativa('')
    toast.show(error ? mensagemDeErro(error) : 'Função revogada.')
    await carregarFuncoes(pessoa.id)
  }

  const ehVoce = pessoa?.id === conta.perfil?.id

  return (
    <div className="stack" style={{ gap: 20, maxWidth: 720 }}>
      <form className="card card--pad stack" style={{ gap: 12 }} onSubmit={procurar} role="search">
        <TextField
          label="Procurar pessoa"
          placeholder="Nome ou usuário"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          hint="Funções de liderança nunca são escolhidas no cadastro; só o administrador concede."
        />
        <div>
          <Button type="submit" variant="secondary" icon={<MagnifyingGlassIcon size={18} />}>
            Procurar
          </Button>
        </div>
      </form>

      {resultados && !pessoa ? (
        resultados.length === 0 ? (
          <div className="card">
            <EmptyState icon={MagnifyingGlassIcon} title="Ninguém encontrado" />
          </div>
        ) : (
          <div className="list">
            {resultados.map((p) => (
              <button key={p.id} type="button" className="list__row" onClick={() => escolher(p)}>
                <Avatar name={p.nome_completo} seed={p.id} size={36} />
                <span className="list__body">
                  <span className="list__title">{p.nome_completo}</span>
                  <span className="list__sub">@{p.usuario}</span>
                </span>
                {p.teste ? <span className="env-badge">Teste</span> : null}
              </button>
            ))}
          </div>
        )
      ) : null}

      {pessoa ? (
        <section className="card card--pad stack" style={{ gap: 14 }} aria-label={`Funções de ${pessoa.nome_completo}`}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Avatar name={pessoa.nome_completo} seed={pessoa.id} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500 }}>{pessoa.nome_completo}</div>
              <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>@{pessoa.usuario}</div>
            </div>
            <Button variant="text" onClick={() => setPessoa(null)}>
              Trocar
            </Button>
          </div>

          {funcoes.length === 0 ? (
            <EmptyState icon={UserGearIcon} title="Sem função de liderança" />
          ) : (
            <div className="list">
              {funcoes.map((f) => (
                <div key={f.id} className="list__row">
                  <span className="list__body">
                    <span className="list__title">{NOME_FUNCAO[f.funcao]}</span>
                    <span className="list__sub">
                      {f.congregacoes?.nome ?? f.campanhas?.nome ?? 'Todas as congregações'}
                    </span>
                  </span>
                  {!ehVoce ? (
                    <Button variant="text-danger" onClick={() => setRevogar(f)}>
                      Revogar
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {ehVoce ? (
            <Alert tone="info">Ninguém altera a própria função. Peça a outro administrador.</Alert>
          ) : (
            <form className="stack" style={{ gap: 12 }} onSubmit={conceder}>
              <div className="field">
                <label className="field__label" htmlFor="nova-funcao">
                  Conceder função
                </label>
                <select
                  id="nova-funcao"
                  className="input campo-select"
                  value={nova}
                  onChange={(e) => {
                    setNova(e.target.value as Funcao)
                    setEscopo('')
                  }}
                >
                  {FUNCOES.map((f) => (
                    <option key={f} value={f}>
                      {NOME_FUNCAO[f]}
                    </option>
                  ))}
                </select>
              </div>
              {nova !== 'admin' ? (
                <div className="field">
                  <label className="field__label" htmlFor="escopo-funcao">
                    {nova === 'direcao_campanha' ? 'Campanha' : 'Congregação'}
                  </label>
                  <select
                    id="escopo-funcao"
                    className="input campo-select"
                    value={escopo}
                    onChange={(e) => setEscopo(e.target.value)}
                  >
                    <option value="">Escolha…</option>
                    {opcoesEscopo.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nome}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <Alert tone="warning">O administrador tem acesso a todas as congregações e dados.</Alert>
              )}
              <div>
                <Button type="submit" loading={salvando} disabled={!escopoValido}>
                  Conceder
                </Button>
              </div>
            </form>
          )}
        </section>
      ) : null}

      <Modal
        open={!!revogar}
        onClose={() => setRevogar(null)}
        title="Revogar função?"
        text={revogar && pessoa ? `${NOME_FUNCAO[revogar.funcao]} de ${pessoa.nome_completo}.` : ''}
        actions={
          <>
            <Button variant="secondary" onClick={() => setRevogar(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger-solid"
              loading={salvando}
              disabled={!justificativa.trim()}
              onClick={confirmarRevogacao}
            >
              Revogar
            </Button>
          </>
        }
      >
        <TextArea
          label="Justificativa"
          maxLength={300}
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          hint="Fica registrada no histórico de ações."
        />
      </Modal>
    </div>
  )
}
