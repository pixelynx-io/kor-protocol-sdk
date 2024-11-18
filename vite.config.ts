import { defineConfig } from 'vite';
import { resolve } from 'path';
import dtsPlugin from 'vite-plugin-dts';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dtsPlugin({ rollupTypes: true })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['jspdf', 'html2canvas', 'dompurify', 'canvg'],
      output: {
        globals: {
          jspdf: 'jsPDF',
          html2canvas: 'html2canvas',
          dompurify: 'DOMPurify',
          canvg: 'canvg',
        },
      },
    },
  },
  resolve: { alias: { src: resolve('src/') } },
});
