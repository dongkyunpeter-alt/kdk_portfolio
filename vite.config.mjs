import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs';

export default defineConfig({
  plugins: [react(), {
    name: 'copy-static-react-bundle',
    closeBundle() {
      mkdirSync('dist/assets/js', { recursive: true });
      copyFileSync('assets/js/react-app.js', 'dist/assets/js/react-app.js');
      for (const directory of ['images','icons','fonts','css']) {
        if (existsSync(`assets/${directory}`)) {
          cpSync(`assets/${directory}`, `dist/assets/${directory}`, { recursive: true });
        }
      }
      cpSync('evidence', 'dist/evidence', { recursive: true });
      cpSync('reports', 'dist/reports', { recursive: true });
    },
  }],
  build: { rollupOptions: { input: { main: 'index.html', pulmuone: 'pulmuone.html' } } },
});
