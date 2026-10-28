import { useCallback, useEffect, useState } from 'react'
import { CheckIcon, UserCheckIcon, XIcon } from '@phosphor-icons/react'
import { Alert, Avatar, Button, EmptyState, Modal, Spinner, TextArea, useToast } from '../../components/ui'
import { useContaConectada } from '../../app/conta/ContaProvider'
import { supabase } from '../../lib/supabase'
import { mensagemDeErro } from '../../lib/erros'
import { NOME_GRUPO, type Grupo } from '../../lib/conta'

type Pendente = {
  vinculo_id: string
  perfil_id: string
  nome_completo: string
  usuario: string
  grupo: Grupo
  congregacao: string
  idade: number
  whatsapp: string | null
  nascimento: string | null
  criado_em: string
}

const dataHora = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Recife',
})
const data = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' })

function formatarFone(d: string) {
  return d.length === 11
    ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
}

/** Cadastros aguardando aprovação do vínculo, no escopo de quem consulta (C08, C09). */
export default function Cadastros() {
  const conta = useContaConectada()
  const toast = useToast()
  const [lista, setLista] = useState<Pendente[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [aprovar, setAprovar] = useState<Pendente | null>(null)
  const [recusar, setRecusar] = useState<Pendente | null>(null)
  const [motivo, setMotivo] = useState('')
  const [salvando, setSalvando] = useState(false)

  const [versao, setVersao] = useState(0)
  const carregar = useCallback(() => setVersao((v) => v + 1), [])

  useEffect(() => {
    let ativo = true
    supabase.rpc('listar_cadastros_pendentes').then(({ data: linhas, error }) => {
      if (!ativo) return
      if (error) {
        setErro(mensagemDeErro(error))
        return
      }
      setErro(null)
      setLista(linhas as Pendente[])
    })
    return () => {
      ativo = false
    }
  }, [versao, conta.perfil?.id])

  async function decidir(item: Pendente, aprovado: boolean) {
    setSalvando(true)
    const { error } = await supabase.rpc('decidir_vinculo', {
      p_vinculo: item.vinculo_id,
      p_aprovar: aprovado,
      p_motivo: aprovado ? null : motivo,
    })
    setSalvando(false)
    setAprovar(null)
    setRecusar(null)
    setMotivo('')
    if (error) {
      toast.show(mensagemDeErro(error))
    } else {
      toast.show(
        aprovado ? `${item.nome_completo} agora participa do grupo.` : 'Cadastro recusado. A pessoa verá o motivo.',
      )
    }
    carregar()
  }

  if (erro) {
    return (
      <Alert tone="error" role="alert" title="Não foi possível carregar os cadastros">
        {erro}{' '}
        <Button variant="text" onClick={carregar}>
          Tentar de novo
        </Button>
      </Alert>
    )
  }
  if (!lista) return <Spinner label="Carregando cadastros" />
  if (lista.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={UserCheckIcon} title="Nenhum cadastro aguardando aprovação">
          Quando alguém se cadastrar por um convite do seu escopo, aparece aqui.
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
        Confirme apenas quem você reconhece como participante do grupo indicado. A decisão fica registrada no histórico.
      </p>
      <div className="grade-cartoes">
        {lista.map((p) => (
          <article key={p.vinculo_id} className="card cartao-decisao" aria-label={p.nome_completo}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Avatar name={p.nome_completo} seed={p.perfil_id} size={44} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{p.nome_completo}</div>
                <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>@{p.usuario}</div>
              </div>
              <span className="tag tag--brand">{NOME_GRUPO[p.grupo]}</span>
            </div>
            <div className="cartao-decisao__dados">
              <div>
                <span className="cartao-decisao__rotulo">Congregação</span>
                {p.congregacao}
              </div>
              <div>
                <span className="cartao-decisao__rotulo">Idade</span>
                {p.idade} anos
              </div>
              {p.nascimento ? (
                <div>
                  <span className="cartao-decisao__rotulo">Nascimento</span>
                  {data.format(new Date(p.nascimento))}
                </div>
              ) : null}
              {p.whatsapp ? (
                <div>
                  <span className="cartao-decisao__rotulo">WhatsApp</span>
                  {formatarFone(p.whatsapp)}
                </div>
              ) : null}
              <div>
                <span className="cartao-decisao__rotulo">Cadastrado em</span>
                {dataHora.format(new Date(p.criado_em))}
              </div>
            </div>
            <div className="cartao-decisao__acoes">
              <Button icon={<CheckIcon size={18} />} onClick={() => setAprovar(p)}>
                Aprovar participação
              </Button>
              <Button variant="danger" icon={<XIcon size={18} />} onClick={() => setRecusar(p)}>
                Recusar
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={!!aprovar}
        onClose={() => setAprovar(null)}
        title="Aprovar participação?"
        text={
          aprovar
            ? `${aprovar.nome_completo} passa a participar de ${NOME_GRUPO[aprovar.grupo]} na ${aprovar.congregacao} e poderá registrar presenças.`
            : ''
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setAprovar(null)}>
              Cancelar
            </Button>
            <Button icon={<CheckIcon size={18} />} loading={salvando} onClick={() => aprovar && decidir(aprovar, true)}>
              Aprovar
            </Button>
          </>
        }
      />

      <Modal
        open={!!recusar}
        onClose={() => {
          setRecusar(null)
          setMotivo('')
        }}
        title={recusar ? `Recusar cadastro de ${recusar.nome_completo.split(' ')[0]}?` : ''}
        actions={
          <>
            <Button variant="secondary" onClick={() => setRecusar(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger-solid"
              loading={salvando}
              disabled={!motivo.trim()}
              onClick={() => recusar && decidir(recusar, false)}
            >
              Confirmar recusa
            </Button>
          </>
        }
      >
        <TextArea
          label="Mensagem que a pessoa verá"
          maxLength={300}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ex.: não identificamos você como participante deste grupo. Fale com a direção."
          hint="Use linguagem respeitosa e objetiva. Fica registrada no histórico."
        />
      </Modal>
    </div>
  )
}
