// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(dir, 'server/state/database/.env.test') });

export default defineConfig({
    test: {
        environment: 'jsdom',
    },
});