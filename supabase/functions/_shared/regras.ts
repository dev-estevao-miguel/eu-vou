// Regras de cadastro compartilhadas entre o app (Vite) e as Edge Functions (Deno).
// Sem dependências: este arquivo precisa rodar nos dois ambientes.

/**
 * Domínio do e-mail técnico interno (decisão C02). O Supabase Auth exige e-mail;
 * a pessoa só conhece o nome de usuário. `.invalid` é reservado (RFC 2606) e
 * nunca recebe mensagens.
 */
export const DOMINIO_CONTAS = 'contas.euvou.invalid'

export const SENHA_MIN = 8
export const SENHA_MAX = 72

export function normalizarUsuario(valor: string) {
  return valor.trim().toLowerCase()
}

export function emailTecnico(usuario: string) {
  return `${normalizarUsuario(usuario)}@${DOMINIO_CONTAS}`
}

/** Mantém só os dígitos do WhatsApp (DDD + número). */
export function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, '')
}

/** Nome exibido no ranking por padrão: primeiro nome + inicial do último sobrenome. */
export function nomeExibicaoPadrao(nomeCompleto: string) {
  const partes = nomeCompleto.trim().split(/\s+/)
  if (partes.length === 1) return partes[0]
  return `${partes[0]} ${partes[partes.length - 1][0].toUpperCase()}.`
}

export type DadosCadastro = {
  token: string
  usuario: string
  senha: string
  nomeCompleto: string
  whatsapp: string
  nascimento: string
}

export type ErrosCadastro = Partial<Record<keyof DadosCadastro, string>>

export function validarUsuario(usuario: string): string | undefined {
  const u = normalizarUsuario(usuario)
  if (u.length < 3) return 'Use pelo menos 3 caracteres.'
  if (u.length > 30) return 'Use no máximo 30 caracteres.'
  if (!/^[a-z0-9._]+$/.test(u)) return 'Use apenas letras sem acento, números, ponto ou sublinhado.'
  if (!/^[a-z0-9].*[a-z0-9]$/.test(u)) return 'Comece e termine com letra ou número.'
  return undefined
}

export function validarCadastro(d: DadosCadastro, hoje = new Date()): ErrosCadastro {
  const erros: ErrosCadastro = {}

  if (!d.token) erros.token = 'Convite ausente.'

  const nome = d.nomeCompleto.trim().replace(/\s+/g, ' ')
  if (nome.length < 3 || nome.length > 120 || !nome.includes(' ')) {
    erros.nomeCompleto = 'Informe nome e sobrenome.'
  }

  const fone = apenasDigitos(d.whatsapp)
  if (!/^[1-9][0-9]{9,10}$/.test(fone)) erros.whatsapp = 'Informe o número completo com DDD.'

  const data = /^\d{4}-\d{2}-\d{2}$/.test(d.nascimento) ? new Date(`${d.nascimento}T12:00:00Z`) : null
  if (!data || Number.isNaN(data.getTime()) || data.getUTCFullYear() < 1900 || data > hoje) {
    erros.nascimento = 'Informe uma data de nascimento válida.'
  }

  const erroUsuario = validarUsuario(d.usuario)
  if (erroUsuario) erros.usuario = erroUsuario

  if (d.senha.length < SENHA_MIN) erros.senha = `Use pelo menos ${SENHA_MIN} caracteres.`
  else if (d.senha.length > SENHA_MAX) erros.senha = `Use no máximo ${SENHA_MAX} caracteres.`

  return erros
}
