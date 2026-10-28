import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Cache do service worker: somente os arquivos estáticos do build (app shell).
// Nenhuma rota de API, resposta autenticada, foto de comprovação ou avatar
// entra em cache — por isso não há `runtimeCaching`. Requisições ao Supabase
// (outra origem) passam direto para a rede.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      pwaAssets: { disabled: false, config: true },
      manifest: {
        name: 'Eu Vou',
        short_name: 'Eu Vou',
        description: 'Agenda, registro de presença e participação de jovens e adolescentes.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#143A66',
        theme_color: '#143A66',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Fontes de outros alfabetos ficam fora do pré-cache (o app é em pt-BR).
        globIgnores: ['**/inter-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
})
