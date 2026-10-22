import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['./lib/server.ts'],
    // Wait for https://github.com/vercel/vercel/pull/14429
    // Then we can set outDir to outputDirectory in vercel.json
    outDir: 'src',
    minify: true,
    shims: true,
    clean: true,
    // Keep Vercel's function configuration as a literal export after minification.
    banner: ({ fileName }) => (fileName === 'server.mjs' ? 'export const config = { maxDuration: 60 };' : undefined),
    // copy: [{ from: 'lib/assets', to: 'dist' }],
    deps: {
        alwaysBundle: ['sanitize-html'],
        onlyBundle: false,
    },
});
