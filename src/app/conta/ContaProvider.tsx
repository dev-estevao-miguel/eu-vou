import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { supabase, supabaseConfigurado } from '../../lib/supabase'
import { emailTecnico } from '../../../supabase/functions/_shared/regras.ts'
import type { Conta } from '../../lib/conta'

/** Por que a pessoa voltou para a tela de entrada sem ter pedido. */
export type AvisoEntrada = 'desativada' | 'incompleta' | 'sessao_expirada'

export type EstadoConta =
  | { status: 'carregando' }
  | { status: 'anonimo'; aviso?: AvisoEntrada }
  | { status: 'conectado'; conta: Conta }
  | { status: 'erro' }

export type FalhaEntrada = 'credenciais' | 'tentativas' | 'rede' | 'desativada' | 'incompleta' | 'desconhecida'

type ContaApi = {
  estado: EstadoConta
  entrar: (usuario: string, senha: string) => Promise<{ ok: true; conta: Conta } | { ok: false; falha: FalhaEntrada }>
  sair: () => Promise<void>
  recarregar: () => Promise<void>
}

const ContaContext = createContext<ContaApi | null>(null)

export function ContaProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoConta>(
    supabaseConfigurado ? { status: 'carregando' } : { status: 'anonimo' },
  )
  const carregadaPara = useRef<string | null>(null)
  const emAndamento = useRef<{ id: string; promessa: Promise<Conta | AvisoEntrada | null> } | null>(null)

  /** Busca a conta; retorna o aviso quando a pessoa não pode continuar conectada. */
  const carregar = useCallback((userId: string) => {
    if (emAndamento.current?.id === userId) return emAndamento.current.promessa
    const promessa = (async (): Promise<Conta | AvisoEntrada | null> => {
      const { data, error } = await supabase.rpc('minha_conta')
      if (error) {
        setEstado({ status: 'erro' })
        return null
      }
      const conta = data as Conta
      const aviso: AvisoEntrada | null = !conta.perfil
        ? 'incompleta'
        : conta.perfil.situacao === 'desativado'
          ? 'desativada'
          : null
      if (aviso) {
        carregadaPara.current = null
        await supabase.auth.signOut({ scope: 'local' })
        setEstado({ status: 'anonimo', aviso })
        return aviso
      }
      carregadaPara.current = userId
      setEstado({ status: 'conectado', conta })
      return conta
    })().finally(() => {
      emAndamento.current = null
    })
    emAndamento.current = { id: userId, promessa }
    return promessa
  }, [])

  useEffect(() => {
    if (!supabaseConfigurado) return
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, sessao) => {
      // Recomendação do Supabase: não chamar a API dentro do callback; adiar para o próximo ciclo.
      setTimeout(() => {
        if (!sessao) {
          // sair() limpa a referência antes; se ela ainda existe, a sessão terminou sem a pessoa pedir.
          const expirou = carregadaPara.current !== null
          carregadaPara.current = null
          setEstado((atual) =>
            atual.status === 'anonimo' ? atual : { status: 'anonimo', aviso: expirou ? 'sessao_expirada' : undefined },
          )
          return
        }
        if (carregadaPara.current === sessao.user.id && evento !== 'USER_UPDATED') return
        void carregar(sessao.user.id)
      }, 0)
    })
    return () => subscription.unsubscribe()
  }, [carregar])

  const entrar = useCallback<ContaApi['entrar']>(
    async (usuario, senha) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email: emailTecnico(usuario), password: senha })
      if (error || !data.user) {
        if (error?.status === 429 || error?.code === 'over_request_rate_limit')
          return { ok: false, falha: 'tentativas' }
        if (error?.code === 'invalid_credentials' || error?.status === 400) return { ok: false, falha: 'credenciais' }
        if (error?.name === 'AuthRetryableFetchError' || !navigator.onLine) return { ok: false, falha: 'rede' }
        return { ok: false, falha: 'desconhecida' }
      }
      const resultado = await carregar(data.user.id)
      if (resultado === 'desativada' || resultado === 'incompleta') return { ok: false, falha: resultado }
      if (!resultado || typeof resultado === 'string') return { ok: false, falha: 'desconhecida' }
      return { ok: true, conta: resultado }
    },
    [carregar],
  )

  const sair = useCallback(async () => {
    carregadaPara.current = null
    // Encerra a sessão só neste aparelho; o token local é apagado pelo próprio Supabase.
    await supabase.auth.signOut({ scope: 'local' })
    setEstado({ status: 'anonimo' })
  }, [])

  const recarregar = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      setEstado({ status: 'anonimo' })
      return
    }
    carregadaPara.current = null
    await carregar(data.session.user.id)
  }, [carregar])

  return <ContaContext.Provider value={{ estado, entrar, sair, recarregar }}>{children}</ContaContext.Provider>
}

export function useConta() {
  const ctx = useContext(ContaContext)
  if (!ctx) throw new Error('useConta precisa estar dentro de <ContaProvider>')
  return ctx
}

/** Conta conectada. Usar apenas em telas protegidas pelas guardas de rota. */
export function useContaConectada() {
  const { estado } = useConta()
  if (estado.status !== 'conectado') throw new Error('Tela protegida renderizada sem conta conectada')
  return estado.conta
}
