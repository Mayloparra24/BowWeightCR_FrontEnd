/// <reference types="vitest" />

import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Android 7+ / Chrome 80+ soportan ES2020; sin legacy para reducir el bundle.
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          ionic: ['@ionic/vue', '@ionic/vue-router', 'ionicons'],
          vue: ['vue', 'vue-router'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
  },
})
