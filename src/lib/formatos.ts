/** Formata o WhatsApp enquanto a pessoa digita: (81) 98888-7777. */
export function mascaraFone(valor: string) {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Lê o código de erro devolvido por uma Edge Function ({ erro: '...' }). */
export async function codigoDeErroDaFuncao(error: unknown) {
  try {
    const corpo = await (error as { context?: Response }).context?.json()
    return { codigo: String(corpo?.erro ?? ''), detalhe: String(corpo?.detalhe ?? '') }
  } catch {
    return { codigo: '', detalhe: '' }
  }
}
