import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('GHCR retention workflow', () => {
    it('succeeds without cleanup when Docker publishing is not configured', () => {
        const workflow = readFileSync(new URL('../.github/workflows/ghcr-retention.yml', import.meta.url), 'utf8');

        expect(workflow).toContain("- name: Skip cleanup when Docker publishing is disabled\n              if: vars.DOCKER_USERNAME == ''");
        expect(workflow).toContain("- name: Delete old container versions (30+ days)\n              if: vars.DOCKER_USERNAME != ''");
    });
});
