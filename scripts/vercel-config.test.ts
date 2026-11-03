import { describe, expect, it } from 'vitest';

describe('vercel config', () => {
    it('bundles sanitize-html for ESM-only transitive dependencies', async () => {
        const { default: config } = await import('../tsdown-vercel.config');

        expect(config).toMatchObject({
            deps: {
                alwaysBundle: ['sanitize-html', /^entities(?:\/|$)/],
            },
        });
    });
});
