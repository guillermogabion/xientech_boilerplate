import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    base:"/",
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Increase the limit to 5MB (5 * 1024 * 1024)
        maximumFileSizeToCacheInBytes: 5000000, 
        // This ensures all your JS/CSS assets are picked up
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'XIENTECH - Smart Community',
        short_name: 'BrgyApp',
        description: 'Offline-ready Barangay System',
        theme_color: '#ffffff',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    allowedHosts: ['all'], // Allow ngrok to bypass the "Invalid Host Header" error
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000', // Forward API calls to your backend
        changeOrigin: true,
      },
    },
  },
});
