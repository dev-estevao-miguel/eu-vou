import { beforeAll, describe, expect, it } from 'vitest'
import { como, criarBanco, type Banco } from './pglite'

// Cenário fictício: congregação A (com campanha ativa) e congregação B, mesma igreja de teste.
const ID = {
  igreja: '00000000-0000-4000-8000-000000000001',
  congA: '00000000-0000-4000-8000-0000000000a1',
  congB: '00000000-0000-4000-8000-0000000000b1',
  campA: '00000000-0000-4000-8000-0000000000c1',
  admin: '10000000-0000-4000-8000-000000000001',
  dirJovA: '10000000-0000-4000-8000-000000000002',
  dirAdolA: '10000000-0000-4000-8000-000000000003',
  respA: '10000000-0000-4000-8000-000000000004',
  dirCampA: '10000000-0000-4000-8000-000000000005',
  dirJovB: '10000000-0000-4000-8000-000000000006',
  jovem: '20000000-0000-4000-8000-000000000001',
  adolescente: '20000000-0000-4000-8000-000000000002',
}

let db: Banco
const convites: Record<string, string> = {}
const vinculos: Record<string, string> = {}

async function criarLider(id: string, usuario: string) {
  await db.query('insert into auth.users (id) values ($1)', [id])
  await db.query(
    `insert into public.perfis (id, usuario, nome_completo, nome_exibicao, whatsapp, nascimento, teste)
     values ($1, $2, $3, $3, '81999990000', '1990-01-01', true)`,
    [id, usuario, `Líder ${usuario}`],
  )
}

async function cadastrar(id: string, usuario: string, token: string) {
  await db.query('insert into auth.users (id) values ($1)', [id])
  const [r] = await como<{ v: string }>(
    db,
    'service',
    `select public.registrar_cadastro($1, $2, $3, $4, $5, '81988887777', '2010-05-20') as v`,
    [id, token, usuario, `Pessoa ${usuario}`, usuario],
  )
  return r.v
}

beforeAll(async () => {
  db = await criarBanco()
  await db.exec(`
    insert into public.igrejas (id, nome, teste) values ('${ID.igreja}', 'Igreja de teste', true);
    insert into public.congregacoes (id, igreja_id, nome) values
      ('${ID.congA}', '${ID.igreja}', 'Vila Demo (teste)'),
      ('${ID.congB}', '${ID.igreja}', 'Outra (teste)');
    insert into public.campanhas (id, congregacao_id, nome, inicio)
      values ('${ID.campA}', '${ID.congA}', 'Presença que aproxima', '2026-10-01');
  `)
  await criarLider(ID.admin, 'admin.teste')
  await criarLider(ID.dirJovA, 'dir.jovens.a')
  await criarLider(ID.dirAdolA, 'dir.adol.a')
  await criarLider(ID.respA, 'resp.a')
  await criarLider(ID.dirCampA, 'dir.campanha.a')
  await criarLider(ID.dirJovB, 'dir.jovens.b')
  await db.exec(`
    insert into public.funcoes (perfil_id, funcao, congregacao_id, campanha_id) values
      ('${ID.admin}', 'admin', null, null),
      ('${ID.dirJovA}', 'direcao_jovens', '${ID.congA}', null),
      ('${ID.dirAdolA}', 'direcao_adolescentes', '${ID.congA}', null),
      ('${ID.respA}', 'responsavel_congregacao', '${ID.congA}', null),
      ('${ID.dirCampA}', 'direcao_campanha', null, '${ID.campA}'),
      ('${ID.dirJovB}', 'direcao_jovens', '${ID.congB}', null);
  `)
})

