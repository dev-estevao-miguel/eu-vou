// Configuração pública do app (somente valores que podem ir para o navegador).
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
  appEnv: import.meta.env.VITE_APP_ENV ?? 'development',
}

/** Qualquer ambiente que não seja produção usa apenas dados fictícios. */
export const isTestEnvironment = env.appEnv !== 'production'
