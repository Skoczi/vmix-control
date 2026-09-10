import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath } from 'node:url';
export default defineConfig({ root: fileURLToPath(new URL('.', import.meta.url)), publicDir: '../public', resolve: { alias: { '@': fileURLToPath(new URL('..', import.meta.url)) } }, css: { postcss: { plugins: [tailwindcss()] } }, plugins: [react()], build: { outDir: '../dist/windows/public', emptyOutDir: true } });
