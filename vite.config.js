const { resolve } = require('path');
const react = require('@vitejs/plugin-react').default;
const handlebars = require('vite-plugin-handlebars').default;

module.exports = {
  root: resolve(__dirname, 'src'),
  base: './',
  plugins: [
    react(),
    handlebars({
      context: {
        title: 'theCommons'
      }
    })
  ],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    // I was getting a warning:
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
};