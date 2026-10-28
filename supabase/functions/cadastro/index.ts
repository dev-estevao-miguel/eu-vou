// Edge Function pública: conclui o autocadastro a partir de um convite (decisões C02, C03, C07).
// O grupo e a congregação vêm do convite — nunca do formulário — e nenhuma função de
// liderança pode ser atribuída aqui. A chave secreta existe apenas neste servidor.
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

  const { data: convite, error: erroConvite } = await admin.rpc('consultar_convite', { p_token: dados.token })
  if (erroConvite) {
    console.error('consultar_convite', erroConvite.message)
    return resposta(500, { erro: 'falha_interna' })
  }
  const situacao = convite?.[0]?.situacao ?? 'invalido'
  if (situacao !== 'valido') return resposta(400, { erro: `convite_${situacao}` })

  const usuario = normalizarUsuario(dados.usuario)
  const { data: existente } = await admin.from('perfis').select('id').eq('usuario', usuario).maybeSingle()
  if (existente) return resposta(409, { erro: 'usuario_indisponivel' })

  const { data: criado, error: erroAuth } = await admin.auth.admin.createUser({
    email: emailTecnico(usuario),
    password: dados.senha,
    email_confirm: true,
  })
  if (erroAuth || !criado.user) {
    // E-mail técnico já existente = nome de usuário já usado.
    if (erroAuth?.status === 422 || /already/i.test(erroAuth?.message ?? '')) {
      return resposta(409, { erro: 'usuario_indisponivel' })
    }
    console.error('createUser', erroAuth?.status, erroAuth?.message)
    return resposta(500, { erro: 'falha_interna' })
  }

  const nomeCompleto = dados.nomeCompleto.trim().replace(/\s+/g, ' ')
  const { error: erroRegistro } = await admin.rpc('registrar_cadastro', {
    p_usuario_id: criado.user.id,
    p_token: dados.token,
    p_usuario: usuario,
    p_nome_completo: nomeCompleto,
    p_nome_exibicao: nomeExibicaoPadrao(nomeCompleto),
    p_whatsapp: apenasDigitos(dados.whatsapp),
    p_nascimento: dados.nascimento,
  })
  if (erroRegistro) {
    // Desfaz a conta do Auth para não deixar usuário sem perfil.
    await admin.auth.admin.deleteUser(criado.user.id)
    if (/convite_invalido/.test(erroRegistro.message)) return resposta(400, { erro: 'convite_invalido' })
    if (erroRegistro.code === '23505') return resposta(409, { erro: 'usuario_indisponivel' })
    console.error('registrar_cadastro', erroRegistro.code, erroRegistro.message)
    return resposta(500, { erro: 'falha_interna' })
  }

  return resposta(201, { ok: true })
})
