import { beforeAll, describe, expect, it } from 'vitest'
import { como, criarBanco, type Banco } from './pglite'

// Congregação A (campanha ativa) e B. Participantes com vínculo ativo; lideranças por função.
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
  jovemA: '20000000-0000-4000-8000-000000000001',
  adolA: '20000000-0000-4000-8000-000000000002',
  jovemB: '20000000-0000-4000-8000-000000000003',
}
// Ocorrências com horários relativos ao momento do teste.
const OC = {
  aberta: '30000000-0000-4000-8000-000000000001', // terminou há 1 h
  futura: '30000000-0000-4000-8000-000000000002', // termina daqui a 2 h
  expirada: '30000000-0000-4000-8000-000000000003', // terminou há 25 h
  soAdol: '30000000-0000-4000-8000-000000000004', // só Adolescentes, aberta
  outraCong: '30000000-0000-4000-8000-000000000005', // congregação B, aberta
  zero: '30000000-0000-4000-8000-000000000006', // 0 ponto, aberta
}

let db: Banco
const presenca: Record<string, string> = {}

async function pessoa(id: string, usuario: string, vinculo?: { cong: string; grupo: string }) {
  await db.query('insert into auth.users (id) values ($1)', [id])
  await db.query(
    `insert into public.perfis (id, usuario, nome_completo, nome_exibicao, whatsapp, nascimento, teste)
     values ($1, $2, $3, $3, '81999990000', '2008-01-01', true)`,
    [id, usuario, `Pessoa ${usuario}`],
  )
  if (vinculo) {
    await db.query(
      `insert into public.vinculos (perfil_id, congregacao_id, grupo, situacao) values ($1, $2, $3, 'ativo')`,
      [id, vinculo.cong, vinculo.grupo],
    )
  }
}

const caminho = (quem: string, oc: string) => `${quem}/${oc}/foto.jpg`

async function enviarFoto(quem: string, oc: string) {
  await como(db, quem, `insert into storage.objects (bucket_id, name, owner) values ('comprovantes', $1, $2)`, [
    caminho(quem, oc),
    quem,
  ])
}

const registrar = (quem: string, oc: string, path = caminho(quem, oc)) =>
  como<{ id: string }>(
    db,
    quem,
    `select public.registrar_presenca($1, $2, 250000, 'image/jpeg', 'cheguei cedo') as id`,
    [oc, path],
  )

beforeAll(async () => {
  db = await criarBanco()
  await db.exec(`
    insert into public.igrejas (id, nome, teste) values ('${ID.igreja}', 'Igreja de teste', true);
    insert into public.congregacoes (id, igreja_id, nome) values
      ('${ID.congA}', '${ID.igreja}', 'Vila Demo (teste)'), ('${ID.congB}', '${ID.igreja}', 'Outra (teste)');
    insert into public.campanhas (id, congregacao_id, nome, inicio) values ('${ID.campA}', '${ID.congA}', 'Campanha', '2026-01-01');
  `)
  await pessoa(ID.admin, 'admin.t')
  await pessoa(ID.dirJovA, 'dir.jov')
  await pessoa(ID.dirAdolA, 'dir.adol')
  await pessoa(ID.respA, 'resp.a', { cong: ID.congA, grupo: 'jovens' }) // liderança que também participa
  await pessoa(ID.dirCampA, 'dir.camp')
  await pessoa(ID.jovemA, 'jovem.a', { cong: ID.congA, grupo: 'jovens' })
  await pessoa(ID.adolA, 'adol.a', { cong: ID.congA, grupo: 'adolescentes' })
  await pessoa(ID.jovemB, 'jovem.b', { cong: ID.congB, grupo: 'jovens' })
  await db.exec(`
    insert into public.funcoes (perfil_id, funcao, congregacao_id, campanha_id) values
      ('${ID.admin}', 'admin', null, null),
      ('${ID.dirJovA}', 'direcao_jovens', '${ID.congA}', null),
      ('${ID.dirAdolA}', 'direcao_adolescentes', '${ID.congA}', null),
      ('${ID.respA}', 'responsavel_congregacao', '${ID.congA}', null),
      ('${ID.dirCampA}', 'direcao_campanha', null, '${ID.campA}');
    insert into public.atividades (id, congregacao_id, titulo, tipo, publico, pontos, data_inicio, data_fim, hora_inicio, hora_fim)
      values ('40000000-0000-4000-8000-000000000001', '${ID.congA}', 'Culto', 'culto', 'todos', 45, current_date, current_date, '18:00', '20:00'),
             ('40000000-0000-4000-8000-000000000002', '${ID.congB}', 'Culto B', 'culto', 'todos', 45, current_date, current_date, '18:00', '20:00');
    insert into public.ocorrencias (id, atividade_id, congregacao_id, titulo, tipo, publico, pontos, inicio, fim) values
      ('${OC.aberta}', '40000000-0000-4000-8000-000000000001', '${ID.congA}', 'Culto oficial', 'culto', 'todos', 45, now() - interval '3 hours', now() - interval '1 hour'),
      ('${OC.futura}', '40000000-0000-4000-8000-000000000001', '${ID.congA}', 'Culto futuro', 'culto', 'todos', 45, now() + interval '1 hour', now() + interval '2 hours'),
      ('${OC.expirada}', '40000000-0000-4000-8000-000000000001', '${ID.congA}', 'Culto antigo', 'culto', 'todos', 20, now() - interval '27 hours', now() - interval '25 hours'),
      ('${OC.soAdol}', '40000000-0000-4000-8000-000000000001', '${ID.congA}', 'Estudo adol.', 'estudo', 'adolescentes', 10, now() - interval '4 hours', now() - interval '2 hours'),
      ('${OC.outraCong}', '40000000-0000-4000-8000-000000000002', '${ID.congB}', 'Culto B', 'culto', 'todos', 45, now() - interval '3 hours', now() - interval '1 hour'),
      ('${OC.zero}', '40000000-0000-4000-8000-000000000001', '${ID.congA}', 'Ensaio', 'ensaio', 'todos', 0, now() - interval '5 hours', now() - interval '4 hours');
  `)
  await db.query(
    `insert into storage.buckets (id, name) values ('comprovantes', 'comprovantes') on conflict do nothing`,
  )
})

