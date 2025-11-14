import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Configuração correta para produção na Vercel
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // pasta gerada após o build
  },
  server: {
    port: 5173, // porta padrão do Vite em dev
  },
})


