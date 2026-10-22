import { globSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { parseSync } from 'oxc-parser';
import { build } from 'tsdown';
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

    it('preserves a statically readable function duration after minification', async () => {
        const { default: config } = await import('../tsdown-vercel.config');
        const directory = mkdtempSync(path.join(tmpdir(), 'rsshub-vercel-'));
        try {
            const entry = path.join(directory, 'server.ts');
            const outDir = path.join(directory, 'out');
            writeFileSync(entry, 'export default {};');
            await build({ ...config, entry: [entry], outDir, dts: false, logLevel: 'silent' });
            const output = readFileSync(path.join(outDir, 'server.mjs'), 'utf8');
            const parsed = parseSync('server.mjs', output);
            expect(parsed.errors).toEqual([]);
            const exportedConfig = parsed.program.body.find(
                (node) =>
                    node.type === 'ExportNamedDeclaration' &&
                    node.declaration?.type === 'VariableDeclaration' &&
                    node.declaration.declarations.some((declaration) => declaration.id.type === 'Identifier' && declaration.id.name === 'config')
            );
            expect(exportedConfig).toMatchObject({
                declaration: {
                    kind: 'const',
                    declarations: [{ id: { name: 'config' }, init: { properties: [{ key: { name: 'maxDuration' }, value: { value: 60 } }] } }],
                },
            });
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    });
});
