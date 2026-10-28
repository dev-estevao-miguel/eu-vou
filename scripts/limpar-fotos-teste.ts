// Remove do Storage as fotos de comprovação das contas de TESTE (perfis.teste = true).
// Precisa rodar ANTES de supabase/testes/limpar-dados-teste.sql: apagar linhas do Storage por SQL
// deixaria os arquivos órfãos. Sem `--confirmar`, só lista o que seria apagado.
//
//   npm run limpar-fotos-teste                 # simulação
//   npm run limpar-fotos-teste -- --confirmar  # apaga
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'comprovantes'
const confirmar = process.argv.includes('--confirmar')

async function main() {
  const url = process.env.VITE_SUPABASE_URL ?? ''
  const chave = process.env.SUPABASE_SECRET_KEY ?? ''
  if (!url || !chave.startsWith('sb_secret_')) {
    console.error('Preencha VITE_SUPABASE_URL e SUPABASE_SECRET_KEY (sb_secret_...) no .env.local.')
    process.exit(1)
  }
  const admin = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: perfis, error } = await admin.from('perfis').select('id, usuario').eq('teste', true)
  if (error) throw new Error(error.message)

  const caminhos: string[] = []
  for (const p of perfis ?? []) {
    const { data: pastas } = await admin.storage.from(BUCKET).list(p.id, { limit: 1000 })
    for (const pasta of pastas ?? []) {
      const { data: arquivos } = await admin.storage.from(BUCKET).list(`${p.id}/${pasta.name}`, { limit: 1000 })
      for (const a of arquivos ?? []) caminhos.push(`${p.id}/${pasta.name}/${a.name}`)
    }
  }

  console.log(`${perfis?.length ?? 0} contas de teste · ${caminhos.length} fotos encontradas.`)
  if (!confirmar) {
    console.log('Simulação: nada foi apagado. Use --confirmar para apagar.')
    return
  }
  for (let i = 0; i < caminhos.length; i += 100) {
    const { error: erroRemocao } = await admin.storage.from(BUCKET).remove(caminhos.slice(i, i + 100))
    if (erroRemocao) throw new Error(erroRemocao.message)
  }
  console.log(`${caminhos.length} fotos de teste apagadas.`)
}

main().catch((e) => {
  console.error('Falha:', e.message)
  process.exit(1)
})
