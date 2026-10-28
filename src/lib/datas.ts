// Datas sempre no horário de Recife (premissa do Lote 1), independentemente do aparelho.
const TZ = 'America/Recife'

const fmt = (opcoes: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, ...opcoes })

const fHora = fmt({ hour: '2-digit', minute: '2-digit' })
const fDiaMes = fmt({ day: '2-digit', month: '2-digit' })
const fSemanaCurta = fmt({ weekday: 'short' })
const fSemanaLonga = fmt({ weekday: 'long' })
const fDiaLongo = fmt({ day: 'numeric', month: 'long' })
const fChaveDia = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' })
const fMesAno = fmt({ month: 'long', year: 'numeric' })

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "18h00" */
export const hora = (d: Date | string) => fHora.format(new Date(d)).replace(':', 'h')
/** "25/10" */
export const diaMes = (d: Date | string) => fDiaMes.format(new Date(d))
/** "Dom" */
export const semanaCurta = (d: Date | string) => capital(fSemanaCurta.format(new Date(d)).replace('.', ''))
/** "Domingo" */
export const semanaLonga = (d: Date | string) => capital(fSemanaLonga.format(new Date(d)))
/** "Domingo, 25 de outubro" */
export const diaPorExtenso = (d: Date | string) => `${semanaLonga(d)}, ${fDiaLongo.format(new Date(d))}`
/** "outubro de 2026" */
export const mesPorExtenso = (mesIso: string) => fMesAno.format(new Date(`${mesIso}T12:00:00Z`))
/** "outubro" */
export const nomeDoMes = (mesIso: string) => mesPorExtenso(mesIso).split(' de ')[0]
/** Chave do dia em Recife: "2026-10-25". */
export const chaveDia = (d: Date | string) => {
  const p = fChaveDia.formatToParts(new Date(d))
  const v = (t: string) => p.find((x) => x.type === t)?.value
  return `${v('year')}-${v('month')}-${v('day')}`
}
/** Hoje em Recife como "AAAA-MM-DD". */
export const hojeIso = () => chaveDia(new Date())
/** Soma dias a "AAAA-MM-DD". */
export const somarDias = (iso: string, dias: number) => {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}
/** Primeiro dia do mês atual em Recife: "2026-10-01". */
export const mesAtualIso = () => `${hojeIso().slice(0, 7)}-01`
/** Mês anterior/seguinte de "AAAA-MM-01". */
export const somarMeses = (mesIso: string, n: number) => {
  const d = new Date(`${mesIso}T12:00:00Z`)
  d.setUTCMonth(d.getUTCMonth() + n, 1)
  return d.toISOString().slice(0, 10)
}
/** "18h00 – 20h30" */
export const faixaHoraria = (inicio: string, fim: string) => `${hora(inicio)} – ${hora(fim)}`
/** "hoje, 20h30" / "26/10, 20h30" */
export const quando = (d: string) => (chaveDia(d) === hojeIso() ? `hoje, ${hora(d)}` : `${diaMes(d)}, ${hora(d)}`)