describe('convites', () => {
  it('a direção gera convite só para o próprio grupo e congregação', async () => {
    const [c] = await como<{ token: string }>(db, ID.dirJovA, 'select * from public.criar_convite($1, $2)', [
      ID.congA,
      'jovens',
    ])
    expect(c.token).toMatch(/^[A-Za-z0-9_-]{32}$/)
    convites.jovensA = c.token

    await expect(
      como(db, ID.dirJovA, 'select * from public.criar_convite($1, $2)', [ID.congA, 'adolescentes']),
    ).rejects.toThrow(/sem_permissao/)
    await expect(
      como(db, ID.dirJovA, 'select * from public.criar_convite($1, $2)', [ID.congB, 'jovens']),
    ).rejects.toThrow(/sem_permissao/)
  })

  it('Responsável e Direção da campanha não geram convites (matriz: não por padrão)', async () => {
    await expect(
      como(db, ID.respA, 'select * from public.criar_convite($1, $2)', [ID.congA, 'jovens']),
    ).rejects.toThrow(/sem_permissao/)
    await expect(
      como(db, ID.dirCampA, 'select * from public.criar_convite($1, $2)', [ID.congA, 'jovens']),
    ).rejects.toThrow(/sem_permissao/)
  })

  it('o admin gera convite para qualquer grupo', async () => {
    const [c] = await como<{ token: string }>(db, ID.admin, 'select * from public.criar_convite($1, $2, 7)', [
      ID.congA,
      'adolescentes',
    ])
    convites.adolA = c.token
  })

  it('visitante consulta o convite sem ver dados de pessoas; token errado não retorna nada', async () => {
    const [c] = await como<{ situacao: string; congregacao: string; grupo: string }>(
      db,
      'anon',
      'select * from public.consultar_convite($1)',
      [convites.jovensA],
    )
    expect(c).toMatchObject({ situacao: 'valido', congregacao: 'Vila Demo (teste)', grupo: 'jovens' })
    expect(await como(db, 'anon', 'select * from public.consultar_convite($1)', ['token-inexistente'])).toHaveLength(0)
  })

  it('o hash do token não é legível nem pela direção', async () => {
    await expect(como(db, ID.dirJovA, 'select token_hash from public.convites')).rejects.toThrow(/permission denied/)
    const linhas = await como(db, ID.dirJovA, 'select id, grupo from public.convites')
    expect(linhas.every((l) => l.grupo === 'jovens')).toBe(true)
  })
})

describe('cadastro por convite', () => {
  it('cria perfil de teste e vínculo pendente no grupo e congregação do convite, sem funções', async () => {
    vinculos.jovem = await cadastrar(ID.jovem, 'joao.teste', convites.jovensA)
    vinculos.adolescente = await cadastrar(ID.adolescente, 'ana.teste', convites.adolA)

    const [conta] = await como<{ c: { perfil: { teste: boolean }; vinculo: Record<string, string>; funcoes: [] } }>(
      db,
      ID.jovem,
      'select public.minha_conta() as c',
    )
    expect(conta.c.perfil.teste).toBe(true)
    expect(conta.c.vinculo).toMatchObject({ situacao: 'pendente', grupo: 'jovens', congregacao_id: ID.congA })
    expect(conta.c.funcoes).toEqual([])
  })

  it('o app (papel authenticated ou anon) não consegue concluir cadastro sem a Edge Function', async () => {
    await expect(
      como(
        db,
        ID.jovem,
        `select public.registrar_cadastro($1, $2, 'x.y.z', 'Nome Teste', 'Nome', '81988887777', '2010-01-01')`,
        [ID.jovem, convites.jovensA],
      ),
    ).rejects.toThrow(/permission denied/)
  })

  it('convite revogado ou inexistente não cadastra', async () => {
    const [{ id }] = await como<{ id: string }>(db, ID.admin, 'select id from public.convites where grupo = $1', [
      'adolescentes',
    ])
    await como(db, ID.admin, 'select public.revogar_convite($1)', [id])
    await db.query(
      "insert into auth.users (id, email) values ('30000000-0000-4000-8000-000000000001', 'novo.um@contas.euvou.invalid')",
    )
    await expect(
      como(
        db,
        'service',
        `select public.registrar_cadastro('30000000-0000-4000-8000-000000000001', $1, 'novo.um', 'Novo Um', 'Novo', '81988887777', '2010-01-01')`,
        [convites.adolA],
      ),
    ).rejects.toThrow(/convite_invalido/)
    const [c] = await como<{ situacao: string }>(db, 'anon', 'select situacao from public.consultar_convite($1)', [
      convites.adolA,
    ])
    expect(c.situacao).toBe('revogado')
  })

  it('ninguém se atribui função nem altera o próprio vínculo diretamente', async () => {
    await expect(
      como(db, ID.jovem, `insert into public.funcoes (perfil_id, funcao) values ($1, 'admin')`, [ID.jovem]),
    ).rejects.toThrow(/permission denied/)
    await expect(
      como(db, ID.jovem, `update public.vinculos set situacao = 'ativo' where perfil_id = $1`, [ID.jovem]),
    ).rejects.toThrow(/permission denied/)
    await expect(como(db, ID.jovem, `select public.conceder_funcao($1, 'admin')`, [ID.jovem])).rejects.toThrow(
      /sem_permissao/,
    )
    await expect(
      como(db, ID.dirJovA, `select public.conceder_funcao($1, 'direcao_adolescentes', $2)`, [ID.dirJovA, ID.congA]),
    ).rejects.toThrow(/sem_permissao/)
  })
})

