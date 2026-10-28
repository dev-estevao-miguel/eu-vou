import { useCallback, useEffect, useMemo, useState } from 'react'
import { CopyIcon, LinkSimpleIcon, ShareNetworkIcon, WhatsappLogoIcon } from '@phosphor-icons/react'
import { Alert, Button, EmptyState, Modal, Spinner, useToast } from '../../components/ui'
import { useContaConectada } from '../../app/conta/ContaProvider'
import { supabase } from '../../lib/supabase'
import { mensagemDeErro } from '../../lib/erros'
import { ehAdmin, escoposDeConvite, NOME_GRUPO, type Grupo } from '../../lib/conta'

type ConviteLinha = {
  id: string
  grupo: Grupo
  criado_em: string
  expira_em: string
  revogado_em: string | null
  cadastros: number
  congregacoes: { nome: string } | null
}

type Gerado = { link: string; congregacao: string; grupo: Grupo; expira_em: string }

const dataCurta = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Recife' })

function situacao(c: ConviteLinha) {
  if (c.revogado_em) return { texto: 'Cancelado', classe: 'tag--error' }
  if (new Date(c.expira_em) <= new Date()) return { texto: 'Expirado', classe: 'tag--muted' }
  return { texto: 'Ativo', classe: 'tag--success' }
}

