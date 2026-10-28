import { useEffect, useRef, useState } from 'react'
import { mensagemDeErro } from './erros'

type Resposta<T> = { data: T | null; error: unknown }

/**
 * Busca dados ao montar e sempre que `chave` muda. `recarregar()` refaz a busca.
 * Respostas que chegam depois de a tela mudar são descartadas.
 */
export function useConsulta<T>(chave: string, executar: () => PromiseLike<Resposta<T>>) {
  const fn = useRef(executar)
  useEffect(() => {
    fn.current = executar
  })
  const [versao, setVersao] = useState(0)
  const [estado, setEstado] = useState<{ dados: T | null; erro: string | null; carregando: boolean }>({
    dados: null,
    erro: null,
    carregando: true,
  })

  useEffect(() => {
    let ativo = true
    Promise.resolve(fn.current()).then(
      ({ data, error }) => {
        if (!ativo) return
        setEstado(
          error
            ? { dados: null, erro: mensagemDeErro(error), carregando: false }
            : { dados: data, erro: null, carregando: false },
        )
      },
      (e) => ativo && setEstado({ dados: null, erro: mensagemDeErro(e), carregando: false }),
    )
    return () => {
      ativo = false
    }
  }, [chave, versao])

  return { ...estado, recarregar: () => setVersao((v) => v + 1) }
}
