import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs';

export default defineConfig({
  base: './',
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), {
    name: 'copy-static-react-bundle',
    closeBundle() {
      mkdirSync('dist/assets/js', { recursive: true });
      copyFileSync('assets/js/react-app.js', 'dist/assets/js/react-app.js');
      copyFileSync('assets/js/pulmuone-app.js', 'dist/assets/js/pulmuone-app.js');
      for (const directory of ['images','icons','fonts','css','videos']) {
        if (existsSync(`assets/${directory}`)) {
          cpSync(`assets/${directory}`, `dist/assets/${directory}`, { recursive: true });
        }
      }
      cpSync('evidence', 'dist/evidence', { recursive: true });
      cpSync('reports', 'dist/reports', { recursive: true });
    },
  }],
  build: {
    rollupOptions: {
      input: { main: 'index.html', pulmuone: 'pulmuone.html' },
      output: {
        assetFileNames: asset=>{
          // 정적 React 번들의 img와 preload가 같은 URL을 써야 중복 다운로드가 없습니다.
          if(asset.names.includes('profile-kang-donggyun.webp'))return 'assets/images/[name][extname]';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
