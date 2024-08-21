import { defineConfig } from 'vite';
import { resolve } from 'path';
import dtsPlugin from 'vite-plugin-dts';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dtsPlugin({ rollupTypes: true })],
  build: { lib: { entry: resolve(__dirname, 'src/main.ts'), formats: ['es', 'cjs'] } },
  resolve: { alias: { src: resolve('src/') } },
});
