import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0', // 모든 네트워크 인터페이스에서 리스닝
        allowedHosts: true, // 터널링 접속 허용
        port: 5173,
        strictPort: false,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    },
    build: {
        chunkSizeWarningLimit: 5000
    }
})
