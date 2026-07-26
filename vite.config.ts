import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    target: 'es2022',
    cssMinify: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'products.html'),
      },
      output: {
        // Split vendor chunks so GSAP/OGL cache independently of app code
        manualChunks: {
          gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/ScrollToPlugin', 'gsap/SplitText'],
          lenis: ['lenis'],
        },
      },
    },
  },
  server: { port: 5173 },
});
