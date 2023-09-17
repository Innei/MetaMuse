import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPath from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BUILD_MODE === 'BUILT_IN' ? '/console' : '/',
  plugins: [react(), tsconfigPath()],
  // alias
  resolve: {
    alias: [
      {
        find: /^@core\/(.*)/,
        replacement: resolve(__dirname, '../core/src/$1'),
      },
      {
        find: /^@model/,
        replacement: resolve(__dirname, '../../prisma/client/index.d.ts'),
      },
    ],
  },

  server: {
    proxy: {
      '/api': {
        ws: true,
        target: 'http://127.0.0.1:3333',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
