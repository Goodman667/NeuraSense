import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Custom Rollup plugin to fix MediaPipe exports for production build.
 * MediaPipe packages use CJS exports that don't work well with Vite's ESM bundling.
 */
const mediapipePlugin = () => {
    return {
        name: 'mediapipe-fix',
        transform(code: string, id: string) {
            // Fix @mediapipe/face_mesh exports
            if (id.includes('@mediapipe/face_mesh')) {
                return code.replace(
                    'exports.FaceMesh = void 0;',
                    'exports.FaceMesh = FaceMesh;'
                );
            }
            // Fix @mediapipe/camera_utils exports
            if (id.includes('@mediapipe/camera_utils')) {
                return code.replace(
                    'exports.Camera = void 0;',
                    'exports.Camera = Camera;'
                );
            }
            return code;
        }
    };
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), mediapipePlugin()],
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
    // Optimize dependencies for recharts, framer-motion, and mediapipe
    optimizeDeps: {
        include: ['recharts', 'framer-motion', '@mediapipe/face_mesh', '@mediapipe/camera_utils'],
    },
    build: {
        commonjsOptions: {
            include: [/recharts/, /node_modules/, /@mediapipe/],
            transformMixedEsModules: true,
        },
    },
})

