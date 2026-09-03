import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

export default defineConfig(({mode})=>({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'assets/js',
    emptyOutDir: false,
    lib: {
      entry: mode==='detail'?'src/pulmuone.jsx':'src/main.jsx',
      name: mode==='detail'?'KdkPulmuone':'KdkPortfolio',
      formats: ['iife'],
      fileName: () => mode==='detail'?'pulmuone-app.js':'react-app.js',
    },
  },
}));
