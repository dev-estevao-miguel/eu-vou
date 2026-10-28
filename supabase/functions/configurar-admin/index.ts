// Edge Function pública: cria o PRIMEIRO administrador a partir do link de configuração inicial
// (uso único, com validade). Não funciona se já existir um administrador.
import { createClient } from 'npm:@supabase/supabase-js@2.118.0'
import {
  apenasDigitos,
  emailTecnico,
  nomeExibicaoPadrao,
  normalizarUsuario,
  validarCadastro,
  type DadosCadastro,
} from '../_shared/regras.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function resposta(status: number, corpo: Record<string, unknown>) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function chaveSecreta() {
  const novas = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (novas) return JSON.parse(novas).default as string
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return resposta(405, { erro: 'metodo_invalido' })

  let entrada: Partial<DadosCadastro>
  try {
    entrada = await req.json()
  } catch {
    return resposta(400, { erro: 'dados_invalidos' })
  }

  const dados: DadosCadastro = {
    token: String(entrada.token ?? ''),
    usuario: String(entrada.usuario ?? ''),
    senha: String(entrada.senha ?? ''),
    nomeCompleto: String(entrada.nomeCompleto ?? ''),
    whatsapp: String(entrada.whatsapp ?? ''),
    nascimento: String(entrada.nascimento ?? ''),
  }
  const erros = validarCadastro(dados)
  if (Object.keys(erros).length > 0) return resposta(400, { erro: 'dados_invalidos', campos: erros })

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, chaveSecreta(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: situacao, error: erroSituacao } = await admin.rpc('situacao_configuracao_inicial', {
    p_token: dados.token,
  })
  if (erroSituacao) {
    console.error('situacao_configuracao_inicial', erroSituacao.message)
    return resposta(500, { erro: 'falha_interna' })
  }
  if (situacao === 'concluida') return resposta(409, { erro: 'ja_configurado' })
  if (situacao !== 'valido') return resposta(400, { erro: 'link_invalido' })

  const usuario = normalizarUsuario(dados.usuario)
  const { data: criado, error: erroAuth } = await admin.auth.admin.createUser({
    email: emailTecnico(usuario),
    password: dados.senha,
    email_confirm: true,
  })
  if (erroAuth || !criado.user) {
    if (erroAuth?.status === 422 || /already/i.test(erroAuth?.message ?? '')) {
      return resposta(409, { erro: 'usuario_indisponivel' })
    }
    console.error('createUser', erroAuth?.status, erroAuth?.code, erroAuth?.message)
    return resposta(500, { erro: 'falha_auth', detalhe: erroAuth?.code ?? erroAuth?.message ?? '' })
  }

  const nomeCompleto = dados.nomeCompleto.trim().replace(/\s+/g, ' ')
  const { error: erroRegistro } = await admin.rpc('concluir_configuracao_inicial', {
    p_usuario_id: criado.user.id,
    p_token: dados.token,
    p_usuario: usuario,
    p_nome_completo: nomeCompleto,
    p_nome_exibicao: nomeExibicaoPadrao(nomeCompleto),
    p_whatsapp: apenasDigitos(dados.whatsapp),
    p_nascimento: dados.nascimento,
  })
  if (erroRegistro) {
    await admin.auth.admin.deleteUser(criado.user.id)
    if (/link_invalido/.test(erroRegistro.message)) return resposta(400, { erro: 'link_invalido' })
    if (/ja_configurado/.test(erroRegistro.message)) return resposta(409, { erro: 'ja_configurado' })
    if (erroRegistro.code === '23505') return resposta(409, { erro: 'usuario_indisponivel' })
    console.error('concluir_configuracao_inicial', erroRegistro.code, erroRegistro.message)
    return resposta(500, { erro: 'falha_interna' })
  }

  return resposta(201, { ok: true })
})
