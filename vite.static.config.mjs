import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
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
