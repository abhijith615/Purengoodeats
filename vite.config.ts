import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    target: 'es2022',
    cssMinify: true,
    rollupOptions: {
      output: {
        // Split vendor chunks so GSAP/OGL cache independently of app code
        manualChunks: {
          gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/ScrollToPlugin', 'gsap/SplitText'],
          ogl: ['ogl'],
          lenis: ['lenis'],
        },
      },
    },
  },
  server: { port: 5173 },
});
