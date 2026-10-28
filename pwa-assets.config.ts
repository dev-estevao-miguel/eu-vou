import { defineConfig } from '@vite-pwa/assets-generator/config'

// Ícones gerados a partir de public/logo.svg (marca provisória do Lote 1).
// O ícone adaptável (maskable) mantém o símbolo dentro da área segura de 20%.
const brand = '#143A66'

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    transparent: { sizes: [64, 192, 512], favicons: [[48, 'favicon.ico']], padding: 0 },
    maskable: { sizes: [512], padding: 0.2, resizeOptions: { background: brand } },
    apple: { sizes: [180], padding: 0.12, resizeOptions: { background: brand } },
  },
  images: ['public/logo.svg'],
})
