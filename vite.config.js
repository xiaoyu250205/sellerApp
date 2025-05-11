import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'


// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          // 支持 SSE
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.headers.accept && req.headers.accept === 'text/event-stream') {
              proxyReq.setHeader('Connection', 'keep-alive')
              proxyReq.setHeader('Cache-Control', 'no-cache')
            }
          })
        }
      },
      // 添加图片资源代理
      '/images': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 不重写路径保持/images开头
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus']
        }
      }
    }
  },
  define: {
    'process.env.API_URL': process.env.NODE_ENV === 'production' 
      ? JSON.stringify('https://localhost:8080') 
      : JSON.stringify('http://localhost:8080')
  }
})
