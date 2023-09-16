import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPath from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BUILD_MODE === 'BUILT_IN' ? '/console' : '/',
  plugins: [react(), tsconfigPath()],
  // alias
  resolve: {
    alias: {},
  },
})
