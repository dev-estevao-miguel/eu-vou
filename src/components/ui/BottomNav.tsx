import { NavLink } from 'react-router'
import {
  CalendarBlankIcon,
  CheckCircleIcon,
  HouseIcon,
  RankingIcon,
  UserCircleIcon,
  type Icon,
} from '@phosphor-icons/react'

// Cinco destinos fixos do participante. Desafios ficam no Início; notificações no topo.
const ITEMS: { to: string; label: string; icon: Icon }[] = [
  { to: '/inicio', label: 'Início', icon: HouseIcon },
  { to: '/agenda', label: 'Agenda', icon: CalendarBlankIcon },
  { to: '/presencas', label: 'Presenças', icon: CheckCircleIcon },
  { to: '/ranking', label: 'Ranking', icon: RankingIcon },
  { to: '/perfil', label: 'Perfil', icon: UserCircleIcon },
]

export function BottomNav() {
  return (
    <nav aria-label="Navegação principal" className="bottom-nav">
      {ITEMS.map(({ to, label, icon: IconCmp }) => (
        <NavLink key={to} to={to} className="bottom-nav__item">
          {({ isActive }) => (
            <>
              <IconCmp size={24} weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
