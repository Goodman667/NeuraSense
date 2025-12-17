import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 3000,
        // Proxy configuration to resolve CORS issues with backend
        proxy: {
            '/api': {
                target: 'http://backend:8000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    preview: {
        host: '0.0.0.0',
        port: 3000,
    },
    // Optimize dependencies for recharts and framer-motion
    optimizeDeps: {
        include: ['recharts', 'framer-motion'],
    },
    build: {
        commonjsOptions: {
            include: [/recharts/, /node_modules/],
        },
    },
})
