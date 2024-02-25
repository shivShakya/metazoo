import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    rollupOptions: {
      external: [
        'svelte',
        'svelte/internal',
        'three',
        'three/examples/jsm/loaders/GLTFLoader',
        'three/examples/jsm/controls/OrbitControls',
        'three/examples/jsm/loaders/RGBELoader',
        '$lib/CharacterControls',
        '$lib/scene-9.json',
        '$lib/Drawing.svelte'
      ]
    }
  }
});