describe('agenda (admin)', () => {
  it('só o admin cria atividade; semanal gera uma ocorrência por semana no horário de Recife', async () => {
    await expect(
      como(
        db,
        ID.dirJovA,
        `select public.criar_atividade($1, 'X', 'culto', 'todos', 10, null, 0, '2026-11-01', '2026-11-30', '18:00', '20:00')`,
        [ID.congA],
      ),
    ).rejects.toThrow(/sem_permissao/)
    const [{ n }] = await como<{ n: number }>(
      db,
      ID.admin,
      `select public.criar_atividade($1, 'Culto de domingo', 'culto', 'todos', 45, 'Templo', 0, '2026-11-01', '2026-11-30', '18:00', '20:30') as n`,
      [ID.congA],
    )
    expect(n).toBe(5) // domingos de novembro/2026: 1, 8, 15, 22, 29
    const [{ h }] = (
      await db.query<{ h: string }>(
        `select to_char(min(inicio) at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as h from public.ocorrencias where titulo = 'Culto de domingo'`,
      )
    ).rows
    expect(h).toBe('2026-11-01 21:00') // 18h00 em Recife = 21h00 UTC
  })

  it('pontuação fora de 0 a 50 é recusada pelo banco', async () => {
    await expect(
      como(
        db,
        ID.admin,
        `select public.criar_atividade($1, 'Y', 'culto', 'todos', 51, null, null, '2026-11-03', '2026-11-03', '18:00', '20:00')`,
        [ID.congA],
      ),
    ).rejects.toThrow(/check/)
  })
})

