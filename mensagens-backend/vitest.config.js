import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.env.js'],
    // Um servidor Mongo em memória por vez — evita concorrência entre arquivos.
    fileParallelism: false,
    hookTimeout: 120000,
    testTimeout: 30000,
  },
});
