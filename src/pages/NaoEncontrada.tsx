import { EmptyState } from '../components/ui'

/** Endereço que não corresponde a nenhuma tela. */
export function NaoEncontrada() {
  return (
    <div className="screen" style={{ justifyContent: 'center', padding: 20 }}>
      <EmptyState title="Página não encontrada">
        <a href="/">Voltar ao início</a>
      </EmptyState>
    </div>
  )
}
