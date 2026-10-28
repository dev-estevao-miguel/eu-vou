import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { TimerIcon, UserMinusIcon, WifiSlashIcon } from '@phosphor-icons/react'
import { Alert, Button, LogoHorizontal, PasswordField, Sheet, TextField } from '../components/ui'
import { useConta, type FalhaEntrada } from '../app/conta/ContaProvider'
import { destinoInicial } from '../lib/conta'
import { isTestEnvironment } from '../lib/env'

/** A01 · Entrada. As mensagens nunca revelam se uma conta existe. */
export default function Entrar() {
  const { estado, entrar } = useConta()
  const navegar = useNavigate()
  const local = useLocation()
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [falha, setFalha] = useState<FalhaEntrada | null>(null)
  const [camposVazios, setCamposVazios] = useState({ usuario: false, senha: false })
  const [painel, setPainel] = useState<'cadastro' | 'senha' | null>(null)

  const aviso = estado.status === 'anonimo' ? estado.aviso : undefined
  const motivo: FalhaEntrada | 'sessao_expirada' | null = falha ?? aviso ?? null

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const vazios = { usuario: !usuario.trim(), senha: !senha }
    setCamposVazios(vazios)
    if (vazios.usuario || vazios.senha) return
    setEnviando(true)
    setFalha(null)
    const r = await entrar(usuario, senha)
    setEnviando(false)
    if (!r.ok) {
      setFalha(r.falha)
      if (r.falha === 'credenciais') setSenha('')
      return
    }
    const volta = (local.state as { volta?: string } | null)?.volta
    navegar(volta && volta !== '/' ? volta : destinoInicial(r.conta), { replace: true })
  }

  const erroCredenciais = motivo === 'credenciais'

  return (
    <div
      className="screen"
      style={{ padding: 'calc(20px + var(--safe-top)) 20px calc(16px + var(--safe-bottom))', gap: 20 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 24 }}>
        <LogoHorizontal />
        {isTestEnvironment ? <span className="env-badge">Ambiente de teste</span> : null}
      </div>
      <div className="stack" style={{ gap: 8 }}>
        <h1 style={{ fontSize: 26, lineHeight: 1.2 }}>Que bom ter você com a gente.</h1>
        <p style={{ color: 'var(--color-muted)' }}>
          Entre para ver a agenda, registrar presença e acompanhar sua participação.
        </p>
      </div>

      {erroCredenciais ? (
        <Alert tone="error" role="alert" title="Não foi possível entrar">
          Confira o nome de usuário e a senha e tente novamente.
        </Alert>
      ) : motivo === 'desativada' ? (
        <Alert tone="neutral" role="alert" icon={UserMinusIcon} title="Este acesso está desativado">
          Para voltar a participar, fale com a direção do seu grupo.
        </Alert>
      ) : motivo === 'tentativas' ? (
        <Alert tone="warning" role="alert" icon={TimerIcon} title="Muitas tentativas seguidas">
          Por segurança, aguarde alguns minutos para tentar de novo. Se esqueceu a senha, use a recuperação.
        </Alert>
      ) : motivo === 'rede' ? (
        <Alert tone="error" role="alert" icon={WifiSlashIcon} title="Sem conexão">
          Confira a internet e tente de novo.
        </Alert>
      ) : motivo === 'sessao_expirada' ? (
        <Alert tone="info" title="Sua sessão terminou">
          Entre de novo para continuar.
        </Alert>
      ) : motivo === 'incompleta' || motivo === 'desconhecida' ? (
        <Alert tone="error" role="alert" title="Não foi possível entrar">
          Tente de novo em instantes. Se continuar, fale com a direção do seu grupo.
        </Alert>
      ) : null}

      <form className="stack" style={{ gap: 16 }} onSubmit={enviar} noValidate>
        <TextField
          label="Nome de usuário"
          name="usuario"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="ex.: anaclara.m"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          error={camposVazios.usuario ? 'Informe seu nome de usuário.' : undefined}
          aria-invalid={erroCredenciais || camposVazios.usuario || undefined}
        />
        <PasswordField
          label="Senha"
          name="senha"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          error={camposVazios.senha ? 'Informe sua senha.' : undefined}
          aria-invalid={erroCredenciais || camposVazios.senha || undefined}
        />
        <div className="stack" style={{ gap: 10 }}>
          <Button type="submit" size="md" block loading={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </Button>
          <Button size="md" variant="secondary" block onClick={() => setPainel('cadastro')}>
            Criar minha conta
          </Button>
          <Button variant="text" onClick={() => setPainel('senha')}>
            Esqueci minha senha
          </Button>
        </div>
      </form>

      <p style={{ marginTop: 'auto', textAlign: 'center', fontSize: 12, color: 'var(--color-muted)' }}>
        Design e desenvolvimento por Estevão Miguel
      </p>

      <Sheet open={painel === 'cadastro'} onClose={() => setPainel(null)} title="Como criar sua conta">
        <p style={{ fontSize: 15, color: 'var(--color-muted)' }}>
          O cadastro é feito pelo link de convite enviado pela direção do seu grupo. Peça o link e abra-o neste celular.
        </p>
        <Button size="md" variant="secondary" block onClick={() => setPainel(null)}>
          Entendi
        </Button>
      </Sheet>
      <Sheet open={painel === 'senha'} onClose={() => setPainel(null)} title="Esqueci minha senha">
        <p style={{ fontSize: 15, color: 'var(--color-muted)' }}>
          A recuperação pelo WhatsApp ainda está sendo preparada. Por enquanto, fale com a direção do seu grupo.
        </p>
        <Button size="md" variant="secondary" block onClick={() => setPainel(null)}>
          Entendi
        </Button>
      </Sheet>
    </div>
  )
}
