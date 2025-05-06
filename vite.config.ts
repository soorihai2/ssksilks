import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure public directory exists
const publicDir = path.resolve(__dirname, 'public')
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '')
  
  const isProd = mode === 'production'
  
  // In production, we don't need a base URL as it will be determined at runtime
  const baseUrl = isProd ? '' : 'http://localhost:3001'
  
  console.log('Mode:', mode)
  console.log('Base URL:', baseUrl)
  console.log('Output Directory:', publicDir)
  
  return {
    plugins: [react()],
    base: './',
    publicDir: false, // Disable copying public directory
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        'framer-motion',
        'react-redux',
        '@reduxjs/toolkit'
      ],
      exclude: []
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@contexts': path.resolve(__dirname, './src/contexts'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
      },
    },
    build: {
      outDir: publicDir,
      assetsDir: 'assets',
      sourcemap: !isProd,
      minify: 'terser',
      emptyOutDir: true,
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd
        }
      },
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            utils: ['date-fns', 'axios', 'uuid'],
            charts: ['chart.js', 'react-chartjs-2']
          },
          chunkFileNames: isProd ? 'assets/[name].[hash].js' : 'assets/[name].js',
          assetFileNames: isProd ? 'assets/[name].[hash].[ext]' : 'assets/[name].[ext]'
        }
      }
    },
    server: {
      port: 4173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/images': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/videos': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 4173,
      proxy: {
        '/api': {
          target: baseUrl,
          changeOrigin: true,
          secure: false,
        },
        '/images': {
          target: baseUrl,
          changeOrigin: true,
          secure: false,
        },
        '/videos': {
          target: baseUrl,
          changeOrigin: true,
          secure: false,
        }
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    }
  }
})