describe('registro de presença com foto privada', () => {
  it('ninguém envia foto para a pasta de outra pessoa', async () => {
    await expect(
      como(db, ID.jovemA, `insert into storage.objects (bucket_id, name) values ('comprovantes', $1)`, [
        caminho(ID.adolA, OC.aberta),
      ]),
    ).rejects.toThrow(/row-level security/)
  })

  it('registra dentro da janela (C10) e fica em análise, sem pontos', async () => {
    await enviarFoto(ID.jovemA, OC.aberta)
    const [r] = await registrar(ID.jovemA, OC.aberta)
    presenca.jovem = r.id
    const [p] = await como<{ situacao: string; mes: string }>(
      db,
      ID.jovemA,
      'select situacao, mes::text from public.presencas where id = $1',
      [r.id],
    )
    expect(p.situacao).toBe('em_analise')
    const lanc = await como(db, ID.jovemA, 'select * from public.lancamentos')
    expect(lanc).toHaveLength(0)
  })

  it('uma pessoa registra uma única vez cada ocorrência', async () => {
    await expect(registrar(ID.jovemA, OC.aberta)).rejects.toThrow(/ja_registrada/)
  })

  it('fora da janela, público errado, outra congregação ou foto inválida são recusados', async () => {
    await enviarFoto(ID.jovemA, OC.futura)
    await expect(registrar(ID.jovemA, OC.futura)).rejects.toThrow(/registro_ainda_nao_abriu/)
    await enviarFoto(ID.jovemA, OC.expirada)
    await expect(registrar(ID.jovemA, OC.expirada)).rejects.toThrow(/prazo_encerrado/)
    await enviarFoto(ID.jovemA, OC.soAdol)
    await expect(registrar(ID.jovemA, OC.soAdol)).rejects.toThrow(/sem_permissao/)
    await enviarFoto(ID.jovemA, OC.outraCong)
    await expect(registrar(ID.jovemA, OC.outraCong)).rejects.toThrow(/sem_permissao/)
    await expect(registrar(ID.jovemA, OC.zero, caminho(ID.adolA, OC.zero))).rejects.toThrow(/foto_invalida/)
    await expect(registrar(ID.jovemA, OC.zero)).rejects.toThrow(/foto_nao_enviada/)
  })

  it('adolescente registra a atividade só para Adolescentes; liderança participante também registra', async () => {
    await enviarFoto(ID.adolA, OC.soAdol)
    presenca.adol = (await registrar(ID.adolA, OC.soAdol))[0].id
    await enviarFoto(ID.respA, OC.aberta)
    presenca.resp = (await registrar(ID.respA, OC.aberta))[0].id
    await enviarFoto(ID.jovemA, OC.zero)
    presenca.zero = (await registrar(ID.jovemA, OC.zero))[0].id
  })

  it('agenda do participante mostra só o próprio público e a situação do registro', async () => {
    const ag = await como<{ id: string; presenca_situacao: string | null }>(
      db,
      ID.jovemA,
      `select id, presenca_situacao from public.minha_agenda(current_date - 3, current_date + 3)`,
    )
    const ids = ag.map((a) => a.id)
    expect(ids).toContain(OC.aberta)
    expect(ids).not.toContain(OC.soAdol)
    expect(ids).not.toContain(OC.outraCong)
    expect(ag.find((a) => a.id === OC.aberta)?.presenca_situacao).toBe('em_analise')
  })
})

describe('validação e acesso às fotos', () => {
  type Item = { presenca_id: string; foto_path: string }
  const fila = (quem: string) => como<Item>(db, quem, 'select presenca_id, foto_path from public.fila_validacao()')

  it('cada liderança vê só o próprio escopo; ninguém vê o próprio registro (D10)', async () => {
    const jov = (await fila(ID.dirJovA)).map((i) => i.presenca_id).sort()
    expect(jov).toEqual([presenca.jovem, presenca.resp, presenca.zero].sort())
    const adol = (await fila(ID.dirAdolA)).map((i) => i.presenca_id)
    expect(adol).toEqual([presenca.adol])
    const resp = (await fila(ID.respA)).map((i) => i.presenca_id)
    expect(resp).not.toContain(presenca.resp)
    expect(resp).toContain(presenca.adol)
    expect(await fila(ID.dirCampA)).toHaveLength(0)
  })

  it('a foto só é legível pelo dono e por quem pode validar aquele grupo', async () => {
    const ler = (quem: string) =>
      como(db, quem, `select name from storage.objects where bucket_id = 'comprovantes' and name = $1`, [
        caminho(ID.jovemA, OC.aberta),
      ])
    expect(await ler(ID.jovemA)).toHaveLength(1)
    expect(await ler(ID.dirJovA)).toHaveLength(1)
    expect(await ler(ID.respA)).toHaveLength(1)
    expect(await ler(ID.dirAdolA)).toHaveLength(0)
    expect(await ler(ID.dirCampA)).toHaveLength(0)
    expect(await ler(ID.adolA)).toHaveLength(0)
  })

  it('participante não lê presenças de outras pessoas', async () => {
    const linhas = await como<{ id: string }>(db, ID.adolA, 'select id from public.presencas')
    expect(linhas.map((l) => l.id)).toEqual([presenca.adol])
  })

  it('direção de outro grupo não decide; recusa exige motivo; ninguém aprova o próprio registro', async () => {
    await expect(como(db, ID.dirAdolA, 'select public.decidir_presenca($1, true)', [presenca.jovem])).rejects.toThrow(
      /sem_permissao/,
    )
    await expect(como(db, ID.dirCampA, 'select public.decidir_presenca($1, true)', [presenca.jovem])).rejects.toThrow(
      /sem_permissao/,
    )
    await expect(
      como(db, ID.dirJovA, 'select public.decidir_presenca($1, false, $2)', [presenca.jovem, ' ']),
    ).rejects.toThrow(/motivo_obrigatorio/)
    await expect(como(db, ID.respA, 'select public.decidir_presenca($1, true)', [presenca.resp])).rejects.toThrow(
      /proprio_registro/,
    )
  })

  it('aprovação credita os pontos uma única vez, mesmo com repetição ou segundo aprovador', async () => {
    const [{ s }] = await como<{ s: string }>(db, ID.dirJovA, 'select public.decidir_presenca($1, true) as s', [
      presenca.jovem,
    ])
    expect(s).toBe('aprovada')
    await expect(como(db, ID.dirJovA, 'select public.decidir_presenca($1, true)', [presenca.jovem])).rejects.toThrow(
      /ja_decidido/,
    )
    await expect(como(db, ID.respA, 'select public.decidir_presenca($1, true)', [presenca.jovem])).rejects.toThrow(
      /ja_decidido/,
    )
    const lanc = await como<{ pontos: number }>(db, ID.jovemA, 'select pontos from public.lancamentos')
    expect(lanc).toEqual([{ pontos: 45 }])
    // Mesmo um insert direto (fora das funções) não consegue um segundo crédito para a mesma presença.
    await expect(
      db.query(
        `insert into public.lancamentos (perfil_id, congregacao_id, grupo, mes, presenca_id, pontos, tipo)
         select perfil_id, congregacao_id, grupo, mes, id, 45, 'credito_presenca' from public.presencas where id = $1`,
        [presenca.jovem],
      ),
    ).rejects.toThrow(/duplicate key/)
  })

  it('atividade sem pontuação aprovada não gera lançamento; recusada não soma', async () => {
    await como(db, ID.dirJovA, 'select public.decidir_presenca($1, true)', [presenca.zero])
    await como(db, ID.dirAdolA, 'select public.decidir_presenca($1, false, $2)', [presenca.adol, 'Foto escura'])
    const lanc = await como(db, ID.admin, 'select presenca_id from public.lancamentos')
    expect(lanc.map((l) => l.presenca_id)).toEqual([presenca.jovem])
  })

  it('outra liderança (Direção dos Jovens) aprova o registro do Responsável participante', async () => {
    await como(db, ID.dirJovA, 'select public.decidir_presenca($1, true)', [presenca.resp])
  })
})

