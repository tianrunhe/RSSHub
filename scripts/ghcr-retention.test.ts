import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('GHCR retention workflow', () => {
    it('only runs when Docker publishing is configured', () => {
        const workflow = readFileSync(new URL('../.github/workflows/ghcr-retention.yml', import.meta.url), 'utf8');

        expect(workflow).toContain("    cleanup:\n        if: vars.DOCKER_USERNAME != ''");
    });
});
