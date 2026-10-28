import { describe, expect, it } from 'vitest'
import {
  emailTecnico,
  nomeExibicaoPadrao,
  validarCadastro,
  validarUsuario,
} from '../../supabase/functions/_shared/regras.ts'

const valido = {
  token: 'abc',
  usuario: 'anaclara.m',
  senha: 'segredo123',
  nomeCompleto: 'Ana Clara Moura',
  whatsapp: '(81) 98888-7777',
  nascimento: '2010-05-20',
}

describe('regras de cadastro', () => {
  it('aceita um cadastro completo', () => {
    expect(validarCadastro(valido, new Date('2026-10-26'))).toEqual({})
  })

  it('nome de usuário: maiúsculas e minúsculas são iguais; sem espaços nem acentos', () => {
    expect(emailTecnico('  AnaClara.M ')).toBe('anaclara.m@contas.euvou.invalid')
    expect(validarUsuario('ana clara')).toBeDefined()
    expect(validarUsuario('joão')).toBeDefined()
    expect(validarUsuario('.ana')).toBeDefined()
    expect(validarUsuario('ab')).toBeDefined()
    expect(validarUsuario('ana_clara.m2')).toBeUndefined()
  })

  it('exige WhatsApp com DDD, nome e sobrenome, data válida e senha mínima', () => {
    const erros = validarCadastro(
      { ...valido, whatsapp: '8888-7777', nomeCompleto: 'Ana', nascimento: '2030-01-01', senha: '123' },
      new Date('2026-10-26'),
    )
    expect(Object.keys(erros).sort()).toEqual(['nascimento', 'nomeCompleto', 'senha', 'whatsapp'])
  })

  it('nome de exibição padrão: primeiro nome + inicial do último sobrenome', () => {
    expect(nomeExibicaoPadrao('Ana Clara Moura')).toBe('Ana M.')
    expect(nomeExibicaoPadrao('Lucas')).toBe('Lucas')
  })
})
