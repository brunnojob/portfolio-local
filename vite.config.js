import { defineConfig } from 'vite';
export default defineConfig({ base: './', server: { allowedHosts: ['terminal.local'] }, build: { chunkSizeWarningLimit: 2000 } });