describe('perfis e dados pessoais', () => {
  it('participante lê só o próprio perfil', async () => {
    const linhas = await como<{ id: string }>(db, ID.jovem, 'select id from public.perfis')
    expect(linhas.map((l) => l.id)).toEqual([ID.jovem])
  })

  it('direção vê cadastro completo só do próprio grupo; Direção da campanha não vê', async () => {
    const dirJov = await como<{ id: string }>(db, ID.dirJovA, 'select id from public.perfis where id = any($1)', [
      [ID.jovem, ID.adolescente],
    ])
    expect(dirJov.map((l) => l.id)).toEqual([ID.jovem])
    const resp = await como<{ id: string }>(db, ID.respA, 'select id from public.perfis where id = any($1)', [
      [ID.jovem, ID.adolescente],
    ])
    expect(resp.map((l) => l.id).sort()).toEqual([ID.jovem, ID.adolescente].sort())
    expect(await como(db, ID.dirCampA, 'select id from public.perfis where id = $1', [ID.jovem])).toHaveLength(0)
    expect(await como(db, ID.dirJovB, 'select id from public.perfis where id = $1', [ID.jovem])).toHaveLength(0)
  })

  it('a pessoa altera o WhatsApp, mas não usuário, nome no ranking (C12) nem dados de outros', async () => {
    await como(db, ID.jovem, `update public.perfis set whatsapp = '81911112222' where id = $1`, [ID.jovem])
    await expect(
      como(db, ID.jovem, `update public.perfis set usuario = 'outro.nome' where id = $1`, [ID.jovem]),
    ).rejects.toThrow(/permission denied/)
    await expect(
      como(db, ID.jovem, `update public.perfis set nome_exibicao = 'Apelido' where id = $1`, [ID.jovem]),
    ).rejects.toThrow(/permission denied/)
    const alterados = await como(
      db,
      ID.jovem,
      `update public.perfis set whatsapp = '81900000000' where id = $1 returning id`,
      [ID.adolescente],
    )
    expect(alterados).toHaveLength(0)
  })

  it('visitante não lê nenhuma tabela', async () => {
    await expect(como(db, 'anon', 'select * from public.perfis')).rejects.toThrow(/permission denied/)
    await expect(como(db, 'anon', 'select * from public.vinculos')).rejects.toThrow(/permission denied/)
  })
})

describe('aprovação de vínculos (C08 e C09)', () => {
  type Pendente = { perfil_id: string; whatsapp: string | null; nascimento: string | null; idade: number }

  it('cada direção vê só os pendentes do próprio grupo', async () => {
    const jov = await como<Pendente>(db, ID.dirJovA, 'select * from public.listar_cadastros_pendentes()')
    expect(jov.map((p) => p.perfil_id)).toEqual([ID.jovem])
    const adol = await como<Pendente>(db, ID.dirAdolA, 'select * from public.listar_cadastros_pendentes()')
    expect(adol.map((p) => p.perfil_id)).toEqual([ID.adolescente])
    expect(await como(db, ID.dirJovB, 'select * from public.listar_cadastros_pendentes()')).toHaveLength(0)
  })

  it('Direção da campanha vê os dois grupos com idade, sem WhatsApp nem nascimento', async () => {
    const lista = await como<Pendente>(db, ID.dirCampA, 'select * from public.listar_cadastros_pendentes()')
    expect(lista).toHaveLength(2)
    for (const p of lista) {
      expect(p.whatsapp).toBeNull()
      expect(p.nascimento).toBeNull()
      expect(p.idade).toBeGreaterThan(0)
    }
    const resp = await como<Pendente>(db, ID.respA, 'select * from public.listar_cadastros_pendentes()')
    expect(resp.every((p) => p.whatsapp !== null)).toBe(true)
  })

  it('Direção dos Jovens não aprova adolescente; recusa exige motivo', async () => {
    await expect(
      como(db, ID.dirJovA, 'select public.decidir_vinculo($1, true)', [vinculos.adolescente]),
    ).rejects.toThrow(/sem_permissao/)
    await expect(
      como(db, ID.dirAdolA, 'select public.decidir_vinculo($1, false, $2)', [vinculos.adolescente, '  ']),
    ).rejects.toThrow(/motivo_obrigatorio/)
  })

  it('só a primeira decisão vale (repetição ou segundo aprovador falham)', async () => {
    const [r] = await como<{ s: string }>(db, ID.dirAdolA, 'select public.decidir_vinculo($1, true) as s', [
      vinculos.adolescente,
    ])
    expect(r.s).toBe('ativo')
    await expect(
      como(db, ID.dirAdolA, 'select public.decidir_vinculo($1, true)', [vinculos.adolescente]),
    ).rejects.toThrow(/ja_decidido/)
    await expect(
      como(db, ID.respA, 'select public.decidir_vinculo($1, false, $2)', [vinculos.adolescente, 'teste']),
    ).rejects.toThrow(/ja_decidido/)
    const [{ n }] = await db
      .query<{ n: number }>(
        "select count(*)::int as n from public.auditoria where alvo_id = $1 and acao like 'vinculo_%'",
        [vinculos.adolescente],
      )
      .then((r) => r.rows)
    expect(n).toBe(1)
  })

  it('Direção da campanha aprova vínculo, e perde o poder quando a campanha é encerrada', async () => {
    await db.query('update public.campanhas set ativa = false where id = $1', [ID.campA])
    await expect(como(db, ID.dirCampA, 'select public.decidir_vinculo($1, true)', [vinculos.jovem])).rejects.toThrow(
      /sem_permissao/,
    )
    await db.query('update public.campanhas set ativa = true where id = $1', [ID.campA])
    const [r] = await como<{ s: string }>(db, ID.dirCampA, 'select public.decidir_vinculo($1, true) as s', [
      vinculos.jovem,
    ])
    expect(r.s).toBe('ativo')
  })

  it('participante aprovado passa a ler a própria congregação e campanha, não a outra', async () => {
    const congs = await como<{ id: string }>(db, ID.jovem, 'select id from public.congregacoes')
    expect(congs.map((c) => c.id)).toEqual([ID.congA])
    const camps = await como(db, ID.jovem, 'select id from public.campanhas')
    expect(camps).toHaveLength(1)
  })
})

