// Tipos e regras de navegação da conta conectada (resultado de public.minha_conta()).

export type Grupo = 'jovens' | 'adolescentes'
export type Funcao =
  'admin' | 'responsavel_congregacao' | 'direcao_campanha' | 'direcao_jovens' | 'direcao_adolescentes'

export type Perfil = {
  id: string
  usuario: string
  nome_completo: string
  nome_exibicao: string
  whatsapp: string
  nascimento: string
  avatar_path: string | null
  situacao: 'ativo' | 'desativado'
  teste: boolean
}

export type Vinculo = {
  id: string
  situacao: 'pendente' | 'ativo' | 'recusado' | 'encerrado'
  grupo: Grupo
  motivo: string | null
  congregacao_id: string
  congregacao: string
  campanha: { id: string; nome: string } | null
}

export type FuncaoAtiva = {
  id: string
  funcao: Funcao
  congregacao_id: string | null
  congregacao: string | null
  campanha_id: string | null
  campanha: string | null
}

export type Conta = {
  perfil: Perfil | null
  vinculo: Vinculo | null
  funcoes: FuncaoAtiva[]
}

export const NOME_GRUPO: Record<Grupo, string> = { jovens: 'Jovens', adolescentes: 'Adolescentes' }
export const NOME_GRUPO_SINGULAR: Record<Grupo, string> = { jovens: 'Jovem', adolescentes: 'Adolescente' }

export const NOME_FUNCAO: Record<Funcao, string> = {
  admin: 'Administrador da plataforma',
  responsavel_congregacao: 'Responsável pela congregação',
  direcao_campanha: 'Direção da campanha',
  direcao_jovens: 'Direção dos Jovens',
  direcao_adolescentes: 'Direção dos Adolescentes (União)',
}

export const ehAdmin = (c: Conta) => c.funcoes.some((f) => f.funcao === 'admin')
export const temGestao = (c: Conta) => c.funcoes.length > 0
export const participanteAtivo = (c: Conta) => c.vinculo?.situacao === 'ativo'
/** Matriz: aprovar/recusar registros — admin, Responsável e direções de grupo (não a Direção da campanha). */
export const podeValidar = (c: Conta) =>
  c.funcoes.some((f) =>
    ['admin', 'responsavel_congregacao', 'direcao_jovens', 'direcao_adolescentes'].includes(f.funcao),
  )

/** Para onde levar a pessoa depois de entrar. */
export function destinoInicial(c: Conta) {
  if (participanteAtivo(c)) return '/inicio'
  if (temGestao(c)) return '/gestao'
  return '/conta-em-analise'
}

/** Combinações (congregação, grupo) para as quais a interface oferece gerar convite. O servidor confere de novo. */
export function escoposDeConvite(c: Conta, todasCongregacoes: { id: string; nome: string }[]) {
  if (ehAdmin(c)) {
    return todasCongregacoes.flatMap((cg) =>
      (['jovens', 'adolescentes'] as Grupo[]).map((g) => ({ congregacao_id: cg.id, congregacao: cg.nome, grupo: g })),
    )
  }
  return c.funcoes
    .filter((f) => f.funcao === 'direcao_jovens' || f.funcao === 'direcao_adolescentes')
    .map((f) => ({
      congregacao_id: f.congregacao_id!,
      congregacao: f.congregacao ?? '',
      grupo: (f.funcao === 'direcao_jovens' ? 'jovens' : 'adolescentes') as Grupo,
    }))
}
