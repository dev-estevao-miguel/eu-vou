import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'

const raiz = join(import.meta.dirname, '..', '..')

/** Banco Postgres em memória com o ambiente Supabase simulado e todas as migrações aplicadas. */
export async function criarBanco() {
  const db = new PGlite({ extensions: { pgcrypto } })
  await db.exec(readFileSync(join(import.meta.dirname, 'supabase-shim.sql'), 'utf8'))
  const pasta = join(raiz, 'supabase', 'migrations')
  for (const arquivo of readdirSync(pasta)
    .filter((f) => f.endsWith('.sql'))
    .sort()) {
    await db.exec(readFileSync(join(pasta, arquivo), 'utf8'))
  }
  return db
}

export type Banco = Awaited<ReturnType<typeof criarBanco>>

/**
 * Executa como um papel da API, igual ao PostgREST:
 * - uuid → `authenticated` com esse usuário em auth.uid()
 * - 'anon' → visitante sem login
 * - 'service' → chave secreta (Edge Functions)
 */
export async function como<T = Record<string, unknown>>(
  db: Banco,
  quem: string,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  return db.transaction(async (tx) => {
    if (quem === 'anon') {
      await tx.exec('set local role anon')
    } else if (quem === 'service') {
      await tx.exec('set local role service_role')
    } else {
      await tx.exec('set local role authenticated')
      await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [quem])
    }
    return (await tx.query<T>(sql, params)).rows
  })
}
