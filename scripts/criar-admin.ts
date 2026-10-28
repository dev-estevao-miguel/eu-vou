// Cria o PRIMEIRO administrador da plataforma. Executado pelo Estevão no próprio terminal:
//
//   npm run criar-admin
//
// - Lê VITE_SUPABASE_URL e SUPABASE_SECRET_KEY do .env.local (ignorado pelo git).
// - A senha é digitada sem aparecer na tela e nunca é gravada.
// - Recusa-se a rodar se já existir um administrador ativo: os próximos são concedidos pela
//   tela de Funções, por um administrador existente.
import readline from 'node:readline'
import { createClient } from '@supabase/supabase-js'
import {
  apenasDigitos,
  emailTecnico,
  nomeExibicaoPadrao,
  normalizarUsuario,
  validarCadastro,
} from '../supabase/functions/_shared/regras.ts'

function perguntar(rl: readline.Interface, texto: string) {
  return new Promise<string>((resolve) => rl.question(texto, resolve))
}

/** Lê sem ecoar os caracteres (senha). */
function perguntarOculto(texto: string) {
  return new Promise<string>((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    const saida = rl as unknown as { _writeToOutput: (s: string) => void }
    let mostrandoPergunta = true
    saida._writeToOutput = (s: string) => {
      if (mostrandoPergunta) process.stdout.write(s)
      else if (s.includes('\n')) process.stdout.write('\n')
    }
    rl.question(texto, (resposta) => {
      rl.close()
      resolve(resposta)
    })
    mostrandoPergunta = false
  })
}

async function main() {
  const url = process.env.VITE_SUPABASE_URL ?? ''
  const chave = process.env.SUPABASE_SECRET_KEY ?? ''
  if (!url || !chave) {
    console.error('Preencha VITE_SUPABASE_URL e SUPABASE_SECRET_KEY no arquivo .env.local.')
    process.exit(1)
  }
  if (!chave.startsWith('sb_secret_')) {
    console.error('SUPABASE_SECRET_KEY deve ser a chave secreta (começa com sb_secret_), não a publicável.')
    process.exit(1)
  }
  const admin = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } })

  const { count, error: erroContagem } = await admin
    .from('funcoes')
    .select('id', { count: 'exact', head: true })
    .eq('funcao', 'admin')
    .is('revogada_em', null)
  if (erroContagem) {
    console.error('Não foi possível consultar o banco:', erroContagem.message)
    process.exit(1)
  }
  if ((count ?? 0) > 0) {
    console.error('Já existe um administrador. Novos administradores são concedidos pela tela de Funções.')
    process.exit(1)
  }

  console.log('Criação do primeiro administrador do Eu Vou\n')
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const usuario = normalizarUsuario(await perguntar(rl, 'Nome de usuário: '))
  const nomeCompleto = (await perguntar(rl, 'Nome completo: ')).trim().replace(/\s+/g, ' ')
  const whatsapp = await perguntar(rl, 'WhatsApp com DDD: ')
  const nascimento = (await perguntar(rl, 'Data de nascimento (AAAA-MM-DD): ')).trim()
  rl.close()
  const senha = await perguntarOculto('Senha (não aparece na tela): ')
  const confirmacao = await perguntarOculto('Confirme a senha: ')

  const erros = validarCadastro({ token: 'nao-se-aplica', usuario, senha, nomeCompleto, whatsapp, nascimento })
  if (senha !== confirmacao) erros.senha = 'As senhas não são iguais.'
  if (Object.keys(erros).length > 0) {
    for (const [campo, msg] of Object.entries(erros)) console.error(`- ${campo}: ${msg}`)
    process.exit(1)
  }

  const { data: criado, error: erroAuth } = await admin.auth.admin.createUser({
    email: emailTecnico(usuario),
    password: senha,
    email_confirm: true,
  })
  if (erroAuth || !criado.user) {
    console.error('Não foi possível criar a conta no Auth:', erroAuth?.message)
    process.exit(1)
  }
  const id = criado.user.id

  const passos = [
    () =>
      admin.from('perfis').insert({
        id,
        usuario,
        nome_completo: nomeCompleto,
        nome_exibicao: nomeExibicaoPadrao(nomeCompleto),
        whatsapp: apenasDigitos(whatsapp),
        nascimento,
        teste: false,
      }),
    () => admin.from('funcoes').insert({ perfil_id: id, funcao: 'admin' }),
    () =>
      admin.from('auditoria').insert({
        ator_id: id,
        acao: 'primeiro_admin_criado',
        alvo_tipo: 'perfil',
        alvo_id: id,
        justificativa: 'Criação inicial por script local',
      }),
  ]
  for (const passo of passos) {
    const { error } = await passo()
    if (error) {
      await admin.auth.admin.deleteUser(id)
      console.error('Falha ao registrar o administrador; a conta foi desfeita:', error.message)
      process.exit(1)
    }
  }
  console.log(`\nAdministrador criado. Entre no app com o usuário "${usuario}".`)
  console.log('Se quiser, apague agora o valor de SUPABASE_SECRET_KEY no .env.local; o app não precisa dele.')
}

void main()
