import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import deno from '@astrojs/deno';

export default defineConfig({
    integrations: [svelte()],
    output: 'server',
    adapter: deno(),
});
