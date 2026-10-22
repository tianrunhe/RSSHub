import { globSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('vercel config', () => {
    it('includes Patchright runtime assets and Chromium binaries in the serverless function bundle', () => {
        const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

        const includeFiles = config.functions?.['src/server.mjs']?.includeFiles;

        expect(typeof includeFiles).toBe('string');
        const files = globSync(includeFiles);
        expect(files.some((file) => file.endsWith('/patchright-core/browsers.json'))).toBe(true);
        expect(files.some((file) => file.endsWith('/chromium/bin/chromium.br'))).toBe(true);
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
