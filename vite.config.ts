import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Optimize build and loading
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react', '@headlessui/react'],
          charts: ['recharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  
  // Optimize dev server
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    open: false
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@hooks': resolve(__dirname, 'src/hooks')
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      '@headlessui/react',
      'recharts'
    ],
    exclude: []
  },
  
  // Environment variables
  envPrefix: 'VITE_',
  
  // Base URL configuration
  base: '/',
  
  // Preview configuration for production builds
  preview: {
    port: 4173,
    host: true,
    strictPort: false
  }
})