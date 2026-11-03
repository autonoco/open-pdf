import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'open-pdf-test-virtual-modules',
      resolveId(id) {
        if (id.startsWith('virtual:open-pdf/')) return id;
      },
    },
  ],
  test: {
    include: ['packages/**/*.test.ts', 'packages/**/*.test.tsx'],
    environment: 'node',
  },
});
