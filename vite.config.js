import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills' // Correct named import

export default defineConfig({
  base: '/suspl-iums', // Deployment sub-path
  plugins: [nodePolyfills()], // Apply the node polyfills plugin
  server :{
    host: true,
  },
  build: {
    target: 'esnext', // Target modern browsers
    rollupOptions: {
      output: {
        format: 'es', // Output format as ES modules
      },
    },
  },
})
