import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

// Nome do repositório no GitHub Pages. Em produção o app é servido em
// https://<usuario>.github.io/english/ — por isso o base com subpasta.
// Se você publicar em domínio próprio ou em user-site, troque para '/'.
const REPO_BASE = '/english/'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? REPO_BASE : '/',
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'icon.svg',
        'apple-touch-icon-180x180.png',
      ],
      manifest: {
        name: 'English Voice Coach',
        short_name: 'VoiceCoach',
        description:
          'Pratique inglês por voz com correção de pronúncia, gramática e vocabulário usando IA (Gemini).',
        lang: 'pt-BR',
        theme_color: '#0ea5e9',
        background_color: '#0b1220',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Não interceptamos as chamadas à API do Gemini (sempre online).
        navigateFallbackDenylist: [/^\/api/],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
}))
