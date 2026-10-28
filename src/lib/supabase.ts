import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export const supabaseConfigurado = Boolean(env.supabaseUrl && env.supabasePublishableKey)

// Sessão guardada pelo próprio Supabase Auth (renovação automática do token).
// Sem configuração, o cliente aponta para um endereço inválido e o app mostra o aviso de configuração.
export const supabase = createClient(
  env.supabaseUrl || 'http://configuracao-ausente.invalid',
  env.supabasePublishableKey || 'configuracao-ausente',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
)
