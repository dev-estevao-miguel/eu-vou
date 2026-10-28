import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeftIcon, EnvelopeOpenIcon, LinkBreakIcon } from '@phosphor-icons/react'
import { Alert, Button, ChoiceGroup, EmptyState, IconButton, PasswordField, Spinner, TextField } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useConta } from '../app/conta/ContaProvider'
import { NOME_GRUPO, NOME_GRUPO_SINGULAR, type Grupo } from '../lib/conta'
import { codigoDeErroDaFuncao, mascaraFone } from '../lib/formatos'
import {
  validarCadastro,
  validarUsuario,
  type DadosCadastro,
  type ErrosCadastro,
} from '../../supabase/functions/_shared/regras.ts'

type Convite = { situacao: 'valido' | 'expirado' | 'revogado'; congregacao: string; igreja: string; grupo: Grupo }

const ERROS_SERVIDOR: Record<string, string> = {
  usuario_indisponivel: 'Este nome de usuário já está em uso. Escolha outro.',
  convite_expirado: 'Este convite expirou. Peça um novo link à direção do seu grupo.',
  convite_revogado: 'Este convite foi cancelado. Peça um novo link à direção do seu grupo.',
  convite_invalido: 'Este convite não é válido. Peça um novo link à direção do seu grupo.',
}

