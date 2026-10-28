import { supabase } from './supabase'
import { useConsulta } from './useConsulta'
import type { OcorrenciaAgenda } from './agenda'

/** Uma ocorrência + o registro da pessoa conectada, no mesmo formato da agenda. */
export function useOcorrencia(id: string, perfilId: string) {
  return useConsulta<OcorrenciaAgenda | null>(`ocorrencia-${id}-${perfilId}`, async () => {
    const [o, p] = await Promise.all([
      supabase
        .from('ocorrencias')
        .select('id, titulo, tipo, publico, pontos, local, inicio, fim, cancelada_em, motivo_cancelamento')
        .eq('id', id)
        .maybeSingle(),
      supabase
        .from('presencas')
        .select('id, situacao, motivo')
        .eq('ocorrencia_id', id)
        .eq('perfil_id', perfilId)
        .maybeSingle(),
    ])
    if (o.error || p.error) return { data: null, error: o.error ?? p.error }
    if (!o.data) return { data: null, error: null }
    const fecha = new Date(new Date(o.data.fim).getTime() + 24 * 60 * 60 * 1000).toISOString()
    return {
      data: {
        ...o.data,
        cancelada: o.data.cancelada_em !== null,
        registro_abre: o.data.fim,
        registro_fecha: fecha,
        presenca_id: p.data?.id ?? null,
        presenca_situacao: p.data?.situacao ?? null,
        presenca_motivo: p.data?.motivo ?? null,
      } as OcorrenciaAgenda,
      error: null,
    }
  })
}
