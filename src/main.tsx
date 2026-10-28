import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import '@fontsource-variable/inter'
import './styles/tokens.css'
import './styles/base.css'
import './styles/ui.css'
import './styles/gestao.css'
import { router } from './app/router'
import { UpdatePrompt } from './app/UpdatePrompt'
import { ContaProvider } from './app/conta/ContaProvider'
import { ToastProvider } from './components/ui'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ContaProvider>
        <RouterProvider router={router} />
      </ContaProvider>
      <UpdatePrompt />
    </ToastProvider>
  </StrictMode>,
)
