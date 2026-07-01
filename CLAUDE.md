# CLAUDE.md — verdict-agent-harness

TypeScript agent harness that drives an opencode session with the VERDICT
forensic MCP server attached. Built on a **vendored** copy of `@opencode-ai/sdk`.

## Layout
- `src/` — harness source. `types.ts` (public types), `harness.ts` (`VerdictHarness`), `index.ts` (exports).
- `examples/` — runnable usage examples.
- `vendor/opencode-sdk/` — vendored `@opencode-ai/sdk` 1.17.13 (MIT). Wired via a `file:` dependency; **do not** replace with an npm-registry version — edits here are intentional.

## Conventions
- ESM only (`"type": "module"`), NodeNext resolution — imports use `.js` extensions.
- Strict TS. Wrap SDK `{ data, error }` results through `unwrap()`; never read `.data` blindly.
- Immutable style, small files, no secrets in source (model creds come from the environment/opencode config).
- Harness code is Apache-2.0; the vendored SDK stays MIT (see `NOTICE`).

## Commands
- `npm install` — links the vendored SDK into `node_modules`.
- `npm run typecheck` / `npm run build`.
- `npm run example:session` / `npm run example:events` — need opencode, a model provider, and the `verdict` MCP binary present.
