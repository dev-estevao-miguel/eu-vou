import { beforeAll, describe, expect, it } from 'vitest'
import { como, criarBanco, type Banco } from './pglite'

const PRIMEIRO = '40000000-0000-4000-8000-000000000001'
const SEGUNDO = '40000000-0000-4000-8000-000000000002'
const TOKEN = 'token-de-configuracao-inicial'

let db: Banco

const concluir = (id: string, token: string, usuario: string) =>
  como(
    db,
    'service',
    `select public.concluir_configuracao_inicial($1, $2, $3, 'Admin Demo', 'Admin D.', '81999990000', '1990-01-01')`,
    [id, token, usuario],
  )

beforeAll(async () => {
  db = await criarBanco()
  await db.query(
    `insert into privado.configuracao_inicial (token_hash, expira_em) values (privado.hash_token($1), now() + interval '48 hours')`,
    [TOKEN],
  )
  await db.query('insert into auth.users (id) values ($1), ($2)', [PRIMEIRO, SEGUNDO])
})

describe('configuração inicial do primeiro administrador', () => {
  it('a tela consulta a situação do link sem login; token errado é inválido', async () => {
    const [{ s }] = await como<{ s: string }>(db, 'anon', 'select public.situacao_configuracao_inicial($1) as s', [
      TOKEN,
    ])
    expect(s).toBe('valido')
    const [{ s: errado }] = await como<{ s: string }>(
      db,
      'anon',
      'select public.situacao_configuracao_inicial($1) as s',
      ['outro'],
    )
    expect(errado).toBe('invalido')
  })

  it('visitante e usuário conectado não concluem a configuração diretamente', async () => {
    await expect(
      como(
        db,
        'anon',
        `select public.concluir_configuracao_inicial($1, $2, 'x.y', 'A B', 'A', '81999990000', '1990-01-01')`,
        [PRIMEIRO, TOKEN],
      ),
    ).rejects.toThrow(/permission denied/)
    await expect(
      como(
        db,
        PRIMEIRO,
        `select public.concluir_configuracao_inicial($1, $2, 'x.y', 'A B', 'A', '81999990000', '1990-01-01')`,
        [PRIMEIRO, TOKEN],
      ),
    ).rejects.toThrow(/permission denied/)
    await expect(como(db, PRIMEIRO, 'select * from privado.configuracao_inicial')).rejects.toThrow(/permission denied/)
  })

  it('token errado não cria administrador', async () => {
    await expect(concluir(PRIMEIRO, 'token-errado', 'admin.demo')).rejects.toThrow(/link_invalido/)
  })

  it('o link correto cria o primeiro administrador e é consumido', async () => {
    await concluir(PRIMEIRO, TOKEN, 'admin.demo')
    const [conta] = await como<{ c: { perfil: { teste: boolean }; funcoes: { funcao: string }[] } }>(
      db,
      PRIMEIRO,
      'select public.minha_conta() as c',
    )
    expect(conta.c.perfil.teste).toBe(false)
    expect(conta.c.funcoes.map((f) => f.funcao)).toEqual(['admin'])
    const [{ s }] = await como<{ s: string }>(db, 'anon', 'select public.situacao_configuracao_inicial($1) as s', [
      TOKEN,
    ])
    expect(s).toBe('concluida')
  })

  it('o mesmo link não cria um segundo administrador', async () => {
    await expect(concluir(SEGUNDO, TOKEN, 'outro.admin')).rejects.toThrow(/link_invalido/)
    const [{ n }] = (
      await db.query<{ n: number }>(`select count(*)::int as n from public.funcoes where funcao = 'admin'`)
    ).rows
    expect(n).toBe(1)
  })

  it('um novo link não funciona se já existe administrador', async () => {
    await db.query(
      `update privado.configuracao_inicial set token_hash = privado.hash_token('novo'), usado_em = null, expira_em = now() + interval '1 hour'`,
    )
    await expect(concluir(SEGUNDO, 'novo', 'outro.admin')).rejects.toThrow(/ja_configurado/)
  })

  it('link expirado é inválido', async () => {
    await db.exec(
      `delete from public.funcoes; update privado.configuracao_inicial set expira_em = now() - interval '1 minute'`,
    )
    const [{ s }] = await como<{ s: string }>(db, 'anon', 'select public.situacao_configuracao_inicial($1) as s', [
      'novo',
    ])
    expect(s).toBe('invalido')
    await expect(concluir(SEGUNDO, 'novo', 'outro.admin')).rejects.toThrow(/link_invalido/)
  })
})