/** A02 · Cadastro por convite, em duas etapas. Congregação e grupo vêm do convite. */
export default function Cadastro() {
  const { token = '' } = useParams()
  const navegar = useNavigate()
  const { entrar } = useConta()
  const [convite, setConvite] = useState<Convite | null | 'carregando' | 'erro'>('carregando')
  const [etapa, setEtapa] = useState<1 | 2>(1)
  const [dados, setDados] = useState<DadosCadastro>({
    token,
    usuario: '',
    senha: '',
    nomeCompleto: '',
    whatsapp: '',
    nascimento: '',
  })
  const [confirmacao, setConfirmacao] = useState('')
  const [erros, setErros] = useState<ErrosCadastro & { confirmacao?: string }>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let ativo = true
    supabase.rpc('consultar_convite', { p_token: token }).then(({ data, error }) => {
      if (!ativo) return
      if (error) setConvite('erro')
      else setConvite((data as Convite[])[0] ?? null)
    })
    return () => {
      ativo = false
    }
  }, [token])

  const campo = (k: keyof DadosCadastro) => (v: string) => setDados((d) => ({ ...d, [k]: v }))

  function avancar(e: FormEvent) {
    e.preventDefault()
    const todos = validarCadastro({ ...dados, usuario: 'provisorio', senha: 'provisoria' })
    const daEtapa = { nomeCompleto: todos.nomeCompleto, whatsapp: todos.whatsapp, nascimento: todos.nascimento }
    setErros(daEtapa)
    if (!daEtapa.nomeCompleto && !daEtapa.whatsapp && !daEtapa.nascimento) setEtapa(2)
  }

  async function concluir(e: FormEvent) {
    e.preventDefault()
    const todos: ErrosCadastro & { confirmacao?: string } = validarCadastro(dados)
    if (!todos.senha && confirmacao !== dados.senha) todos.confirmacao = 'As senhas não são iguais.'
    setErros(todos)
    if (todos.usuario || todos.senha || todos.confirmacao) return
    if (todos.nomeCompleto || todos.whatsapp || todos.nascimento) {
      setEtapa(1)
      return
    }
    setEnviando(true)
    setErroGeral(null)
    const { error } = await supabase.functions.invoke('cadastro', { body: dados })
    if (error) {
      const { codigo } = await codigoDeErroDaFuncao(error)
      setEnviando(false)
      if (codigo === 'usuario_indisponivel') setErros((x) => ({ ...x, usuario: ERROS_SERVIDOR[codigo] }))
      else
        setErroGeral(
          ERROS_SERVIDOR[codigo] ??
            (navigator.onLine
              ? 'Não foi possível concluir o cadastro. Tente de novo em instantes.'
              : 'Sem conexão. Confira a internet e tente de novo; seus dados continuam aqui.'),
        )
      return
    }
    const r = await entrar(dados.usuario, dados.senha)
    navegar(r.ok ? '/conta-em-analise' : '/entrar', { replace: true })
  }

  if (convite === 'carregando') {
    return (
      <div className="screen" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Spinner label="Conferindo o convite" />
      </div>
    )
  }
  if (convite === 'erro' || convite === null || convite.situacao !== 'valido') {
    const titulo =
      convite === 'erro'
        ? 'Não foi possível abrir o convite'
        : convite === null
          ? 'Convite não encontrado'
          : convite.situacao === 'expirado'
            ? 'Este convite expirou'
            : 'Este convite foi cancelado'
    return (
      <div className="screen" style={{ justifyContent: 'center', padding: 20 }}>
        <EmptyState icon={LinkBreakIcon} title={titulo}>
          {convite === 'erro'
            ? 'Confira a internet e abra o link de novo.'
            : 'Peça um novo link à direção do seu grupo.'}
        </EmptyState>
        <Button variant="secondary" onClick={() => navegar('/entrar')}>
          Ir para a entrada
        </Button>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="screen-header screen-header--back">
        <IconButton label="Voltar" onClick={() => (etapa === 2 ? setEtapa(1) : navegar('/entrar'))}>
          <ArrowLeftIcon size={24} />
        </IconButton>
        <span style={{ fontSize: 16, fontWeight: 500, flex: 1 }}>Criar minha conta</span>
        <span style={{ fontSize: 13, color: 'var(--color-muted)', paddingRight: 10 }}>Etapa {etapa} de 2</span>
      </div>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '0 20px 12px' }}
        aria-hidden="true"
      >
        {[1, 2].map((i) => (
          <span
            key={i}
            style={{
              height: 4,
              borderRadius: 2,
              background: i <= etapa ? 'var(--color-accent)' : 'var(--color-divider)',
            }}
          />
        ))}
      </div>

      <div className="inset stack" style={{ gap: 16, paddingBottom: 24 }}>
        <Alert tone="info" icon={EnvelopeOpenIcon} title={`Convite da ${convite.congregacao}`}>
          Grupo: {NOME_GRUPO[convite.grupo]}. Depois do cadastro, a direção confirma sua participação.
        </Alert>
        {erroGeral ? (
          <Alert tone="error" role="alert" title="Cadastro não concluído">
            {erroGeral}
          </Alert>
        ) : null}

        {etapa === 1 ? (
          <form className="stack" style={{ gap: 16 }} onSubmit={avancar} noValidate>
            <h1 style={{ fontSize: 20 }}>Sobre você</h1>
            <TextField
              label="Nome completo"
              autoComplete="name"
              value={dados.nomeCompleto}
              onChange={(e) => campo('nomeCompleto')(e.target.value)}
              error={erros.nomeCompleto}
            />
            <TextField
              label="WhatsApp com DDD"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(81) 98888-7777"
              value={dados.whatsapp}
              onChange={(e) => campo('whatsapp')(mascaraFone(e.target.value))}
              error={erros.whatsapp}
              hint="Visível só para a liderança autorizada."
            />
            <TextField
              label="Data de nascimento"
              type="date"
              autoComplete="bday"
              value={dados.nascimento}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => campo('nascimento')(e.target.value)}
              error={erros.nascimento}
              hint="Visível só para a liderança autorizada."
            />
            <ChoiceGroup
              legend="Grupo"
              name="grupo"
              value={convite.grupo}
              onChange={() => {}}
              disabled
              options={[
                { value: 'adolescentes', label: NOME_GRUPO_SINGULAR.adolescentes },
                { value: 'jovens', label: NOME_GRUPO_SINGULAR.jovens },
              ]}
              hint="Definido pelo convite. Funções de liderança nunca são escolhidas no cadastro."
            />
            <Button type="submit" size="lg" block>
              Continuar
            </Button>
          </form>
        ) : (
          <form className="stack" style={{ gap: 16 }} onSubmit={concluir} noValidate>
            <h1 style={{ fontSize: 20 }}>Seu acesso</h1>
            <TextField
              label="Nome de usuário"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="ex.: anaclara.m"
              value={dados.usuario}
              onChange={(e) => campo('usuario')(e.target.value)}
              onBlur={() =>
                setErros((x) => ({ ...x, usuario: dados.usuario ? validarUsuario(dados.usuario) : x.usuario }))
              }
              error={erros.usuario}
              hint="Sem espaços. Maiúsculas e minúsculas são iguais."
            />
            <PasswordField
              label="Senha"
              autoComplete="new-password"
              value={dados.senha}
              onChange={(e) => campo('senha')(e.target.value)}
              error={erros.senha}
              hint="Pelo menos 8 caracteres."
            />
            <PasswordField
              label="Confirme a senha"
              autoComplete="new-password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              error={erros.confirmacao}
            />
            <Button type="submit" size="lg" block loading={enviando}>
              {enviando ? 'Criando conta…' : 'Criar minha conta'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
