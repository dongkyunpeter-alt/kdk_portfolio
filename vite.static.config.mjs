import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'assets/js',
    emptyOutDir: false,
    lib: {
      entry: 'src/main.jsx',
      name: 'KdkPortfolio',
      formats: ['iife'],
      fileName: () => 'react-app.js',
    },
  },
});
