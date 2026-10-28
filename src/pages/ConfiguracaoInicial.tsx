import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { LinkBreakIcon, ShieldCheckIcon } from '@phosphor-icons/react'
import { Alert, Button, EmptyState, LogoHorizontal, PasswordField, Spinner, TextField } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useConta } from '../app/conta/ContaProvider'
import { codigoDeErroDaFuncao, mascaraFone } from '../lib/formatos'
import {
  validarCadastro,
  validarUsuario,
  type DadosCadastro,
  type ErrosCadastro,
} from '../../supabase/functions/_shared/regras.ts'

type Situacao = 'carregando' | 'valido' | 'invalido' | 'concluida' | 'erro'

const ERROS: Record<string, string> = {
  usuario_indisponivel: 'Este nome de usuário já está em uso. Escolha outro.',
  link_invalido: 'Este link de configuração não é mais válido.',
  ja_configurado: 'O administrador já foi configurado. Entre pela tela inicial.',
}

/** Criação do PRIMEIRO administrador pelo link de configuração inicial (uso único, com validade). */
export default function ConfiguracaoInicial() {
  const { token = '' } = useParams()
  const navegar = useNavigate()
  const { entrar } = useConta()
  const [situacao, setSituacao] = useState<Situacao>('carregando')
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
    supabase.rpc('situacao_configuracao_inicial', { p_token: token }).then(({ data, error }) => {
      if (ativo) setSituacao(error ? 'erro' : (data as Situacao))
    })
    return () => {
      ativo = false
    }
  }, [token])

  const campo = (k: keyof DadosCadastro) => (v: string) => setDados((d) => ({ ...d, [k]: v }))

  async function concluir(e: FormEvent) {
    e.preventDefault()
    const todos: ErrosCadastro & { confirmacao?: string } = validarCadastro(dados)
    if (!todos.senha && confirmacao !== dados.senha) todos.confirmacao = 'As senhas não são iguais.'
    setErros(todos)
    if (Object.keys(todos).length > 0) return
    setEnviando(true)
    setErroGeral(null)
    const { error } = await supabase.functions.invoke('configurar-admin', { body: dados })
    if (error) {
      const { codigo, detalhe } = await codigoDeErroDaFuncao(error)
      setEnviando(false)
      if (codigo === 'usuario_indisponivel') setErros((x) => ({ ...x, usuario: ERROS[codigo] }))
      else
        setErroGeral(
          ERROS[codigo] ??
            (codigo === 'falha_auth'
              ? `O serviço de login recusou a criação da conta (${detalhe || 'sem detalhe'}).`
              : 'Não foi possível concluir. Confira a internet e tente de novo.'),
        )
      return
    }
    const r = await entrar(dados.usuario, dados.senha)
    navegar(r.ok ? '/gestao' : '/entrar', { replace: true })
  }

  if (situacao === 'carregando') {
    return (
      <div className="screen" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Spinner label="Conferindo o link" />
      </div>
    )
  }
  if (situacao !== 'valido') {
    return (
      <div className="screen" style={{ justifyContent: 'center', padding: 20, gap: 12 }}>
        <EmptyState
          icon={LinkBreakIcon}
          title={situacao === 'concluida' ? 'O administrador já foi configurado' : 'Link de configuração inválido'}
        >
          {situacao === 'concluida'
            ? 'Entre com seu usuário e senha pela tela inicial.'
            : situacao === 'erro'
              ? 'Confira a internet e abra o link de novo.'
              : 'Este link expirou ou já foi usado.'}
        </EmptyState>
        <Button variant="secondary" onClick={() => navegar('/entrar')}>
          Ir para a entrada
        </Button>
      </div>
    )
  }

  return (
    <div
      className="screen"
      style={{ padding: 'calc(20px + var(--safe-top)) 20px calc(24px + var(--safe-bottom))', gap: 20 }}
    >
      <LogoHorizontal />
      <div className="stack" style={{ gap: 8 }}>
        <h1 style={{ fontSize: 24 }}>Configuração inicial</h1>
        <p style={{ color: 'var(--color-muted)' }}>
          Crie a conta do administrador da plataforma. Este link funciona uma única vez.
        </p>
      </div>
      <Alert tone="info" icon={ShieldCheckIcon} title="Acesso total">
        O administrador vê e gerencia todas as congregações. Escolha uma senha forte e não a compartilhe.
      </Alert>
      {erroGeral ? (
        <Alert tone="error" role="alert" title="Configuração não concluída">
          {erroGeral}
        </Alert>
      ) : null}
      <form className="stack" style={{ gap: 16 }} onSubmit={concluir} noValidate>
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
        />
        <TextField
          label="Data de nascimento"
          type="date"
          autoComplete="bday"
          value={dados.nascimento}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => campo('nascimento')(e.target.value)}
          error={erros.nascimento}
        />
        <TextField
          label="Nome de usuário"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="ex.: maria.silva"
          value={dados.usuario}
          onChange={(e) => campo('usuario')(e.target.value)}
          onBlur={() => setErros((x) => ({ ...x, usuario: dados.usuario ? validarUsuario(dados.usuario) : x.usuario }))}
          error={erros.usuario}
          hint="Sem espaços. É com ele que você entra no app."
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
          {enviando ? 'Criando administrador…' : 'Criar administrador e entrar'}
        </Button>
      </form>
    </div>
  )
}
