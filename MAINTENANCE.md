# Fork Maintenance

This fork tracks `DIYgod/RSSHub` while preserving fork-local behavior, especially TopHub routes. Use this runbook after an upstream sync or any production deployment change.

## Upstream Sync

1. Require a clean worktree and verify `origin` points to this fork and `upstream` points to `DIYgod/RSSHub`.
2. Fetch both remotes and update `master` from `origin/master` before merging `upstream/master`.
3. Prefer upstream package and toolchain versions when resolving dependency conflicts. Retain a fork-local package change only when taking upstream would clearly break a required local patch.
4. Preserve TopHub source and tests. Current TopHub test placement is `lib/routes/tophub.test.ts`: it is excluded from route discovery and from the orphan-test guard introduced upstream.

## Fork-Specific CI Guards

This fork does not publish Docker or GHCR images unless the `DOCKER_USERNAME` repository variable is configured. Keep the matching conditional steps in `.github/workflows/ghcr-retention.yml`: perform a successful no-op when the variable is absent, and run the cleanup action only when it is present. Without these guards, the inherited weekly cleanup workflow fails because there is no `ghcr.io/tianrunhe/rsshub` package to clean up.

Validate this invariant with:

```bash
npx pnpm@10.34.5 exec vitest scripts/ghcr-retention.test.ts
```

## Deployment Gate

Do not call a sync complete immediately after pushing. The production deployment is complete only when all of the following succeed:

1. The GitHub Vercel deployment status for the pushed SHA is successful.
2. `vercel inspect <deployment-id>` reports `Ready`.
3. The active production alias returns HTTP 200 for `/`, `/tophub/Om4ejxvxEN`, and `/tophub/list/Om4ejxvxEN`.

Use the deployment URL from the SHA status rather than guessing an alias. A successful build is not enough: invoke the live routes and inspect runtime logs when any request fails.

## Failure Recovery

### Orphan TopHub Test

If `build-routes.ts` reports `lib/tophub-route.test.ts` as a test without a corresponding source file, move the test to `lib/routes/tophub.test.ts` and change its import to `./tophub`. Do not place the test inside `lib/routes/tophub/`; route discovery imports every TypeScript file in that directory and would execute the test as route code.

### sanitize-html ESM Runtime Failure

If Vercel logs report `ERR_REQUIRE_ESM` from `sanitize-html` requiring `htmlparser2`, keep the upstream `sanitize-html` version. Add `sanitize-html` to `deps.alwaysBundle` in `tsdown-vercel.config.ts` so the Vercel bundle handles its ESM-only transitive dependency. The regression assertion belongs in `scripts/vercel-config.test.ts`.

Validate with:

```bash
npx pnpm@10.34.4 exec vitest scripts/vercel-config.test.ts lib/routes/tophub.test.ts
npx pnpm@10.34.4 run build
npm run format:check
```

Then push the repair and repeat the full deployment gate.
