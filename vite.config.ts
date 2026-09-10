import {markLocalRequest} from './lib/local-access';
import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
export default defineConfig({ css: { postcss: { plugins: [tailwindcss()] } }, plugins: [{name:'vmix-local-access',enforce:'pre',configureServer(server){server.middlewares.use((req,_res,next)=>{markLocalRequest(req);next();});}},vinext(), sites()] });
