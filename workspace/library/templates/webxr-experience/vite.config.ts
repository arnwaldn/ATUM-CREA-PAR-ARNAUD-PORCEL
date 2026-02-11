import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: true, // Allow external connections for VR testing
    https: false // Set to true for production VR
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr']
});