describe('ranking e extrato', () => {
  type Linha = { perfil_id: string; pontos: number; posicao_geral: number; posicao_grupo: number; sou_eu: boolean }

  it('três classificações coerentes; só pontos aprovados; sem dados pessoais', async () => {
    const r = await como<Linha & Record<string, unknown>>(db, ID.jovemA, 'select * from public.ranking()')
    expect(Object.keys(r[0]).sort()).toEqual(
      [
        'avatar_path',
        'grupo',
        'nome_exibicao',
        'perfil_id',
        'pontos',
        'posicao_geral',
        'posicao_grupo',
        'sou_eu',
      ].sort(),
    )
    const eu = r.find((l) => l.sou_eu)!
    expect(eu).toMatchObject({ perfil_id: ID.jovemA, pontos: 45, posicao_geral: 1, posicao_grupo: 1 })
    const resp = r.find((l) => l.perfil_id === ID.respA)!
    expect(resp).toMatchObject({ pontos: 45, posicao_geral: 1 }) // empate na mesma posição
    const adol = r.find((l) => l.perfil_id === ID.adolA)!
    expect(adol).toMatchObject({ pontos: 0, posicao_grupo: 1 })
    expect(r.map((l) => l.perfil_id)).not.toContain(ID.jovemB)
  })

  it('não mistura congregações; Direção da campanha consulta a própria campanha', async () => {
    const b = await como<Linha>(db, ID.jovemB, 'select * from public.ranking()')
    expect(b.map((l) => l.perfil_id)).toEqual([ID.jovemB])
    const curioso = await como<Linha>(db, ID.jovemB, 'select * from public.ranking(null, $1)', [ID.congA])
    expect(curioso).toHaveLength(0)
    const camp = await como<Linha>(db, ID.dirCampA, 'select * from public.ranking(null, $1)', [ID.congA])
    expect(camp.length).toBe(3)
  })

  it('extrato do mês mostra aprovadas, recusadas e pontos creditados', async () => {
    const ex = await como<{ situacao: string; pontos_creditados: number }>(
      db,
      ID.jovemA,
      'select situacao, pontos_creditados from public.minhas_presencas()',
    )
    expect(ex.map((e) => e.situacao).sort()).toEqual(['aprovada', 'aprovada'])
    expect(ex.reduce((s, e) => s + e.pontos_creditados, 0)).toBe(45)
  })

  it('cancelar a ocorrência cancela registros ainda em análise, sem pontos', async () => {
    await enviarFoto(ID.adolA, OC.aberta)
    const id = (await registrar(ID.adolA, OC.aberta))[0].id
    await como(db, ID.admin, `select public.cancelar_ocorrencia($1, 'Chuva forte')`, [OC.aberta])
    const [p] = await como<{ situacao: string }>(db, ID.adolA, 'select situacao from public.presencas where id = $1', [
      id,
    ])
    expect(p.situacao).toBe('cancelada')
  })
})
