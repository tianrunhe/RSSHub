import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('vercel config', () => {
    it('includes Patchright runtime assets and Chromium binaries in the serverless function bundle', () => {
        const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

        const includeFiles = config.functions?.['src/server.mjs']?.includeFiles;

        expect(includeFiles).toEqual(['node_modules/.pnpm/patchright-core@*/node_modules/patchright-core/**', 'node_modules/.pnpm/@sparticuz+chromium@*/node_modules/@sparticuz/chromium/bin/**']);
    });

    it('bundles sanitize-html for ESM-only transitive dependencies', async () => {
        const { default: config } = await import('../tsdown-vercel.config');

        expect(config).toMatchObject({
            deps: {
                alwaysBundle: ['sanitize-html'],
            },
        });
    });
});
