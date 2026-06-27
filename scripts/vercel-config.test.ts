import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('vercel config', () => {
    it('includes patchright browser metadata in the serverless function bundle', () => {
        const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

        const includeFiles = config.functions?.['src/server.mjs']?.includeFiles;

        expect(includeFiles).toBe('node_modules/.pnpm/patchright-core@*/node_modules/patchright-core/browsers.json');
    });
});