/** Convites compartilháveis por grupo (C07). O link só aparece uma vez, ao ser gerado. */
export default function Convites() {
  const conta = useContaConectada()
  const toast = useToast()
  const [congregacoes, setCongregacoes] = useState<{ id: string; nome: string }[]>([])
  const [lista, setLista] = useState<ConviteLinha[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [escolha, setEscolha] = useState('')
  const [dias, setDias] = useState(30)
  const [gerando, setGerando] = useState(false)
  const [gerado, setGerado] = useState<Gerado | null>(null)
  const [cancelar, setCancelar] = useState<ConviteLinha | null>(null)

  const [versao, setVersao] = useState(0)
  const carregar = useCallback(() => setVersao((v) => v + 1), [])
  const admin = ehAdmin(conta)

  useEffect(() => {
    let ativo = true
    Promise.all([
      supabase
        .from('convites')
        .select('id, grupo, criado_em, expira_em, revogado_em, cadastros, congregacoes(nome)')
        .order('criado_em', { ascending: false })
        .limit(50),
      admin ? supabase.from('congregacoes').select('id, nome').eq('ativa', true).order('nome') : null,
    ]).then(([convites, congs]) => {
      if (!ativo) return
      if (convites.error) {
        setErro(mensagemDeErro(convites.error))
      } else {
        setErro(null)
        setLista(convites.data as unknown as ConviteLinha[])
      }
      if (congs?.data) setCongregacoes(congs.data)
    })
    return () => {
      ativo = false
    }
  }, [versao, admin])

  const escopos = useMemo(() => escoposDeConvite(conta, congregacoes), [conta, congregacoes])
  const chave = (e: { congregacao_id: string; grupo: Grupo }) => `${e.congregacao_id}|${e.grupo}`
  const selecionado = escopos.find((e) => chave(e) === escolha) ?? escopos[0]

  async function gerar() {
    if (!selecionado) return
    setGerando(true)
    const { data, error } = await supabase.rpc('criar_convite', {
      p_congregacao: selecionado.congregacao_id,
      p_grupo: selecionado.grupo,
      p_dias: dias,
    })
    setGerando(false)
    if (error) {
      toast.show(mensagemDeErro(error))
      return
    }
    const r = (data as { token: string; expira_em: string }[])[0]
    setGerado({
      link: `${window.location.origin}/convite/${r.token}`,
      congregacao: selecionado.congregacao,
      grupo: selecionado.grupo,
      expira_em: r.expira_em,
    })
    carregar()
  }

  async function confirmarCancelamento() {
    if (!cancelar) return
    const { error } = await supabase.rpc('revogar_convite', { p_convite: cancelar.id })
    setCancelar(null)
    toast.show(error ? mensagemDeErro(error) : 'Convite cancelado. O link deixou de funcionar.')
    carregar()
  }

  const textoConvite = gerado
    ? `Você foi convidado para o Eu Vou, grupo de ${NOME_GRUPO[gerado.grupo]} da ${gerado.congregacao}. ` +
      `Crie sua conta por este link (válido até ${dataCurta.format(new Date(gerado.expira_em))}): ${gerado.link}`
    : ''

  async function copiar() {
    try {
      await navigator.clipboard.writeText(gerado!.link)
      toast.show('Link copiado.')
    } catch {
      toast.show('Não foi possível copiar. Selecione o link e copie manualmente.')
    }
  }

  return (
    <div className="stack" style={{ gap: 20 }}>
      <section className="card card--pad stack" style={{ gap: 14 }} aria-labelledby="novo-convite">
        <h2 id="novo-convite" style={{ fontSize: 16 }}>
          Gerar link de convite
        </h2>
        {escopos.length === 0 ? (
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
            {ehAdmin(conta) ? 'Cadastre uma congregação ativa para gerar convites.' : 'Sua função não gera convites.'}
          </p>
        ) : (
          <>
            <div className="field">
              <label className="field__label" htmlFor="conv-grupo">
                Grupo
              </label>
              <select
                id="conv-grupo"
                className="input campo-select"
                value={selecionado ? chave(selecionado) : ''}
                onChange={(e) => setEscolha(e.target.value)}
              >
                {escopos.map((e) => (
                  <option key={chave(e)} value={chave(e)}>
                    {NOME_GRUPO[e.grupo]} · {e.congregacao}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="conv-dias">
                Validade
              </label>
              <select
                id="conv-dias"
                className="input campo-select"
                value={dias}
                onChange={(e) => setDias(Number(e.target.value))}
              >
                <option value={7}>7 dias</option>
                <option value={30}>30 dias</option>
                <option value={90}>90 dias</option>
              </select>
              <span className="field__hint">
                Quem se cadastrar pelo link fica em análise até a aprovação da direção.
              </span>
            </div>
            <div>
              <Button icon={<LinkSimpleIcon size={18} />} loading={gerando} onClick={gerar}>
                Gerar link
              </Button>
            </div>
          </>
        )}
      </section>

      {gerado ? (
        <section className="card card--pad stack" style={{ gap: 12 }} aria-live="polite">
          <Alert tone="warning" title="Compartilhe agora">
            Por segurança, este link não pode ser exibido de novo. Se perder, gere outro e cancele este.
          </Alert>
          <div className="link-gerado">{gerado.link}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a
              className="btn btn--primary"
              href={`https://wa.me/?text=${encodeURIComponent(textoConvite)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappLogoIcon size={18} aria-hidden="true" />
              Enviar no WhatsApp
            </a>
            <Button variant="secondary" icon={<CopyIcon size={18} />} onClick={copiar}>
              Copiar link
            </Button>
            {typeof navigator.share === 'function' ? (
              <Button
                variant="secondary"
                icon={<ShareNetworkIcon size={18} />}
                onClick={() => navigator.share({ text: textoConvite }).catch(() => {})}
              >
                Compartilhar
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="stack" style={{ gap: 10 }} aria-labelledby="convites-lista">
        <h2 id="convites-lista" style={{ fontSize: 16 }}>
          Convites gerados
        </h2>
        {erro ? (
          <Alert tone="error" role="alert">
            {erro}
          </Alert>
        ) : !lista ? (
          <Spinner label="Carregando convites" />
        ) : lista.length === 0 ? (
          <div className="card">
            <EmptyState icon={LinkSimpleIcon} title="Nenhum convite gerado ainda" />
          </div>
        ) : (
          <div className="list">
            {lista.map((c) => {
              const s = situacao(c)
              return (
                <div key={c.id} className="list__row" style={{ flexWrap: 'wrap' }}>
                  <span className="list__body">
                    <span className="list__title">
                      {NOME_GRUPO[c.grupo]} · {c.congregacoes?.nome}
                    </span>
                    <span className="list__sub">
                      Gerado em {dataCurta.format(new Date(c.criado_em))} · válido até{' '}
                      {dataCurta.format(new Date(c.expira_em))} · {c.cadastros}{' '}
                      {c.cadastros === 1 ? 'cadastro' : 'cadastros'}
                    </span>
                  </span>
                  <span className={`tag ${s.classe}`}>{s.texto}</span>
                  {s.texto === 'Ativo' ? (
                    <Button variant="text-danger" onClick={() => setCancelar(c)}>
                      Cancelar
                    </Button>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <Modal
        open={!!cancelar}
        onClose={() => setCancelar(null)}
        title="Cancelar este convite?"
        text="O link deixa de funcionar imediatamente. Cadastros já feitos por ele continuam como estão."
        actions={
          <>
            <Button variant="secondary" onClick={() => setCancelar(null)}>
              Manter
            </Button>
            <Button variant="danger-solid" onClick={confirmarCancelamento}>
              Cancelar convite
            </Button>
          </>
        }
      />
    </div>
  )
}
