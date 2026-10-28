import { Outlet } from 'react-router'
import { BottomNav } from '../../components/ui'

/** Estrutura das telas do participante: conteúdo rolável + navegação inferior fixa. */
export function ParticipantLayout() {
  return (
    <div className="screen">
      <main className="screen__content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
