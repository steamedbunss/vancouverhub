//declaring vite, react plugin, and tailwindcss for build configuration
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

//This function exports the Vite dev server and build config for Vancouver Hub
export default defineConfig({
  //declaring react and tailwind plugins
  plugins: [react(), tailwindcss()],
  server: {
    //declaring fixed dev port so the app always runs on 5147
    port: 5147,
    strictPort: true,
    proxy: {
      //Browser cannot scrape trafficcams HTML directly (CORS). Dev proxy only.
      '/proxy/trafficcams': {
        target: 'https://trafficcams.vancouver.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/trafficcams/, ''),
      },
      //proxy for Vancouver Open Data API to avoid CORS in dev
      '/proxy/opendata': {
        target: 'https://opendata.vancouver.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/opendata/, ''),
      },
    },
  },
})
