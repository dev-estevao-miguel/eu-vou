import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, Outlet, type RouteObject } from 'react-router'
import { ParticipantLayout } from './layouts/ParticipantLayout'
import { GestaoLayout } from './layouts/GestaoLayout'
import { ExigeGestao, ExigeLogin, ExigeParticipante, SoVisitante } from './guardas'
import { useConta } from './conta/ContaProvider'
import { destinoInicial, podeValidar } from '../lib/conta'
import { NaoEncontrada } from '../pages/NaoEncontrada'
import { TelaCarregando } from '../pages/Estados'
import Entrar from '../pages/Entrar'
import Cadastro from '../pages/Cadastro'
import ContaEmAnalise from '../pages/ContaEmAnalise'
import Perfil from '../pages/Perfil'
import Inicio from '../pages/participante/Inicio'
import Agenda from '../pages/participante/Agenda'
import Presencas from '../pages/participante/Presencas'
import Ranking from '../pages/participante/Ranking'
import Atividade from '../pages/participante/Atividade'
import { Spinner } from '../components/ui'

const Registrar = lazy(() => import('../pages/participante/Registrar'))
const Validacao = lazy(() => import('../pages/gestao/Validacao'))
const Cadastros = lazy(() => import('../pages/gestao/Cadastros'))
const Convites = lazy(() => import('../pages/gestao/Convites'))
const AgendaGestao = lazy(() => import('../pages/gestao/AgendaGestao'))
const Congregacoes = lazy(() => import('../pages/gestao/Congregacoes'))
const Funcoes = lazy(() => import('../pages/gestao/Funcoes'))
const ConfiguracaoInicial = lazy(() => import('../pages/ConfiguracaoInicial'))

// O catálogo só existe no build de desenvolvimento (removido do build de produção).
const Catalogo = import.meta.env.DEV ? lazy(() => import('../pages/dev/Catalogo')) : null

function Carregar({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Spinner label="Carregando" />}>{children}</Suspense>
}

/** "/" leva cada pessoa ao lugar certo conforme a conta. */
function Raiz() {
  const { estado } = useConta()
  if (estado.status === 'carregando') return <TelaCarregando />
  if (estado.status === 'conectado') return <Navigate to={destinoInicial(estado.conta)} replace />
  return <Navigate to="/entrar" replace />
}

/** Entrada da área da direção: quem valida começa pela fila de validação. */
function InicioGestao() {
  const { estado } = useConta()
  if (estado.status !== 'conectado') return null
  return <Navigate to={podeValidar(estado.conta) ? 'validacao' : 'cadastros'} replace />
}

/** Telas de tarefa (atividade, envio) sem a navegação inferior, como no protótipo. */
function TelaCheia() {
  return (
    <div className="screen">
      <Outlet />
    </div>
  )
}

const devRoutes: RouteObject[] = Catalogo
  ? [
      {
        path: '/dev/componentes',
        element: (
          <Carregar>
            <Catalogo />
          </Carregar>
        ),
      },
    ]
  : []

export const router = createBrowserRouter([
  { path: '/', element: <Raiz /> },
  {
    element: <SoVisitante />,
    children: [
      { path: 'entrar', element: <Entrar /> },
      { path: 'convite/:token', element: <Cadastro /> },
      {
        path: 'configurar/:token',
        element: (
          <Carregar>
            <ConfiguracaoInicial />
          </Carregar>
        ),
      },
    ],
  },
  {
    element: <ExigeLogin />,
    children: [
      { path: 'conta-em-analise', element: <ContaEmAnalise /> },
      {
        element: <ExigeParticipante />,
        children: [
          {
            element: <ParticipantLayout />,
            children: [
              { path: 'inicio', element: <Inicio /> },
              { path: 'agenda', element: <Agenda /> },
              { path: 'presencas', element: <Presencas /> },
              { path: 'ranking', element: <Ranking /> },
              { path: 'perfil', element: <Perfil /> },
            ],
          },
          {
            element: <TelaCheia />,
            children: [
              { path: 'agenda/:id', element: <Atividade /> },
              {
                path: 'agenda/:id/registrar',
                element: (
                  <Carregar>
                    <Registrar />
                  </Carregar>
                ),
              },
            ],
          },
        ],
      },
      {
        element: <ExigeGestao />,
        children: [
          {
            path: 'gestao',
            element: <GestaoLayout />,
            children: [
              { index: true, element: <InicioGestao /> },
              {
                path: 'validacao',
                element: (
                  <Carregar>
                    <Validacao />
                  </Carregar>
                ),
              },
              {
                path: 'cadastros',
                element: (
                  <Carregar>
                    <Cadastros />
                  </Carregar>
                ),
              },
              {
                path: 'convites',
                element: (
                  <Carregar>
                    <Convites />
                  </Carregar>
                ),
              },
              {
                path: 'agenda',
                element: (
                  <Carregar>
                    <AgendaGestao />
                  </Carregar>
                ),
              },
              {
                path: 'congregacoes',
                element: (
                  <Carregar>
                    <Congregacoes />
                  </Carregar>
                ),
              },
              {
                path: 'funcoes',
                element: (
                  <Carregar>
                    <Funcoes />
                  </Carregar>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  ...devRoutes,
  { path: '*', element: <NaoEncontrada /> },
])