describe('funções de liderança', () => {
  it('admin concede e revoga com justificativa; não altera a própria função', async () => {
    const [{ id }] = await como<{ id: string }>(
      db,
      ID.admin,
      `select public.conceder_funcao($1, 'direcao_jovens', $2) as id`,
      [ID.jovem, ID.congA],
    )
    await expect(como(db, ID.admin, 'select public.revogar_funcao($1, $2)', [id, ''])).rejects.toThrow(
      /justificativa_obrigatoria/,
    )
    await como(db, ID.admin, 'select public.revogar_funcao($1, $2)', [id, 'Teste de revogação'])
    const [{ admin }] = await como<{ admin: string }>(
      db,
      ID.admin,
      `select id as admin from public.funcoes where perfil_id = $1 and funcao = 'admin'`,
      [ID.admin],
    )
    await expect(como(db, ID.admin, 'select public.revogar_funcao($1, $2)', [admin, 'x'])).rejects.toThrow(
      /propria_funcao/,
    )
  })
})

describe('limpeza dos dados de teste (C05)', () => {
  it('remove contas e estrutura de teste e preserva os dados reais', async () => {
    const real = '90000000-0000-4000-8000-000000000001'
    await db.query('insert into auth.users (id) values ($1)', [real])
    await db.query(
      `insert into public.perfis (id, usuario, nome_completo, nome_exibicao, whatsapp, nascimento, teste)
       values ($1, 'admin.demo', 'Admin Demo', 'Admin D.', '81999990000', '1990-01-01', false)`,
      [real],
    )
    await db.query(`insert into public.funcoes (perfil_id, funcao) values ($1, 'admin')`, [real])
    await db.query(
      `insert into public.igrejas (id, nome) values ('90000000-0000-4000-8000-0000000000aa', 'Igreja real')`,
    )

    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    await db.exec(
      readFileSync(join(import.meta.dirname, '..', '..', 'supabase', 'testes', 'limpar-dados-teste.sql'), 'utf8'),
    )

    const contar = async (sql: string) => (await db.query<{ n: number }>(sql)).rows[0].n
    expect(await contar('select count(*)::int as n from public.perfis where teste')).toBe(0)
    expect(await contar('select count(*)::int as n from public.igrejas where teste')).toBe(0)
    expect(await contar('select count(*)::int as n from public.vinculos')).toBe(0)
    expect(await contar('select count(*)::int as n from public.convites')).toBe(0)
    expect(await contar(`select count(*)::int as n from auth.users where id <> '${real}'`)).toBe(0)
    expect(await contar(`select count(*)::int as n from public.perfis where id = '${real}'`)).toBe(1)
    expect(await contar(`select count(*)::int as n from public.funcoes where perfil_id = '${real}'`)).toBe(1)
    expect(await contar(`select count(*)::int as n from public.igrejas where not teste`)).toBe(1)
  })
})
